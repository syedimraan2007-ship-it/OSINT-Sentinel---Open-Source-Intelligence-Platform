import React, { useState } from 'react';
import { checkUsername, UsernameCheckResult, PLATFORMS } from '../../utils/usernameChecker';
import { StatusBadge } from '../Badges';
import { Search, ExternalLink, BookmarkPlus, Check, Filter } from 'lucide-react';
import { InvestigationFinding } from '../../types';

interface UsernameViewProps {
  onAddFinding: (finding: Omit<InvestigationFinding, 'id' | 'timestamp'>) => void;
}

export const UsernameView: React.FC<UsernameViewProps> = ({ onAddFinding }) => {
  const [username, setUsername] = useState<string>('torvalds');
  const [loading, setLoading] = useState<boolean>(false);
  const [results, setResults] = useState<UsernameCheckResult[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!username.trim()) return;

    setLoading(true);
    setResults([]);
    try {
      const data = await checkUsername(username.trim(), (item) => {
        setResults((prev) => [...prev, item]);
      });
      setResults(data);
    } finally {
      setLoading(false);
    }
  };

  const handleLog = (item: UsernameCheckResult) => {
    const key = `${item.platform}-${item.url}`;
    onAddFinding({
      sourceTool: 'username',
      target: `@${username}`,
      type: 'Profile Footprint',
      title: `${item.platform} Account Profile`,
      risk: item.verified ? 'LOW' : 'GUARDED',
      status: item.status,
      details: `${item.platform} (${item.category}): ${item.url}. ${item.details}`,
      metadata: { platform: item.platform, url: item.url, verified: item.verified },
    });
    setAddedIds((prev) => new Set([...prev, key]));
  };

  const categories = ['ALL', 'Coding & Dev', 'Social', 'Community', 'Media & Music', 'Professional'];

  const filteredResults = results.filter((r) => {
    if (filterCategory === 'ALL') return true;
    return r.category === filterCategory;
  });

  const verifiedCount = results.filter((r) => r.verified).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6 bg-[#FFFFFF]">
      {/* Tool Header */}
      <div className="bg-[#FFFFFF] border border-[#E1E5E9] rounded-[6px] p-5" style={{ borderLeft: '3px solid #244A73' }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#244A73' }} />
              <h2 className="text-base font-semibold text-[#222222]">
                Username Intelligence
              </h2>
              <span className="text-xs px-2 py-0.5 rounded bg-[#F0F4F8] text-[#244A73] border border-[#D0DFEF]">
                Identity Attribution
              </span>
            </div>
            <p className="text-xs text-[#626B73] mt-1">
              Enumerate account presence, evaluate platform namespace collisions, and discover digital personas across public platforms.
            </p>
          </div>

          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username handle (e.g. torvalds)"
                className="w-56 sm:w-64 pl-8 pr-3 py-1.5 text-xs border border-[#E1E5E9] rounded focus:outline-none focus:border-[#244A73] text-[#222222]"
              />
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-[#626B73]">@</span>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-3.5 py-1.5 text-xs font-medium text-white rounded transition-colors disabled:opacity-60 flex items-center gap-1.5"
              style={{ backgroundColor: '#244A73' }}
            >
              <Search className="w-3.5 h-3.5" />
              <span>{loading ? 'Searching...' : 'Scan Profile'}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Results Controls & Stats */}
      {results.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-4 bg-[#F8F9FA] border border-[#E1E5E9] p-3 rounded-[6px] text-xs">
          <div className="flex items-center gap-4 text-[#626B73]">
            <span>Total scanned: <strong className="text-[#222222]">{results.length}</strong></span>
            <span>•</span>
            <span>API Confirmed: <strong className="text-[#3A7D44]">{verifiedCount}</strong></span>
            <span>•</span>
            <span>Potential targets: <strong className="text-[#244A73]">{results.length - verifiedCount}</strong></span>
          </div>

          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-[#626B73]" />
            <span className="text-[#626B73]">Category:</span>
            <div className="flex gap-1 overflow-x-auto">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setFilterCategory(c)}
                  className={`px-2 py-1 text-[11px] rounded transition-colors ${
                    filterCategory === c
                      ? 'bg-[#244A73] text-white font-medium'
                      : 'bg-[#FFFFFF] border border-[#E1E5E9] text-[#626B73] hover:text-[#222222]'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Results Table */}
      {results.length === 0 && !loading ? (
        <div className="p-12 text-center bg-[#FFFFFF] border border-[#E1E5E9] rounded-[6px] text-xs text-[#626B73]">
          Click "Scan Profile" above to initiate cross-platform namespace search across {PLATFORMS.length} services.
        </div>
      ) : (
        <div className="bg-[#FFFFFF] border border-[#E1E5E9] rounded-[6px] overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E1E5E9] bg-[#F8F9FA] text-[#626B73] font-medium">
                <th className="py-2.5 px-4">Platform</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Public Profile URL</th>
                <th className="py-2.5 px-3">Intelligence Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E1E5E9]">
              {filteredResults.map((item) => {
                const key = `${item.platform}-${item.url}`;
                const isLogged = addedIds.has(key);

                return (
                  <tr key={key} className="hover:bg-[#F8F9FA]/60 transition-colors">
                    <td className="py-3 px-4 font-medium text-[#222222]">
                      <div className="flex items-center gap-2">
                        {item.avatarUrl && (
                          <img
                            src={item.avatarUrl}
                            alt=""
                            className="w-5 h-5 rounded-full border border-[#E1E5E9]"
                          />
                        )}
                        <span>{item.platform}</span>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-[#626B73]">
                      <span className="px-1.5 py-0.5 rounded bg-[#F8F9FA] border border-[#E1E5E9] text-[11px]">
                        {item.category}
                      </span>
                    </td>

                    <td className="py-3 px-3 font-mono text-xs">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#244A73] hover:underline flex items-center gap-1 max-w-sm truncate"
                      >
                        <span className="truncate">{item.url}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                      {item.bio && (
                        <p className="font-sans text-[11px] text-[#626B73] mt-0.5 truncate max-w-md">
                          {item.bio}
                        </p>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      <StatusBadge status={item.status} />
                    </td>

                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleLog(item)}
                          disabled={isLogged}
                          className={`px-2.5 py-1 rounded text-[11px] font-medium flex items-center gap-1 transition-colors ${
                            isLogged
                              ? 'bg-[#F2F7F3] text-[#3A7D44] border border-[#D3E6D6]'
                              : 'bg-[#FFFFFF] border border-[#244A73] text-[#244A73] hover:bg-[#F0F4F8]'
                          }`}
                        >
                          {isLogged ? (
                            <>
                              <Check className="w-3 h-3" />
                              <span>Logged</span>
                            </>
                          ) : (
                            <>
                              <BookmarkPlus className="w-3 h-3" />
                              <span>Log Artifact</span>
                            </>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
