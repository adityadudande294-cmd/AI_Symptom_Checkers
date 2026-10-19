/**
 * AI Symptom Checker & Clinical Triage Platform
 * Core Deterministic Safety Triage Engine
 * 
 * IMPORTANT CLINICAL SAFETY MANDATE:
 * As mandated by Client Requirements (Section 07 & 15):
 * "No unsupervised LLM hallucinations for emergency decisions. Urgency logic must be deterministic and rule-governed."
 * Failures of optional AI services must never suppress a critical emergency instruction.
 */

export const RULESET_VERSION = "2026.1.0-clinical-governed";

export type UrgencyCategory =
  | "EMERGENCY_NOW"
  | "URGENT_TODAY"
  | "ROUTINE_SOON"
  | "SELF_CARE"
  | "UNABLE_TO_ASSESS";

export interface RedFlagRule {
  id: string;
  scenarioCode: string; // T01, T02, T03, T04, T05, T06, etc.
  name: string;
  description: string;
  clinicalRationale: string;
  urgency: UrgencyCategory;
  primaryAction: string;
  emergencyNumberDefault: string;
  triggerKeywords: string[];
  checkCondition: (intake: PatientIntake) => boolean;
}

export interface PatientIntake {
  age: number;
  isCaregiver: boolean;
  patientContext?: "self" | "caregiver";
  countryCode?: string; // US, UK, EU, IN, etc.
  chiefComplaint: string;
  symptoms: string[];
  duration?: string; // e.g. "sudden", "< 1 hour", "1-2 days", "weeks", "unknown"
  severityScore?: number; // 1-10
  associatedSymptoms?: string[];
  isPregnant?: boolean;
  contradictoryFlags?: boolean;
  additionalNotes?: string;
}

export interface RedFlagMatch {
  ruleId: string;
  scenarioCode: string;
  ruleName: string;
  clinicalRationale: string;
  matchedTriggers: string[];
}

export interface TriageResult {
  urgency: UrgencyCategory;
  isEmergency: boolean;
  scenarioCode?: string;
  primaryAction: string;
  reasoning: string;
  matchedRedFlags: RedFlagMatch[];
  emergencyContact: {
    number: string;
    label: string;
  };
  safetyNetWarning: string;
  limitationsNotice: string;
  rulesetVersion: string;
  timestamp: string;
}

/**
 * Country emergency mapping
 */
export function getEmergencyContact(countryCode?: string): { number: string; label: string } {
  const code = (countryCode || "GLOBAL").toUpperCase();
  switch (code) {
    case "US":
    case "CA":
      return { number: "911", label: "Emergency Services (911)" };
    case "UK":
      return { number: "999", label: "Emergency Services (999 / 112)" };
    case "EU":
      return { number: "112", label: "European Emergency Services (112)" };
    case "IN":
      return { number: "112", label: "National Emergency Helpline (112 / 102)" };
    case "AU":
      return { number: "000", label: "Emergency Services (000)" };
    default:
      return { number: "112 / 911", label: "Local Emergency Services (112 / 911)" };
  }
}

/**
 * Clinician-Approved Hard Red-Flag Rules (Deterministic Safety Barrier)
 */
