"use client";

import React, { useState, useId } from "react";
import {
  Search,
  Plus,
  X,
  AlertTriangle,
  Sparkles,
  Activity,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  HelpCircle,
  Layers,
  MapPin,
  ChevronDown,
  Info
} from "lucide-react";
import { PatientIntake, evaluateSafetyTriage, TriageResult } from "@/lib/triageEngine";
import { BodyMap } from "@/components/BodyMap";

interface SymptomSelectorProps {
  initialIntake: Partial<PatientIntake>;
  onBack: () => void;
  onProceedWithIntake: (intake: PatientIntake, immediateTriage: TriageResult) => void;
  onEmergencyTriggered: (triageResult: TriageResult) => void;
}

const COMMON_SYMPTOM_CHIPS = [
  { id: "s-chest-pain", name: "Chest Pain", category: "cardiovascular", warningLevel: "high" },
  { id: "s-headache", name: "Headache", category: "neurological", warningLevel: "medium" },
  { id: "s-fever", name: "Fever", category: "general", warningLevel: "low" },
  { id: "s-shortness-breath", name: "Shortness of Breath", category: "respiratory", warningLevel: "high" },
  { id: "s-cough", name: "Cough", category: "respiratory", warningLevel: "low" },
  { id: "s-abdo-pain", name: "Abdominal Pain", category: "gastrointestinal", warningLevel: "medium" },
  { id: "s-facial-weakness", name: "Facial Droop / Arm Weakness", category: "neurological", warningLevel: "emergency" },
  { id: "s-allergic-swelling", name: "Swelling in Throat / Lips", category: "allergic", warningLevel: "emergency" },
  { id: "s-dizziness", name: "Dizziness", category: "neurological", warningLevel: "medium" },
  { id: "s-sore-throat", name: "Sore Throat", category: "respiratory", warningLevel: "low" }
];

