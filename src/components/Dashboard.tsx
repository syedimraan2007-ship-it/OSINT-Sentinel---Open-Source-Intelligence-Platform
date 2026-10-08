import React, { useState } from 'react';
import { ToolCard } from './ToolCard';
import { TOOLS_CONFIG } from '../utils/toolsConfig';
import { ToolId, InvestigationCase } from '../types';
import { RiskBadge, StatusBadge } from './Badges';
import { Search, ArrowRight, ShieldCheck, Database, FileText, CheckCircle2 } from 'lucide-react';

interface DashboardProps {
  onSelectTool: (toolId: ToolId) => void;
  activeCase: InvestigationCase;
}

export const Dashboard: React.FC<DashboardProps> = ({ onSelectTool, activeCase }) => {
  const [quickInput, setQuickInput] = useState<string>('');

  // Quick detect target type
  const handleQuickRoute = (e: React.FormEvent) => {
    e.preventDefault();
    const query = quickInput.trim();
    if (!query) return;

    if (query.includes('@')) {
      onSelectTool('email');
    } else if (/^(\d{1,3}\.){3}\d{1,3}$/.test(query) || query.includes(':')) {
      onSelectTool('ip');
    } else if (query.startsWith('http://') || query.startsWith('https://')) {
      onSelectTool('url');
    } else if (/^[0-9a-f]{32,128}$/i.test(query)) {
      onSelectTool('hash');
    } else if (query.includes('.') && !query.includes(' ')) {
      onSelectTool('domain');
    } else {
      onSelectTool('username');
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 py-6 bg-[#FFFFFF]">
      {/* Institutional Mission Banner */}
      <div className="bg-[#FFFFFF] border border-[#E1E5E9] rounded-[6px] p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#244A73' }} />
              <span className="text-xs uppercase tracking-wider font-semibold text-[#244A73]">
                Academic Intelligence Framework
              </span>
            </div>
            <h2 className="text-xl font-medium tracking-tight text-[#222222]">
              OSINT SENTINEL Forensic Workbench
            </h2>
            <p className="text-sm text-[#626B73] leading-relaxed">
              Standardized Open Source Intelligence (OSINT) suite operated under the joint academic purview of{' '}
              <span className="text-[#222222] font-medium">SPARC Organization</span> and{' '}
              <span className="text-[#222222] font-medium">Rajeev Gandhi Memorial College of Engineering and Technology</span>.
              Designed for verifiable digital investigations, attribution analysis, and technical evidence preservation.
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0 border-t md:border-t-0 md:border-l border-[#E1E5E9] pt-4 md:pt-0 md:pl-6">
            <div className="text-left space-y-1">
              <div className="text-xs text-[#626B73]">Active Investigation Dossier</div>
              <div className="text-sm font-semibold text-[#222222] truncate max-w-[180px]">
                {activeCase.id}
              </div>
              <div className="text-xs text-[#3A7D44] flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Audited Integrity</span>
              </div>
            </div>
            <button
              onClick={() => onSelectTool('investigation')}
              className="text-xs font-medium px-3 py-2 rounded text-white shrink-0"
              style={{ backgroundColor: '#244A73' }}
            >
              Open Dossier
            </button>
          </div>
        </div>

        {/* Target Quick Dispatcher */}
        <div className="mt-6 pt-5 border-t border-[#E1E5E9]">
          <form onSubmit={handleQuickRoute} className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-[#626B73] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={quickInput}
                onChange={(e) => setQuickInput(e.target.value)}
                placeholder="Enter any target indicator (e.g. user handle, admin@corp.com, 1.1.1.1, suspicious.xyz, hash) to route..."
                className="w-full pl-10 pr-4 py-2 text-xs border border-[#E1E5E9] rounded-[4px] focus:outline-none focus:border-[#244A73] transition-colors bg-[#FFFFFF] text-[#222222]"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-2 text-xs font-medium text-white rounded-[4px] transition-colors shrink-0"
              style={{ backgroundColor: '#244A73' }}
            >
              Identify &amp; Dispatch
            </button>
          </form>
        </div>
      </div>

      {/* Analytical Modules Grid */}
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-[#222222] uppercase tracking-wider">
              Investigation Modules ({TOOLS_CONFIG.length})
            </h3>
            <span className="text-xs text-[#626B73]">
              Standardized Institutional Toolset
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {TOOLS_CONFIG.map((tool) => (
              <ToolCard key={tool.id} tool={tool} onSelect={onSelectTool} />
            ))}
          </div>
        </div>
      </div>

      {/* Case Findings Summary Table */}
      <div className="bg-[#FFFFFF] border border-[#E1E5E9] rounded-[6px] p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#244A73]" />
            <h3 className="text-sm font-semibold text-[#222222]">
              Case Dossier Evidence Log ({activeCase.findings.length} Artifacts)
            </h3>
          </div>
          <button
            onClick={() => onSelectTool('investigation')}
            className="text-xs font-medium hover:underline flex items-center gap-1"
            style={{ color: '#244A73' }}
          >
            <span>Full Report View</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {activeCase.findings.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#626B73] bg-[#F8F9FA] rounded border border-[#E1E5E9]/60">
            No findings currently logged in this case dossier. Open any analytical tool above to inspect targets and log evidence.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E1E5E9] text-[#626B73] font-medium bg-[#F8F9FA]/60">
                  <th className="py-2.5 px-3">Target</th>
                  <th className="py-2.5 px-3">Type / Tool</th>
                  <th className="py-2.5 px-3">Title / Finding</th>
                  <th className="py-2.5 px-3">Risk Assessment</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E1E5E9]">
                {activeCase.findings.slice(0, 5).map((f) => (
                  <tr key={f.id} className="hover:bg-[#F8F9FA]/50 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-medium text-[#222222]">
                      {f.target}
                    </td>
                    <td className="py-2.5 px-3 text-[#626B73]">
                      {f.type}
                    </td>
                    <td className="py-2.5 px-3 text-[#222222]">
                      {f.title}
                    </td>
                    <td className="py-2.5 px-3">
                      <RiskBadge risk={f.risk} />
                    </td>
                    <td className="py-2.5 px-3">
                      <StatusBadge status={f.status} />
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-[#626B73]">
                      {f.timestamp}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
