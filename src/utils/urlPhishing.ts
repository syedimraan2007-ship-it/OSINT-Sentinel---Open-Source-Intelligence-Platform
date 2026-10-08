import { RiskLevel, UrlPhishingResult } from '../types';

const KNOWN_BRANDS = [
  'google',
  'paypal',
  'microsoft',
  'apple',
  'amazon',
  'facebook',
  'netflix',
  'chase',
  'wellsfargo',
  'bankofamerica',
  'coinbase',
  'binance',
  'instagram',
  'twitter',
  'linkedin',
  'github',
  'discord',
  'roblox',
  'steam',
  'outlook',
];

const SUSPICIOUS_TLDS = new Set([
  'zip',
  'mov',
  'top',
  'xyz',
  'buzz',
  'rest',
  'work',
  'icu',
  'kim',
  'quest',
  'beauty',
  'sbs',
  'click',
  'country',
  'loan',
  'gq',
  'ml',
  'cf',
  'ga',
  'tk',
]);

const CREDENTIAL_KEYWORDS = [
  'login',
  'signin',
  'sign-in',
  'verify',
  'verification',
  'secure',
  'security',
  'update',
  'account',
  'banking',
  'password',
  'auth',
  'confirm',
  'recovery',
  'cpanel',
  'webmail',
  'identity',
];

/**
 * Checks if a string contains Cyrillic or Greek characters lookalike to Latin
 */
export function detectHomoglyphs(str: string): { isHomograph: boolean; details?: string } {
  // Common Cyrillic and Greek homoglyphs
  const homoglyphRegex = /[\u0400-\u04FF\u0370-\u03FF]/;
  if (homoglyphRegex.test(str)) {
    const chars = str.split('').filter((c) => homoglyphRegex.test(c));
    return {
      isHomograph: true,
      details: `Contains non-Latin homoglyphs (${chars.join(', ')}). High risk of IDN visual spoofing attack.`,
    };
  }
  return { isHomograph: false };
}

/**
 * Levenshtein distance for typosquatting detection
 */
