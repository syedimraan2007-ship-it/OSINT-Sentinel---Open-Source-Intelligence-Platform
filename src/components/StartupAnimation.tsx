import React, { useEffect, useState } from 'react';
import { RgmcetLogo, SparcLogo } from './Logos';

interface StartupAnimationProps {
  onComplete: () => void;
}

export const StartupAnimation: React.FC<StartupAnimationProps> = ({ onComplete }) => {
  const [step, setStep] = useState<number>(0);
  const [fadingOut, setFadingOut] = useState<boolean>(false);

  useEffect(() => {
    // Check user accessibility preference for reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      onComplete();
      return;
    }

    // Sequence timeline:
    // 0.0s -> step 0 (soft background active)
    // 0.3s -> step 1 (RGMCET logo fades in)
    // 0.6s -> step 2 (SPARC logo fades in)
    // 0.9s -> step 3 (Divider appears)
    // 1.1s -> step 4 (OSINT SENTINEL fades in)
    // 1.3s -> step 5 (Open Source Intelligence Platform & institutions fade in)
    // 2.0s -> fadingOut (background effect disappears, transitions to white)
    // 2.3s -> onComplete (Dashboard appears, all effects stopped)

    const t1 = setTimeout(() => setStep(1), 300);
    const t2 = setTimeout(() => setStep(2), 600);
    const t3 = setTimeout(() => setStep(3), 900);
    const t4 = setTimeout(() => setStep(4), 1100);
    const t5 = setTimeout(() => setStep(5), 1300);
    const t6 = setTimeout(() => setFadingOut(true), 2000);
    const t7 = setTimeout(() => onComplete(), 2350);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(t6);
      clearTimeout(t7);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden transition-opacity duration-300 ${
        fadingOut ? 'opacity-0' : 'opacity-100'
      }`}
      style={{ backgroundColor: '#FFFFFF' }}
    >
      {/* 
        Subtle Startup Background Animation ONLY:
        Soft, slowly moving transparent color fields in Navy (8-12%), Teal (6-10%), Purple (5-8%), Amber (4-7%).
        Predominantly light white background.
      */}
      <div
        className={`absolute inset-0 pointer-events-none transition-opacity duration-500 ${
          fadingOut ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {/* Navy field */}
        <div
          className="absolute -top-20 -left-20 w-96 h-96 rounded-full blur-3xl animate-pulse"
          style={{ backgroundColor: '#244A73', opacity: 0.10, animationDuration: '3.5s' }}
        />
        {/* Teal field */}
        <div
          className="absolute top-1/3 -right-20 w-96 h-96 rounded-full blur-3xl"
          style={{ backgroundColor: '#2A7F7F', opacity: 0.08 }}
        />
        {/* Purple field */}
        <div
          className="absolute -bottom-20 left-1/4 w-80 h-80 rounded-full blur-3xl"
          style={{ backgroundColor: '#665191', opacity: 0.06 }}
        />
        {/* Amber field */}
        <div
          className="absolute top-10 right-1/4 w-72 h-72 rounded-full blur-3xl"
          style={{ backgroundColor: '#B7791F', opacity: 0.05 }}
        />
      </div>

      {/* Main Content Card / Minimal Container */}
      <div className="relative z-10 flex flex-col items-center max-w-xl px-6 text-center">
        {/* Logos Container */}
        <div className="flex items-center justify-center gap-8 mb-6">
          {/* RGMCET Logo (0.3s) */}
          <div
            className={`transition-all duration-500 transform ${
              step >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}
          >
            <RgmcetLogo size={74} />
          </div>

          {/* SPARC Logo (0.6s) */}
          <div
            className={`transition-all duration-500 transform ${
              step >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}
          >
            <SparcLogo size={74} />
          </div>
        </div>

        {/* Thin Divider (0.9s) */}
        <div
          className={`w-48 h-px bg-[#E1E5E9] my-3 transition-all duration-400 ${
            step >= 3 ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-50'
          }`}
        />

        {/* Title: OSINT SENTINEL (1.1s) */}
        <h1
          className={`text-[21px] font-medium tracking-tight text-[#222222] transition-all duration-400 transform ${
            step >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1.5'
          }`}
        >
          OSINT SENTINEL
        </h1>

        {/* Subtitle & Institutional Affiliation (1.3s) */}
        <div
          className={`mt-1.5 space-y-2 transition-all duration-400 transform ${
            step >= 5 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1.5'
          }`}
        >
          <p className="text-[13.5px] font-normal text-[#626B73]">
            Open Source Intelligence Platform
          </p>

          <div className="pt-2 text-[12px] text-[#626B73] font-normal leading-relaxed">
            <span className="font-medium text-[#222222]">SPARC Organization</span>
            <span className="mx-1.5 text-[#E1E5E9]">•</span>
            <span>Rajeev Gandhi Memorial College of Engineering and Technology</span>
          </div>
        </div>
      </div>

      {/* Subtle Skip button in corner */}
      <button
        onClick={onComplete}
        className="absolute bottom-6 right-6 text-xs text-[#626B73] hover:text-[#222222] px-3 py-1.5 border border-[#E1E5E9] rounded hover:bg-[#F8F9FA] transition-colors"
      >
        Skip Intro
      </button>
    </div>
  );
};
