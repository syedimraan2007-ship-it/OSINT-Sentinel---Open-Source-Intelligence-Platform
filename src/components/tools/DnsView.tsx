import React, { useState } from 'react';
import { resolveAllDns, parseSpfRecord, checkDmarc, SpfAnalysis, DmarcAnalysis } from '../../utils/dns';
import { DnsRecord, InvestigationFinding } from '../../types';
import { RiskBadge, StatusBadge } from '../Badges';
import { Search, Shield, ShieldCheck, ShieldAlert, BookmarkPlus, Check, Download } from 'lucide-react';

interface DnsViewProps {
  onAddFinding: (finding: Omit<InvestigationFinding, 'id' | 'timestamp'>) => void;
}

export const DnsView: React.FC<DnsViewProps> = ({ onAddFinding }) => {
  const [domain, setDomain] = useState<string>('google.com');
  const [loading, setLoading] = useState<boolean>(false);
  const [records, setRecords] = useState<Record<string, DnsRecord[]>>({});
  const [spf, setSpf] = useState<SpfAnalysis | null>(null);
  const [dmarc, setDmarc] = useState<DmarcAnalysis | null>(null);
  const [isLogged, setIsLogged] = useState<boolean>(false);

  const handleLookup = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = domain.trim().toLowerCase().replace(/^https?:\/\//, '').split('/')[0];
    if (!clean) return;

    setLoading(true);
    setIsLogged(false);
    try {
      const dnsRecs = await resolveAllDns(clean);
      setRecords(dnsRecs);

      // SPF
      const txt = dnsRecs['TXT'] || [];
      const spfData = parseSpfRecord(txt);
      setSpf(spfData);

      // DMARC
      const dmarcData = await checkDmarc(clean);
      setDmarc(dmarcData);
    } finally {
      setLoading(false);
    }
  };

  const handleLog = () => {
    const clean = domain.trim().toLowerCase().replace(/^https?:\/\//, '').split('/')[0];
    onAddFinding({
      sourceTool: 'dns',
      target: clean,
      type: 'DNS & Email Security Telemetry',
      title: `DNS Audit: ${clean}`,
      risk: dmarc?.isStrict && spf?.isEnforcing ? 'LOW' : dmarc?.found ? 'GUARDED' : 'MEDIUM',
      status: 'Completed',
      details: `SPF: ${spf?.allPolicy || 'missing'} (${spf?.recommendation}). DMARC: ${dmarc?.policy || 'missing'} (${dmarc?.details}). Total records: ${Object.values(records).flat().length}.`,
      metadata: { records, spf, dmarc },
    });
    setIsLogged(true);
  };

  const exportJson = () => {
    const clean = domain.trim().toLowerCase().replace(/^https?:\/\//, '').split('/')[0];
    const data = JSON.stringify({ domain: clean, records, spf, dmarc }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dns-${clean}-audit.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6 bg-[#FFFFFF]">
      {/* Header */}
      <div className="bg-[#FFFFFF] border border-[#E1E5E9] rounded-[6px] p-5" style={{ borderLeft: '3px solid #2A7F7F' }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#2A7F7F' }} />
              <h2 className="text-base font-semibold text-[#222222]">
                DNS Intelligence
              </h2>
              <span className="text-xs px-2 py-0.5 rounded bg-[#F0F7F7] text-[#2A7F7F] border border-[#D0E6E6]">
                Zone Telemetry &amp; Auth Policies
              </span>
            </div>
            <p className="text-xs text-[#626B73] mt-1">
              Live DoH querying for A, AAAA, MX, TXT, NS, SOA, CAA records, SPF mechanism parsing, and DMARC enforcement verification.
            </p>
          </div>

          <form onSubmit={handleLookup} className="flex items-center gap-2">
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="target.org"
              className="w-56 sm:w-64 px-3 py-1.5 text-xs border border-[#E1E5E9] rounded focus:outline-none focus:border-[#2A7F7F] text-[#222222]"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-3.5 py-1.5 text-xs font-medium text-white rounded transition-colors disabled:opacity-60 flex items-center gap-1.5"
              style={{ backgroundColor: '#244A73' }}
            >
              <Search className="w-3.5 h-3.5" />
              <span>{loading ? 'Querying...' : 'Query DNS'}</span>
            </button>
          </form>
        </div>
      </div>

      {Object.keys(records).length > 0 && (
        <div className="space-y-6">
          {/* Security Posture Cards (SPF & DMARC) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* SPF Card */}
            <div className="p-4 bg-[#FFFFFF] border border-[#E1E5E9] rounded-[6px]">
              <div className="flex items-center justify-between pb-2 border-b border-[#E1E5E9]">
                <div className="flex items-center gap-2">
                  {spf?.isEnforcing ? (
                    <ShieldCheck className="w-4 h-4 text-[#3A7D44]" />
                  ) : (
                    <ShieldAlert className="w-4 h-4 text-[#B7791F]" />
                  )}
                  <h3 className="text-xs font-semibold text-[#222222] uppercase tracking-wide">
                    SPF (Sender Policy Framework)
                  </h3>
                </div>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                  spf?.isEnforcing ? 'bg-[#F2F7F3] text-[#3A7D44]' : 'bg-[#FDF7EB] text-[#B7791F]'
                }`}>
                  {spf?.allPolicy || 'NO SPF'}
                </span>
              </div>
              <p className="text-xs text-[#626B73] mt-2 mb-3">
                {spf?.recommendation}
              </p>
              {spf?.raw && (
                <div className="font-mono text-[11px] p-2 bg-[#F8F9FA] rounded border border-[#E1E5E9] text-[#222222] break-all">
                  {spf.raw}
                </div>
              )}
            </div>

            {/* DMARC Card */}
            <div className="p-4 bg-[#FFFFFF] border border-[#E1E5E9] rounded-[6px]">
              <div className="flex items-center justify-between pb-2 border-b border-[#E1E5E9]">
                <div className="flex items-center gap-2">
                  {dmarc?.isStrict ? (
                    <ShieldCheck className="w-4 h-4 text-[#3A7D44]" />
                  ) : (
                    <ShieldAlert className="w-4 h-4 text-[#B7791F]" />
                  )}
                  <h3 className="text-xs font-semibold text-[#222222] uppercase tracking-wide">
                    DMARC Anti-Impersonation
                  </h3>
                </div>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                  dmarc?.isStrict ? 'bg-[#F2F7F3] text-[#3A7D44]' : 'bg-[#FDF7EB] text-[#B7791F]'
                }`}>
                  {dmarc?.policy ? `p=${dmarc.policy}` : 'MISSING'}
                </span>
              </div>
              <p className="text-xs text-[#626B73] mt-2 mb-3">
                {dmarc?.details}
              </p>
              {dmarc?.raw && (
                <div className="font-mono text-[11px] p-2 bg-[#F8F9FA] rounded border border-[#E1E5E9] text-[#222222] break-all">
                  {dmarc.raw}
                </div>
              )}
            </div>
          </div>

          {/* Records Table */}
          <div className="bg-[#FFFFFF] border border-[#E1E5E9] rounded-[6px] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E1E5E9] pb-3">
              <h3 className="text-sm font-semibold text-[#222222]">
                Resolved DNS Resource Records
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={exportJson}
                  className="px-2.5 py-1 text-xs rounded border border-[#E1E5E9] text-[#222222] hover:bg-[#F8F9FA] flex items-center gap-1 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-[#626B73]" />
                  <span>Export JSON</span>
                </button>
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
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#E1E5E9] text-[#626B73] bg-[#F8F9FA]">
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Name</th>
                    <th className="py-2.5 px-3">Data / Value</th>
                    <th className="py-2.5 px-3 text-right">TTL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E1E5E9]">
                  {Object.entries(records).map(([type, list]) =>
                    list.map((r, i) => (
                      <tr key={`${type}-${i}`} className="hover:bg-[#F8F9FA]/60">
                        <td className="py-2.5 px-3">
                          <span className="font-mono text-xs font-semibold px-1.5 py-0.5 rounded bg-[#F0F7F7] text-[#2A7F7F] border border-[#D0E6E6]">
                            {r.type}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-xs text-[#626B73]">
                          {r.name}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-xs text-[#222222] break-all max-w-lg">
                          {r.data}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-[#626B73]">
                          {r.TTL}s
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
