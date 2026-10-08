import React, { useState } from 'react';
import { InvestigationCase, InvestigationFinding, RiskLevel, StatusType } from '../types';
import { RiskBadge, StatusBadge } from './Badges';
import { RgmcetLogo, SparcLogo } from './Logos';
import { FolderLock, Printer, Download, Plus, Trash2, FileCheck, ShieldAlert, Award } from 'lucide-react';

interface InvestigationViewProps {
  currentCase: InvestigationCase;
  onUpdateCase: (updated: InvestigationCase) => void;
  onRemoveFinding: (findingId: string) => void;
  onAddFinding: (finding: Omit<InvestigationFinding, 'id' | 'timestamp'>) => void;
}

export const InvestigationView: React.FC<InvestigationViewProps> = ({
  currentCase,
  onUpdateCase,
  onRemoveFinding,
  onAddFinding,
}) => {
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newTarget, setNewTarget] = useState<string>('');
  const [newType, setNewType] = useState<string>('Open Source Intelligence Observation');
  const [newTitle, setNewTitle] = useState<string>('');
  const [newRisk, setNewRisk] = useState<RiskLevel>('LOW');
  const [newStatus, setNewStatus] = useState<StatusType>('Completed');
  const [newDetails, setNewDetails] = useState<string>('');

  const handleCreateFinding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTarget || !newTitle) return;

    onAddFinding({
      sourceTool: 'investigation',
      target: newTarget.trim(),
      type: newType,
      title: newTitle.trim(),
      risk: newRisk,
      status: newStatus,
      details: newDetails.trim() || 'Manual academic observation logged to case dossier.',
    });

    setNewTarget('');
    setNewTitle('');
    setNewDetails('');
    setShowAddModal(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const exportMarkdown = () => {
    let md = `# ACADEMIC OSINT INVESTIGATION DOSSIER\n\n`;
    md += `**Case ID:** ${currentCase.id}\n`;
    md += `**Investigation Title:** ${currentCase.title}\n`;
    md += `**Lead Investigator:** ${currentCase.leadInvestigator}\n`;
    md += `**Affiliation:** ${currentCase.institution}\n`;
    md += `**Classification:** ${currentCase.classification}\n`;
    md += `**Date of Compilation:** ${currentCase.createdDate}\n\n`;
    md += `## 1. Executive Summary\n${currentCase.summary}\n\n`;
    md += `## 2. Evidence & Findings Audit Table\n\n`;
    md += `| Target | Type / Tool | Finding | Risk Level | Status | Timestamp |\n`;
    md += `|---|---|---|---|---|---|\n`;

    currentCase.findings.forEach((f) => {
      md += `| \`${f.target}\` | ${f.type} | ${f.title} | [${f.risk}] | ${f.status} | ${f.timestamp} |\n`;
    });

    md += `\n## 3. Detailed Evidence Logs\n\n`;
    currentCase.findings.forEach((f, i) => {
      md += `### Artifact ${i + 1}: ${f.title} (${f.target})\n`;
      md += `- **Risk Level:** ${f.risk}\n`;
      md += `- **Status:** ${f.status}\n`;
      md += `- **Details:** ${f.details}\n\n`;
    });

    md += `\n---\n*Certified by SPARC Organization and RGMCET Intelligence Research Laboratory*\n`;

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentCase.id}-dossier.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportJson = () => {
    const data = JSON.stringify(currentCase, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentCase.id}-dossier.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Risk distribution
  const riskCounts = {
    LOW: currentCase.findings.filter((f) => f.risk === 'LOW').length,
    GUARDED: currentCase.findings.filter((f) => f.risk === 'GUARDED').length,
    MEDIUM: currentCase.findings.filter((f) => f.risk === 'MEDIUM').length,
    HIGH: currentCase.findings.filter((f) => f.risk === 'HIGH').length,
    CRITICAL: currentCase.findings.filter((f) => f.risk === 'CRITICAL').length,
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 py-6 bg-[#FFFFFF]">
      {/* Dossier Header */}
      <div className="bg-[#FFFFFF] border border-[#E1E5E9] rounded-[6px] p-6 no-print">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <FolderLock className="w-4 h-4 text-[#244A73]" />
              <span className="text-xs uppercase tracking-wider font-semibold text-[#244A73]">
                Forensic Case Dossier
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-[#F8F9FA] text-[#626B73] border border-[#E1E5E9]">
                {currentCase.classification}
              </span>
            </div>
            <h2 className="text-xl font-medium tracking-tight text-[#222222]">
              {currentCase.title}
            </h2>
            <p className="text-xs text-[#626B73]">
              Case ID: <span className="font-mono text-[#222222] font-semibold">{currentCase.id}</span> • Investigator: {currentCase.leadInvestigator} ({currentCase.institution})
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3 py-1.5 text-xs font-medium bg-[#FFFFFF] border border-[#244A73] text-[#244A73] hover:bg-[#F0F4F8] rounded flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Manual Finding</span>
            </button>
            <button
              onClick={exportMarkdown}
              className="px-3 py-1.5 text-xs font-medium bg-[#FFFFFF] border border-[#E1E5E9] text-[#222222] hover:bg-[#F8F9FA] rounded flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-[#626B73]" />
              <span>Markdown</span>
            </button>
            <button
              onClick={exportJson}
              className="px-3 py-1.5 text-xs font-medium bg-[#FFFFFF] border border-[#E1E5E9] text-[#222222] hover:bg-[#F8F9FA] rounded flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-[#626B73]" />
              <span>JSON</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 text-xs font-medium text-white rounded flex items-center gap-1.5 transition-colors"
              style={{ backgroundColor: '#244A73' }}
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Academic Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Printable Academic Header (Visible on print & formal view) */}
      <div className="p-6 bg-[#FFFFFF] border border-[#E1E5E9] rounded-[6px] space-y-6">
        <div className="flex items-center justify-between border-b border-[#E1E5E9] pb-6">
          <div className="flex items-center gap-4">
            <RgmcetLogo size={52} />
            <SparcLogo size={52} />
            <div>
              <div className="text-xs uppercase font-bold tracking-wider text-[#626B73]">
                Academic Intelligence Dossier
              </div>
              <h1 className="text-lg font-bold text-[#222222]">
                OSINT SENTINEL INVESTIGATION REPORT
              </h1>
              <div className="text-xs text-[#626B73]">
                Joint Project: SPARC Organization &amp; Rajeev Gandhi Memorial College of Engineering &amp; Technology
              </div>
            </div>
          </div>

          <div className="text-right text-xs space-y-1 font-mono">
            <div><span className="text-[#626B73]">DOSSIER:</span> <strong className="text-[#222222]">{currentCase.id}</strong></div>
            <div><span className="text-[#626B73]">DATE:</span> {currentCase.createdDate}</div>
            <div><span className="text-[#626B73]">STATUS:</span> <strong className="text-[#3A7D44]">VERIFIED</strong></div>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#222222]">
            1. Executive Summary &amp; Scope
          </h3>
          <p className="text-xs text-[#626B73] leading-relaxed">
            {currentCase.summary}
          </p>
        </div>

        {/* Risk Breakdown Bar */}
        <div className="p-4 bg-[#F8F9FA] rounded border border-[#E1E5E9] space-y-2">
          <div className="text-xs font-semibold text-[#222222]">
            2. Risk Matrix &amp; Threat Distribution
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5">
              <RiskBadge risk="LOW" /> <strong className="text-[#222222]">{riskCounts.LOW}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <RiskBadge risk="GUARDED" /> <strong className="text-[#222222]">{riskCounts.GUARDED}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <RiskBadge risk="MEDIUM" /> <strong className="text-[#222222]">{riskCounts.MEDIUM}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <RiskBadge risk="HIGH" /> <strong className="text-[#222222]">{riskCounts.HIGH}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <RiskBadge risk="CRITICAL" /> <strong className="text-[#222222]">{riskCounts.CRITICAL}</strong>
            </span>
          </div>
        </div>

        {/* Evidence Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#222222]">
              3. Evidence Chain of Custody ({currentCase.findings.length} Artifacts)
            </h3>
          </div>

          {currentCase.findings.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#626B73] bg-[#F8F9FA] rounded border border-[#E1E5E9]">
              No evidence logged in this dossier yet. Perform scans with the OSINT modules to register artifacts.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#E1E5E9] bg-[#F8F9FA] text-[#626B73] font-medium">
                    <th className="py-2.5 px-3">Target</th>
                    <th className="py-2.5 px-3">Source Tool / Category</th>
                    <th className="py-2.5 px-3">Finding Title</th>
                    <th className="py-2.5 px-3">Risk</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Timestamp</th>
                    <th className="py-2.5 px-3 text-right no-print">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E1E5E9]">
                  {currentCase.findings.map((f) => (
                    <tr key={f.id} className="hover:bg-[#F8F9FA]/60">
                      <td className="py-2.5 px-3 font-mono font-medium text-[#222222]">
                        {f.target}
                      </td>
                      <td className="py-2.5 px-3 text-[#626B73]">
                        {f.type}
                      </td>
                      <td className="py-2.5 px-3 text-[#222222] max-w-xs truncate">
                        {f.title}
                      </td>
                      <td className="py-2.5 px-3">
                        <RiskBadge risk={f.risk} />
                      </td>
                      <td className="py-2.5 px-3">
                        <StatusBadge status={f.status} />
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[#626B73] text-[11px]">
                        {f.timestamp}
                      </td>
                      <td className="py-2.5 px-3 text-right no-print">
                        <button
                          onClick={() => onRemoveFinding(f.id)}
                          className="text-[#626B73] hover:text-[#B23A3A] transition-colors"
                          title="Remove finding"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Detailed Itemized Narrative */}
        {currentCase.findings.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-[#E1E5E9]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#222222]">
              4. Technical Observations &amp; Verification Details
            </h3>

            <div className="space-y-3">
              {currentCase.findings.map((f, i) => (
                <div key={f.id} className="p-3 bg-[#F8F9FA] rounded border border-[#E1E5E9] space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[#244A73]">#{i + 1}</span>
                      <strong className="text-[#222222]">{f.title}</strong>
                      <span className="font-mono text-[#626B73]">({f.target})</span>
                    </div>
                    <RiskBadge risk={f.risk} />
                  </div>
                  <p className="text-xs text-[#626B73] leading-relaxed">
                    {f.details}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Academic Attestation Footer */}
        <div className="pt-8 border-t border-[#E1E5E9] flex flex-col sm:flex-row items-center justify-between text-xs text-[#626B73] gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <div className="font-semibold text-[#222222]">SPARC Academic Intelligence Certification</div>
            <div>All artifacts collected under non-intrusive open source intelligence methodologies.</div>
          </div>
          <div className="text-right">
            <div className="border-b border-[#222222] w-48 pb-1 text-center font-mono text-[11px] text-[#222222]">
              {currentCase.leadInvestigator}
            </div>
            <div className="text-[11px] text-center pt-1">Authorized Investigator Signature</div>
          </div>
        </div>
      </div>

      {/* Manual Finding Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="bg-[#FFFFFF] border border-[#E1E5E9] rounded-[6px] max-w-lg w-full p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#E1E5E9] pb-3">
              <h3 className="text-sm font-semibold text-[#222222]">
                Log Manual Finding to Case Dossier
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#626B73] hover:text-[#222222]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateFinding} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#626B73] mb-1">Target Indicator (e.g. email, domain, hash)</label>
                <input
                  type="text"
                  required
                  value={newTarget}
                  onChange={(e) => setNewTarget(e.target.value)}
                  placeholder="e.g. target.domain.com"
                  className="w-full px-3 py-1.5 border border-[#E1E5E9] rounded focus:outline-none focus:border-[#244A73]"
                />
              </div>

              <div>
                <label className="block text-[#626B73] mb-1">Finding Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Brief descriptive title"
                  className="w-full px-3 py-1.5 border border-[#E1E5E9] rounded focus:outline-none focus:border-[#244A73]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#626B73] mb-1">Risk Assessment</label>
                  <select
                    value={newRisk}
                    onChange={(e) => setNewRisk(e.target.value as RiskLevel)}
                    className="w-full px-3 py-1.5 border border-[#E1E5E9] rounded focus:outline-none focus:border-[#244A73]"
                  >
                    <option value="LOW">LOW</option>
                    <option value="GUARDED">GUARDED</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#626B73] mb-1">Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as StatusType)}
                    className="w-full px-3 py-1.5 border border-[#E1E5E9] rounded focus:outline-none focus:border-[#244A73]"
                  >
                    <option value="Completed">Completed</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Needs Review">Needs Review</option>
                    <option value="Potential Match">Potential Match</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#626B73] mb-1">Technical Observation Details</label>
                <textarea
                  rows={3}
                  value={newDetails}
                  onChange={(e) => setNewDetails(e.target.value)}
                  placeholder="Technical notes, context, or verified indicators..."
                  className="w-full px-3 py-1.5 border border-[#E1E5E9] rounded focus:outline-none focus:border-[#244A73]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E1E5E9]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 border border-[#E1E5E9] rounded text-[#626B73] hover:bg-[#F8F9FA]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-white rounded font-medium"
                  style={{ backgroundColor: '#244A73' }}
                >
                  Save Finding
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
