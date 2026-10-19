"use client";

import React, { useEffect, useRef } from "react";
import { AlertOctagon, PhoneCall, MapPin, XCircle, ShieldAlert, ArrowRight } from "lucide-react";
import { TriageResult } from "@/lib/triageEngine";

interface EmergencyModalProps {
  isOpen: boolean;
  triageResult: TriageResult | null;
  onDismiss: () => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({
  isOpen,
  triageResult,
  onDismiss
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Accessible keyboard trap & ESC handling
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onDismiss();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onDismiss]);

  if (!isOpen || !triageResult) return null;

  const emergencyNumber = triageResult.emergencyContact?.number || "112 / 911";
  const primaryTel = emergencyNumber.split("/")[0].trim();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="emergency-dialog-title"
      aria-describedby="emergency-dialog-description"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
    >
      <div
        ref={dialogRef}
        className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border-4 border-rose-600 overflow-hidden text-slate-900 animate-in zoom-in-95 duration-200"
      >
        {/* Emergency High-Contrast Header */}
        <div className="bg-rose-600 text-white p-6 sm:p-7 relative overflow-hidden">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 border-2 border-white/40 flex items-center justify-center shrink-0 animate-emergency-alert">
              <AlertOctagon className="w-9 h-9 text-white" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/25 text-white text-xs font-bold uppercase tracking-wider">
                <ShieldAlert className="w-3.5 h-3.5" aria-hidden="true" />
                Immediate Safety Interruption
              </div>
              <h2 id="emergency-dialog-title" className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Emergency Assistance Required
              </h2>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-7 space-y-6">
          {/* Primary Action Guidance */}
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200">
            <p id="emergency-dialog-description" className="text-base font-semibold text-rose-950 leading-snug">
              {triageResult.primaryAction}
            </p>
            <p className="text-xs text-rose-800 mt-2 leading-relaxed">
              {triageResult.reasoning}
            </p>
          </div>

          {/* Clinician-Approved Red Flag Rationale */}
          {triageResult.matchedRedFlags && triageResult.matchedRedFlags.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Triggered Safety Red Flag
              </span>
              {triageResult.matchedRedFlags.map((rf, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{rf.ruleName}</span>
                    <span className="text-[10px] font-semibold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full">
                      Criteria {rf.scenarioCode}
                    </span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">{rf.clinicalRationale}</p>
                </div>
              ))}
            </div>
          )}

          {/* Call-to-action buttons */}
          <div className="space-y-3">
            <a
              id="emergency-call-now-btn"
              href={`tel:${primaryTel}`}
              className="w-full py-4 px-6 rounded-2xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold text-lg shadow-lg shadow-rose-600/30 flex items-center justify-center gap-3 transition-all focus-visible:ring-4 focus-visible:ring-rose-400 cursor-pointer"
            >
              <PhoneCall className="w-6 h-6 animate-pulse" aria-hidden="true" />
              <span>Call Emergency ({emergencyNumber}) Now</span>
            </a>

            <a
              href="https://www.google.com/maps/search/emergency+room+near+me"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <MapPin className="w-4 h-4 text-slate-600" aria-hidden="true" />
              <span>Locate Nearest Emergency Room (Maps)</span>
            </a>
          </div>

          {/* Safety Net & Zero Question Guarantee Notice */}
          <div className="pt-4 border-t border-slate-200 flex items-start justify-between gap-4">
            <p className="text-xs text-slate-500 leading-relaxed">
              <strong>Medical Safety Rule:</strong> Further non-emergency questioning has been stopped. Please do not delay seeking medical care to complete online surveys.
            </p>
            <button
              type="button"
              onClick={onDismiss}
              className="text-xs text-slate-400 hover:text-slate-700 font-medium underline shrink-0 cursor-pointer p-1"
            >
              Dismiss warning
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
