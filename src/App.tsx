import React, { useState } from 'react';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { StartupAnimation } from './components/StartupAnimation';
import { UsernameView } from './components/tools/UsernameView';
import { EmailView } from './components/tools/EmailView';
import { DomainView } from './components/tools/DomainView';
import { DnsView } from './components/tools/DnsView';
import { IpView } from './components/tools/IpView';
import { UrlPhishingView } from './components/tools/UrlPhishingView';
import { WebsiteView } from './components/tools/WebsiteView';
import { SocialView } from './components/tools/SocialView';
import { MetadataView } from './components/tools/MetadataView';
import { HashView } from './components/tools/HashView';
import { ImageView } from './components/tools/ImageView';
import { InvestigationView } from './components/InvestigationView';
import { ToolId, InvestigationCase, InvestigationFinding } from './types';

const INITIAL_CASE: InvestigationCase = {
  id: 'CASE-2026-SPARC-01',
  title: 'Academic Threat Attribution & Infrastructure Audit',
  leadInvestigator: 'Syed Imran (Lead Analyst)',
  institution: 'SPARC Organization & RGMCET',
  classification: 'UNCLASSIFIED / ACADEMIC',
  createdDate: '2026-10-08',
  summary:
    'Forensic evaluation and open-source intelligence assessment of network perimeters, email anti-spoofing postures, credential phishing indicators, and cryptographic artifacts conducted under standard scientific academic research protocols.',
  findings: [
    {
      id: 'f-1',
      timestamp: '2026-10-08 04:12 UTC',
      sourceTool: 'domain',
      target: 'rgmcet.edu.in',
      type: 'DNS Infrastructure',
      title: 'Authoritative Nameservers Configured',
      risk: 'LOW',
      status: 'Completed',
      details: 'Authoritative nameservers and primary A records verified with proper DoH resolution.',
    },
    {
      id: 'f-2',
      timestamp: '2026-10-08 04:14 UTC',
      sourceTool: 'url',
      target: 'paypal.account-verify-login.xyz',
      type: 'Phishing Heuristics',
      title: 'Credential Harvesting & Suspicious TLD Detected',
      risk: 'CRITICAL',
      status: 'Needs Review',
      details: 'Identified brand typosquatting, high-abuse .xyz TLD, and credential harvesting lure in path.',
    },
    {
      id: 'f-3',
      timestamp: '2026-10-08 04:15 UTC',
      sourceTool: 'email',
      target: 'security@proton.me',
      type: 'Email Intelligence',
      title: 'MX & Anti-Spoofing Verification',
      risk: 'LOW',
      status: 'Completed',
      details: 'Valid RFC-5322 syntax, strict SPF/DMARC policies enforced, active mail exchanges.',
    },
  ],
};

export default function App() {
  const [showIntro, setShowIntro] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<ToolId>('dashboard');
  const [currentCase, setCurrentCase] = useState<InvestigationCase>(INITIAL_CASE);

  const handleAddFinding = (
    finding: Omit<InvestigationFinding, 'id' | 'timestamp'>
  ) => {
    const now = new Date();
    const timestamp = now.toISOString().replace('T', ' ').slice(0, 16) + ' UTC';
    const newFinding: InvestigationFinding = {
      ...finding,
      id: `f-${Date.now()}`,
      timestamp,
    };

    setCurrentCase((prev) => ({
      ...prev,
      findings: [newFinding, ...prev.findings],
    }));
  };

  const handleRemoveFinding = (findingId: string) => {
    setCurrentCase((prev) => ({
      ...prev,
      findings: prev.findings.filter((f) => f.id !== findingId),
    }));
  };

  const handleUpdateCase = (updated: InvestigationCase) => {
    setCurrentCase(updated);
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#222222] flex flex-col font-sans">
      {/* 
        Startup Animation:
        Only renders during the 2–2.5s intro. Once complete, completely unmounts,
        and application background returns strictly to pure white #FFFFFF.
      */}
      {showIntro && (
        <StartupAnimation onComplete={() => setShowIntro(false)} />
      )}

      {/* Main Institutional Header */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        activeCase={currentCase}
        onReplayIntro={() => setShowIntro(true)}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 pb-16">
        {activeTab === 'dashboard' && (
          <Dashboard
            onSelectTool={setActiveTab}
            activeCase={currentCase}
          />
        )}

        {activeTab === 'username' && (
          <UsernameView onAddFinding={handleAddFinding} />
        )}

        {activeTab === 'email' && (
          <EmailView onAddFinding={handleAddFinding} />
        )}

        {activeTab === 'domain' && (
          <DomainView onAddFinding={handleAddFinding} />
        )}

        {activeTab === 'dns' && (
          <DnsView onAddFinding={handleAddFinding} />
        )}

        {activeTab === 'ip' && (
          <IpView onAddFinding={handleAddFinding} />
        )}

        {activeTab === 'url' && (
          <UrlPhishingView onAddFinding={handleAddFinding} />
        )}

        {activeTab === 'website' && (
          <WebsiteView onAddFinding={handleAddFinding} />
        )}

        {activeTab === 'social' && (
          <SocialView onAddFinding={handleAddFinding} />
        )}

        {activeTab === 'metadata' && (
          <MetadataView onAddFinding={handleAddFinding} />
        )}

        {activeTab === 'hash' && (
          <HashView onAddFinding={handleAddFinding} />
        )}

        {activeTab === 'image' && (
          <ImageView onAddFinding={handleAddFinding} />
        )}

        {activeTab === 'investigation' && (
          <InvestigationView
            currentCase={currentCase}
            onUpdateCase={handleUpdateCase}
            onRemoveFinding={handleRemoveFinding}
            onAddFinding={handleAddFinding}
          />
        )}
      </main>

      {/* Academic Institutional Footer */}
      <footer className="bg-[#FFFFFF] border-t border-[#E1E5E9] py-5 px-6 text-xs text-[#626B73] no-print">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#222222]">OSINT SENTINEL</span>
            <span>•</span>
            <span>SPARC Organization (Scientific Program for Academic Research Cube)</span>
            <span>•</span>
            <span>RGMCET (ESTD-1995)</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>Awareness • Education • Service</span>
            <span>•</span>
            <span className="text-[#3A7D44] font-medium">Standards Compliant</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
