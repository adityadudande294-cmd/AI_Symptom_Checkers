"use client";

import React, { useState } from "react";
import { ShieldCheck, User, Users, AlertCircle, CheckCircle2, Lock, ArrowRight, Info } from "lucide-react";

export interface ConsentFormData {
  age: number;
  patientContext: "self" | "caregiver";
  countryCode: string;
  hasConsented: boolean;
  isPregnant?: boolean;
}

interface ConsentScreenProps {
  onProceed: (data: ConsentFormData) => void;
}

export const ConsentScreen: React.FC<ConsentScreenProps> = ({ onProceed }) => {
  const [patientContext, setPatientContext] = useState<"self" | "caregiver">("self");
  const [ageInput, setAgeInput] = useState<string>("32");
  const [countryCode, setCountryCode] = useState<string>("US");
  const [isPregnant, setIsPregnant] = useState<boolean>(false);
  const [hasConsented, setHasConsented] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const parsedAge = parseInt(ageInput, 10);
  const isPediatricExcluded = !isNaN(parsedAge) && parsedAge < 2;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (isNaN(parsedAge) || parsedAge < 0 || parsedAge > 125) {
      setErrorMessage("Please enter a valid age between 0 and 125.");
      return;
    }

    if (!hasConsented) {
      setErrorMessage("Explicit consent to proceed with health symptom processing is required.");
      return;
    }

    onProceed({
      age: parsedAge,
      patientContext,
      countryCode,
      hasConsented,
      isPregnant
    });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Step Indicator Header */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
              Step 1 of 3: Eligibility & Consent
            </span>
            <h1 className="text-xl font-bold text-slate-900 mt-0.5">
              Begin Clinical Symptom Assessment
            </h1>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium border border-slate-300">
            <Lock className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
            Anonymous & Encrypted
          </span>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {/* Transparent Non-Forced Account Notice */}
          <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" aria-hidden="true" />
            <div className="text-xs text-indigo-950 space-y-1">
              <p className="font-semibold text-indigo-900">
                Anonymous First & No Registration Required
              </p>
              <p className="text-slate-600 leading-relaxed">
                You do not need to create an account, provide an email address, or provide your name to check symptoms. Your health data is processed solely for this temporary assessment session.
              </p>
            </div>
          </div>

          {/* Patient Context: Self vs Caregiver */}
          <fieldset className="space-y-2">
            <legend className="text-sm font-semibold text-slate-900">
              Who is this assessment for?
            </legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => setPatientContext("self")}
                className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  patientContext === "self"
                    ? "border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-600 text-slate-900 font-medium"
                    : "border-slate-200 hover:border-slate-300 bg-white text-slate-700"
                }`}
                aria-pressed={patientContext === "self"}
              >
                <div className={`p-2 rounded-lg ${patientContext === "self" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"}`}>
                  <User className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <div className="text-sm font-semibold">Myself</div>
                  <div className="text-xs text-slate-500">I am describing my own symptoms</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPatientContext("caregiver")}
                className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  patientContext === "caregiver"
                    ? "border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-600 text-slate-900 font-medium"
                    : "border-slate-200 hover:border-slate-300 bg-white text-slate-700"
                }`}
                aria-pressed={patientContext === "caregiver"}
              >
                <div className={`p-2 rounded-lg ${patientContext === "caregiver" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"}`}>
                  <Users className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <div className="text-sm font-semibold">Someone Else</div>
                  <div className="text-xs text-slate-500">I am a parent, guardian, or caregiver</div>
                </div>
              </button>
            </div>
          </fieldset>

          {/* Age Input & Region */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="patient-age-input" className="block text-sm font-semibold text-slate-900 mb-1">
                Patient Age (years)
              </label>
              <input
                id="patient-age-input"
                type="number"
                min="0"
                max="125"
                value={ageInput}
                onChange={(e) => setAgeInput(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600 focus:outline-hidden"
                placeholder="e.g. 32"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Required for clinical age-specific guidelines.
              </span>
            </div>

            <div>
              <label htmlFor="patient-country-select" className="block text-sm font-semibold text-slate-900 mb-1">
                Current Location / Region
              </label>
              <select
                id="patient-country-select"
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600 focus:outline-hidden cursor-pointer"
              >
                <option value="US">United States (911)</option>
                <option value="UK">United Kingdom (999 / 112)</option>
                <option value="EU">European Union (112)</option>
                <option value="CA">Canada (911)</option>
                <option value="IN">India (112)</option>
                <option value="AU">Australia (000)</option>
                <option value="GLOBAL">Other / International (112 / 911)</option>
              </select>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Determines regional emergency & care contacts.
              </span>
            </div>
          </div>

          {/* Pediatric Age Exclusion Warning Banner (T09) */}
          {isPediatricExcluded && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden="true" />
              <div className="text-xs text-amber-900 space-y-1">
                <p className="font-semibold text-amber-950">
                  Pediatric Safety Boundary Notice (Ages &lt; 2)
                </p>
                <p className="text-amber-800 leading-relaxed">
                  Infants and children under 2 years of age cannot be safely assessed by automated algorithms. Submitting this form will safely guide you to pediatric emergency or primary care hotlines directly without lengthy questions.
                </p>
              </div>
            </div>
          )}

          {/* Optional Pregnancy Check */}
          {!isPediatricExcluded && parsedAge >= 12 && parsedAge <= 55 && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-slate-500" aria-hidden="true" />
                <span className="text-xs font-medium text-slate-800">
                  Is the patient currently pregnant or recently postpartum?
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsPregnant(!isPregnant)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden focus:ring-2 focus:ring-indigo-600 ${
                  isPregnant ? "bg-indigo-600" : "bg-slate-300"
                }`}
                role="switch"
                aria-checked={isPregnant}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    isPregnant ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          )}

          {/* Explicit Health Data Consent */}
          <div className="pt-2 border-t border-slate-200">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                id="consent-checkbox"
                type="checkbox"
                checked={hasConsented}
                onChange={(e) => setHasConsented(e.target.checked)}
                className="mt-1 h-4 w-4 rounded-sm border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <span className="text-xs text-slate-600 leading-relaxed">
                <strong className="text-slate-900 block font-semibold mb-0.5">
                  I give explicit consent for processing health symptoms for triage guidance.
                </strong>
                I understand this platform provides general educational triage and safety advice. It is not an unsupervised medical diagnosis or emergency dispatch service. I can withdraw at any time.
              </span>
            </label>
          </div>

          {/* Error Message Display */}
          {errorMessage && (
            <div 
              role="alert" 
              className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" aria-hidden="true" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Submission Button */}
          <div className="pt-2">
            <button
              id="consent-submit-btn"
              type="submit"
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-sm rounded-xl shadow-sm shadow-indigo-200 transition-all flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 cursor-pointer"
            >
              <span>Continue to Symptom Description</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
