import { DnsRecord } from '../types';

export const DNS_TYPE_MAP: Record<string, number> = {
  A: 1,
  NS: 2,
  CNAME: 5,
  SOA: 6,
  PTR: 12,
  MX: 15,
  TXT: 16,
  AAAA: 28,
  CAA: 257,
};

export const COMMON_SUBDOMAINS = [
  'www',
  'mail',
  'api',
  'dev',
  'app',
  'portal',
  'staging',
  'vpn',
  'admin',
  'git',
  'auth',
  'shop',
  'test',
  'cdn',
  'cloud',
  'docs',
  'remote',
];

/**
 * Resolves DNS records using Google DoH API with fallback to Cloudflare DoH
 */
export async function queryDoh(name: string, type: string = 'A'): Promise<DnsRecord[]> {
  const cleanName = name.trim().toLowerCase();
  
  // Try Google DNS-over-HTTPS
  try {
    const url = `https://dns.google/resolve?name=${encodeURIComponent(cleanName)}&type=${encodeURIComponent(type)}`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (res.ok) {
      const data = await res.json();
      if (data.Answer && Array.isArray(data.Answer)) {
        return data.Answer.map((ans: any) => ({
          name: ans.name,
          type: type.toUpperCase(),
          typeCode: ans.type,
          TTL: ans.TTL,
          data: ans.data,
        }));
      }
    }
  } catch (err) {
    // try fallback
  }

  // Fallback to Cloudflare DoH
  try {
    const url = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(cleanName)}&type=${encodeURIComponent(type)}`;
    const res = await fetch(url, { headers: { Accept: 'application/dns-json' } });
    if (res.ok) {
      const data = await res.json();
      if (data.Answer && Array.isArray(data.Answer)) {
        return data.Answer.map((ans: any) => ({
          name: ans.name,
          type: type.toUpperCase(),
          typeCode: ans.type,
          TTL: ans.TTL,
          data: ans.data,
        }));
      }
    }
  } catch (err) {
    // Both failed (network offline or blocked)
  }

  return [];
}

/**
 * Perform multi-record resolution for a domain
 */
export async function resolveAllDns(domain: string): Promise<Record<string, DnsRecord[]>> {
  const cleanDomain = domain.trim().toLowerCase().replace(/^https?:\/\//, '').split('/')[0];
  const recordTypes = ['A', 'AAAA', 'MX', 'TXT', 'NS', 'CNAME', 'SOA', 'CAA'];
  
  const results: Record<string, DnsRecord[]> = {};

  await Promise.all(
    recordTypes.map(async (rtype) => {
      try {
        const records = await queryDoh(cleanDomain, rtype);
        results[rtype] = records;
      } catch {
        results[rtype] = [];
      }
    })
  );

  return results;
}

/**
 * SPF Inspector
 */
export interface SpfAnalysis {
  found: boolean;
  raw?: string;
  version?: string;
  allPolicy?: '+all' | '-all' | '~all' | '?all';
  includes: string[];
  ips: string[];
  isEnforcing: boolean;
  recommendation: string;
}

export function parseSpfRecord(txtRecords: DnsRecord[]): SpfAnalysis {
  const spfTxt = txtRecords.find((r) => r.data.toLowerCase().includes('v=spf1'));
  if (!spfTxt) {
    return {
      found: false,
      includes: [],
      ips: [],
      isEnforcing: false,
      recommendation: 'No SPF record discovered. Domain is vulnerable to email spoofing impersonation.',
    };
  }

  const raw = spfTxt.data.replace(/^"|"$/g, '');
  const tokens = raw.split(/\s+/);
  const includes: string[] = [];
  const ips: string[] = [];
  let allPolicy: '+all' | '-all' | '~all' | '?all' | undefined = undefined;

  for (const token of tokens) {
    if (token.startsWith('include:')) {
      includes.push(token.replace('include:', ''));
    } else if (token.startsWith('ip4:') || token.startsWith('ip6:')) {
      ips.push(token);
    } else if (token === '-all' || token === '~all' || token === '+all' || token === '?all') {
      allPolicy = token;
    }
  }

  const isEnforcing = allPolicy === '-all';

  return {
    found: true,
    raw,
    version: 'spf1',
    allPolicy,
    includes,
    ips,
    isEnforcing,
    recommendation: isEnforcing
      ? 'Strict HardFail (-all) policy enforced. High anti-spoofing resilience.'
      : allPolicy === '~all'
      ? 'SoftFail (~all) policy detected. Legitimate delivery is preserved, but spoofed emails may not be outright rejected.'
      : 'Permissive or missing all policy. Stronger hardfail (-all) policy recommended.',
  };
}

/**
 * DMARC Inspector
 */
export interface DmarcAnalysis {
  found: boolean;
  raw?: string;
  policy?: 'none' | 'quarantine' | 'reject';
  subdomainPolicy?: string;
  pct?: number;
  rua?: string;
  isStrict: boolean;
  verdict: 'STRONG' | 'MODERATE' | 'WEAK' | 'MISSING';
  details: string;
}

export async function checkDmarc(domain: string): Promise<DmarcAnalysis> {
  const cleanDomain = domain.trim().toLowerCase().replace(/^https?:\/\//, '').split('/')[0];
  const dmarcName = `_dmarc.${cleanDomain}`;
  const records = await queryDoh(dmarcName, 'TXT');
  const dmarcRec = records.find((r) => r.data.toLowerCase().includes('v=dmarc1'));

  if (!dmarcRec) {
    return {
      found: false,
      isStrict: false,
      verdict: 'MISSING',
      details: 'No DMARC policy published at _dmarc host. Email domain impersonation protection is disabled.',
    };
  }

  const raw = dmarcRec.data.replace(/^"|"$/g, '');
  const parts = raw.split(';').map((s) => s.trim());
  let policy: 'none' | 'quarantine' | 'reject' = 'none';
  let sp: string | undefined;
  let pct: number = 100;
  let rua: string | undefined;

  for (const p of parts) {
    const [k, v] = p.split('=').map((s) => s.trim().toLowerCase());
    if (k === 'p') {
      if (v === 'reject') policy = 'reject';
      else if (v === 'quarantine') policy = 'quarantine';
      else policy = 'none';
    } else if (k === 'sp') {
      sp = v;
    } else if (k === 'pct') {
      pct = parseInt(v, 10) || 100;
    } else if (k === 'rua') {
      rua = p.split('=')[1]?.trim();
    }
  }

  const isStrict = policy === 'reject' && pct === 100;
  const verdict = isStrict ? 'STRONG' : policy === 'quarantine' ? 'MODERATE' : 'WEAK';

  return {
    found: true,
    raw,
    policy,
    subdomainPolicy: sp,
    pct,
    rua,
    isStrict,
    verdict,
    details:
      policy === 'reject'
        ? `Enforcing p=reject (${pct}% applied). Unauthorized mail is rejected outright by receiving MTAs.`
        : policy === 'quarantine'
        ? `Policy set to quarantine (${pct}%). Unauthorized mail is directed to spam folders.`
        : `Policy set to p=none (monitoring only). No enforcement or delivery blocking takes place.`,
  };
}
