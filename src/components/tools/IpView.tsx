import React, { useState } from 'react';
import { analyzeIp } from '../../utils/ip';
import { IpAnalysisResult, InvestigationFinding } from '../../types';
import { RiskBadge } from '../Badges';
import { Search, MapPin, Network, Server, Shield, BookmarkPlus, Check, ExternalLink } from 'lucide-react';

interface IpViewProps {
  onAddFinding: (finding: Omit<InvestigationFinding, 'id' | 'timestamp'>) => void;
}

export const IpView: React.FC<IpViewProps> = ({ onAddFinding }) => {
  const [ip, setIp] = useState<string>('8.8.8.8');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<IpAnalysisResult | null>(null);
  const [isLogged, setIsLogged] = useState<boolean>(false);

  const handleLookup = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!ip.trim()) return;

    setLoading(true);
    setIsLogged(false);
    try {
      const data = await analyzeIp(ip.trim());
      setResult(data);
    } finally {
      setLoading(false);
    }
  };

  const handleLog = () => {
    if (!result) return;
    onAddFinding({
      sourceTool: 'ip',
      target: result.ip,
      type: 'IP & Geolocation Intelligence',
      title: `IP Audit: ${result.ip} (${result.country})`,
      risk: result.risk,
      status: 'Completed',
      details: `${result.version}. Location: ${result.city}, ${result.region}, ${result.country}. ASN: ${result.asn} (${result.org}). ISP: ${result.isp}. PTR: ${result.ptr || 'None'}.`,
      metadata: result,
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
                IP Intelligence
              </h2>
              <span className="text-xs px-2 py-0.5 rounded bg-[#F0F4F8] text-[#244A73] border border-[#D0DFEF]">
                Geolocation &amp; Routing
              </span>
            </div>
            <p className="text-xs text-[#626B73] mt-1">
              Geolocate IPv4/IPv6 endpoints, query Autonomous System Numbers (ASN), audit reverse DNS (PTR), and evaluate hosting proxies.
            </p>
          </div>

          <form onSubmit={handleLookup} className="flex items-center gap-2">
            <input
              type="text"
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              placeholder="e.g. 1.1.1.1 or 2606:4700::"
              className="w-56 sm:w-64 px-3 py-1.5 text-xs border border-[#E1E5E9] rounded focus:outline-none focus:border-[#244A73] text-[#222222]"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-3.5 py-1.5 text-xs font-medium text-white rounded transition-colors disabled:opacity-60 flex items-center gap-1.5"
              style={{ backgroundColor: '#244A73' }}
            >
              <Search className="w-3.5 h-3.5" />
              <span>{loading ? 'Locating...' : 'Trace IP'}</span>
            </button>
          </form>
        </div>
      </div>

      {result && (
        <div className="space-y-6">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-[#FFFFFF] border border-[#E1E5E9] rounded-[6px]">
              <div className="text-[11px] text-[#626B73] uppercase tracking-wide">Threat Assessment</div>
              <div className="mt-1 flex items-center justify-between">
                <RiskBadge risk={result.risk} />
                <span className="text-xs text-[#626B73] font-mono">{result.version}</span>
              </div>
            </div>

            <div className="p-4 bg-[#FFFFFF] border border-[#E1E5E9] rounded-[6px]">
              <div className="text-[11px] text-[#626B73] uppercase tracking-wide">Location</div>
              <div className="mt-1 text-xs font-medium text-[#222222] truncate">
                {result.city}, {result.country}
              </div>
            </div>

            <div className="p-4 bg-[#FFFFFF] border border-[#E1E5E9] rounded-[6px]">
              <div className="text-[11px] text-[#626B73] uppercase tracking-wide">Autonomous System</div>
              <div className="mt-1 font-mono text-xs text-[#244A73] font-medium truncate">
                {result.asn}
              </div>
            </div>

            <div className="p-4 bg-[#FFFFFF] border border-[#E1E5E9] rounded-[6px]">
              <div className="text-[11px] text-[#626B73] uppercase tracking-wide">Reverse PTR</div>
              <div className="mt-1 font-mono text-xs text-[#222222] truncate">
                {result.ptr || 'No PTR Record'}
              </div>
            </div>
          </div>

          {/* Detailed Info Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-[#FFFFFF] border border-[#E1E5E9] rounded-[6px] p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[#E1E5E9] pb-3">
                <h3 className="text-sm font-semibold text-[#222222]">
                  Network Infrastructure &amp; Routing
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

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-2 border-b border-[#E1E5E9]/60">
                  <span className="text-[#626B73]">IP Address:</span>
                  <span className="font-mono text-[#222222] font-semibold">{result.ip}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#E1E5E9]/60">
                  <span className="text-[#626B73]">Network Classification:</span>
                  <span className={result.isPrivate ? 'text-[#B7791F]' : 'text-[#3A7D44]'}>
                    {result.isPrivate ? 'Internal Private Intranet (RFC-1918)' : 'Public Internet Routable'}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#E1E5E9]/60">
                  <span className="text-[#626B73]">Internet Service Provider (ISP):</span>
                  <span className="text-[#222222] font-medium">{result.isp}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#E1E5E9]/60">
                  <span className="text-[#626B73]">Organization:</span>
                  <span className="text-[#222222] font-medium">{result.org}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#E1E5E9]/60">
                  <span className="text-[#626B73]">Timezone:</span>
                  <span className="font-mono text-[#222222]">{result.timezone}</span>
                </div>
                {result.ptr && (
                  <div className="flex justify-between py-2 border-b border-[#E1E5E9]/60">
                    <span className="text-[#626B73]">PTR Hostname:</span>
                    <span className="font-mono text-[#244A73]">{result.ptr}</span>
                  </div>
                )}
              </div>

              {/* Threat Heuristics */}
              <div className="pt-2">
                <div className="text-xs font-semibold text-[#222222] mb-2">Threat Indicators:</div>
                <div className="space-y-1.5">
                  {result.riskReasons.map((r, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 bg-[#F8F9FA] rounded border border-[#E1E5E9] text-xs">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#244A73' }} />
                      <span className="text-[#222222]">{r}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Geolocation Card */}
            <div className="bg-[#FFFFFF] border border-[#E1E5E9] rounded-[6px] p-5 space-y-4">
              <h3 className="text-sm font-semibold text-[#222222] border-b border-[#E1E5E9] pb-3 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#244A73]" />
                <span>Geographic Intelligence</span>
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-[#E1E5E9]/50">
                  <span className="text-[#626B73]">City:</span>
                  <span className="text-[#222222] font-medium">{result.city}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#E1E5E9]/50">
                  <span className="text-[#626B73]">Region / State:</span>
                  <span className="text-[#222222]">{result.region}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#E1E5E9]/50">
                  <span className="text-[#626B73]">Country:</span>
                  <span className="text-[#222222] font-medium">{result.country} ({result.countryCode})</span>
                </div>
                {result.latitude !== undefined && result.longitude !== undefined && (
                  <>
                    <div className="flex justify-between py-1 border-b border-[#E1E5E9]/50">
                      <span className="text-[#626B73]">Latitude:</span>
                      <span className="font-mono text-[#222222]">{result.latitude}°</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#E1E5E9]/50">
                      <span className="text-[#626B73]">Longitude:</span>
                      <span className="font-mono text-[#222222]">{result.longitude}°</span>
                    </div>

                    <div className="pt-2">
                      <a
                        href={`https://www.openstreetmap.org/?mlat=${result.latitude}&mlon=${result.longitude}#map=12/${result.latitude}/${result.longitude}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-[#244A73] hover:underline"
                      >
                        <span>View on OpenStreetMap</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