export const CLINICAL_RED_FLAGS: RedFlagRule[] = [
  // T01: Acute Coronary Syndrome / Serious Chest Discomfort
  {
    id: "RF-CARD-001",
    scenarioCode: "T01",
    name: "Acute Chest Discomfort with High-Risk Associated Features",
    description: "Chest pressure, heaviness, or squeezing with radiation to arm, jaw, neck, back, or shortness of breath.",
    clinicalRationale: "High clinical suspicion for Acute Coronary Syndrome (Myocardial Infarction). Requires immediate catheterization / emergency evaluation.",
    urgency: "EMERGENCY_NOW",
    primaryAction: "Call emergency services immediately. Do not drive yourself to hospital.",
    emergencyNumberDefault: "112 / 911",
    triggerKeywords: [
      "chest pain", "chest pressure", "crushing chest", "chest tightness", "heart attack", "radiating to arm", "radiating to jaw"
    ],
    checkCondition: (intake: PatientIntake): boolean => {
      const allText = [
        intake.chiefComplaint,
        ...intake.symptoms,
        ...(intake.associatedSymptoms || []),
        intake.additionalNotes || ""
      ].join(" ").toLowerCase();

      const hasChestPain =
        allText.includes("chest pain") ||
        allText.includes("chest pressure") ||
        allText.includes("chest tightness") ||
        allText.includes("crushing pain") ||
        allText.includes("heaviness in chest") ||
        intake.symptoms.some(s => s.toLowerCase().includes("chest pain") || s.toLowerCase().includes("chest pressure"));

      if (!hasChestPain) return false;

      const hasRadiation =
        allText.includes("left arm") ||
        allText.includes("arm pain") ||
        allText.includes("radiating") ||
        allText.includes("jaw pain") ||
        allText.includes("neck pain") ||
        allText.includes("back pain");

      const hasDyspneaOrSweat =
        allText.includes("shortness of breath") ||
        allText.includes("difficulty breathing") ||
        allText.includes("breathless") ||
        allText.includes("sweating") ||
        allText.includes("clammy") ||
        allText.includes("dizziness") ||
        allText.includes("lightheaded");

      return hasRadiation || hasDyspneaOrSweat || (intake.severityScore !== undefined && intake.severityScore >= 8);
    }
  },

  // T02: Acute Neurological Deficit (FAST Stroke Criteria)
  {
    id: "RF-NEURO-002",
    scenarioCode: "T02",
    name: "Acute Stroke Symptoms (FAST Protocol)",
    description: "Sudden facial droop, arm or leg weakness, slurred speech, or difficulty speaking/understanding.",
    clinicalRationale: "Time-critical cerebral ischemia or hemorrhage. Emergency thrombolytic / endovascular window (FAST protocol).",
    urgency: "EMERGENCY_NOW",
    primaryAction: "Call emergency services immediately (Code Stroke). Note exact time symptoms began.",
    emergencyNumberDefault: "112 / 911",
    triggerKeywords: ["facial droop", "arm weakness", "slurred speech", "stroke", "numbness one side", "cant speak"],
    checkCondition: (intake: PatientIntake): boolean => {
      const allText = [
        intake.chiefComplaint,
        ...intake.symptoms,
        ...(intake.associatedSymptoms || []),
        intake.additionalNotes || ""
      ].join(" ").toLowerCase();

      const fastMatches = [
        allText.includes("facial droop") || allText.includes("face drooping") || allText.includes("crooked smile"),
        allText.includes("arm weakness") || allText.includes("arm drifting") || allText.includes("cannot lift arm") || allText.includes("weakness on one side"),
        allText.includes("slurred speech") || allText.includes("trouble speaking") || allText.includes("jumbled words") || allText.includes("difficulty talking") || allText.includes("cannot talk"),
        allText.includes("stroke") || allText.includes("tia")
      ];

      return fastMatches.filter(Boolean).length >= 1;
    }
  },

  // T03: Severe Acute Respiratory Distress / Stridor
  {
    id: "RF-RESP-003",
    scenarioCode: "T03",
    name: "Severe Respiratory Distress / Impending Respiratory Failure",
    description: "Stridor, inability to complete full sentences, cyanosis (blue lips/face), or extreme gasping.",
    clinicalRationale: "Critical airway compromise or acute hypoxemic respiratory failure requiring immediate oxygenation and airway management.",
    urgency: "EMERGENCY_NOW",
    primaryAction: "Call emergency services immediately. Sit upright and loosen tight clothing around the neck.",
    emergencyNumberDefault: "112 / 911",
    triggerKeywords: ["stridor", "blue lips", "cant breathe", "severe breathlessness", "gasping for air", "cyanosis"],
    checkCondition: (intake: PatientIntake): boolean => {
      const allText = [
        intake.chiefComplaint,
        ...intake.symptoms,
        ...(intake.associatedSymptoms || []),
        intake.additionalNotes || ""
      ].join(" ").toLowerCase();

      return (
        allText.includes("stridor") ||
        allText.includes("blue lips") ||
        allText.includes("blue face") ||
        allText.includes("cyanosis") ||
        allText.includes("cannot speak full sentences") ||
        allText.includes("inability to speak") ||
        allText.includes("gasping for air") ||
        allText.includes("severe shortness of breath") ||
        allText.includes("choking") ||
        (intake.symptoms.some(s => s.toLowerCase().includes("shortness of breath")) && (intake.severityScore || 0) >= 8)
      );
    }
  },

  // T04: Anaphylaxis / Severe Allergic Reaction
  {
    id: "RF-ALLERG-004",
    scenarioCode: "T04",
    name: "Anaphylaxis (Severe Systemic Allergic Reaction)",
    description: "Swelling of throat, tongue, or lips with wheezing, difficulty breathing, dizziness, or widespread hives.",
    clinicalRationale: "Rapidly progressive IgE-mediated or non-IgE systemic shock. Immediate intramuscular epinephrine administration required.",
    urgency: "EMERGENCY_NOW",
    primaryAction: "Administer Epinephrine auto-injector (EpiPen) immediately if available, then call 112/911.",
    emergencyNumberDefault: "112 / 911",
    triggerKeywords: ["anaphylaxis", "swollen tongue", "throat swelling", "allergic reaction throat", "epipen"],
    checkCondition: (intake: PatientIntake): boolean => {
      const allText = [
        intake.chiefComplaint,
        ...intake.symptoms,
        ...(intake.associatedSymptoms || []),
        intake.additionalNotes || ""
      ].join(" ").toLowerCase();

      const hasSwelling =
        allText.includes("throat swelling") ||
        allText.includes("swelling in throat") ||
        allText.includes("swollen tongue") ||
        allText.includes("swelling of lips") ||
        allText.includes("swollen airway") ||
        allText.includes("difficulty swallowing");

      const hasRespiratoryOrCirculatory =
        allText.includes("difficulty breathing") ||
        allText.includes("wheezing") ||
        allText.includes("dizzy") ||
        allText.includes("fainting") ||
        allText.includes("hives") ||
        allText.includes("rash");

      const explicitAnaphylaxis =
        allText.includes("anaphylaxis") ||
        allText.includes("severe allergic reaction");

      return explicitAnaphylaxis || (hasSwelling && hasRespiratoryOrCirculatory);
    }
  },

  // T05: Massive Hemorrhage / Loss of Consciousness
  {
    id: "RF-TRAUMA-005",
    scenarioCode: "T05",
    name: "Severe Hemorrhage or Loss of Consciousness",
    description: "Uncontrolled bleeding, passing out/unresponsiveness, vomiting large volumes of blood.",
    clinicalRationale: "Hemorrhagic shock or acute neurological collapse requiring immediate advanced trauma/life support.",
    urgency: "EMERGENCY_NOW",
    primaryAction: "Apply firm direct pressure to active bleeding if possible and call emergency services immediately.",
    emergencyNumberDefault: "112 / 911",
    triggerKeywords: ["uncontrolled bleeding", "loss of consciousness", "passed out", "vomiting blood", "unresponsive"],
    checkCondition: (intake: PatientIntake): boolean => {
      const allText = [
        intake.chiefComplaint,
        ...intake.symptoms,
        ...(intake.associatedSymptoms || []),
        intake.additionalNotes || ""
      ].join(" ").toLowerCase();

      return (
        allText.includes("loss of consciousness") ||
        allText.includes("passed out") ||
        allText.includes("blacked out") ||
        allText.includes("unresponsive") ||
        allText.includes("vomiting blood") ||
        allText.includes("coughing blood") ||
        allText.includes("uncontrolled bleeding") ||
        allText.includes("spurting blood")
      );
    }
  },

  // T06: Thunderclap Headache / Meningism
  {
    id: "RF-HEAD-006",
    scenarioCode: "T06",
    name: "Thunderclap Headache or Suspected Meningeal Irritation",
    description: "Sudden explosive severe headache peaking within seconds ('worst headache of life') or headache with stiff neck and high fever.",
    clinicalRationale: "High suspicion for Subarachnoid Hemorrhage (SAH) or acute Bacterial Meningitis.",
    urgency: "EMERGENCY_NOW",
    primaryAction: "Seek emergency medical assessment at the nearest hospital emergency department.",
    emergencyNumberDefault: "112 / 911",
    triggerKeywords: ["thunderclap", "worst headache of life", "stiff neck fever headache", "sudden explosive headache"],
    checkCondition: (intake: PatientIntake): boolean => {
      const allText = [
        intake.chiefComplaint,
        ...intake.symptoms,
        ...(intake.associatedSymptoms || []),
        intake.additionalNotes || ""
      ].join(" ").toLowerCase();

      const isThunderclap =
        allText.includes("thunderclap") ||
        allText.includes("worst headache of my life") ||
        allText.includes("explosive headache") ||
        (allText.includes("headache") && intake.duration === "sudden" && (intake.severityScore || 0) >= 9);

      const isMeningism =
        allText.includes("headache") &&
        allText.includes("stiff neck") &&
        (allText.includes("fever") || allText.includes("photophobia") || allText.includes("sensitivity to light"));

      return isThunderclap || isMeningism;
    }
  }
];

