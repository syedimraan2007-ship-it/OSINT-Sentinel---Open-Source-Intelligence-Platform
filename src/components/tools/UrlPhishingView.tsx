import React, { useState } from 'react';
import { analyzeUrl } from '../../utils/urlPhishing';
import { UrlPhishingResult, InvestigationFinding } from '../../types';
import { RiskBadge } from '../Badges';
import { Search, ShieldAlert, AlertTriangle, ShieldCheck, BookmarkPlus, Check, ExternalLink } from 'lucide-react';

interface UrlPhishingViewProps {
  onAddFinding: (finding: Omit<InvestigationFinding, 'id' | 'timestamp'>) => void;
}

export const UrlPhishingView: React.FC<UrlPhishingViewProps> = ({ onAddFinding }) => {
  const [urlInput, setUrlInput] = useState<string>('https://paypal.account-verify-login.xyz/secure/update?auth=base64');
  const [result, setResult] = useState<UrlPhishingResult | null>(null);
  const [isLogged, setIsLogged] = useState<boolean>(false);

  const handleAnalyze = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!urlInput.trim()) return;

    setIsLogged(false);
    const data = analyzeUrl(urlInput.trim());
    setResult(data);
  };

  const handleLog = () => {
    if (!result) return;
    onAddFinding({
      sourceTool: 'url',
      target: result.url,
      type: 'Phishing & Fraud Heuristic Analysis',
      title: `URL Threat Assessment: ${result.hostname}`,
      risk: result.risk,
      status: result.risk === 'HIGH' || result.risk === 'CRITICAL' ? 'Needs Review' : 'Completed',
      details: `Calculated Threat Score: ${result.riskScore}/100 [${result.risk}]. Triggers: ${result.triggers.map((t) => t.title).join('; ')}.`,
      metadata: result,
    });
    setIsLogged(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6 bg-[#FFFFFF]">
      {/* Header */}
      <div className="bg-[#FFFFFF] border border-[#E1E5E9] rounded-[6px] p-5" style={{ borderLeft: '3px solid #B23A3A' }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#B23A3A' }} />
              <h2 className="text-base font-semibold text-[#222222]">
                URL / Phishing Intelligence
              </h2>
              <span className="text-xs px-2 py-0.5 rounded bg-[#FDF2F2] text-[#B23A3A] border border-[#F9D5D5]">
                Threat &amp; Spoofing Detection
              </span>
            </div>
            <p className="text-xs text-[#626B73] mt-1">
              Deconstruct suspicious URLs, identify IDN homograph character spoofing, detect brand typosquatting, and uncover credential harvesting lures.
            </p>
          </div>

          <form onSubmit={handleAnalyze} className="flex items-center gap-2">
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://suspicious-link.com/login"
              className="w-56 sm:w-72 px-3 py-1.5 text-xs border border-[#E1E5E9] rounded focus:outline-none focus:border-[#B23A3A] text-[#222222]"
            />
            <button
              type="submit"
              className="px-3.5 py-1.5 text-xs font-medium text-white rounded transition-colors flex items-center gap-1.5"
              style={{ backgroundColor: '#244A73' }}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Analyze URL</span>
            </button>
          </form>
        </div>
      </div>

      {result && (
        <div className="space-y-6">
          {/* Risk Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-[#FFFFFF] border border-[#E1E5E9] rounded-[6px]">
              <div className="text-[11px] text-[#626B73] uppercase tracking-wide">Threat Level</div>
              <div className="mt-1 flex items-center justify-between">
                <RiskBadge risk={result.risk} />
                <span className="text-xs font-mono font-semibold" style={{ color: result.riskScore > 50 ? '#B23A3A' : '#3A7D44' }}>
                  {result.riskScore}/100
                </span>
              </div>
            </div>

            <div className="p-4 bg-[#FFFFFF] border border-[#E1E5E9] rounded-[6px]">
              <div className="text-[11px] text-[#626B73] uppercase tracking-wide">Host Target</div>
              <div className="mt-1 font-mono text-xs text-[#222222] truncate">
                {result.hostname}
              </div>
            </div>

            <div className="p-4 bg-[#FFFFFF] border border-[#E1E5E9] rounded-[6px]">
              <div className="text-[11px] text-[#626B73] uppercase tracking-wide">Top Level Domain</div>
              <div className="mt-1 text-xs font-mono">
                <span className={result.isSuspiciousTld ? 'text-[#B23A3A] font-semibold' : 'text-[#222222]'}>
                  .{result.tld} {result.isSuspiciousTld ? '(High Abuse)' : ''}
                </span>
              </div>
            </div>

            <div className="p-4 bg-[#FFFFFF] border border-[#E1E5E9] rounded-[6px]">
              <div className="text-[11px] text-[#626B73] uppercase tracking-wide">Active Triggers</div>
              <div className="mt-1 text-xs font-semibold text-[#222222]">
                {result.triggers.length} indicators evaluated
              </div>
            </div>
          </div>

          {/* Triggered Heuristics Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-[#FFFFFF] border border-[#E1E5E9] rounded-[6px] p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[#E1E5E9] pb-3">
                <h3 className="text-sm font-semibold text-[#222222]">
                  Phishing Heuristic Triggers
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

              <div className="space-y-3">
                {result.triggers.map((t, i) => (
                  <div key={i} className="p-3 rounded bg-[#F8F9FA] border border-[#E1E5E9] space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-[#B23A3A]" />
                        <span className="text-xs font-semibold text-[#222222]">{t.title}</span>
                      </div>
                      <RiskBadge risk={t.risk} />
                    </div>
                    <p className="text-xs text-[#626B73] pl-5">
                      {t.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* URL Structural Decomposition */}
            <div className="bg-[#FFFFFF] border border-[#E1E5E9] rounded-[6px] p-5 space-y-4">
              <h3 className="text-sm font-semibold text-[#222222] border-b border-[#E1E5E9] pb-3">
                Structural Decomposition
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-[#E1E5E9]/50">
                  <span className="text-[#626B73]">Protocol:</span>
                  <span className="font-mono text-[#222222]">{result.protocol}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#E1E5E9]/50">
                  <span className="text-[#626B73]">Hostname:</span>
                  <span className="font-mono text-[#222222]">{result.hostname}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#E1E5E9]/50">
                  <span className="text-[#626B73]">Subdomain Depth:</span>
                  <span className="font-mono text-[#222222]">{result.subdomainCount} levels</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#E1E5E9]/50">
                  <span className="text-[#626B73]">Path:</span>
                  <span className="font-mono text-[#222222] truncate max-w-[140px]">{result.pathname || '/'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#E1E5E9]/50">
                  <span className="text-[#626B73]">Query Params:</span>
                  <span className="font-mono text-[#222222] truncate max-w-[140px]">{result.search || 'None'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#E1E5E9]/50">
                  <span className="text-[#626B73]">Homoglyph Attack:</span>
                  <span className={result.isHomograph ? 'text-[#B23A3A] font-bold' : 'text-[#3A7D44]'}>
                    {result.isHomograph ? 'DETECTED' : 'Negative'}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#626B73]">Raw IP Host:</span>
                  <span className={result.isIpHost ? 'text-[#B23A3A] font-bold' : 'text-[#3A7D44]'}>
                    {result.isIpHost ? 'Yes (Anomalous)' : 'No (Standard FQDN)'}
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
