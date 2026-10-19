"use client";

import React, { useState } from "react";
import { Plus, Check, RotateCw, UserCheck, Sparkles } from "lucide-react";

export type BodyRegionId = "head" | "chest" | "abdomen" | "back" | "limbs" | "general";

interface BodyRegionData {
  id: BodyRegionId;
  label: string;
  description: string;
  symptoms: string[];
}

export const REGION_SYMPTOM_MAP: Record<BodyRegionId, BodyRegionData> = {
  head: {
    id: "head",
    label: "Head & Neck",
    description: "Cranial, facial, ear, eye, and throat complaints",
    symptoms: [
      "Headache",
      "Dizziness",
      "Sore Throat",
      "Facial Droop / Arm Weakness",
      "Sinus pressure",
      "Ear pain",
      "Swelling in Throat / Lips",
      "Stiff neck"
    ]
  },
  chest: {
    id: "chest",
    label: "Chest & Respiratory",
    description: "Cardiac, bronchial, and pulmonary complaints",
    symptoms: [
      "Chest Pain",
      "Shortness of Breath",
      "Cough",
      "Heart palpitations",
      "Wheezing / Stridor",
      "Chest tightness",
      "Rib tenderness"
    ]
  },
  abdomen: {
    id: "abdomen",
    label: "Abdomen & Pelvis",
    description: "Gastrointestinal and lower abdominal complaints",
    symptoms: [
      "Abdominal Pain",
      "Nausea / Vomiting",
      "Diarrhea",
      "Stomach cramping",
      "Heartburn / Acid reflux",
      "Pelvic cramping",
      "Loss of appetite"
    ]
  },
  back: {
    id: "back",
    label: "Back & Spine",
    description: "Cervical, thoracic, and lumbar spine tension or pain",
    symptoms: [
      "Lower back pain",
      "Upper back ache",
      "Spine stiffness",
      "Muscle spasms",
      "Radiating leg pain (sciatica)"
    ]
  },
  limbs: {
    id: "limbs",
    label: "Arms, Legs & Joints",
    description: "Extremity weakness, joint swelling, or limb pain",
    symptoms: [
      "Arm weakness / numbness",
      "Leg swelling",
      "Joint pain / stiffness",
      "Pain radiating down left arm",
      "Muscle ache",
      "Tremor"
    ]
  },
  general: {
    id: "general",
    label: "Whole Body (Systemic)",
    description: "Constitutional or generalized symptoms",
    symptoms: [
      "Fever",
      "Fatigue / Exhaustion",
      "Cold sweats / clamminess",
      "Unexplained weight loss",
      "Generalized rash / hives",
      "Loss of consciousness"
    ]
  }
};

interface BodyMapProps {
  selectedSymptoms: string[];
  onToggleSymptom: (symptomName: string) => void;
}