/**
 * Deterministic Safety Evaluator
 * Executes all rules synchronously without AI hallucination risks.
 */
export function evaluateSafetyTriage(intake: PatientIntake): TriageResult {
  const timestamp = new Date().toISOString();
  const emergencyInfo = getEmergencyContact(intake.countryCode);

  // 1. Check Age & Supported Population Screening (T09 Exclusions)
  // Client Requirement: "If a population or symptom pattern has not been validated, the system must clearly say it cannot safely assess that situation and advise appropriate professional care. Age exclusions < 2 years."
  if (intake.age < 2) {
    return {
      urgency: "UNABLE_TO_ASSESS",
      isEmergency: false,
      scenarioCode: "T09",
      primaryAction: "Contact a pediatrician, primary care physician, or NHS 111 / local health line immediately.",
      reasoning: "Pediatric assessment for infants and toddlers under 2 years of age requires direct, in-person clinical examination. Automated algorithmic triage cannot safely evaluate this age category.",
      matchedRedFlags: [],
      emergencyContact: emergencyInfo,
      safetyNetWarning: "If the child is lethargic, struggling to breathe, has a purpuric non-blanching rash, or a fever above 38°C (100.4°F) under 3 months, seek emergency care immediately.",
      limitationsNotice: "This platform is clinically validated only for individuals aged 2 years and above.",
      rulesetVersion: RULESET_VERSION,
      timestamp
    };
  }

  // 2. Check for Severe Contradictions or Unreconciled Input (T13)
  if (intake.contradictoryFlags) {
    return {
      urgency: "UNABLE_TO_ASSESS",
      isEmergency: false,
      scenarioCode: "T13",
      primaryAction: "Please re-check your answers or consult a qualified healthcare provider directly.",
      reasoning: "The symptoms provided contain contradictory clinical entries. To avoid unsafe or misleading triage guidance, automated assessment has been safely paused.",
      matchedRedFlags: [],
      emergencyContact: emergencyInfo,
      safetyNetWarning: "If you feel unwell or are unsure about your symptoms, always contact a healthcare professional or urgent care center.",
      limitationsNotice: "Algorithmic triage requires consistent symptom parameters to maintain clinical validity.",
      rulesetVersion: RULESET_VERSION,
      timestamp
    };
  }

  // 3. Evaluate Hard Red-Flag Rules (EMERGENCY_NOW)
  const matchedRedFlags: RedFlagMatch[] = [];

  for (const rule of CLINICAL_RED_FLAGS) {
    if (rule.checkCondition(intake)) {
      matchedRedFlags.push({
        ruleId: rule.id,
        scenarioCode: rule.scenarioCode,
        ruleName: rule.name,
        clinicalRationale: rule.clinicalRationale,
        matchedTriggers: rule.triggerKeywords.filter(k =>
          [intake.chiefComplaint, ...intake.symptoms, intake.additionalNotes || ""].join(" ").toLowerCase().includes(k.toLowerCase())
        )
      });
    }
  }

  if (matchedRedFlags.length > 0) {
    const primaryRule = matchedRedFlags[0];
    return {
      urgency: "EMERGENCY_NOW",
      isEmergency: true,
      scenarioCode: primaryRule.scenarioCode,
      primaryAction: `Call ${emergencyInfo.number} immediately or go to the nearest emergency department.`,
      reasoning: `Your reported symptoms matched an immediate critical safety criteria: ${primaryRule.ruleName}. This indicates a potentially time-critical medical situation.`,
      matchedRedFlags,
      emergencyContact: emergencyInfo,
      safetyNetWarning: "Do not wait to see if symptoms improve. Do not drive yourself to hospital if experiencing chest pain, severe breathlessness, or stroke signs.",
      limitationsNotice: "This is a deterministic red-flag alert. It does not replace emergency medical diagnosis or treatment by paramedics and physicians.",
      rulesetVersion: RULESET_VERSION,
      timestamp
    };
  }

  // 4. Pregnancy Screening Checks (T10)
  if (intake.isPregnant) {
    const allText = [intake.chiefComplaint, ...intake.symptoms, intake.additionalNotes || ""].join(" ").toLowerCase();
    const hasPregnancyWarning =
      allText.includes("bleeding") ||
      allText.includes("cramping") ||
      allText.includes("abdominal pain") ||
      allText.includes("severe headache") ||
      allText.includes("blurred vision") ||
      allText.includes("fever");

    if (hasPregnancyWarning) {
      return {
        urgency: "URGENT_TODAY",
        isEmergency: false,
        scenarioCode: "T10",
        primaryAction: "Contact your maternity unit, OB/GYN triage line, or urgent care doctor today.",
        reasoning: "Symptoms such as bleeding, abdominal pain, fever, or severe headaches during pregnancy require prompt clinical evaluation by an obstetric or urgent care team.",
        matchedRedFlags: [],
        emergencyContact: emergencyInfo,
        safetyNetWarning: "If you experience heavy bleeding, sudden severe abdominal pain, or fluid leakage, proceed to an emergency department or maternity assessment center immediately.",
        limitationsNotice: "Pregnancy requires specialized clinical protocols that cannot be replaced by general triage tools.",
        rulesetVersion: RULESET_VERSION,
        timestamp
      };
    }
  }

  // 5. High-Risk / Frail / Severe Symptoms without Red Flags -> URGENT_TODAY
  const isSevere = (intake.severityScore || 0) >= 7;
  const allText = [intake.chiefComplaint, ...intake.symptoms, intake.additionalNotes || ""].join(" ").toLowerCase();
  
  // Test Scenario T07: Abdominal pain with persistent vomiting
  const isAcuteAbdomen =
    allText.includes("abdominal pain") &&
    (allText.includes("vomiting") || allText.includes("cannot keep fluids down") || allText.includes("fever"));

  if (isAcuteAbdomen || isSevere || (intake.age >= 75 && (intake.severityScore || 0) >= 5)) {
    return {
      urgency: "URGENT_TODAY",
      isEmergency: false,
      scenarioCode: isAcuteAbdomen ? "T07" : "T11",
      primaryAction: "Consult a doctor, primary care clinic, or urgent care facility today.",
      reasoning: "The combination, severity, or duration of your symptoms indicates you should be examined by a clinician within the next few hours.",
      matchedRedFlags: [],
      emergencyContact: emergencyInfo,
      safetyNetWarning: "If your symptoms suddenly worsen, or you develop severe pain, breathlessness, or confusion, call emergency services immediately.",
      limitationsNotice: "Urgent guidance is intended to assist timely healthcare navigation, not formulate a final diagnosis.",
      rulesetVersion: RULESET_VERSION,
      timestamp
    };
  }

  // 6. Moderate persistent symptoms -> ROUTINE_SOON
  const hasModerateSymptoms =
    allText.includes("cough") ||
    allText.includes("fever") ||
    allText.includes("headache") ||
    allText.includes("sore throat") ||
    allText.includes("ear pain") ||
    (intake.severityScore || 0) >= 4;

  if (hasModerateSymptoms) {
    return {
      urgency: "ROUTINE_SOON",
      isEmergency: false,
      scenarioCode: "T08",
      primaryAction: "Schedule a routine consultation with your general practitioner or primary clinic.",
      reasoning: "Your reported symptoms appear stable but warrant routine professional assessment if they persist beyond expected viral recovery periods (3-5 days).",
      matchedRedFlags: [],
      emergencyContact: emergencyInfo,
      safetyNetWarning: "Seek urgent care if you develop high fever resistant to medication, difficulty breathing, stiff neck, or inability to tolerate fluids.",
      limitationsNotice: "Routine guidance assists in planning primary care appointments.",
      rulesetVersion: RULESET_VERSION,
      timestamp
    };
  }

  // 7. Mild, low-risk symptoms -> SELF_CARE
  return {
    urgency: "SELF_CARE",
    isEmergency: false,
    scenarioCode: "T08-MILD",
    primaryAction: "Rest, ensure adequate hydration, and monitor your symptoms at home.",
    reasoning: "Your reported symptoms appear mild and low-risk based on standard clinical guidelines.",
    matchedRedFlags: [],
    emergencyContact: emergencyInfo,
    safetyNetWarning: "Safety Net: If your symptoms worsen, persist beyond 7 days, or new concerning signs arise, seek medical evaluation.",
    limitationsNotice: "Self-care information does not substitute for clinical advice. No medications are prescribed.",
    rulesetVersion: RULESET_VERSION,
    timestamp
  };
}
