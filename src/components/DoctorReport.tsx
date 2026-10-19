"use client";

import React, { useState } from "react";
import {
  Printer,
  ArrowLeft,
  Calendar,
  Clock,
  Activity,
  CheckCircle2,
  FileText,
  User,
  ShieldCheck,
  Stethoscope,
  ChevronRight,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { PatientIntake, TriageResult } from "@/lib/triageEngine";
import { matchEducationalPossibilities } from "@/lib/conditionsDatabase";

interface DoctorReportProps {
  intake: PatientIntake;
  triageResult: TriageResult;
  onBackToResult: () => void;
}

export const DoctorReport: React.FC<DoctorReportProps> = ({
  intake,
  triageResult,
  onBackToResult
}) => {
  const [reportView, setReportView] = useState<"sbar" | "patient">("sbar");
  const educationalMatches = matchEducationalPossibilities(intake.symptoms);

  const reportDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  const reportReferenceId = `TS-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Top Screen Controls (Hidden during print) */}
      <div className="print:hidden flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <button
          type="button"
          onClick={onBackToResult}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Assessment Care Route</span>
        </button>

        <div className="flex items-center gap-3">
          {/* Dual Perspective Toggle */}
          <div className="flex items-center bg-slate-200 p-1 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setReportView("sbar")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                reportView === "sbar"
                  ? "bg-white text-indigo-700 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Doctor SBAR View
            </button>
            <button
              type="button"
              onClick={() => setReportView("patient")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                reportView === "patient"
                  ? "bg-white text-indigo-700 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Patient Friendly View
            </button>
          </div>

          {/* Print A4 Action Button */}
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Summary (A4)</span>
          </button>
        </div>
      </div>

      {/* PRINTABLE REPORT CONTAINER (A4 FORMATTED) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 sm:p-10 space-y-8 print:border-none print:shadow-none print:p-0 print:space-y-6">
        {/* Formal Clinical Header */}
        <div className="border-b-2 border-slate-900 pb-6 flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
                <Stethoscope className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                TriageSafe Clinical Handover Summary
              </h1>
            </div>
            <p className="text-xs text-slate-500">
              Structured Patient Intake & Deterministic Clinical Triage Report
            </p>
          </div>

          <div className="text-right text-xs text-slate-500 space-y-0.5">
            <div><strong>Ref ID:</strong> {reportReferenceId}</div>
            <div><strong>Date & Time:</strong> {reportDate}</div>
            <div><strong>Ruleset:</strong> {triageResult.rulesetVersion}</div>
          </div>
        </div>

        {/* Regulatory & Safety Disclaimer Strip */}
        <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-[11px] text-slate-600 flex items-center justify-between gap-2">
          <span>
            <strong>Clinical Notice for Attending Healthcare Provider:</strong> This report records self-reported patient facts and deterministic red-flag screening. It is non-diagnostic and designed solely to streamline clinical intake.
          </span>
          <span className="font-semibold text-indigo-700 shrink-0">
            Intake Protocol: v2026.1
          </span>
        </div>

        {/* DYNAMIC SYMPTOM TIMELINE (Market-Leading Feature 4) */}
        <section aria-labelledby="timeline-title" className="space-y-3">
          <h2 id="timeline-title" className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-indigo-600" aria-hidden="true" />
            Reported Symptom Timeline & Progression
          </h2>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
              {/* Step 1: Onset */}
              <div className="space-y-1 relative">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center border border-indigo-300">
                    1
                  </span>
                  <span className="text-xs font-bold text-slate-900">Onset Phase</span>
                </div>
                <div className="pl-8 text-xs text-slate-600">
                  <div>Reported Duration: <strong>{intake.duration}</strong></div>
                  <div className="text-slate-500">Primary Complaint: {intake.chiefComplaint || "General symptoms"}</div>
                </div>
              </div>

              {/* Step 2: Peak / Severity */}
              <div className="space-y-1 relative">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 font-bold text-xs flex items-center justify-center border border-amber-300">
                    2
                  </span>
                  <span className="text-xs font-bold text-slate-900">Reported Acuity</span>
                </div>
                <div className="pl-8 text-xs text-slate-600">
                  <div>Severity Score: <strong>{intake.severityScore || "N/A"} / 10</strong></div>
                  <div className="text-slate-500">
                    {intake.severityScore && intake.severityScore >= 8 ? "Severe incapacitating" : "Moderate distress"}
                  </div>
                </div>
              </div>

              {/* Step 3: Current State */}
              <div className="space-y-1 relative">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center border border-emerald-300">
                    3
                  </span>
                  <span className="text-xs font-bold text-slate-900">Current Triage Status</span>
                </div>
                <div className="pl-8 text-xs text-slate-600">
                  <div className="font-semibold text-indigo-700">{triageResult.urgency.replace(/_/g, " ")}</div>
                  <div className="text-slate-500">{triageResult.primaryAction}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* VIEW 1: FORMAL DOCTOR SBAR HANDOVER */}
        {reportView === "sbar" ? (
          <div className="space-y-6">
            {/* S - SITUATION */}
            <div className="border border-slate-200 rounded-2xl p-5 space-y-2">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-700">
                  S — Situation
                </span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-900 text-white">
                  Triage Category: {triageResult.urgency}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                <div>
                  <span className="text-slate-400 block text-[11px]">Patient Age</span>
                  <strong className="text-slate-900">{intake.age} years</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Intake Context</span>
                  <strong className="text-slate-900 capitalize">{intake.patientContext} ({intake.isCaregiver ? "Caregiver" : "Self"})</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Primary Chief Complaint</span>
                  <strong className="text-slate-900">{intake.chiefComplaint}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Current Location</span>
                  <strong className="text-slate-900">{intake.countryCode || "US"} ({triageResult.emergencyContact?.number})</strong>
                </div>
              </div>
            </div>

            {/* B - BACKGROUND */}
            <div className="border border-slate-200 rounded-2xl p-5 space-y-3">
              <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-700 block border-b border-slate-100 pb-2">
                B — Background & Clinical History
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <span className="text-slate-500 font-semibold block">All Reported Symptoms:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {intake.symptoms.map((s, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-800 font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-slate-500 font-semibold block">Physiological Context:</span>
                  <ul className="space-y-1 text-slate-700">
                    <li>&bull; Pregnancy status: <strong>{intake.isPregnant ? "Confirmed pregnant / postpartum" : "Not pregnant / Not applicable"}</strong></li>
                    <li>&bull; Reported duration: <strong>{intake.duration}</strong></li>
                    <li>&bull; Additional patient remarks: <em>{intake.additionalNotes || "None provided"}</em></li>
                  </ul>
                </div>
              </div>
            </div>

            {/* A - ASSESSMENT */}
            <div className="border border-slate-200 rounded-2xl p-5 space-y-3">
              <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-700 block border-b border-slate-100 pb-2">
                A — Clinical Safety Assessment
              </span>
              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="font-bold text-slate-900 mb-0.5">Deterministic Urgency Rationale:</div>
                  <p className="text-slate-700 leading-relaxed">{triageResult.reasoning}</p>
                </div>

                {triageResult.matchedRedFlags.length > 0 && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 space-y-1">
                    <span className="font-bold text-rose-900">Triggered Emergency Red Flags:</span>
                    {triageResult.matchedRedFlags.map((rf, idx) => (
                      <div key={idx} className="text-rose-800">
                        &bull; <strong>{rf.ruleName}</strong> (Protocol {rf.scenarioCode}): {rf.clinicalRationale}
                      </div>
                    ))}
                  </div>
                )}

                {/* Educational Differential Candidates */}
                {educationalMatches.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-slate-500 font-semibold block">Educational Differential Candidates (Matched for Discussion):</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {educationalMatches.map((m) => (
                        <div key={m.condition.id} className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/50">
                          <strong className="text-slate-900 block">{m.condition.name}</strong>
                          <span className="text-[11px] text-emerald-700 block">Matches: {m.matchingSymptoms.join(", ") || "None"}</span>
                          <span className="text-[11px] text-slate-400 block">Absent: {m.absentSymptoms.slice(0, 2).join(", ")}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* R - RECOMMENDATION */}
            <div className="border border-slate-200 rounded-2xl p-5 space-y-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-700 block border-b border-slate-100 pb-2">
                R — Recommended Clinical Disposition
              </span>
              <div className="text-xs space-y-2 text-slate-700">
                <p>
                  <strong>Primary Action:</strong> {triageResult.primaryAction}
                </p>
                <p>
                  <strong>Safety Net:</strong> {triageResult.safetyNetWarning}
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* VIEW 2: PATIENT-FRIENDLY SUMMARY */
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-indigo-50 border border-indigo-100 space-y-2 text-indigo-950">
              <h3 className="font-bold text-base text-indigo-900">Your Summary for the Doctor</h3>
              <p className="text-xs leading-relaxed text-indigo-900/80">
                You can print this page or show it directly on your mobile screen during your appointment. It highlights your symptoms in the order doctors prefer to review them.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl border border-slate-200 space-y-1.5">
                <strong className="text-slate-900 block font-bold">What You Reported</strong>
                <p className="text-slate-600">Chief symptom: <strong>{intake.chiefComplaint}</strong></p>
                <p className="text-slate-600">Started: <strong>{intake.duration}</strong></p>
                <p className="text-slate-600">Discomfort level: <strong>{intake.severityScore}/10</strong></p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 space-y-1.5">
                <strong className="text-slate-900 block font-bold">Recommended Next Step</strong>
                <p className="text-slate-600">{triageResult.primaryAction}</p>
                <p className="text-amber-700 font-medium">{triageResult.safetyNetWarning}</p>
              </div>
            </div>
          </div>
        )}

        {/* Doctor Signature / Clinical Notes Section (for Printout) */}
        <div className="pt-6 border-t border-slate-200 grid grid-cols-2 gap-8 text-xs text-slate-500">
          <div>
            <span className="block mb-8">Physician / Triage Nurse Notes:</span>
            <div className="border-b border-slate-300 w-full" />
          </div>
          <div>
            <span className="block mb-8">Signature & Date:</span>
            <div className="border-b border-slate-300 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
};
