"use client";

import React from "react";
import { ShieldCheck, PhoneCall, AlertTriangle, Stethoscope } from "lucide-react";

interface HeaderProps {
  onStartAssessment?: () => void;
  activeStep?: string;
}

export const Header: React.FC<HeaderProps> = ({ onStartAssessment, activeStep }) => {
  return (
    <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      {/* Top High-Priority Medical Disclaimer Strip */}
      <div 
        role="region" 
        aria-label="Medical safety advisory"
        className="bg-slate-900 text-slate-200 px-4 py-1.5 text-xs font-medium flex flex-wrap items-center justify-between gap-2 border-b border-slate-800"
      >
        <div className="flex items-center gap-1.5 max-w-4xl mx-auto w-full justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/50 text-[11px] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
              Deterministic Safety Barrier Active
            </span>
            <span className="hidden sm:inline text-slate-400 text-xs">
              Not a diagnostic tool. In acute life-threatening situations, call emergency services.
            </span>
          </div>

          <a 
            href="tel:112" 
            className="inline-flex items-center gap-1 text-rose-300 hover:text-rose-200 font-semibold focus-visible:ring-2 focus-visible:ring-rose-400 rounded-sm px-1 py-0.5 text-xs transition-colors"
            aria-label="Emergency Call 112 or 911"
          >
            <PhoneCall className="w-3 h-3 text-rose-400" aria-hidden="true" />
            <span>Emergency: 112 / 911</span>
          </a>
        </div>
      </div>

      {/* Main Header Navigation */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-200">
            <Stethoscope className="w-6 h-6" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-slate-900 tracking-tight">TriageSafe</span>
              <span className="text-[11px] font-semibold uppercase tracking-wider bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded-md border border-indigo-200">
                Clinical
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Evidence-based AI symptom assessment & urgency triage
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <span className="text-slate-400 text-xs">WCAG 2.2 AA Compliant</span>
          </div>

          {onStartAssessment && (
            <button
              id="header-start-assessment-btn"
              onClick={onStartAssessment}
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 cursor-pointer"
            >
              Start Assessment
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