export const SymptomSelector: React.FC<SymptomSelectorProps> = ({
  initialIntake,
  onBack,
  onProceedWithIntake,
  onEmergencyTriggered
}) => {
  const [inputMode, setInputMode] = useState<"chips" | "bodymap">("bodymap");
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(initialIntake.symptoms || []);
  const [chiefComplaint, setChiefComplaint] = useState<string>(initialIntake.chiefComplaint || "");
  const [freeTextQuery, setFreeTextQuery] = useState<string>("");
  const [duration, setDuration] = useState<string>(initialIntake.duration || "1-2 days");
  const [severityScore, setSeverityScore] = useState<number>(initialIntake.severityScore || 4);
  const [additionalDetails, setAdditionalDetails] = useState<string>(initialIntake.additionalNotes || "");
  const [associatedFeatures, setAssociatedFeatures] = useState<string[]>(initialIntake.associatedSymptoms || []);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Contextual "Why are we asking?" accordion states
  const [openWhyAsking, setOpenWhyAsking] = useState<string | null>(null);

  const searchInputId = useId();

  const toggleWhyAsking = (sectionId: string) => {
    setOpenWhyAsking(openWhyAsking === sectionId ? null : sectionId);
  };

  const handleToggleSymptom = (symptomName: string) => {
    let updated: string[];
    if (selectedSymptoms.includes(symptomName)) {
      updated = selectedSymptoms.filter((s) => s !== symptomName);
      if (chiefComplaint === symptomName) {
        setChiefComplaint(updated.length > 0 ? updated[0] : "");
      }
    } else {
      updated = [...selectedSymptoms, symptomName];
      if (!chiefComplaint) {
        setChiefComplaint(symptomName);
      }
    }
    setSelectedSymptoms(updated);
    checkEmergencyImmediately(updated, freeTextQuery, duration, severityScore, additionalDetails);
  };

  const handleAddCustomSymptom = (e: React.FormEvent) => {
    e.preventDefault();
    const query = freeTextQuery.trim();
    if (!query) return;

    if (!selectedSymptoms.includes(query)) {
      const updated = [...selectedSymptoms, query];
      setSelectedSymptoms(updated);
      if (!chiefComplaint) setChiefComplaint(query);
      checkEmergencyImmediately(updated, query, duration, severityScore, additionalDetails);
    }
    setFreeTextQuery("");
  };

  const handleToggleAssociatedFeature = (feature: string) => {
    const updated = associatedFeatures.includes(feature)
      ? associatedFeatures.filter((f) => f !== feature)
      : [...associatedFeatures, feature];
    setAssociatedFeatures(updated);
    checkEmergencyImmediately(selectedSymptoms, freeTextQuery, duration, severityScore, additionalDetails, updated);
  };

  const checkEmergencyImmediately = (
    symptoms: string[],
    freeText: string,
    currentDuration: string,
    severity: number,
    notes: string,
    assoc: string[] = associatedFeatures
  ) => {
    const candidateIntake: PatientIntake = {
      age: initialIntake.age ?? 30,
      isCaregiver: initialIntake.isCaregiver ?? false,
      patientContext: initialIntake.patientContext ?? "self",
      countryCode: initialIntake.countryCode ?? "US",
      isPregnant: initialIntake.isPregnant,
      chiefComplaint: chiefComplaint || symptoms[0] || freeText,
      symptoms,
      duration: currentDuration,
      severityScore: severity,
      associatedSymptoms: assoc,
      additionalNotes: `${freeText} ${notes}`.trim()
    };

    const result = evaluateSafetyTriage(candidateIntake);
    if (result.isEmergency) {
      onEmergencyTriggered(result);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (selectedSymptoms.length === 0 && !freeTextQuery.trim()) {
      setErrorMsg("Please select or type at least one primary symptom to evaluate.");
      return;
    }

    const effectiveSymptoms = [...selectedSymptoms];
    if (freeTextQuery.trim() && !effectiveSymptoms.includes(freeTextQuery.trim())) {
      effectiveSymptoms.push(freeTextQuery.trim());
    }

    const intake: PatientIntake = {
      age: initialIntake.age ?? 30,
      isCaregiver: initialIntake.isCaregiver ?? false,
      patientContext: initialIntake.patientContext ?? "self",
      countryCode: initialIntake.countryCode ?? "US",
      isPregnant: initialIntake.isPregnant,
      chiefComplaint: chiefComplaint || effectiveSymptoms[0],
      symptoms: effectiveSymptoms,
      duration,
      severityScore,
      associatedSymptoms: associatedFeatures,
      additionalNotes: additionalDetails
    };

    const triageResult = evaluateSafetyTriage(intake);

    if (triageResult.isEmergency) {
      onEmergencyTriggered(triageResult);
    } else {
      onProceedWithIntake(intake, triageResult);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Step Header */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
              aria-label="Go back to eligibility step"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                Step 2 of 3: Symptom Intake & Localization
              </span>
              <h1 className="text-xl font-bold text-slate-900 mt-0.5">
                Describe What You Are Experiencing
              </h1>
            </div>
          </div>

          {/* Mode Switcher: Chips vs Body Map */}
          <div className="flex items-center gap-1 p-1 bg-slate-200/80 rounded-xl">
            <button
              type="button"
              onClick={() => setInputMode("bodymap")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                inputMode === "bodymap"
                  ? "bg-white text-indigo-700 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Interactive Body Map</span>
            </button>
            <button
              type="button"
              onClick={() => setInputMode("chips")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                inputMode === "chips"
                  ? "bg-white text-indigo-700 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Layers className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Quick Categories</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleFormSubmit} className="p-6 sm:p-8 space-y-8">
          {/* Free-Text Search & Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor={searchInputId} className="block text-sm font-semibold text-slate-900">
                Type your symptoms or primary concern
              </label>
              <button
                type="button"
                onClick={() => toggleWhyAsking("freetext")}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold inline-flex items-center gap-1 cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Why are we asking this?</span>
              </button>
            </div>

            {openWhyAsking === "freetext" && (
              <div className="p-3 mb-2 rounded-xl bg-indigo-50 border border-indigo-100 text-xs text-indigo-950 flex items-start gap-2.5 animate-in fade-in duration-150">
                <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <strong className="font-semibold block mb-0.5">Clinical Rationale: Natural Language Capture</strong>
                  Patient-reported words often contain subtleties that rigid checkboxes miss. We preserve your exact terminology for clinical SBAR handover while mapping clinical concepts to safety rules.
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
                <input
                  id={searchInputId}
                  type="text"
                  value={freeTextQuery}
                  onChange={(e) => setFreeTextQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddCustomSymptom(e);
                    }
                  }}
                  placeholder="e.g., sharp pain under ribs, sudden difficulty speaking, throbbing headache..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm bg-white text-slate-900 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600 focus:outline-hidden"
                />
              </div>
              <button
                type="button"
                onClick={handleAddCustomSymptom}
                disabled={!freeTextQuery.trim()}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white text-sm font-medium flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Dual-Mode Intake Screen: Body Map or Category Chips */}
          {inputMode === "bodymap" ? (
            <BodyMap
              selectedSymptoms={selectedSymptoms}
              onToggleSymptom={handleToggleSymptom}
            />
          ) : (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Quick-Select Clinical Symptom Categories
                </span>
                <button
                  type="button"
                  onClick={() => toggleWhyAsking("chips")}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold inline-flex items-center gap-1 cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Why these categories?</span>
                </button>
              </div>

              {openWhyAsking === "chips" && (
                <div className="p-3 mb-3 rounded-xl bg-indigo-50 border border-indigo-100 text-xs text-indigo-950 flex items-start gap-2.5 animate-in fade-in duration-150">
                  <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <strong className="font-semibold block mb-0.5">Clinical Rationale: High-Prevalence Red Flags</strong>
                    These categories represent the most frequent primary complaints encountered in emergency triage and general practice. Fast intake ensures high-risk flags are screened early.
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {COMMON_SYMPTOM_CHIPS.map((chip) => {
                  const isSelected = selectedSymptoms.includes(chip.name);
                  const isEmergencyChip = chip.warningLevel === "emergency";
                  return (
                    <button
                      key={chip.id}
                      type="button"
                      onClick={() => handleToggleSymptom(chip.name)}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-2xs"
                          : isEmergencyChip
                          ? "bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
                      }`}
                      aria-pressed={isSelected}
                    >
                      <span>{chip.name}</span>
                      {isSelected ? (
                        <CheckCircle className="w-3.5 h-3.5 text-white" aria-hidden="true" />
                      ) : (
                        <Plus className="w-3.5 h-3.5 opacity-60" aria-hidden="true" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Selected Symptoms Pills & Chief Complaint Selector */}
          {selectedSymptoms.length > 0 && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">
                  Selected Symptoms ({selectedSymptoms.length})
                </span>
                <span className="text-[11px] text-slate-500">
                  Click a tag to make it your Primary Complaint
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedSymptoms.map((sym) => {
                  const isChief = chiefComplaint === sym;
                  return (
                    <div
                      key={sym}
                      className={`inline-flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-lg text-xs font-medium border ${
                        isChief
                          ? "bg-indigo-100 border-indigo-300 text-indigo-900 ring-2 ring-indigo-500/20"
                          : "bg-white border-slate-200 text-slate-800"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setChiefComplaint(sym)}
                        className="cursor-pointer hover:underline text-left font-semibold"
                      >
                        {sym} {isChief && <span className="font-bold text-indigo-700 ml-1">(Primary)</span>}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleSymptom(sym)}
                        className="p-0.5 rounded-md hover:bg-slate-200 text-slate-400 hover:text-slate-700 cursor-pointer"
                        aria-label={`Remove symptom ${sym}`}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* High-Risk Accompanying Signs Checklist */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="block text-sm font-semibold text-slate-900">
                Are you experiencing any of these high-risk accompanying signs?
              </span>
              <button
                type="button"
                onClick={() => toggleWhyAsking("redflags")}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold inline-flex items-center gap-1 cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Why are we asking this?</span>
              </button>
            </div>

            {openWhyAsking === "redflags" && (
              <div className="p-3 mb-2.5 rounded-xl bg-indigo-50 border border-indigo-100 text-xs text-indigo-950 flex items-start gap-2.5 animate-in fade-in duration-150">
                <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <strong className="font-semibold block mb-0.5">Clinical Rationale: Rule-Out Emergency Red Flags</strong>
                  Accompanying signs such as pain radiating to the jaw, sudden facial weakness, or airway swelling are classic clinical red flags indicating potential life threats (e.g. Acute Coronary Syndrome, Stroke FAST, Anaphylaxis).
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                { id: "af-radiating", label: "Pain radiating to left arm, neck, or jaw", tag: "radiating to arm" },
                { id: "af-dyspnea", label: "Shortness of breath / severe breathless", tag: "shortness of breath" },
                { id: "af-sweating", label: "Cold sweat / clammy skin", tag: "clammy" },
                { id: "af-stroke", label: "Sudden slurred speech or facial droop", tag: "slurred speech" },
                { id: "af-stridor", label: "Blue lips or high whistling breath (stridor)", tag: "stridor" },
                { id: "af-allergy", label: "Swollen tongue / difficulty swallowing", tag: "swollen tongue" }
              ].map((item) => {
                const checked = associatedFeatures.includes(item.tag);
                return (
                  <label
                    key={item.id}
                    className={`flex items-start gap-2.5 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      checked
                        ? "bg-rose-50 border-rose-300 text-rose-950 font-medium"
                        : "bg-white border-slate-200 hover:border-slate-300 text-slate-700"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleToggleAssociatedFeature(item.tag)}
                      className="mt-0.5 h-4 w-4 rounded-sm border-slate-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
                    />
                    <span>{item.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Duration & Severity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-slate-200">
            {/* Onset / Duration */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="duration-select" className="block text-sm font-semibold text-slate-900">
                  When did it start? (Onset / Duration)
                </label>
                <button
                  type="button"
                  onClick={() => toggleWhyAsking("onset")}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold inline-flex items-center gap-1 cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Why?</span>
                </button>
              </div>

              {openWhyAsking === "onset" && (
                <div className="p-2.5 mb-2 rounded-xl bg-indigo-50 border border-indigo-100 text-xs text-indigo-950 flex items-start gap-2">
                  <Info className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    Acute sudden onset (seconds to minutes) distinguishes emergent vascular/neurological events from gradual subacute infections.
                  </div>
                </div>
              )}

              <select
                id="duration-select"
                value={duration}
                onChange={(e) => {
                  setDuration(e.target.value);
                  checkEmergencyImmediately(selectedSymptoms, freeTextQuery, e.target.value, severityScore, additionalDetails);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600 focus:outline-hidden cursor-pointer"
              >
                <option value="sudden">Suddenly (within seconds/minutes)</option>
                <option value="< 1 hour">Less than 1 hour ago</option>
                <option value="hours">A few hours ago (today)</option>
                <option value="1-2 days">1 to 2 days ago</option>
                <option value="3-7 days">3 to 7 days ago</option>
                <option value="weeks">More than a week ago</option>
                <option value="unknown">Unsure / Not certain</option>
              </select>
            </div>

            {/* Severity Slider (1-10) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="severity-range" className="text-sm font-semibold text-slate-900">
                  Severity Score: {severityScore}/10
                </label>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    severityScore >= 8
                      ? "bg-rose-100 text-rose-800"
                      : severityScore >= 5
                      ? "bg-amber-100 text-amber-800"
                      : "bg-emerald-100 text-emerald-800"
                  }`}
                >
                  {severityScore >= 8
                    ? "Severe / Incapacitating"
                    : severityScore >= 5
                    ? "Moderate Discomfort"
                    : "Mild"}
                </span>
              </div>
              <input
                id="severity-range"
                type="range"
                min="1"
                max="10"
                value={severityScore}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setSeverityScore(val);
                  checkEmergencyImmediately(selectedSymptoms, freeTextQuery, duration, val, additionalDetails);
                }}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>1 (Mild)</span>
                <span>5 (Moderate)</span>
                <span>10 (Worst Possible)</span>
              </div>
            </div>
          </div>

          {/* Validation Error */}
          {errorMsg && (
            <div role="alert" className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" aria-hidden="true" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Navigation Action Buttons */}
          <div className="pt-2 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={onBack}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-sm font-semibold transition-all cursor-pointer"
            >
              Back
            </button>
            <button
              id="evaluate-symptoms-btn"
              type="submit"
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-sm shadow-sm shadow-indigo-200 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Evaluate Symptoms Safely</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
