import React, { useState } from 'react';
import { resolveAllDns, queryDoh, COMMON_SUBDOMAINS } from '../../utils/dns';
import { DnsRecord, InvestigationFinding, RiskLevel } from '../../types';
import { RiskBadge, StatusBadge } from '../Badges';
import { Search, Globe, Network, Server, BookmarkPlus, Check, ExternalLink } from 'lucide-react';

interface DomainViewProps {
  onAddFinding: (finding: Omit<InvestigationFinding, 'id' | 'timestamp'>) => void;
}

export const DomainView: React.FC<DomainViewProps> = ({ onAddFinding }) => {
  const [domain, setDomain] = useState<string>('rgmcet.edu.in');
  const [loading, setLoading] = useState<boolean>(false);
  const [dnsResults, setDnsResults] = useState<Record<string, DnsRecord[]>>({});
  const [discoveredSubdomains, setDiscoveredSubdomains] = useState<Array<{ sub: string; ip: string }>>([]);
  const [isLogged, setIsLogged] = useState<boolean>(false);

  const handleScan = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanDomain = domain.trim().toLowerCase().replace(/^https?:\/\//, '').split('/')[0];
    if (!cleanDomain) return;

    setLoading(true);
    setIsLogged(false);
    setDnsResults({});
    setDiscoveredSubdomains([]);

    try {
      // 1. Resolve DNS records
      const records = await resolveAllDns(cleanDomain);
      setDnsResults(records);

      // 2. Discover subdomains in parallel
      const subs: Array<{ sub: string; ip: string }> = [];
      await Promise.all(
        COMMON_SUBDOMAINS.map(async (prefix) => {
          const testHost = `${prefix}.${cleanDomain}`;
          try {
            const res = await queryDoh(testHost, 'A');
            if (res.length > 0) {
              subs.push({ sub: testHost, ip: res[0].data });
            }
          } catch {
            // ignore
          }
        })
      );
      setDiscoveredSubdomains(subs);
    } finally {
      setLoading(false);
    }
  };

  const aRecords = dnsResults['A'] || [];
  const mxRecords = dnsResults['MX'] || [];
  const nsRecords = dnsResults['NS'] || [];
  const txtRecords = dnsResults['TXT'] || [];

  const handleLog = () => {
    const cleanDomain = domain.trim().toLowerCase().replace(/^https?:\/\//, '').split('/')[0];
    onAddFinding({
      sourceTool: 'domain',
      target: cleanDomain,
      type: 'Domain Infrastructure Audit',
      title: `Domain Audit: ${cleanDomain}`,
      risk: aRecords.length > 0 ? 'LOW' : 'MEDIUM',
      status: 'Completed',
      details: `Discovered ${aRecords.length} A records, ${mxRecords.length} MX records, ${nsRecords.length} NS records, and ${discoveredSubdomains.length} active subdomains.`,
      metadata: { cleanDomain, dnsResults, subdomains: discoveredSubdomains },
    });
    setIsLogged(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6 bg-[#FFFFFF]">
      {/* Tool Header */}
      <div className="bg-[#FFFFFF] border border-[#E1E5E9] rounded-[6px] p-5" style={{ borderLeft: '3px solid #244A73' }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#244A73' }} />
              <h2 className="text-base font-semibold text-[#222222]">
                Domain Intelligence
              </h2>
              <span className="text-xs px-2 py-0.5 rounded bg-[#F0F4F8] text-[#244A73] border border-[#D0DFEF]">
                Network Infrastructure
              </span>
            </div>
            <p className="text-xs text-[#626B73] mt-1">
              Audit authoritative nameservers, Mail Exchangers, host records, and enumerate active subdomains using DoH infrastructure.
            </p>
          </div>

          <form onSubmit={handleScan} className="flex items-center gap-2">
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="targetdomain.edu"
              className="w-56 sm:w-64 px-3 py-1.5 text-xs border border-[#E1E5E9] rounded focus:outline-none focus:border-[#244A73] text-[#222222]"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-3.5 py-1.5 text-xs font-medium text-white rounded transition-colors disabled:opacity-60 flex items-center gap-1.5"
              style={{ backgroundColor: '#244A73' }}
            >
              <Search className="w-3.5 h-3.5" />
              <span>{loading ? 'Resolving...' : 'Scan Domain'}</span>
            </button>
          </form>
        </div>
      </div>

      {Object.keys(dnsResults).length > 0 && (
        <div className="space-y-6">
          {/* Top Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-[#FFFFFF] border border-[#E1E5E9] rounded-[6px]">
              <div className="text-[11px] text-[#626B73] uppercase tracking-wide">Domain Risk</div>
              <div className="mt-1 flex items-center justify-between">
                <RiskBadge risk={aRecords.length > 0 ? 'LOW' : 'MEDIUM'} />
                <span className="text-xs text-[#3A7D44] font-medium">Resolving</span>
              </div>
            </div>

            <div className="p-4 bg-[#FFFFFF] border border-[#E1E5E9] rounded-[6px]">
              <div className="text-[11px] text-[#626B73] uppercase tracking-wide">Primary IP (A)</div>
              <div className="mt-1 font-mono text-xs text-[#222222]">
                {aRecords[0]?.data || 'No A record'}
              </div>
            </div>

            <div className="p-4 bg-[#FFFFFF] border border-[#E1E5E9] rounded-[6px]">
              <div className="text-[11px] text-[#626B73] uppercase tracking-wide">Nameservers (NS)</div>
              <div className="mt-1 text-xs text-[#222222] truncate">
                {nsRecords.length} Authoritative servers
              </div>
            </div>

            <div className="p-4 bg-[#FFFFFF] border border-[#E1E5E9] rounded-[6px]">
              <div className="text-[11px] text-[#626B73] uppercase tracking-wide">Subdomains Found</div>
              <div className="mt-1 text-xs text-[#244A73] font-semibold">
                {discoveredSubdomains.length} active hosts
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* DNS Records Table */}
            <div className="lg:col-span-2 bg-[#FFFFFF] border border-[#E1E5E9] rounded-[6px] p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[#E1E5E9] pb-3">
                <h3 className="text-sm font-semibold text-[#222222]">
                  Authoritative DNS Records
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

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#E1E5E9] text-[#626B73] bg-[#F8F9FA]">
                      <th className="py-2 px-3">Type</th>
                      <th className="py-2 px-3">Record Value / Destination</th>
                      <th className="py-2 px-3 text-right">TTL</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E1E5E9]">
                    {Object.entries(dnsResults).map(([type, records]) =>
                      records.map((r, i) => (
                        <tr key={`${type}-${i}`} className="hover:bg-[#F8F9FA]/60">
                          <td className="py-2 px-3">
                            <span className="font-mono font-semibold px-1.5 py-0.5 rounded bg-[#F0F4F8] text-[#244A73] border border-[#D0DFEF]">
                              {r.type}
                            </span>
                          </td>
                          <td className="py-2 px-3 font-mono text-xs text-[#222222] break-all max-w-md">
                            {r.data}
                          </td>
                          <td className="py-2 px-3 text-right font-mono text-[#626B73]">
                            {r.TTL}s
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Subdomain Discovery Panel */}
            <div className="bg-[#FFFFFF] border border-[#E1E5E9] rounded-[6px] p-5 space-y-4">
              <h3 className="text-sm font-semibold text-[#222222] border-b border-[#E1E5E9] pb-3">
                Discovered Subdomains ({discoveredSubdomains.length})
              </h3>

              {discoveredSubdomains.length === 0 ? (
                <div className="text-xs text-[#626B73] py-4 text-center">
                  No standard subdomains identified via DoH lookup.
                </div>
              ) : (
                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                  {discoveredSubdomains.map((s, i) => (
                    <div key={i} className="p-2.5 rounded bg-[#F8F9FA] border border-[#E1E5E9] text-xs">
                      <div className="font-mono font-medium text-[#244A73] flex items-center justify-between">
                        <span className="truncate">{s.sub}</span>
                        <a
                          href={`http://${s.sub}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#626B73] hover:text-[#222222]"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <div className="font-mono text-[11px] text-[#626B73] mt-1">
                        IP: {s.ip}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
