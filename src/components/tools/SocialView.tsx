import React, { useState } from 'react';
import { InvestigationFinding } from '../../types';
import { RiskBadge, StatusBadge } from '../Badges';
import { Search, Users, ExternalLink, BookmarkPlus, Check, Share2, Sparkles } from 'lucide-react';

interface SocialViewProps {
  onAddFinding: (finding: Omit<InvestigationFinding, 'id' | 'timestamp'>) => void;
}

export const SocialView: React.FC<SocialViewProps> = ({ onAddFinding }) => {
  const [handle, setHandle] = useState<string>('syedimran');
  const [permutations, setPermutations] = useState<string[]>([]);
  const [activeProfiles, setActiveProfiles] = useState<Array<{ platform: string; url: string; category: string }>>([]);
  const [isLogged, setIsLogged] = useState<boolean>(false);

  const handleGenerate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = handle.trim().toLowerCase().replace(/^@/, '');
    if (!clean) return;

    setIsLogged(false);

    // Generate smart alias variations commonly used across networks
    const parts = clean.split(/[._-]/);
    const first = parts[0] || clean;
    const last = parts[1] || '';

    const list = [
      clean,
      `${clean}_`,
      `_${clean}`,
      `${clean}01`,
      `${clean}dev`,
      `${clean}_official`,
      last ? `${first}.${last}` : `${clean}.io`,
      last ? `${last}.${first}` : `${clean}_research`,
      last ? `${first}_${last}` : `real_${clean}`,
    ];

    setPermutations(Array.from(new Set(list)));

    // Formatted key platforms
    setActiveProfiles([
      { platform: 'GitHub', url: `https://github.com/${clean}`, category: 'Code / Technical' },
      { platform: 'LinkedIn', url: `https://linkedin.com/in/${clean}`, category: 'Professional' },
      { platform: 'X / Twitter', url: `https://x.com/${clean}`, category: 'Microblogging' },
      { platform: 'Reddit', url: `https://reddit.com/user/${clean}`, category: 'Community' },
      { platform: 'Telegram', url: `https://t.me/${clean}`, category: 'Messaging' },
      { platform: 'Kaggle', url: `https://kaggle.com/${clean}`, category: 'Data Science' },
      { platform: 'Medium', url: `https://medium.com/@${clean}`, category: 'Publishing' },
      { platform: 'YouTube', url: `https://youtube.com/@${clean}`, category: 'Media' },
    ]);
  };

  const handleLog = () => {
    onAddFinding({
      sourceTool: 'social',
      target: `@${handle}`,
      type: 'Social Persona & Footprint Mapping',
      title: `Social Mapping: @${handle}`,
      risk: 'GUARDED',
      status: 'Completed',
      details: `Generated ${permutations.length} alias variants and indexed ${activeProfiles.length} cross-network profile locations for digital persona correlation.`,
      metadata: { handle, permutations, activeProfiles },
    });
    setIsLogged(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6 bg-[#FFFFFF]">
      {/* Header */}
      <div className="bg-[#FFFFFF] border border-[#E1E5E9] rounded-[6px] p-5" style={{ borderLeft: '3px solid #665191' }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#665191' }} />
              <h2 className="text-base font-semibold text-[#222222]">
                Social Profile Intelligence
              </h2>
              <span className="text-xs px-2 py-0.5 rounded bg-[#F5F2F9] text-[#665191] border border-[#DDD5E9]">
                Persona Correlation &amp; Footprint
              </span>
            </div>
            <p className="text-xs text-[#626B73] mt-1">
              Correlate cross-network pseudonyms, calculate username permutations, and map public digital identity footprints.
            </p>
          </div>

          <form onSubmit={handleGenerate} className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder="Target alias or handle"
                className="w-56 sm:w-64 pl-7 pr-3 py-1.5 text-xs border border-[#E1E5E9] rounded focus:outline-none focus:border-[#665191] text-[#222222]"
              />
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-[#626B73]">@</span>
            </div>
            <button
              type="submit"
              className="px-3.5 py-1.5 text-xs font-medium text-white rounded transition-colors flex items-center gap-1.5"
              style={{ backgroundColor: '#244A73' }}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Map Persona</span>
            </button>
          </form>
        </div>
      </div>

      {activeProfiles.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Profiles Table */}
          <div className="lg:col-span-2 bg-[#FFFFFF] border border-[#E1E5E9] rounded-[6px] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E1E5E9] pb-3">
              <h3 className="text-sm font-semibold text-[#222222]">
                Cross-Network Profile Targets
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
                    <th className="py-2.5 px-3">Network</th>
                    <th className="py-2.5 px-3">Domain Focus</th>
                    <th className="py-2.5 px-3">Target URL</th>
                    <th className="py-2.5 px-3 text-right">Audit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E1E5E9]">
                  {activeProfiles.map((p, i) => (
                    <tr key={i} className="hover:bg-[#F8F9FA]/60">
                      <td className="py-2.5 px-3 font-medium text-[#222222]">
                        {p.platform}
                      </td>
                      <td className="py-2.5 px-3 text-[#626B73]">
                        {p.category}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-xs">
                        <a
                          href={p.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#244A73] hover:underline flex items-center gap-1 truncate max-w-sm"
                        >
                          <span className="truncate">{p.url}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <StatusBadge status="Potential Match" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Alias Permutation Generator */}
          <div className="bg-[#FFFFFF] border border-[#E1E5E9] rounded-[6px] p-5 space-y-4">
            <h3 className="text-sm font-semibold text-[#222222] border-b border-[#E1E5E9] pb-3 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#665191]" />
              <span>Attribution Permutations</span>
            </h3>

            <p className="text-xs text-[#626B73]">
              Automated algorithmic variations representing probable username shifts across registrations:
            </p>

            <div className="space-y-1.5 max-h-[340px] overflow-y-auto pr-1">
              {permutations.map((v, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 rounded bg-[#F8F9FA] border border-[#E1E5E9] text-xs font-mono text-[#222222]"
                >
                  <span>@{v}</span>
                  <span className="text-[10px] text-[#665191] font-sans font-medium px-1.5 py-0.5 bg-[#FFFFFF] rounded border border-[#E1E5E9]">
                    Variant #{i + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
