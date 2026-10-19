"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { ConsentScreen, ConsentFormData } from "@/components/ConsentScreen";
import { SymptomSelector } from "@/components/SymptomSelector";
import { EmergencyModal } from "@/components/EmergencyModal";
import { AssessmentResult } from "@/components/AssessmentResult";
import { DoctorReport } from "@/components/DoctorReport";
import {
  PatientIntake,
  TriageResult,
  evaluateSafetyTriage,
  UrgencyCategory
} from "@/lib/triageEngine";
import {
  ShieldAlert,
  ShieldCheck,
  AlertCircle,
  Clock,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
  Printer,
  FileText,
  Activity,
  HeartPulse,
  Brain,
  Wind,
  MapPin,
  Sparkles,
  ClipboardList
} from "lucide-react";

const SESSION_STORAGE_KEY = "triage_session_state_v1";

export default function Home() {
  const [activeStep, setActiveStep] = useState<"home" | "consent" | "symptoms" | "result" | "doctor-report">("home");
  const [intake, setIntake] = useState<PatientIntake>({
    age: 32,
    isCaregiver: false,
    patientContext: "self",
    countryCode: "US",
    chiefComplaint: "",
    symptoms: [],
    duration: "1-2 days",
    severityScore: 4,
    associatedSymptoms: []
  });
  const [triageResult, setTriageResult] = useState<TriageResult | null>(null);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState<boolean>(false);
  const [isHydrated, setIsHydrated] = useState<boolean>(false);

  // Restore session from sessionStorage on mount
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.intake) setIntake(parsed.intake);
        if (parsed.triageResult) setTriageResult(parsed.triageResult);
        if (parsed.activeStep) setActiveStep(parsed.activeStep);
      }
    } catch (e) {
      console.warn("Failed to restore session state:", e);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Persist session to sessionStorage on state updates
  useEffect(() => {
    if (!isHydrated) return;
    try {
      sessionStorage.setItem(
        SESSION_STORAGE_KEY,
        JSON.stringify({
          activeStep,
          intake,
          triageResult
        })
      );
    } catch (e) {
      console.warn("Failed to persist session state:", e);
    }
  }, [activeStep, intake, triageResult, isHydrated]);

  // Transition to Consent Step
  const handleStartAssessment = () => {
    setActiveStep("consent");
  };

  // From Consent Step to Symptom Selector
  const handleConsentProceed = (data: ConsentFormData) => {
    const updatedIntake: PatientIntake = {
      ...intake,
      age: data.age,
      isCaregiver: data.patientContext === "caregiver",
      patientContext: data.patientContext,
      countryCode: data.countryCode,
      isPregnant: data.isPregnant
    };
    setIntake(updatedIntake);

    // If age < 2, evaluate immediately as per T09
    if (data.age < 2) {
      const result = evaluateSafetyTriage(updatedIntake);
      setTriageResult(result);
      setActiveStep("result");
      return;
    }

    setActiveStep("symptoms");
  };

  // From Symptom Selector to Result
  const handleSymptomProceed = (newIntake: PatientIntake, immediateTriage: TriageResult) => {
    setIntake(newIntake);
    setTriageResult(immediateTriage);

    if (immediateTriage.isEmergency) {
      setIsEmergencyModalOpen(true);
    } else {
      setActiveStep("result");
    }
  };

  // Handle immediate emergency trigger during symptom selection
  const handleEmergencyTriggered = (result: TriageResult) => {
    setTriageResult(result);
    setIsEmergencyModalOpen(true);
  };

  // Reset & Clear session
  const handleStartNewAssessment = () => {
    try {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    } catch (e) {
      // ignore
    }
    setIntake({
      age: 32,
      isCaregiver: false,
      patientContext: "self",
      countryCode: "US",
      chiefComplaint: "",
      symptoms: [],
      duration: "1-2 days",
      severityScore: 4,
      associatedSymptoms: []
    });
    setTriageResult(null);
    setIsEmergencyModalOpen(false);
    setActiveStep("home");
  };

  // Pre-load and execute Test Scenarios (T01 - T04, T09)
  const runTestScenario = (scenarioKey: "T01" | "T02" | "T03" | "T04" | "T09" | "T08") => {
    let scenarioIntake: PatientIntake;

    switch (scenarioKey) {
      case "T01": // Chest pain + radiating to arm/jaw
        scenarioIntake = {
          age: 54,
          isCaregiver: false,
          patientContext: "self",
          countryCode: "US",
          chiefComplaint: "Crushing chest pain",
          symptoms: ["Chest Pain", "Shortness of Breath"],
          duration: "< 1 hour",
          severityScore: 9,
          associatedSymptoms: ["radiating to arm", "clammy"],
          additionalNotes: "Severe tightness in center of chest radiating down left arm."
        };
        break;

      case "T02": // Stroke FAST criteria
        scenarioIntake = {
          age: 68,
          isCaregiver: true,
          patientContext: "caregiver",
          countryCode: "US",
          chiefComplaint: "Sudden slurred speech",
          symptoms: ["Facial Droop / Arm Weakness"],
          duration: "sudden",
          severityScore: 8,
          associatedSymptoms: ["slurred speech"],
          additionalNotes: "Right arm weakness and difficulty speaking started 15 minutes ago."
        };
        break;

      case "T03": // Acute respiratory distress / stridor
        scenarioIntake = {
          age: 29,
          isCaregiver: false,
          patientContext: "self",
          countryCode: "US",
          chiefComplaint: "Severe gasping for air",
          symptoms: ["Shortness of Breath"],
          duration: "< 1 hour",
          severityScore: 9,
          associatedSymptoms: ["stridor", "blue lips"],
          additionalNotes: "Stridor, unable to complete full sentences, lips turning pale/blue."
        };
        break;

      case "T04": // Anaphylaxis
        scenarioIntake = {
          age: 24,
          isCaregiver: false,
          patientContext: "self",
          countryCode: "US",
          chiefComplaint: "Throat swelling and hives after eating nuts",
          symptoms: ["Swelling in Throat / Lips"],
          duration: "sudden",
          severityScore: 9,
          associatedSymptoms: ["swollen tongue", "difficulty breathing"],
          additionalNotes: "Tongue swelling and wheezing 10 mins post meal."
        };
        break;

      case "T09": // Pediatric exclusion (< 2 years)
        scenarioIntake = {
          age: 1, // 1 year old infant
          isCaregiver: true,
          patientContext: "caregiver",
          countryCode: "US",
          chiefComplaint: "Fever and irritability",
          symptoms: ["Fever"],
          duration: "1-2 days",
          severityScore: 5,
          associatedSymptoms: []
        };
        break;

      case "T08": // Mild common respiratory
        scenarioIntake = {
          age: 35,
          isCaregiver: false,
          patientContext: "self",
          countryCode: "US",
          chiefComplaint: "Mild cough and runny nose",
          symptoms: ["Cough"],
          duration: "3-7 days",
          severityScore: 3,
          associatedSymptoms: []
        };
        break;
    }

    setIntake(scenarioIntake);
    const result = evaluateSafetyTriage(scenarioIntake);
    setTriageResult(result);

    if (result.isEmergency) {
      setIsEmergencyModalOpen(true);
    } else {
      setActiveStep("result");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header
        onStartAssessment={activeStep === "home" ? handleStartAssessment : undefined}
        activeStep={activeStep}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Step 0: Landing / Overview Screen */}
        {activeStep === "home" && (
          <div className="max-w-5xl mx-auto px-4 py-10 sm:py-16 space-y-12">
            {/* Hero Section */}
            <div className="text-center max-w-3xl mx-auto space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4 text-indigo-600" aria-hidden="true" />
                <span>Deterministic Clinical Safety Core Engine</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Understand Symptoms & Know What To Do Next
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
                Evidence-based clinical triage benchmarked with Ada Health differential reasoning, Infermedica visual anatomical mapping, and Buoy Health care navigation.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  id="hero-start-assessment-btn"
                  onClick={handleStartAssessment}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-base shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Start Symptom Check</span>
                  <ArrowRight className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>

              <p className="text-xs text-slate-400">
                Anonymous &bull; Free &bull; WCAG 2.2 AA Compliant &bull; Non-diagnostic guidance
              </p>
            </div>

            {/* Market Leader Capabilities Showcase */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-2xs">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                  <MapPin className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Infermedica Anatomical Map</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Dual-mode intake with an interactive visual body selector filtering region-specific symptoms.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-2xs">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                  <ClipboardList className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Buoy Care Acuity Routing</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Color-coded urgency tiers with personalized preparation checklists and direct emergency dialers.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-2xs">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Ada Reasoned Possibilities</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Transparent educational differential with reported matching vs absent symptom breakdowns.
                </p>
              </div>
            </div>

            {/* Client Mandated Test Scenarios Verification Panel */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-indigo-600" aria-hidden="true" />
                    Clinical Safety Engine: Instant Scenario Testing (Client Benchmarks)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Verify deterministic zero-hallucination escalation against client test criteria:
                  </p>
                </div>
                <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                  Deterministic Rules Active
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => runTestScenario("T01")}
                  className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-100/70 text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2 font-bold text-xs text-rose-900 mb-1">
                    <HeartPulse className="w-4 h-4 text-rose-600" aria-hidden="true" />
                    <span>Scenario T01: Acute Chest Discomfort</span>
                  </div>
                  <p className="text-[11px] text-rose-800 leading-snug">
                    Chest pain radiating to left arm/jaw. Triggers immediate red-flag modal.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => runTestScenario("T02")}
                  className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-100/70 text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2 font-bold text-xs text-rose-900 mb-1">
                    <Brain className="w-4 h-4 text-rose-600" aria-hidden="true" />
                    <span>Scenario T02: Stroke Signs (FAST)</span>
                  </div>
                  <p className="text-[11px] text-rose-800 leading-snug">
                    Sudden facial droop, arm weakness, slurred speech. Unsuppressible emergency.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => runTestScenario("T03")}
                  className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-100/70 text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2 font-bold text-xs text-rose-900 mb-1">
                    <Wind className="w-4 h-4 text-rose-600" aria-hidden="true" />
                    <span>Scenario T03: Severe Stridor / Dyspnea</span>
                  </div>
                  <p className="text-[11px] text-rose-800 leading-snug">
                    Stridor, blue lips, inability to speak full sentences. Immediate 112/911.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => runTestScenario("T04")}
                  className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-100/70 text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2 font-bold text-xs text-rose-900 mb-1">
                    <AlertCircle className="w-4 h-4 text-rose-600" aria-hidden="true" />
                    <span>Scenario T04: Anaphylaxis</span>
                  </div>
                  <p className="text-[11px] text-rose-800 leading-snug">
                    Throat/tongue swelling, breathing distress. EpiPen + 911 urgent alert.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => runTestScenario("T09")}
                  className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/50 hover:bg-amber-100/70 text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2 font-bold text-xs text-amber-950 mb-1">
                    <ShieldAlert className="w-4 h-4 text-amber-700" aria-hidden="true" />
                    <span>Scenario T09: Pediatric Exclusion (&lt;2y)</span>
                  </div>
                  <p className="text-[11px] text-amber-900 leading-snug">
                    Infant fever. Safely returns &quot;Unable to Assess&quot; with direct pediatric referral.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => runTestScenario("T08")}
                  className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/70 text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2 font-bold text-xs text-emerald-950 mb-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" aria-hidden="true" />
                    <span>Scenario T08: Mild Cough & Cold</span>
                  </div>
                  <p className="text-[11px] text-emerald-900 leading-snug">
                    Mild symptoms. Routine consultation & self-care guidance without false alarm.
                  </p>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Consent & Eligibility */}
        {activeStep === "consent" && (
          <ConsentScreen onProceed={handleConsentProceed} />
        )}

        {/* Step 2: Symptom Selector & Body Map */}
        {activeStep === "symptoms" && (
          <SymptomSelector
            initialIntake={intake}
            onBack={() => setActiveStep("consent")}
            onProceedWithIntake={handleSymptomProceed}
            onEmergencyTriggered={handleEmergencyTriggered}
          />
        )}

        {/* Step 3: Buoy & Ada-style Assessment Result */}
        {activeStep === "result" && triageResult && (
          <AssessmentResult
            intake={intake}
            triageResult={triageResult}
            onStartNewAssessment={handleStartNewAssessment}
            onOpenDoctorReport={() => setActiveStep("doctor-report")}
          />
        )}

        {/* Step 4: SBAR Doctor Handover & A4 Printable Report */}
        {activeStep === "doctor-report" && triageResult && (
          <DoctorReport
            intake={intake}
            triageResult={triageResult}
            onBackToResult={() => setActiveStep("result")}
          />
        )}
      </main>

      {/* Emergency Immediate Red Intercept Modal */}
      <EmergencyModal
        isOpen={isEmergencyModalOpen}
        triageResult={triageResult}
        onDismiss={() => setIsEmergencyModalOpen(false)}
      />

      {/* Accessible Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-xs text-slate-500 print:hidden">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">TriageSafe AI</span>
            <span>&bull;</span>
            <span>Clinical Rule Engine {triageResult?.rulesetVersion || "2026.1.0"}</span>
          </div>
          <div className="text-center sm:text-right text-[11px] text-slate-400">
            For educational and triage preparation only. Never disregard immediate medical advice.
          </div>
        </div>
      </footer>
    </div>
  );
}
