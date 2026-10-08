import React, { useState } from 'react';
import { analyzeEmail } from '../../utils/emailChecker';
import { EmailAnalysisResult, InvestigationFinding } from '../../types';
import { RiskBadge, StatusBadge } from '../Badges';
import { Search, Mail, ShieldAlert, CheckCircle2, BookmarkPlus, Check, Globe } from 'lucide-react';

interface EmailViewProps {
  onAddFinding: (finding: Omit<InvestigationFinding, 'id' | 'timestamp'>) => void;
}

export const EmailView: React.FC<EmailViewProps> = ({ onAddFinding }) => {
  const [email, setEmail] = useState<string>('investigator@proton.me');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<EmailAnalysisResult | null>(null);
  const [isLogged, setIsLogged] = useState<boolean>(false);

  const handleAudit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setIsLogged(false);
    try {
      const data = await analyzeEmail(email.trim());
      setResult(data);
    } finally {
      setLoading(false);
    }
  };

  const handleLog = () => {
    if (!result) return;
    onAddFinding({
      sourceTool: 'email',
      target: result.email,
      type: 'Email Address Intelligence',
      title: `Audit: ${result.email}`,
      risk: result.risk,
      status: result.isValidSyntax ? 'Completed' : 'Needs Review',
      details: `Domain: ${result.domain}. Disposable: ${result.isDisposable}. MX Records: ${result.mxRecordsFound ? 'Verified' : 'Missing'}. Gravatar: ${result.gravatarExists ? 'Found' : 'Not found'}. Risk: ${result.risk} (Score ${result.riskScore}/100).`,
      metadata: result,
    });
    setIsLogged(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6 bg-[#FFFFFF]">
      {/* Tool Header */}
      <div className="bg-[#FFFFFF] border border-[#E1E5E9] rounded-[6px] p-5" style={{ borderLeft: '3px solid #2A7F7F' }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#2A7F7F' }} />
              <h2 className="text-base font-semibold text-[#222222]">
                Email Intelligence
              </h2>
              <span className="text-xs px-2 py-0.5 rounded bg-[#F0F7F7] text-[#2A7F7F] border border-[#D0E6E6]">
                Mailbox &amp; Domain Verification
              </span>
            </div>
            <p className="text-xs text-[#626B73] mt-1">
              Verify RFC compliance, detect disposable mail networks, inspect DNS MX routes, audit SPF/DMARC policies, and query Gravatar identity hashes.
            </p>
          </div>

          <form onSubmit={handleAudit} className="flex items-center gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="target@organization.com"
              className="w-56 sm:w-64 px-3 py-1.5 text-xs border border-[#E1E5E9] rounded focus:outline-none focus:border-[#2A7F7F] text-[#222222]"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-3.5 py-1.5 text-xs font-medium text-white rounded transition-colors disabled:opacity-60 flex items-center gap-1.5"
              style={{ backgroundColor: '#244A73' }}
            >
              <Search className="w-3.5 h-3.5" />
              <span>{loading ? 'Auditing...' : 'Analyze Email'}</span>
            </button>
          </form>
        </div>
      </div>

      {result && (
        <div className="space-y-6">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-[#FFFFFF] border border-[#E1E5E9] rounded-[6px]">
              <div className="text-[11px] text-[#626B73] uppercase tracking-wide">Threat Risk</div>
              <div className="mt-1 flex items-center justify-between">
                <RiskBadge risk={result.risk} />
                <span className="font-mono text-xs text-[#626B73]">{result.riskScore}/100</span>
              </div>
            </div>

            <div className="p-4 bg-[#FFFFFF] border border-[#E1E5E9] rounded-[6px]">
              <div className="text-[11px] text-[#626B73] uppercase tracking-wide">Mailbox Classification</div>
              <div className="mt-1 text-xs font-medium text-[#222222]">
                {result.isDisposable ? (
                  <span className="text-[#B23A3A] font-semibold">Disposable / Burner</span>
                ) : result.isFreeWebmail ? (
                  <span className="text-[#2A7F7F]">Free Webmail Service</span>
                ) : (
                  <span className="text-[#244A73]">Custom Corporate / Gov Domain</span>
                )}
              </div>
            </div>

            <div className="p-4 bg-[#FFFFFF] border border-[#E1E5E9] rounded-[6px]">
              <div className="text-[11px] text-[#626B73] uppercase tracking-wide">MX Mail Route</div>
              <div className="mt-1 text-xs font-medium">
                {result.mxRecordsFound ? (
                  <span className="text-[#3A7D44] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Active &amp; Resolving
                  </span>
                ) : (
                  <span className="text-[#B23A3A] flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" /> No MX Records
                  </span>
                )}
              </div>
            </div>

            <div className="p-4 bg-[#FFFFFF] border border-[#E1E5E9] rounded-[6px]">
              <div className="text-[11px] text-[#626B73] uppercase tracking-wide">Gravatar Avatar</div>
              <div className="mt-1 text-xs font-medium">
                {result.gravatarExists ? (
                  <span className="text-[#3A7D44] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Public Photo Active
                  </span>
                ) : (
                  <span className="text-[#626B73]">No Public Avatar</span>
                )}
              </div>
            </div>
          </div>

          {/* Detailed Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-[#FFFFFF] border border-[#E1E5E9] rounded-[6px] p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[#E1E5E9] pb-3">
                <h3 className="text-sm font-semibold text-[#222222]">
                  Intelligence Verification Checklist
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
                  <span>{isLogged ? 'Evidence Logged' : 'Log to Dossier'}</span>
                </button>
              </div>

              <div className="space-y-2.5 text-xs">
                {result.findings.map((f, i) => (
                  <div key={i} className="flex items-start gap-2.5 p-2.5 rounded bg-[#F8F9FA] border border-[#E1E5E9]">
                    <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: '#2A7F7F' }} />
                    <span className="text-[#222222]">{f}</span>
                  </div>
                ))}
              </div>

              {result.mxHosts.length > 0 && (
                <div className="pt-3 border-t border-[#E1E5E9]">
                  <div className="text-xs font-medium text-[#222222] mb-1.5">
                    Discovered MX Mail Hosts:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {result.mxHosts.map((h, i) => (
                      <span key={i} className="font-mono text-[11px] px-2 py-0.5 rounded bg-[#F8F9FA] border border-[#E1E5E9] text-[#222222]">
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Persona & Security Specs */}
            <div className="bg-[#FFFFFF] border border-[#E1E5E9] rounded-[6px] p-5 space-y-4">
              <h3 className="text-sm font-semibold text-[#222222] border-b border-[#E1E5E9] pb-3">
                Email Persona Attribution
              </h3>

              {result.gravatarExists && result.gravatarUrl && (
                <div className="flex items-center gap-3 p-3 bg-[#F8F9FA] rounded border border-[#E1E5E9]">
                  <img
                    src={result.gravatarUrl}
                    alt="Gravatar avatar"
                    className="w-12 h-12 rounded border border-[#E1E5E9]"
                  />
                  <div>
                    <div className="text-xs font-semibold text-[#222222]">Gravatar Identity</div>
                    <div className="text-[11px] text-[#626B73]">Photo confirmed on file</div>
                  </div>
                </div>
              )}

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-[#E1E5E9]/50">
                  <span className="text-[#626B73]">Local Part:</span>
                  <span className="font-mono text-[#222222]">{result.localPart}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#E1E5E9]/50">
                  <span className="text-[#626B73]">Domain:</span>
                  <span className="font-mono text-[#222222]">{result.domain}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#E1E5E9]/50">
                  <span className="text-[#626B73]">Syntax Standard:</span>
                  <span className="text-[#3A7D44]">RFC-5322 Compliant</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#E1E5E9]/50">
                  <span className="text-[#626B73]">DMARC Policy:</span>
                  <span className={result.dmarcConfigured ? 'text-[#3A7D44]' : 'text-[#B23A3A]'}>
                    {result.dmarcConfigured ? 'Configured' : 'Unprotected'}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#626B73]">SPF Records:</span>
                  <span className={result.spfConfigured ? 'text-[#3A7D44]' : 'text-[#B23A3A]'}>
                    {result.spfConfigured ? 'Configured' : 'Missing'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
