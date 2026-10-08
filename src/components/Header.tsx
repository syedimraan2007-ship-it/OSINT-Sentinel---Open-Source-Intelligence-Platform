import React, { useState, useEffect } from 'react';
import { RgmcetLogo, SparcLogo } from './Logos';
import { ToolId, InvestigationCase } from '../types';
import { FolderLock, RotateCcw } from 'lucide-react';

interface HeaderProps {
  activeTab: ToolId;
  onSelectTab: (tab: ToolId) => void;
  activeCase: InvestigationCase;
  onReplayIntro: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  activeCase,
  onReplayIntro,
}) => {
  const [utcTime, setUtcTime] = useState<string>('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setUtcTime(now.toUTCString().slice(17, 25) + ' UTC');
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-[#FFFFFF] border-b border-[#E1E5E9] sticky top-0 z-30">
      {/* Top institutional ribbon */}
      <div className="bg-[#F8F9FA] border-b border-[#E1E5E9] px-4 sm:px-6 py-1.5 flex flex-wrap items-center justify-between text-xs text-[#626B73]">
        <div className="flex items-center gap-3">
          <span className="font-medium text-[#222222]">RGMCET</span>
          <span>•</span>
          <span>SPARC Organization</span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline text-[11px]">Academic Intelligence Research Unit</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-mono text-[11px] text-[#222222]">{utcTime}</span>
          <button
            onClick={onReplayIntro}
            title="Replay intro animation"
            className="flex items-center gap-1 text-[11px] hover:text-[#222222] transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Intro</span>
          </button>
        </div>
      </div>

      {/* Main branding bar */}
      <div className="px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => onSelectTab('dashboard')}>
          <div className="flex items-center gap-2">
            <RgmcetLogo size={36} />
            <SparcLogo size={36} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold tracking-tight text-[#222222]">
                OSINT SENTINEL
              </h1>
              <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#F0F4F8] text-[#244A73] border border-[#D0DFEF]">
                v2.6 ACADEMIC
              </span>
            </div>
            <p className="text-xs text-[#626B73]">
              Open Source Intelligence Platform
            </p>
          </div>
        </div>

        {/* Right side dossier status */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onSelectTab('investigation')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs rounded border transition-colors ${
              activeTab === 'investigation'
                ? 'bg-[#F0F4F8] border-[#244A73] text-[#244A73] font-semibold'
                : 'bg-[#FFFFFF] border-[#E1E5E9] text-[#222222] hover:bg-[#F8F9FA]'
            }`}
          >
            <FolderLock className="w-3.5 h-3.5 text-[#244A73]" />
            <div className="text-left">
              <div className="leading-tight font-medium">Case Dossier</div>
              <div className="text-[10px] text-[#626B73]">
                {activeCase.findings.length} findings recorded
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Secondary horizontal navigation */}
      <nav className="px-4 sm:px-6 flex items-center gap-1 overflow-x-auto border-t border-[#E1E5E9]/60 py-1 text-xs no-scrollbar">
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`px-3 py-1.5 font-medium rounded transition-colors shrink-0 ${
            activeTab === 'dashboard'
              ? 'text-[#244A73] bg-[#F0F4F8] font-semibold'
              : 'text-[#626B73] hover:text-[#222222] hover:bg-[#F8F9FA]'
          }`}
        >
          Overview
        </button>

        <span className="text-[#E1E5E9] mx-1">|</span>

        {/* Identity Category */}
        <button
          onClick={() => onSelectTab('username')}
          className={`px-2.5 py-1.5 rounded transition-colors shrink-0 ${
            activeTab === 'username'
              ? 'text-[#244A73] bg-[#F0F4F8] font-medium'
              : 'text-[#626B73] hover:text-[#222222]'
          }`}
        >
          Username
        </button>
        <button
          onClick={() => onSelectTab('email')}
          className={`px-2.5 py-1.5 rounded transition-colors shrink-0 ${
            activeTab === 'email'
              ? 'text-[#2A7F7F] bg-[#F0F7F7] font-medium'
              : 'text-[#626B73] hover:text-[#222222]'
          }`}
        >
          Email
        </button>
        <button
          onClick={() => onSelectTab('social')}
          className={`px-2.5 py-1.5 rounded transition-colors shrink-0 ${
            activeTab === 'social'
              ? 'text-[#665191] bg-[#F5F2F9] font-medium'
              : 'text-[#626B73] hover:text-[#222222]'
          }`}
        >
          Social Profile
        </button>

        <span className="text-[#E1E5E9] mx-1">|</span>

        {/* Network Category */}
        <button
          onClick={() => onSelectTab('domain')}
          className={`px-2.5 py-1.5 rounded transition-colors shrink-0 ${
            activeTab === 'domain'
              ? 'text-[#244A73] bg-[#F0F4F8] font-medium'
              : 'text-[#626B73] hover:text-[#222222]'
          }`}
        >
          Domain
        </button>
        <button
          onClick={() => onSelectTab('dns')}
          className={`px-2.5 py-1.5 rounded transition-colors shrink-0 ${
            activeTab === 'dns'
              ? 'text-[#2A7F7F] bg-[#F0F7F7] font-medium'
              : 'text-[#626B73] hover:text-[#222222]'
          }`}
        >
          DNS
        </button>
        <button
          onClick={() => onSelectTab('ip')}
          className={`px-2.5 py-1.5 rounded transition-colors shrink-0 ${
            activeTab === 'ip'
              ? 'text-[#244A73] bg-[#F0F4F8] font-medium'
              : 'text-[#626B73] hover:text-[#222222]'
          }`}
        >
          IP
        </button>

        <span className="text-[#E1E5E9] mx-1">|</span>

        {/* Web & Security */}
        <button
          onClick={() => onSelectTab('url')}
          className={`px-2.5 py-1.5 rounded transition-colors shrink-0 ${
            activeTab === 'url'
              ? 'text-[#B23A3A] bg-[#FDF2F2] font-medium'
              : 'text-[#626B73] hover:text-[#222222]'
          }`}
        >
          URL / Phishing
        </button>
        <button
          onClick={() => onSelectTab('website')}
          className={`px-2.5 py-1.5 rounded transition-colors shrink-0 ${
            activeTab === 'website'
              ? 'text-[#244A73] bg-[#F0F4F8] font-medium'
              : 'text-[#626B73] hover:text-[#222222]'
          }`}
        >
          Website
        </button>

        <span className="text-[#E1E5E9] mx-1">|</span>

        {/* Forensics */}
        <button
          onClick={() => onSelectTab('metadata')}
          className={`px-2.5 py-1.5 rounded transition-colors shrink-0 ${
            activeTab === 'metadata'
              ? 'text-[#665191] bg-[#F5F2F9] font-medium'
              : 'text-[#626B73] hover:text-[#222222]'
          }`}
        >
          Metadata
        </button>
        <button
          onClick={() => onSelectTab('hash')}
          className={`px-2.5 py-1.5 rounded transition-colors shrink-0 ${
            activeTab === 'hash'
              ? 'text-[#3A7D44] bg-[#F2F7F3] font-medium'
              : 'text-[#626B73] hover:text-[#222222]'
          }`}
        >
          Hash
        </button>
        <button
          onClick={() => onSelectTab('image')}
          className={`px-2.5 py-1.5 rounded transition-colors shrink-0 ${
            activeTab === 'image'
              ? 'text-[#B7791F] bg-[#FDF7EB] font-medium'
              : 'text-[#626B73] hover:text-[#222222]'
          }`}
        >
          Image
        </button>
      </nav>
    </header>
  );
};
