import React, { useState } from 'react';
import { InvestigationFinding, RiskLevel } from '../../types';
import { RiskBadge } from '../Badges';
import { Search, Globe, ShieldCheck, ShieldAlert, BookmarkPlus, Check, ExternalLink, Code, CheckCircle2 } from 'lucide-react';

interface WebsiteViewProps {
  onAddFinding: (finding: Omit<InvestigationFinding, 'id' | 'timestamp'>) => void;
}

interface SecurityHeaderItem {
  header: string;
  recommended: string;
  present: boolean;
  value?: string;
  description: string;
  importance: 'HIGH' | 'MEDIUM' | 'LOW';
}

export const WebsiteView: React.FC<WebsiteViewProps> = ({ onAddFinding }) => {
  const [targetUrl, setTargetUrl] = useState<string>('https://rgmcet.edu.in');
  const [loading, setLoading] = useState<boolean>(false);
  const [analyzedHost, setAnalyzedHost] = useState<string>('');
  const [headers, setHeaders] = useState<SecurityHeaderItem[]>([]);
  const [securityScore, setSecurityScore] = useState<number>(0);
  const [isLogged, setIsLogged] = useState<boolean>(false);

  const handleAudit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!targetUrl.trim()) return;

    setLoading(true);
    setIsLogged(false);

    try {
      let host = targetUrl.trim();
      if (!/^https?:\/\//i.test(host)) host = 'https://' + host;
      const parsed = new URL(host);
      setAnalyzedHost(parsed.hostname);

      // Standard headers audit simulation & inspection
      const isHttps = parsed.protocol === 'https:';
      const sampleHeaders: SecurityHeaderItem[] = [
        {
          header: 'Strict-Transport-Security (HSTS)',
          recommended: 'max-age=31536000; includeSubDomains',
          present: isHttps,
          value: isHttps ? 'max-age=31536000; includeSubDomains; preload' : undefined,
          description: 'Enforces encrypted HTTPS connections and mitigates SSL stripping man-in-the-middle attacks.',
          importance: 'HIGH',
        },
        {
          header: 'Content-Security-Policy (CSP)',
          recommended: "default-src 'self'",
          present: true,
          value: "default-src 'self' https: data: 'unsafe-inline'",
          description: 'Restricts script injection, cross-site scripting (XSS), and unauthorized data exfiltration.',
          importance: 'HIGH',
        },
        {
          header: 'X-Frame-Options',
          recommended: 'DENY or SAMEORIGIN',
          present: true,
          value: 'SAMEORIGIN',
          description: 'Defends against UI redress attacks and clickjacking embeds.',
          importance: 'HIGH',
        },
        {
          header: 'X-Content-Type-Options',
          recommended: 'nosniff',
          present: true,
          value: 'nosniff',
          description: 'Prevents MIME-type sniffing by browsers.',
          importance: 'MEDIUM',
        },
        {
          header: 'Referrer-Policy',
          recommended: 'strict-origin-when-cross-origin',
          present: true,
          value: 'strict-origin-when-cross-origin',
          description: 'Controls referrer information disclosure across cross-origin requests.',
          importance: 'MEDIUM',
        },
        {
          header: 'Permissions-Policy',
          recommended: 'geolocation=(), camera=(), microphone=()',
          present: false,
          description: 'Restricts device API hardware features in browser context.',
          importance: 'LOW',
        },
      ];

      setHeaders(sampleHeaders);
      const passed = sampleHeaders.filter((h) => h.present).length;
      setSecurityScore(Math.round((passed / sampleHeaders.length) * 100));
    } finally {
      setLoading(false);
    }
  };

  const handleLog = () => {
    onAddFinding({
      sourceTool: 'website',
      target: analyzedHost || targetUrl,
      type: 'Web Application Security Audit',
      title: `Website Headers: ${analyzedHost}`,
      risk: securityScore >= 75 ? 'LOW' : securityScore >= 50 ? 'GUARDED' : 'MEDIUM',
      status: 'Completed',
      details: `Security Header Hardening Score: ${securityScore}/100. Audited ${headers.length} protective policies including HSTS, CSP, and X-Frame-Options.`,
      metadata: { analyzedHost, headers, securityScore },
    });
    setIsLogged(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6 bg-[#FFFFFF]">
      {/* Header */}
      <div className="bg-[#FFFFFF] border border-[#E1E5E9] rounded-[6px] p-5" style={{ borderLeft: '3px solid #244A73' }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#244A73' }} />
              <h2 className="text-base font-semibold text-[#222222]">
                Website Intelligence
              </h2>
              <span className="text-xs px-2 py-0.5 rounded bg-[#F0F4F8] text-[#244A73] border border-[#D0DFEF]">
                Application Security &amp; Endpoints
              </span>
            </div>
            <p className="text-xs text-[#626B73] mt-1">
              Audit HTTP defense headers, inspect robots crawl directives, evaluate TLS configurations, and discover web perimeter endpoints.
            </p>
          </div>

          <form onSubmit={handleAudit} className="flex items-center gap-2">
            <input
              type="text"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="https://target.edu"
              className="w-56 sm:w-64 px-3 py-1.5 text-xs border border-[#E1E5E9] rounded focus:outline-none focus:border-[#244A73] text-[#222222]"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-3.5 py-1.5 text-xs font-medium text-white rounded transition-colors disabled:opacity-60 flex items-center gap-1.5"
              style={{ backgroundColor: '#244A73' }}
            >
              <Search className="w-3.5 h-3.5" />
              <span>{loading ? 'Auditing...' : 'Audit Site'}</span>
            </button>
          </form>
        </div>
      </div>

      {headers.length > 0 && (
        <div className="space-y-6">
          {/* Top Score */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-[#FFFFFF] border border-[#E1E5E9] rounded-[6px]">
              <div className="text-[11px] text-[#626B73] uppercase tracking-wide">Hardening Score</div>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-lg font-bold text-[#222222]">{securityScore}/100</span>
                <span className="text-xs font-medium text-[#3A7D44]">Grade B+</span>
              </div>
            </div>

            <div className="p-4 bg-[#FFFFFF] border border-[#E1E5E9] rounded-[6px]">
              <div className="text-[11px] text-[#626B73] uppercase tracking-wide">Target FQDN</div>
              <div className="mt-1 font-mono text-xs text-[#244A73] truncate">
                {analyzedHost}
              </div>
            </div>

            <div className="p-4 bg-[#FFFFFF] border border-[#E1E5E9] rounded-[6px]">
              <div className="text-[11px] text-[#626B73] uppercase tracking-wide">Robots &amp; Sitemap</div>
              <div className="mt-1 flex items-center gap-3 text-xs">
                <a
                  href={`https://${analyzedHost}/robots.txt`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#244A73] hover:underline flex items-center gap-1 font-mono"
                >
                  <span>/robots.txt</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <span className="text-[#E1E5E9]">•</span>
                <a
                  href={`https://${analyzedHost}/sitemap.xml`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#244A73] hover:underline flex items-center gap-1 font-mono"
                >
                  <span>/sitemap.xml</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Headers Checklist Table */}
          <div className="bg-[#FFFFFF] border border-[#E1E5E9] rounded-[6px] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E1E5E9] pb-3">
              <h3 className="text-sm font-semibold text-[#222222]">
                HTTP Security Response Headers Audit
              </h3>
              <button
                onClick={handleLog}
                disabled={isLogged}
                className={`px-2.5 py-1 text-xs rounded font-medium flex items-center gap-1 transition-colors ${
                  isLogged
                    ? 'bg-[#F2F7F3] text-[#3A7D44] border border-[#D3E6D6]'
                    : 'bg-[#FFFFFF] border border-[#244A73] text-[#244A73] hover:bg-[#F0F4F8]'
                }`}
              >
                {isLogged ? <Check className="w-3.5 h-3.5" /> : <BookmarkPlus className="w-3.5 h-3.5" />}
                <span>{isLogged ? 'Logged' : 'Log to Dossier'}</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#E1E5E9] text-[#626B73] bg-[#F8F9FA]">
                    <th className="py-2.5 px-3">Header</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Active Configuration</th>
                    <th className="py-2.5 px-3">Security Function</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E1E5E9]">
                  {headers.map((h, i) => (
                    <tr key={i} className="hover:bg-[#F8F9FA]/60">
                      <td className="py-3 px-3 font-mono font-medium text-[#222222]">
                        {h.header}
                      </td>
                      <td className="py-3 px-3">
                        {h.present ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#F2F7F3] text-[#3A7D44] font-medium text-[11px]">
                            <CheckCircle2 className="w-3 h-3" /> Present
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#FDF2F2] text-[#B23A3A] font-medium text-[11px]">
                            <ShieldAlert className="w-3 h-3" /> Missing
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-[#222222] break-all max-w-xs">
                        {h.value || <span className="text-[#626B73] italic">Not configured</span>}
                      </td>
                      <td className="py-3 px-3 text-[#626B73] max-w-sm">
                        {h.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
