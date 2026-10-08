import { EmailAnalysisResult, RiskLevel } from '../types';
import { md5 } from './crypto';
import { checkDmarc, parseSpfRecord, queryDoh } from './dns';

const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com',
  'guerrillamail.com',
  'guerrillamail.net',
  'guerrillamail.org',
  'sharklasers.com',
  'tempmail.com',
  '10minutemail.com',
  '10minutemail.net',
  'yopmail.com',
  'trashmail.com',
  'dispostable.com',
  'getairmail.com',
  'throwawaymail.com',
  'fakemailgenerator.com',
  'generator.email',
  'temp-mail.org',
  'crazymailing.com',
  'maildrop.cc',
  'fakeinbox.com',
  'burnermail.io',
  'mohmal.com',
  'emailondeck.com',
  'mytemp.email',
]);

const FREE_WEBMAIL_DOMAINS = new Set([
  'gmail.com',
  'googlemail.com',
  'yahoo.com',
  'ymail.com',
  'outlook.com',
  'hotmail.com',
  'live.com',
  'msn.com',
  'protonmail.com',
  'proton.me',
  'icloud.com',
  'me.com',
  'aol.com',
  'zoho.com',
  'gmx.com',
  'gmx.net',
  'mail.com',
  'yandex.com',
  'tutanota.com',
  'tuta.com',
]);

const ROLE_PREFIXES = new Set([
  'admin',
  'administrator',
  'support',
  'help',
  'contact',
  'info',
  'sales',
  'billing',
  'security',
  'postmaster',
  'hostmaster',
  'webmaster',
  'abuse',
  'root',
  'legal',
  'compliance',
  'press',
  'media',
  'jobs',
  'careers',
  'hr',
  'marketing',
  'privacy',
]);

/**
 * Checks if a Gravatar profile picture exists for a given email MD5
 */
export async function checkGravatar(email: string): Promise<{ exists: boolean; url: string }> {
  const hash = md5(email.trim().toLowerCase());
  const gravatarUrl = `https://www.gravatar.com/avatar/${hash}?d=404`;

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ exists: true, url: gravatarUrl });
    img.onerror = () => resolve({ exists: false, url: gravatarUrl });
    img.src = gravatarUrl;
    setTimeout(() => resolve({ exists: false, url: gravatarUrl }), 2500);
  });
}

/**
 * Performs full intelligence audit on an email address
 */
export async function analyzeEmail(rawEmail: string): Promise<EmailAnalysisResult> {
  const email = rawEmail.trim().toLowerCase();
  const parts = email.split('@');
  const localPart = parts[0] || '';
  const domain = parts[1] || '';

  const isValidSyntax = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
  const isDisposable = DISPOSABLE_DOMAINS.has(domain);
  const isFreeWebmail = FREE_WEBMAIL_DOMAINS.has(domain);
  const isRoleAccount = ROLE_PREFIXES.has(localPart);

  const findings: string[] = [];
  let riskScore = 0;

  if (!isValidSyntax) {
    findings.push('Invalid email address format according to RFC 5322 specification.');
    riskScore += 40;
  }

  if (isDisposable) {
    findings.push('Domain is a known temporary / throwaway disposable inbox service.');
    riskScore += 60;
  }

  if (isRoleAccount) {
    findings.push(`Local part "${localPart}" is a generic role-based administrative mailbox.`);
    riskScore += 15;
  }

  if (isFreeWebmail) {
    findings.push(`Free consumer webmail provider (${domain}). Persona attribution requires secondary correlation.`);
  } else if (isValidSyntax) {
    findings.push(`Custom organizational domain (${domain}).`);
  }

  // Check MX records via DoH
  let mxRecordsFound = false;
  let mxHosts: string[] = [];

  if (domain) {
    try {
      const mxRecords = await queryDoh(domain, 'MX');
      if (mxRecords.length > 0) {
        mxRecordsFound = true;
        mxHosts = mxRecords.map((r) => r.data.split(' ').pop()?.replace(/\.$/, '') || r.data);
        findings.push(`Active Mail Exchange (MX) records discovered: ${mxHosts.slice(0, 2).join(', ')}.`);
      } else {
        findings.push('No Mail Exchange (MX) records published. Mail servers will reject outbound delivery.');
        riskScore += 25;
      }
    } catch {
      // dns timeout
    }
  }

  // Check DMARC & SPF
  let dmarcConfigured = false;
  let spfConfigured = false;

  if (domain && !isFreeWebmail) {
    try {
      const dmarcRes = await checkDmarc(domain);
      dmarcConfigured = dmarcRes.found;
      if (dmarcRes.found) {
        findings.push(`DMARC protection active: policy=${dmarcRes.policy}.`);
      } else {
        findings.push('DMARC record not found. Domain is vulnerable to spoofing impersonation.');
        riskScore += 20;
      }

      const txtRecords = await queryDoh(domain, 'TXT');
      const spfRes = parseSpfRecord(txtRecords);
      spfConfigured = spfRes.found;
      if (spfRes.found) {
        findings.push(`SPF anti-spoofing published: ${spfRes.allPolicy || 'active'}.`);
      } else {
        findings.push('SPF record absent. Outbound mail lacks sender authorization headers.');
        riskScore += 15;
      }
    } catch {
      // ignore
    }
  } else if (isFreeWebmail) {
    dmarcConfigured = true;
    spfConfigured = true;
  }

  // Gravatar Profile Check
  const gravatarRes = await checkGravatar(email);
  if (gravatarRes.exists) {
    findings.push('Verified public Gravatar profile picture found associated with this email hash.');
  }

  // Determine Risk Level
  let risk: RiskLevel = 'LOW';
  if (riskScore >= 60 || isDisposable) risk = 'HIGH';
  else if (riskScore >= 35) risk = 'MEDIUM';
  else if (riskScore >= 15) risk = 'GUARDED';

  return {
    email,
    localPart,
    domain,
    isValidSyntax,
    isDisposable,
    isFreeWebmail,
    isRoleAccount,
    mxRecordsFound,
    mxHosts,
    gravatarExists: gravatarRes.exists,
    gravatarUrl: gravatarRes.exists ? gravatarRes.url : undefined,
    dmarcConfigured,
    spfConfigured,
    risk,
    riskScore: Math.min(100, riskScore),
    findings,
  };
}
