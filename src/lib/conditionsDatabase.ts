/**
 * Educational Possibilities & Condition Reference Database
 * Conforming strictly to Client Requirements Section 08 & 12:
 * "Possible explanations, only where medically appropriate, labelled as possibilities and not diagnoses.
 * Never invent certainty scores or percentages."
 */

export interface EducationalCondition {
  id: string;
  name: string;
  category: "respiratory" | "cardiovascular" | "neurological" | "gastrointestinal" | "general" | "musculoskeletal";
  plainLanguageSummary: string;
  typicalSymptoms: string[];
  associatedRedFlags: string[];
  careAcuityDefault: "EMERGENCY_NOW" | "URGENT_TODAY" | "ROUTINE_SOON" | "SELF_CARE";
  questionsForDoctor: string[];
}

export interface ConditionMatchResult {
  condition: EducationalCondition;
  matchingSymptoms: string[];
  absentSymptoms: string[];
  matchScore: number;
}

export const EDUCATIONAL_CONDITIONS_CATALOG: EducationalCondition[] = [
  {
    id: "cond-urti",
    name: "Upper Respiratory Tract Infection (Common Cold / Viral Rhinopharyngitis)",
    category: "respiratory",
    plainLanguageSummary: "A common viral infection affecting the nose, throat, and upper airways. Symptoms typically peak within 2-3 days and resolve with rest and hydration.",
    typicalSymptoms: ["Cough", "Sore Throat", "Runny nose", "Fatigue", "Mild fever", "Headache"],
    associatedRedFlags: ["Shortness of Breath", "Stridor", "Chest Pain"],
    careAcuityDefault: "SELF_CARE",
    questionsForDoctor: [
      "Is this viral or could there be a secondary bacterial infection?",
      "Are there OTC remedies suitable given my health history?",
      "What signs should prompt me to seek urgent care?"
    ]
  },
  {
    id: "cond-bronchitis",
    name: "Acute Bronchitis",
    category: "respiratory",
    plainLanguageSummary: "Inflammation of the airways in the lungs, often following a cold or respiratory virus. A persistent cough is the hallmark sign.",
    typicalSymptoms: ["Cough", "Fatigue", "Shortness of breath on exertion", "Mild fever", "Chest discomfort on coughing"],
    associatedRedFlags: ["Blue lips", "Stridor", "Crushing chest pain"],
    careAcuityDefault: "ROUTINE_SOON",
    questionsForDoctor: [
      "How long should I expect the cough to linger?",
      "Do I need an inhaler or bronchodilator to ease breathing?",
      "Would a chest X-ray be recommended?"
    ]
  },
  {
    id: "cond-tension-headache",
    name: "Tension-Type Headache",
    category: "neurological",
    plainLanguageSummary: "The most common form of headache, typically described as a dull, aching band-like pressure across the forehead or back of the head, often related to stress, eye strain, or poor posture.",
    typicalSymptoms: ["Headache", "Fatigue", "Neck tension", "Mild dizziness"],
    associatedRedFlags: ["Thunderclap headache", "Sudden facial droop", "Stiff neck and high fever", "Slurred speech"],
    careAcuityDefault: "SELF_CARE",
    questionsForDoctor: [
      "Are there lifestyle or ergonomic triggers I can adjust?",
      "How can I safely manage pain without rebound headaches?",
      "What warning signs indicate a more serious migraine or neurological concern?"
    ]
  },
  {
    id: "cond-migraine",
    name: "Migraine Episode",
    category: "neurological",
    plainLanguageSummary: "A recurrent neurological disorder causing moderate to severe throbbing headache, frequently unilateral, often exacerbated by sound, light, or physical movement.",
    typicalSymptoms: ["Headache", "Nausea", "Dizziness", "Sensitivity to light", "Fatigue"],
    associatedRedFlags: ["Thunderclap headache", "Slurred speech", "Arm weakness"],
    careAcuityDefault: "ROUTINE_SOON",
    questionsForDoctor: [
      "Would a prescription migraine-specific treatment (such as a triptan) help?",
      "Should I keep a symptom diary to identify dietary or sleep triggers?",
      "When is preventative daily medication indicated?"
    ]
  },
  {
    id: "cond-gastroenteritis",
    name: "Acute Viral Gastroenteritis ('Stomach Flu')",
    category: "gastrointestinal",
    plainLanguageSummary: "Inflammation of the stomach and intestines caused by a viral infection, leading to cramping, nausea, vomiting, or diarrhea. The priority is maintaining hydration.",
    typicalSymptoms: ["Abdominal Pain", "Nausea", "Vomiting", "Fever", "Fatigue"],
    associatedRedFlags: ["Inability to retain fluids for 24 hours", "Vomiting blood", "Black tarry stools", "High fever"],
    careAcuityDefault: "ROUTINE_SOON",
    questionsForDoctor: [
      "How can I best assess my hydration levels at home?",
      "Are oral rehydration salts recommended?",
      "At what point would IV fluids or urgent blood tests be needed?"
    ]
  },
  {
    id: "cond-gerd",
    name: "Gastroesophageal Reflux Disease (Acid Reflux / Heartburn)",
    category: "gastrointestinal",
    plainLanguageSummary: "A condition where stomach acid washes back up into the esophagus, producing a burning sensation in the chest or upper abdomen, often worse after meals or when lying down.",
    typicalSymptoms: ["Chest discomfort", "Abdominal Pain", "Cough", "Sore Throat", "Acid taste in mouth"],
    associatedRedFlags: ["Chest pain radiating to arm or jaw", "Shortness of breath", "Difficulty swallowing"],
    careAcuityDefault: "ROUTINE_SOON",
    questionsForDoctor: [
      "Can we confirm this is acid-related and not a cardiovascular problem?",
      "What dietary changes will provide the quickest relief?",
      "Should I take an H2-blocker or proton-pump inhibitor?"
    ]
  },
  {
    id: "cond-musculoskeletal-chest",
    name: "Musculoskeletal Chest Wall Strain / Costochondritis",
    category: "musculoskeletal",
    plainLanguageSummary: "Localized inflammation or strain in the muscles, cartilage, or ribs of the chest wall. Pain is typically sharp and distinctly reproducible by pressing on the ribs or taking a deep breath.",
    typicalSymptoms: ["Chest Pain", "Pain reproducible on touch", "Pain with movement"],
    associatedRedFlags: ["Shortness of Breath", "Radiation to jaw or left arm", "Cold sweats"],
    careAcuityDefault: "ROUTINE_SOON",
    questionsForDoctor: [
      "How do we rule out heart or lung conditions with certainty?",
      "What gentle stretching or heat/ice protocol should I use?",
      "How long does rib cartilage inflammation typically take to heal?"
    ]
  }
];

