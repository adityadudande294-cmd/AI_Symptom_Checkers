"use client";

import React, { useState } from "react";
import {
  ShieldAlert,
  AlertTriangle,
  Clock,
  CheckCircle2,
  PhoneCall,
  MapPin,
  ClipboardList,
  Sparkles,
  HelpCircle,
  Check,
  MinusCircle,
  FileText,
  Printer,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  AlertCircle
} from "lucide-react";
import { PatientIntake, TriageResult, UrgencyCategory } from "@/lib/triageEngine";
import { matchEducationalPossibilities, ConditionMatchResult } from "@/lib/conditionsDatabase";

interface AssessmentResultProps {
  intake: PatientIntake;
  triageResult: TriageResult;
  onStartNewAssessment: () => void;
  onOpenDoctorReport: () => void;
}

export const AssessmentResult: React.FC<AssessmentResultProps> = ({
  intake,
  triageResult,
  onStartNewAssessment,
  onOpenDoctorReport
}) => {
  const [expandedConditionId, setExpandedConditionId] = useState<string | null>(null);

  // Match educational condition possibilities (Ada Health style)
  const educationalMatches: ConditionMatchResult[] = matchEducationalPossibilities(intake.symptoms);

  // Buoy-Style Care Routing Acuity Configurations
  const getAcuityRoute = (urgency: UrgencyCategory) => {
    switch (urgency) {
      case "EMERGENCY_NOW":
        return {
          acuityColor: "red",
          tagLabel: "Acuity Level 1: Immediate Emergency Care",
          badgeBg: "bg-rose-600 text-white",
          containerBorder: "border-rose-400 bg-rose-50/70",
          icon: ShieldAlert,
          timeframe: "Immediately (Within minutes)",
          destination: "Hospital Emergency Department (A&E / ER) or Call 112 / 911",
          recommendedAction: "Call emergency services immediately. Do not drive yourself.",
          preparationItems: [
            "Keep phone line clear for emergency dispatchers",
            "Loosen tight clothing around chest and neck",
            "Have someone unlock front door for paramedics if safe to do so",
            "Gather current prescription medications or photo of boxes"
          ]
        };

      case "URGENT_TODAY":
        return {
          acuityColor: "orange",
          tagLabel: "Acuity Level 2: Urgent Same-Day Care",
          badgeBg: "bg-amber-600 text-white",
          containerBorder: "border-amber-300 bg-amber-50/70",
          icon: AlertTriangle,
          timeframe: "Today (Within 4 to 8 hours)",
          destination: "Urgent Care Center, Walk-In Clinic, or Same-Day GP Appointment",
          recommendedAction: "Seek prompt in-person clinical examination today.",
          preparationItems: [
            "Write down exact time symptoms began and any recent triggers",
            "List all medications, vitamins, and supplements you currently take",
            "Record your latest temperature and any pain relief medication taken",
            "Arrange transportation in case pain increases"
          ]
        };

      case "ROUTINE_SOON":
        return {
          acuityColor: "blue",
          tagLabel: "Acuity Level 3: Routine Clinic Appointment",
          badgeBg: "bg-blue-600 text-white",
          containerBorder: "border-blue-300 bg-blue-50/70",
          icon: Clock,
          timeframe: "Within 2 to 3 days",
          destination: "Primary Care Physician (GP) / Family Practice",
          recommendedAction: "Book a routine clinic consultation if symptoms do not resolve.",
          preparationItems: [
            "Note symptom changes over time in a daily log",
            "Prepare 2-3 key questions for your physician",
            "Bring your printed Doctor-Ready Summary (SBAR report)",
            "Check safety-net red flags that would upgrade urgency"
          ]
        };

      case "SELF_CARE":
      default:
        return {
          acuityColor: "green",
          tagLabel: "Acuity Level 4: Home Self-Care with Safety Net",
          badgeBg: "bg-emerald-600 text-white",
          containerBorder: "border-emerald-300 bg-emerald-50/70",
          icon: CheckCircle2,
          timeframe: "3 to 5 days recovery monitoring",
          destination: "Home Rest, Hydration & Over-the-Counter Symptom Relief",
          recommendedAction: "Rest, hydrate, and monitor for changes with our safety net.",
          preparationItems: [
            "Maintain hydration with water, clear broths, or oral electrolytes",
            "Get sufficient sleep and avoid strenuous physical exertion",
            "Avoid taking multiple combination medicines with duplicate ingredients",
            "Seek clinic consultation if no improvement after 7 days"
          ]
        };
    }
  };

  const route = getAcuityRoute(triageResult.urgency);
  const RouteIcon = route.icon;
  const emergencyTel = triageResult.emergencyContact?.number.split("/")[0].trim() || "112";

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
            Clinical Triage Evaluation Complete
          </span>
          <h1 className="text-2xl font-bold text-slate-900 mt-0.5">
            Personalized Assessment & Care Route
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenDoctorReport}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs cursor-pointer transition-all"
          >
            <FileText className="w-3.5 h-3.5" aria-hidden="true" />
            <span>View SBAR Doctor Handover</span>
          </button>
        </div>
      </div>

      {/* 1. BUOY-STYLE ACUITY CARE ROUTE CARD */}
      <section 
        aria-labelledby="acuity-care-title"
        className={`p-6 sm:p-8 rounded-3xl border-2 ${route.containerBorder} shadow-sm space-y-6`}
      >
        <div className="flex items-start gap-4">
          <div className="p-3.5 rounded-2xl bg-white shadow-xs shrink-0">
            <RouteIcon className="w-8 h-8 text-indigo-700" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <span className={`inline-block text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${route.badgeBg}`}>
              {route.tagLabel}
            </span>
            <h2 id="acuity-care-title" className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
              {route.destination}
            </h2>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 pt-0.5">
              <Clock className="w-4 h-4 text-slate-500" aria-hidden="true" />
              <span>Recommended Timeframe: <strong>{route.timeframe}</strong></span>
            </div>
          </div>
        </div>

        {/* Clinical Rationale Box */}
        <div className="bg-white/90 backdrop-blur-xs p-5 rounded-2xl border border-slate-200/80 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Why this care level was determined:
          </span>
          <p className="text-sm font-semibold text-slate-900 leading-snug">
            {triageResult.primaryAction}
          </p>
          <p className="text-xs text-slate-600 leading-relaxed">
            {triageResult.reasoning}
          </p>
        </div>

        {/* Immediate Action Buttons (Helpline launcher + Map link) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <a
            href={`tel:${emergencyTel}`}
            className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-rose-500 cursor-pointer"
          >
            <PhoneCall className="w-4 h-4" aria-hidden="true" />
            <span>Emergency Dialer ({triageResult.emergencyContact?.number})</span>
          </a>

          <a
            href="https://www.google.com/maps/search/urgent+care+clinic+or+hospital+near+me"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-sm shadow-2xs transition-all cursor-pointer"
          >
            <MapPin className="w-4 h-4 text-indigo-600" aria-hidden="true" />
            <span>Locate Nearest Verified Clinic (Maps)</span>
          </a>
        </div>

        {/* Buoy-Style Preparation Checklist for Clinic Visit */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-indigo-600" aria-hidden="true" />
            Preparation Checklist for Your Consultation
          </h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
            {route.preparationItems.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 2. ADA HEALTH-STYLE REASONED EDUCATIONAL POSSIBILITIES */}
      <section aria-labelledby="educational-possibilities-title" className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-2xs space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
              Ada Health-Style Differential Reasoning
            </div>
            <h2 id="educational-possibilities-title" className="text-xl font-bold text-slate-900 mt-1">
              Educational Possibilities to Discuss with Your Doctor
            </h2>
            <p className="text-xs text-slate-500">
              Ranked solely for educational discussion. We do not provide definitive diagnoses or invented probabilities.
            </p>
          </div>

          <span className="text-[11px] font-semibold bg-slate-100 text-slate-600 px-3 py-1 rounded-full border border-slate-200">
            Client Safe Rule: Non-Diagnostic
          </span>
        </div>

        {educationalMatches.length > 0 ? (
          <div className="space-y-4">
            {educationalMatches.map((item) => {
              const cond = item.condition;
              const isExpanded = expandedConditionId === cond.id;

              return (
                <div
                  key={cond.id}
                  className="rounded-2xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 transition-all overflow-hidden"
                >
                  <div
                    onClick={() => setExpandedConditionId(isExpanded ? null : cond.id)}
                    className="p-5 flex items-start justify-between gap-4 cursor-pointer"
                    role="button"
                    tabIndex={0}
                    aria-expanded={isExpanded}
                    onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setExpandedConditionId(isExpanded ? null : cond.id)}
                  >
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900">
                          {cond.name}
                        </h3>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800">
                          Educational Candidate
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                        {cond.plainLanguageSummary}
                      </p>
                    </div>

                    <div className="p-1 rounded-lg bg-white border border-slate-200 text-slate-400 shrink-0">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>

                  {/* Matching vs Absent Symptoms Badges (Ada Health Style) */}
                  <div className="px-5 pb-4 pt-1 flex flex-col sm:flex-row gap-4 border-t border-slate-200/60 text-xs">
                    {/* Matching Symptoms */}
                    <div className="flex-1 space-y-1.5">
                      <span className="font-semibold text-emerald-800 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                        <Check className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                        Reported Symptoms that Match ({item.matchingSymptoms.length})
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {item.matchingSymptoms.map((ms, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium text-xs"
                          >
                            <span>{ms}</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Absent Symptoms */}
                    <div className="flex-1 space-y-1.5">
                      <span className="font-semibold text-slate-500 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                        <MinusCircle className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                        Typical Signs You Did Not Report ({item.absentSymptoms.length})
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {item.absentSymptoms.map((as, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 border border-slate-200 font-medium text-xs"
                          >
                            <span>{as}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Questions for the Doctor */}
                  {isExpanded && (
                    <div className="bg-white p-5 border-t border-slate-200 text-xs space-y-2">
                      <strong className="text-slate-900 block font-bold">
                        Suggested questions to ask your physician regarding {cond.name}:
                      </strong>
                      <ul className="list-disc pl-5 space-y-1 text-slate-700">
                        {cond.questionsForDoctor.map((q, idx) => (
                          <li key={idx}>{q}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
            <HelpCircle className="w-8 h-8 text-slate-400 mx-auto" aria-hidden="true" />
            <p className="text-xs text-slate-600">
              No single common educational condition strongly correlates with the sparse symptoms reported. Clinical examination is advised for precise diagnostic correlation.
            </p>
          </div>
        )}
      </section>

      {/* Safety Net Banner */}
      <section className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs space-y-2 text-amber-950">
        <div className="flex items-center gap-2 font-bold">
          <AlertCircle className="w-4 h-4 text-amber-700" aria-hidden="true" />
          <span>Clinical Safety Net: When to Seek Faster Care</span>
        </div>
        <p className="leading-relaxed text-amber-900">
          {triageResult.safetyNetWarning}
        </p>
        <p className="text-[11px] text-amber-800/80 pt-1 border-t border-amber-200/60">
          {triageResult.limitationsNotice} &bull; Deterministic Ruleset {triageResult.rulesetVersion}
        </p>
      </section>

      {/* Navigation & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <button
          type="button"
          onClick={onStartNewAssessment}
          className="px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-2xs"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
          <span>Start New Assessment</span>
        </button>

        <button
          type="button"
          onClick={onOpenDoctorReport}
          className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm shadow-indigo-200"
        >
          <FileText className="w-4 h-4" aria-hidden="true" />
          <span>Proceed to Doctor SBAR Summary & Print (A4)</span>
        </button>
      </div>
    </div>
  );
};