export const BodyMap: React.FC<BodyMapProps> = ({
  selectedSymptoms,
  onToggleSymptom
}) => {
  const [activeRegion, setActiveRegion] = useState<BodyRegionId>("chest");
  const [viewOrientation, setViewOrientation] = useState<"front" | "back">("front");

  const currentRegionData = REGION_SYMPTOM_MAP[activeRegion];

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-5">
      {/* Header & Orientation Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">
            Infermedica-Style Anatomical Mapping
          </span>
          <h3 className="text-sm font-bold text-slate-900 mt-0.5">
            Interactive Body Selector
          </h3>
          <p className="text-xs text-slate-500">
            Click an anatomical zone to discover symptoms specific to that body region.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setViewOrientation(viewOrientation === "front" ? "back" : "front")}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs cursor-pointer"
        >
          <RotateCw className="w-3.5 h-3.5 text-indigo-600" aria-hidden="true" />
          <span>Switch to {viewOrientation === "front" ? "Posterior (Back)" : "Anterior (Front)"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* SVG Anatomical Human Figure Column */}
        <div className="md:col-span-5 flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-2">
            {viewOrientation === "front" ? "Anterior Aspect" : "Posterior Aspect"}
          </div>

          <svg
            viewBox="0 0 200 380"
            className="w-48 h-auto select-none drop-shadow-xs"
            role="img"
            aria-label="Human body interactive map"
          >
            <defs>
              <linearGradient id="bodyBaseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#e2e8f0" />
                <stop offset="100%" stopColor="#cbd5e1" />
              </linearGradient>
              <linearGradient id="activeRegionGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#4f46e5" />
              </linearGradient>
            </defs>

            {/* General / Background subtle glow if selected */}
            {activeRegion === "general" && (
              <rect
                x="15"
                y="15"
                width="170"
                height="350"
                rx="24"
                fill="#e0e7ff"
                stroke="#6366f1"
                strokeWidth="2"
                strokeDasharray="4 4"
                className="animate-pulse opacity-60"
              />
            )}

            {/* HEAD & NECK */}
            <g
              onClick={() => setActiveRegion("head")}
              className="cursor-pointer group transition-all"
              role="button"
              tabIndex={0}
              aria-label="Select Head & Neck region"
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setActiveRegion("head")}
            >
              {/* Head Oval */}
              <ellipse
                cx="100"
                cy="42"
                rx="26"
                ry="30"
                fill={activeRegion === "head" ? "url(#activeRegionGrad)" : "#cbd5e1"}
                stroke={activeRegion === "head" ? "#4338ca" : "#94a3b8"}
                strokeWidth="2"
                className="transition-colors duration-200 group-hover:fill-indigo-300"
              />
              {/* Neck */}
              <rect
                x="92"
                y="68"
                width="16"
                height="16"
                rx="2"
                fill={activeRegion === "head" ? "url(#activeRegionGrad)" : "#cbd5e1"}
                stroke={activeRegion === "head" ? "#4338ca" : "#94a3b8"}
                strokeWidth="1.5"
                className="transition-colors duration-200 group-hover:fill-indigo-300"
              />
              <text
                x="100"
                y="45"
                textAnchor="middle"
                fontSize="9"
                fontWeight="bold"
                fill={activeRegion === "head" ? "#ffffff" : "#475569"}
              >
                HEAD
              </text>
            </g>

            {/* CHEST / UPPER BACK */}
            <g
              onClick={() => setActiveRegion(viewOrientation === "front" ? "chest" : "back")}
              className="cursor-pointer group transition-all"
              role="button"
              tabIndex={0}
              aria-label={viewOrientation === "front" ? "Select Chest region" : "Select Upper Back region"}
              onKeyDown={(e) =>
                (e.key === "Enter" || e.key === " ") &&
                setActiveRegion(viewOrientation === "front" ? "chest" : "back")
              }
            >
              <path
                d="M 68 86 L 132 86 L 126 150 L 74 150 Z"
                fill={
                  (viewOrientation === "front" && activeRegion === "chest") ||
                  (viewOrientation === "back" && activeRegion === "back")
                    ? "url(#activeRegionGrad)"
                    : "#cbd5e1"
                }
                stroke={
                  (viewOrientation === "front" && activeRegion === "chest") ||
                  (viewOrientation === "back" && activeRegion === "back")
                    ? "#4338ca"
                    : "#94a3b8"
                }
                strokeWidth="2"
                className="transition-colors duration-200 group-hover:fill-indigo-300"
              />
              <text
                x="100"
                y="120"
                textAnchor="middle"
                fontSize="10"
                fontWeight="bold"
                fill={
                  (viewOrientation === "front" && activeRegion === "chest") ||
                  (viewOrientation === "back" && activeRegion === "back")
                    ? "#ffffff"
                    : "#475569"
                }
              >
                {viewOrientation === "front" ? "CHEST" : "UPPER BACK"}
              </text>
            </g>

            {/* ABDOMEN / LOWER BACK */}
            <g
              onClick={() => setActiveRegion(viewOrientation === "front" ? "abdomen" : "back")}
              className="cursor-pointer group transition-all"
              role="button"
              tabIndex={0}
              aria-label={viewOrientation === "front" ? "Select Abdomen region" : "Select Lower Back region"}
              onKeyDown={(e) =>
                (e.key === "Enter" || e.key === " ") &&
                setActiveRegion(viewOrientation === "front" ? "abdomen" : "back")
              }
            >
              <path
                d="M 74 152 L 126 152 L 120 205 L 80 205 Z"
                fill={
                  (viewOrientation === "front" && activeRegion === "abdomen") ||
                  (viewOrientation === "back" && activeRegion === "back")
                    ? "url(#activeRegionGrad)"
                    : "#cbd5e1"
                }
                stroke={
                  (viewOrientation === "front" && activeRegion === "abdomen") ||
                  (viewOrientation === "back" && activeRegion === "back")
                    ? "#4338ca"
                    : "#94a3b8"
                }
                strokeWidth="2"
                className="transition-colors duration-200 group-hover:fill-indigo-300"
              />
              <text
                x="100"
                y="180"
                textAnchor="middle"
                fontSize="9"
                fontWeight="bold"
                fill={
                  (viewOrientation === "front" && activeRegion === "abdomen") ||
                  (viewOrientation === "back" && activeRegion === "back")
                    ? "#ffffff"
                    : "#475569"
                }
              >
                {viewOrientation === "front" ? "ABDOMEN" : "LOWER BACK"}
              </text>
            </g>

            {/* UPPER LIMBS (ARMS) */}
            <g
              onClick={() => setActiveRegion("limbs")}
              className="cursor-pointer group transition-all"
              role="button"
              tabIndex={0}
              aria-label="Select Arms & Limbs region"
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setActiveRegion("limbs")}
            >
              {/* Left Arm */}
              <path
                d="M 64 88 L 44 150 L 34 210 L 46 212 L 56 156 L 70 94 Z"
                fill={activeRegion === "limbs" ? "url(#activeRegionGrad)" : "#cbd5e1"}
                stroke={activeRegion === "limbs" ? "#4338ca" : "#94a3b8"}
                strokeWidth="2"
                className="transition-colors duration-200 group-hover:fill-indigo-300"
              />
              {/* Right Arm */}
              <path
                d="M 136 88 L 156 150 L 166 210 L 154 212 L 144 156 L 130 94 Z"
                fill={activeRegion === "limbs" ? "url(#activeRegionGrad)" : "#cbd5e1"}
                stroke={activeRegion === "limbs" ? "#4338ca" : "#94a3b8"}
                strokeWidth="2"
                className="transition-colors duration-200 group-hover:fill-indigo-300"
              />
            </g>

            {/* LOWER LIMBS (LEGS) */}
            <g
              onClick={() => setActiveRegion("limbs")}
              className="cursor-pointer group transition-all"
              role="button"
              tabIndex={0}
              aria-label="Select Legs & Limbs region"
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setActiveRegion("limbs")}
            >
              {/* Left Leg */}
              <path
                d="M 80 208 L 74 290 L 70 360 L 88 360 L 96 290 L 98 208 Z"
                fill={activeRegion === "limbs" ? "url(#activeRegionGrad)" : "#cbd5e1"}
                stroke={activeRegion === "limbs" ? "#4338ca" : "#94a3b8"}
                strokeWidth="2"
                className="transition-colors duration-200 group-hover:fill-indigo-300"
              />
              {/* Right Leg */}
              <path
                d="M 102 208 L 104 290 L 112 360 L 130 360 L 126 290 L 120 208 Z"
                fill={activeRegion === "limbs" ? "url(#activeRegionGrad)" : "#cbd5e1"}
                stroke={activeRegion === "limbs" ? "#4338ca" : "#94a3b8"}
                strokeWidth="2"
                className="transition-colors duration-200 group-hover:fill-indigo-300"
              />
              <text
                x="100"
                y="310"
                textAnchor="middle"
                fontSize="9"
                fontWeight="bold"
                fill={activeRegion === "limbs" ? "#ffffff" : "#475569"}
              >
                LIMBS
              </text>
            </g>
          </svg>

          {/* Quick Region Selector Pills */}
          <div className="flex flex-wrap justify-center gap-1.5 mt-3 pt-3 border-t border-slate-100 w-full">
            {(Object.keys(REGION_SYMPTOM_MAP) as BodyRegionId[]).map((key) => {
              const reg = REGION_SYMPTOM_MAP[key];
              const isSelected = activeRegion === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveRegion(key)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-indigo-600 text-white shadow-2xs"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {reg.label.split(" ")[0]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Symptom Suggestions for Active Region */}
        <div className="md:col-span-7 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-ping" />
                <h4 className="text-sm font-bold text-slate-900">
                  {currentRegionData.label} Symptoms
                </h4>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {currentRegionData.description}
              </p>
            </div>
            <span className="text-[11px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-100">
              {currentRegionData.symptoms.length} symptoms
            </span>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {currentRegionData.symptoms.map((symptom) => {
              const isSelected = selectedSymptoms.includes(symptom);
              const isEmergencyTrigger =
                symptom.includes("Chest Pain") ||
                symptom.includes("Facial Droop") ||
                symptom.includes("Throat / Lips") ||
                symptom.includes("Shortness of Breath");

              return (
                <button
                  key={symptom}
                  type="button"
                  onClick={() => onToggleSymptom(symptom)}
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-2xs scale-[1.02]"
                      : isEmergencyTrigger
                      ? "bg-rose-50/70 text-rose-900 border-rose-200 hover:bg-rose-100"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
                  }`}
                  aria-pressed={isSelected}
                >
                  <span>{symptom}</span>
                  {isSelected ? (
                    <Check className="w-3.5 h-3.5 text-white" aria-hidden="true" />
                  ) : (
                    <Plus className="w-3.5 h-3.5 opacity-60" aria-hidden="true" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="p-3 rounded-lg bg-indigo-50/60 border border-indigo-100 text-[11px] text-indigo-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" aria-hidden="true" />
            <span>
              Selected symptoms are immediately screened against deterministic clinical safety barriers.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