/**
 * Determine top 2-3 educational possibilities based on reported symptoms
 * Strictly calculates matches vs absences for transparent, educational breakdown.
 */
export function matchEducationalPossibilities(userSymptoms: string[]): ConditionMatchResult[] {
  if (!userSymptoms || userSymptoms.length === 0) return [];

  const lowerUserSymptoms = userSymptoms.map(s => s.toLowerCase());

  const results: ConditionMatchResult[] = EDUCATIONAL_CONDITIONS_CATALOG.map(condition => {
    const matching: string[] = [];
    const absent: string[] = [];

    for (const typical of condition.typicalSymptoms) {
      const matchFound = lowerUserSymptoms.some(us => 
        us.includes(typical.toLowerCase()) || typical.toLowerCase().includes(us)
      );

      if (matchFound) {
        matching.push(typical);
      } else {
        absent.push(typical);
      }
    }

    const score = matching.length / Math.max(condition.typicalSymptoms.length, 1);

    return {
      condition,
      matchingSymptoms: matching,
      absentSymptoms: absent,
      matchScore: score
    };
  });

  // Filter conditions that have at least 1 matching symptom, sort by highest matching count
  return results
    .filter(r => r.matchingSymptoms.length > 0)
    .sort((a, b) => b.matchingSymptoms.length - a.matchingSymptoms.length)
    .slice(0, 3);
}
