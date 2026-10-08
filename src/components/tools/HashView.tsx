import React, { useState } from 'react';
import { identifyHashType, computeSubtleHash, md5, KNOWN_THREAT_SIGNATURES, calculateShannonEntropy } from '../../utils/crypto';
import { InvestigationFinding } from '../../types';
import { RiskBadge } from '../Badges';
import { Search, Hash, ShieldCheck, ShieldAlert, BookmarkPlus, Check, ExternalLink, Cpu, Copy } from 'lucide-react';

interface HashViewProps {
  onAddFinding: (finding: Omit<InvestigationFinding, 'id' | 'timestamp'>) => void;
}

export const HashView: React.FC<HashViewProps> = ({ onAddFinding }) => {
  const [hashInput, setHashInput] = useState<string>('24d004a104d4d54034dbc29c2f81fb077b36724da6e029efb36e0b0e5d850eee');
  const [textInput, setTextInput] = useState<string>('');
  const [calculatedHashes, setCalculatedHashes] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'inspect' | 'generate'>('inspect');
  const [isLogged, setIsLogged] = useState<boolean>(false);
  const [copied, setCopied] = useState<string | null>(null);

  // Identify input
  const cleanHash = hashInput.trim().toLowerCase();
  const identification = identifyHashType(cleanHash);
  const matchedThreat = KNOWN_THREAT_SIGNATURES[cleanHash];
  const entropy = calculateShannonEntropy(cleanHash);

  const handleComputeForText = async () => {
    if (!textInput) return;
    const md5Val = md5(textInput);
    const sha1Val = await computeSubtleHash('SHA-1', textInput);
    const sha256Val = await computeSubtleHash('SHA-256', textInput);
    const sha512Val = await computeSubtleHash('SHA-512', textInput);

    setCalculatedHashes({
      MD5: md5Val,
      'SHA-1': sha1Val,
      'SHA-256': sha256Val,
      'SHA-512': sha512Val,
    });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleLog = () => {
    onAddFinding({
      sourceTool: 'hash',
      target: cleanHash,
      type: 'Cryptographic Hash Intelligence',
      title: `Hash Inspection: ${identification.type}`,
      risk: matchedThreat?.verdict === 'MALICIOUS' ? 'CRITICAL' : matchedThreat?.verdict === 'SAFE / TEST' ? 'GUARDED' : 'LOW',
      status: 'Completed',
      details: `Type: ${identification.type} (${identification.bitLength}-bit). Matched Threat: ${
        matchedThreat ? `${matchedThreat.name} [${matchedThreat.verdict}]` : 'No known threat match'
      }. Entropy: ${entropy}.`,
      metadata: { cleanHash, identification, matchedThreat, entropy },
    });
    setIsLogged(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6 bg-[#FFFFFF]">
      {/* Header */}
      <div className="bg-[#FFFFFF] border border-[#E1E5E9] rounded-[6px] p-5" style={{ borderLeft: '3px solid #3A7D44' }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#3A7D44' }} />
              <h2 className="text-base font-semibold text-[#222222]">
                Hash Intelligence &amp; Cryptography
              </h2>
              <span className="text-xs px-2 py-0.5 rounded bg-[#F2F7F3] text-[#3A7D44] border border-[#D3E6D6]">
                Cryptographic Forensics &amp; Malware Signatures
              </span>
            </div>
            <p className="text-xs text-[#626B73] mt-1">
              Identify hash algorithms, calculate cryptographic digests (MD5, SHA-1, SHA-256, SHA-512), audit Shannon entropy, and verify malware signatures.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('inspect')}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                activeTab === 'inspect'
                  ? 'bg-[#3A7D44] text-white'
                  : 'bg-[#FFFFFF] border border-[#E1E5E9] text-[#626B73]'
              }`}
            >
              Analyze Existing Hash
            </button>
            <button
              onClick={() => setActiveTab('generate')}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                activeTab === 'generate'
                  ? 'bg-[#3A7D44] text-white'
                  : 'bg-[#FFFFFF] border border-[#E1E5E9] text-[#626B73]'
              }`}
            >
              Hash Generator
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'inspect' ? (
        <div className="space-y-6">
          {/* Input Box */}
          <div className="bg-[#FFFFFF] border border-[#E1E5E9] rounded-[6px] p-5">
            <label className="block text-xs font-semibold text-[#222222] mb-1.5">
              Target Cryptographic Hash (MD5, SHA-1, SHA-256, SHA-512, etc.)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={hashInput}
                onChange={(e) => {
                  setHashInput(e.target.value);
                  setIsLogged(false);
                }}
                placeholder="Enter hash hex string..."
                className="flex-1 px-3 py-2 text-xs font-mono border border-[#E1E5E9] rounded focus:outline-none focus:border-[#3A7D44] text-[#222222]"
              />
              <button
                onClick={() => setHashInput('275a021bbfb6489e54d471899f7db9d1663fc695ec2fe2a2c4538aabf651fd0f')}
                className="px-3 py-2 text-xs border border-[#E1E5E9] text-[#626B73] hover:text-[#222222] rounded shrink-0"
              >
                Sample EICAR
              </button>
              <button
                onClick={() => setHashInput('24d004a104d4d54034dbc29c2f81fb077b36724da6e029efb36e0b0e5d850eee')}
                className="px-3 py-2 text-xs border border-[#E1E5E9] text-[#626B73] hover:text-[#222222] rounded shrink-0"
              >
                Sample WannaCry
              </button>
            </div>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-[#FFFFFF] border border-[#E1E5E9] rounded-[6px]">
              <div className="text-[11px] text-[#626B73] uppercase tracking-wide">Threat Status</div>
              <div className="mt-1 flex items-center justify-between">
                <RiskBadge
                  risk={
                    matchedThreat?.verdict === 'MALICIOUS'
                      ? 'CRITICAL'
                      : matchedThreat?.verdict === 'SAFE / TEST'
                      ? 'GUARDED'
                      : 'LOW'
                  }
                />
                <span className="text-xs font-semibold text-[#222222]">
                  {matchedThreat?.verdict || 'Unflagged'}
                </span>
              </div>
            </div>

            <div className="p-4 bg-[#FFFFFF] border border-[#E1E5E9] rounded-[6px]">
              <div className="text-[11px] text-[#626B73] uppercase tracking-wide">Identified Format</div>
              <div className="mt-1 text-xs font-semibold text-[#3A7D44] truncate">
                {identification.type}
              </div>
            </div>

            <div className="p-4 bg-[#FFFFFF] border border-[#E1E5E9] rounded-[6px]">
              <div className="text-[11px] text-[#626B73] uppercase tracking-wide">Bit / Byte Length</div>
              <div className="mt-1 font-mono text-xs text-[#222222]">
                {identification.bitLength} bits ({identification.byteLength} bytes)
              </div>
            </div>

            <div className="p-4 bg-[#FFFFFF] border border-[#E1E5E9] rounded-[6px]">
              <div className="text-[11px] text-[#626B73] uppercase tracking-wide">Shannon Entropy</div>
              <div className="mt-1 font-mono text-xs text-[#222222]">
                {entropy} / 4.000 max
              </div>
            </div>
          </div>

          {/* Detailed Info */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-[#FFFFFF] border border-[#E1E5E9] rounded-[6px] p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[#E1E5E9] pb-3">
                <h3 className="text-sm font-semibold text-[#222222]">
                  Threat Intelligence Signature Evaluation
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

              {matchedThreat ? (
                <div
                  className={`p-4 rounded-[6px] border space-y-2 ${
                    matchedThreat.verdict === 'MALICIOUS'
                      ? 'bg-[#FAEDED] border-[#F3CCCC]'
                      : 'bg-[#F2F7F3] border-[#D3E6D6]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-semibold text-[#222222] flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-[#B23A3A]" />
                      <span>{matchedThreat.name}</span>
                    </div>
                    <span className="text-xs font-mono font-bold">{matchedThreat.category}</span>
                  </div>
                  <p className="text-xs text-[#222222] leading-relaxed">
                    {matchedThreat.description}
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded bg-[#F8F9FA] border border-[#E1E5E9] text-xs text-[#626B73]">
                  No exact match in local academic threat repository. Check third-party feeds below for global IOC reputation.
                </div>
              )}

              <div className="pt-2">
                <div className="text-xs font-semibold text-[#222222] mb-2">
                  External Intelligence Pivot Links:
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <a
                    href={`https://www.virustotal.com/gui/search/${cleanHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-[#FFFFFF] border border-[#E1E5E9] rounded hover:border-[#244A73] flex items-center gap-1 text-[#244A73]"
                  >
                    <span>VirusTotal</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <a
                    href={`https://www.hybrid-analysis.com/search?query=${cleanHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-[#FFFFFF] border border-[#E1E5E9] rounded hover:border-[#244A73] flex items-center gap-1 text-[#244A73]"
                  >
                    <span>Hybrid Analysis</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <a
                    href={`https://bazaar.abuse.ch/browse.php?search=hash%3A${cleanHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-[#FFFFFF] border border-[#E1E5E9] rounded hover:border-[#244A73] flex items-center gap-1 text-[#244A73]"
                  >
                    <span>MalwareBazaar</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* Candidate Algorithms */}
            <div className="bg-[#FFFFFF] border border-[#E1E5E9] rounded-[6px] p-5 space-y-4">
              <h3 className="text-sm font-semibold text-[#222222] border-b border-[#E1E5E9] pb-3">
                Candidate Hash Algorithms
              </h3>

              <div className="space-y-2">
                {identification.possibleAlgorithms.map((algo, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 rounded bg-[#F8F9FA] border border-[#E1E5E9] text-xs"
                  >
                    <span className="font-mono text-[#222222] font-medium">{algo}</span>
                    <span className="text-[10px] text-[#3A7D44] font-semibold bg-[#FFFFFF] px-1.5 py-0.5 rounded border border-[#E1E5E9]">
                      MATCH
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Generator Tab */
        <div className="bg-[#FFFFFF] border border-[#E1E5E9] rounded-[6px] p-5 space-y-6">
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[#222222]">
              Input String / Payload to Compute Cryptographic Digests
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Enter text to hash (e.g. password, secret, token, email)..."
                className="flex-1 px-3 py-2 text-xs border border-[#E1E5E9] rounded focus:outline-none focus:border-[#3A7D44] text-[#222222]"
              />
              <button
                onClick={handleComputeForText}
                className="px-4 py-2 text-xs font-medium text-white rounded"
                style={{ backgroundColor: '#3A7D44' }}
              >
                Compute Digests
              </button>
            </div>
          </div>

          {Object.keys(calculatedHashes).length > 0 && (
            <div className="space-y-3 pt-3 border-t border-[#E1E5E9]">
              <h4 className="text-xs font-semibold text-[#222222] uppercase tracking-wide">
                Computed Digests
              </h4>

              {Object.entries(calculatedHashes).map(([algo, h]) => (
                <div key={algo} className="p-3 rounded bg-[#F8F9FA] border border-[#E1E5E9] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#3A7D44]">{algo}</span>
                    <button
                      onClick={() => copyToClipboard(h, algo)}
                      className="text-[11px] text-[#626B73] hover:text-[#222222] flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copied === algo ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="font-mono text-xs text-[#222222] break-all select-all">
                    {h}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
