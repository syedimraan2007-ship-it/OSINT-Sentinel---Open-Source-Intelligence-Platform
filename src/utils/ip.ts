import { IpAnalysisResult, RiskLevel } from '../types';
import { queryDoh } from './dns';

export function isPrivateOrBogonIp(ip: string): boolean {
  const trimmed = ip.trim();
  // IPv4 Local / Loopback / Bogon ranges
  if (/^127\./.test(trimmed)) return true;
  if (/^10\./.test(trimmed)) return true;
  if (/^192\.168\./.test(trimmed)) return true;
  if (/^169\.254\./.test(trimmed)) return true;
  if (/^0\./.test(trimmed)) return true;
  if (/^255\.255\.255\.255/.test(trimmed)) return true;
  
  // 172.16.0.0 – 172.31.255.255
  const match172 = trimmed.match(/^172\.(\d+)\./);
  if (match172) {
    const octet = parseInt(match172[1], 10);
    if (octet >= 16 && octet <= 31) return true;
  }

  // IPv6 loopback / private
  if (trimmed === '::1' || trimmed === '::') return true;
  if (/^fe80:/i.test(trimmed)) return true;
  if (/^fc00:/i.test(trimmed) || /^fd00:/i.test(trimmed)) return true;

  return false;
}

export function detectIpVersion(ip: string): 'IPv4' | 'IPv6' {
  return ip.includes(':') ? 'IPv6' : 'IPv4';
}

/**
 * Reverse DNS (PTR) lookup for IP
 */
export async function lookupReverseDns(ip: string): Promise<string | undefined> {
  const version = detectIpVersion(ip);
  if (version === 'IPv4') {
    const parts = ip.trim().split('.');
    if (parts.length === 4) {
      const ptrDomain = `${parts[3]}.${parts[2]}.${parts[1]}.${parts[0]}.in-addr.arpa`;
      const records = await queryDoh(ptrDomain, 'PTR');
      if (records.length > 0) {
        return records[0].data.replace(/\.$/, '');
      }
    }
  }
  return undefined;
}

/**
 * Perform comprehensive IP intelligence lookup
 */
export async function analyzeIp(targetIp: string): Promise<IpAnalysisResult> {
  const cleanIp = targetIp.trim();
  const version = detectIpVersion(cleanIp);
  const isPrivate = isPrivateOrBogonIp(cleanIp);

  if (isPrivate) {
    return {
      ip: cleanIp,
      isPrivate: true,
      version,
      city: 'Local Area Network',
      region: 'Internal / RFC-1918',
      country: 'Private Network',
      countryCode: 'LAN',
      asn: 'AS0 - Non-Routable',
      org: 'Private Intranet Range',
      isp: 'Internal Infrastructure',
      risk: 'LOW',
      riskReasons: ['Non-routable internal IP address. Traffic is restricted to local intranet.'],
    };
  }

  // Look up geolocation using freeipapi or ipwhois
  let geo: any = null;
  try {
    const res = await fetch(`https://ipwho.is/${cleanIp}`, { headers: { Accept: 'application/json' } });
    if (res.ok) {
      const data = await res.json();
      if (data.success !== false) {
        geo = data;
      }
    }
  } catch {
    // fallback
  }

  if (!geo) {
    try {
      const res = await fetch(`https://freeipapi.com/api/json/${cleanIp}`);
      if (res.ok) {
        const data = await res.json();
        geo = {
          city: data.cityName,
          region: data.regionName,
          country: data.countryName,
          country_code: data.countryCode,
          latitude: data.latitude,
          longitude: data.longitude,
          connection: {
            asn: data.asn,
            isp: data.isp,
            org: data.organization,
          },
        };
      }
    } catch {
      // offline fallback
    }
  }

  const ptr = await lookupReverseDns(cleanIp);

  const riskReasons: string[] = [];
  let risk: RiskLevel = 'LOW';

  const ispName = (geo?.connection?.isp || geo?.isp || '').toLowerCase();
  const orgName = (geo?.connection?.org || geo?.org || '').toLowerCase();

  // Hosting / Datacenter heuristics
  const isHosting = 
    ispName.includes('hosting') ||
    ispName.includes('digitalocean') ||
    ispName.includes('amazon') ||
    ispName.includes('aws') ||
    ispName.includes('google cloud') ||
    ispName.includes('microsoft') ||
    ispName.includes('ovh') ||
    ispName.includes('hetzner') ||
    ispName.includes('linode') ||
    ispName.includes('vultr') ||
    ispName.includes('cloudflare');

  if (isHosting) {
    risk = 'GUARDED';
    riskReasons.push('IP belongs to a cloud hosting / data center provider. Potential proxy, VPN, or bot node.');
  }

  if (geo?.security?.is_vpn || geo?.security?.is_proxy || geo?.security?.is_tor) {
    risk = 'MEDIUM';
    riskReasons.push('Flagged as anonymous relay, VPN, or Tor exit node.');
  }

  if (riskReasons.length === 0) {
    riskReasons.push('Public routable IP with standard ISP assignment.');
  }

  return {
    ip: cleanIp,
    isPrivate: false,
    version,
    city: geo?.city || 'Unknown',
    region: geo?.region || 'Unknown',
    country: geo?.country || 'Unknown',
    countryCode: geo?.country_code || 'UN',
    latitude: geo?.latitude,
    longitude: geo?.longitude,
    asn: geo?.connection?.asn ? `AS${geo.connection.asn}` : (geo?.asn || 'Unknown'),
    org: geo?.connection?.org || geo?.org || 'Unknown',
    isp: geo?.connection?.isp || geo?.isp || 'Unknown',
    timezone: geo?.timezone?.id || geo?.timezone || 'UTC',
    ptr,
    risk,
    riskReasons,
  };
}