function levenshtein(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

export function checkTyposquatting(domain: string): string | undefined {
  const parts = domain.toLowerCase().split('.');
  const sld = parts.length >= 2 ? parts[parts.length - 2] : domain;

  for (const brand of KNOWN_BRANDS) {
    if (sld === brand) return undefined; // Exact match to legitimate brand
    const dist = levenshtein(sld, brand);
    if (dist === 1 || dist === 2) {
      return `Target domain "${sld}" is dangerously close to protected brand "${brand}" (Levenshtein distance: ${dist}). Potential typosquatting.`;
    }
    // Subdomain impersonation check (e.g. paypal.security-update.com)
    if (domain.includes(brand) && !domain.endsWith(`.${brand}.com`)) {
      return `Brand keyword "${brand}" embedded in domain hierarchy. Potential brand spoofing.`;
    }
  }
  return undefined;
}

export function analyzeUrl(rawUrl: string): UrlPhishingResult {
  let normalized = rawUrl.trim();
  if (!/^https?:\/\//i.test(normalized)) {
    normalized = 'http://' + normalized;
  }

  let parsed: URL;
  try {
    parsed = new URL(normalized);
  } catch {
    return {
      url: rawUrl,
      protocol: 'invalid',
      hostname: 'invalid',
      pathname: '',
      search: '',
      tld: '',
      isIpHost: false,
      isHomograph: false,
      isSuspiciousTld: false,
      hasCredentialKeywords: false,
      hasSuspiciousExtension: false,
      hasBase64Payload: false,
      subdomainCount: 0,
      risk: 'HIGH',
      riskScore: 85,
      triggers: [{ title: 'Malformed URL', risk: 'HIGH', description: 'URL could not be parsed according to RFC 3986.' }],
    };
  }

  const hostname = parsed.hostname.toLowerCase();
  const tld = hostname.split('.').pop() || '';
  const triggers: Array<{ title: string; risk: RiskLevel; description: string }> = [];
  let score = 0;

  // 1. IP in hostname
  const isIpHost = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname) || hostname.startsWith('[');
  if (isIpHost) {
    score += 35;
    triggers.push({
      title: 'IP Address as Hostname',
      risk: 'HIGH',
      description: 'Host points directly to a raw numeric IP address rather than a registered domain name.',
    });
  }

  // 2. Homoglyph attack
  const homograph = detectHomoglyphs(hostname);
  if (homograph.isHomograph) {
    score += 50;
    triggers.push({
      title: 'Internationalized Domain (IDN) Homograph Attack',
      risk: 'CRITICAL',
      description: homograph.details || 'Contains lookalike Unicode characters mimicking popular characters.',
    });
  }

  // 3. Typosquatting
  const typosquat = checkTyposquatting(hostname);
  if (typosquat) {
    score += 40;
    triggers.push({
      title: 'Brand Impersonation / Typosquatting',
      risk: 'HIGH',
      description: typosquat,
    });
  }

  // 4. Suspicious TLD
  const isSuspiciousTld = SUSPICIOUS_TLDS.has(tld);
  if (isSuspiciousTld) {
    score += 25;
    triggers.push({
      title: 'High-Abuse Top Level Domain',
      risk: 'MEDIUM',
      description: `.${tld} is frequently observed in automated phishing campaigns and abuse feeds.`,
    });
  }

  // 5. Credential harvesting keywords
  const fullPathAndQuery = (parsed.pathname + parsed.search).toLowerCase();
  const matchedKeywords = CREDENTIAL_KEYWORDS.filter((kw) => fullPathAndQuery.includes(kw));
  const hasCredentialKeywords = matchedKeywords.length > 0;
  if (hasCredentialKeywords) {
    score += matchedKeywords.length >= 2 ? 30 : 15;
    triggers.push({
      title: 'Credential Harvesting Pattern in Path/Query',
      risk: matchedKeywords.length >= 2 ? 'HIGH' : 'MEDIUM',
      description: `Contains sensitive authentication keywords: ${matchedKeywords.join(', ')}.`,
    });
  }

  // 6. Suspicious extension
  const hasSuspiciousExtension = /\.(exe|scr|bat|cmd|apk|iso|vbs|hta|ps1)($|\?)/i.test(parsed.pathname);
  if (hasSuspiciousExtension) {
    score += 45;
    triggers.push({
      title: 'Executable / Dangerous Binary File in Path',
      risk: 'CRITICAL',
      description: 'URL directly references an executable or script format commonly used in malware droppers.',
    });
  }

  // 7. Base64 payload in query
  const hasBase64Payload = /[a-zA-Z0-9+/]{30,}={0,2}/.test(parsed.search);
  if (hasBase64Payload) {
    score += 20;
    triggers.push({
      title: 'Obfuscated Base64 String in Query Parameters',
      risk: 'GUARDED',
      description: 'Potential encoded payload, target redirect, or exfiltrated token in URL parameters.',
    });
  }

  // 8. Deep subdomain nesting
  const subdomains = hostname.split('.');
  const subdomainCount = subdomains.length;
  if (subdomainCount > 4) {
    score += 15;
    triggers.push({
      title: 'Excessive Subdomain Nesting',
      risk: 'GUARDED',
      description: `Host contains ${subdomainCount} domain labels, often used to conceal true domain identity.`,
    });
  }

  // 9. Plain HTTP protocol
  if (parsed.protocol === 'http:') {
    score += 10;
    triggers.push({
      title: 'Unencrypted HTTP Protocol',
      risk: 'GUARDED',
      description: 'Connection uses plain unencrypted HTTP without TLS encryption.',
    });
  }

  // Calculate final RiskLevel
  let risk: RiskLevel = 'LOW';
  if (score >= 70) risk = 'CRITICAL';
  else if (score >= 45) risk = 'HIGH';
  else if (score >= 25) risk = 'MEDIUM';
  else if (score >= 10) risk = 'GUARDED';

  if (triggers.length === 0) {
    triggers.push({
      title: 'No Immediate Phishing Flags',
      risk: 'LOW',
      description: 'Domain and path adhere to standard structural conventions. No known heuristics triggered.',
    });
  }

  return {
    url: rawUrl,
    protocol: parsed.protocol,
    hostname,
    pathname: parsed.pathname,
    search: parsed.search,
    tld,
    isIpHost,
    isHomograph: homograph.isHomograph,
    homographDetails: homograph.details,
    typosquatBrand: typosquat,
    isSuspiciousTld,
    hasCredentialKeywords,
    hasSuspiciousExtension,
    hasBase64Payload,
    subdomainCount,
    risk,
    riskScore: Math.min(100, score),
    triggers,
  };
}
