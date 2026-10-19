/**
 * Automated Safety & Clinical Regression Test Suite
 * Conforming strictly to Section 18: Realistic Test Scenarios
 * (Client Requirements AI_Symptom_Checkers_Client_Requirements-1 (1).pdf)
 */

import { evaluateSafetyTriage, PatientIntake, TriageResult } from "../src/lib/triageEngine";

interface TestCase {
  id: string;
  name: string;
  intake: PatientIntake;
  expectedUrgency: TriageResult["urgency"];
  expectedEmergency: boolean;
  validate?: (result: TriageResult) => boolean;
}

const TEST_CASES: TestCase[] = [
  {
    id: "T01",
    name: "Serious chest discomfort plus concerning accompanying symptoms",
    intake: {
      age: 52,
      isCaregiver: false,
      chiefComplaint: "Crushing chest discomfort",
      symptoms: ["Chest Pain"],
      associatedSymptoms: ["radiating to arm", "clammy"],
      duration: "< 1 hour",
      severityScore: 9
    },
    expectedUrgency: "EMERGENCY_NOW",
    expectedEmergency: true,
    validate: (res) => res.matchedRedFlags.some(rf => rf.scenarioCode === "T01")
  },
  {
    id: "T02",
    name: "Sudden face, arm or speech change (FAST Criteria)",
    intake: {
      age: 67,
      isCaregiver: true,
      chiefComplaint: "Slurred speech and crooked smile",
      symptoms: ["Facial droop", "Arm weakness"],
      duration: "sudden",
      severityScore: 8
    },
    expectedUrgency: "EMERGENCY_NOW",
    expectedEmergency: true,
    validate: (res) => res.matchedRedFlags.some(rf => rf.scenarioCode === "T02")
  },
  {
    id: "T03",
    name: "Severe acute breathing difficulty / stridor",
    intake: {
      age: 34,
      isCaregiver: false,
      chiefComplaint: "Extreme gasping for air",
      symptoms: ["Shortness of breath"],
      associatedSymptoms: ["stridor", "blue lips"],
      duration: "< 1 hour",
      severityScore: 9
    },
    expectedUrgency: "EMERGENCY_NOW",
    expectedEmergency: true,
    validate: (res) => res.matchedRedFlags.some(rf => rf.scenarioCode === "T03")
  },
  {
    id: "T04",
    name: "Possible severe allergic reaction / anaphylaxis",
    intake: {
      age: 22,
      isCaregiver: false,
      chiefComplaint: "Swollen tongue and throat after bee sting",
      symptoms: ["Throat swelling", "Wheezing"],
      duration: "sudden",
      severityScore: 9
    },
    expectedUrgency: "EMERGENCY_NOW",
    expectedEmergency: true,
    validate: (res) => res.matchedRedFlags.some(rf => rf.scenarioCode === "T04")
  },
  {
    id: "T05",
    name: "Severe bleeding or loss of consciousness",
    intake: {
      age: 41,
      isCaregiver: true,
      chiefComplaint: "Passed out and coughing blood",
      symptoms: ["Loss of consciousness", "Coughing blood"],
      duration: "< 1 hour",
      severityScore: 10
    },
    expectedUrgency: "EMERGENCY_NOW",
    expectedEmergency: true,
    validate: (res) => res.matchedRedFlags.some(rf => rf.scenarioCode === "T05")
  },
  {
    id: "T06",
    name: "Severe headache with concerning new signs (Thunderclap)",
    intake: {
      age: 38,
      isCaregiver: false,
      chiefComplaint: "Thunderclap explosive headache",
      symptoms: ["Headache"],
      duration: "sudden",
      severityScore: 10,
      associatedSymptoms: ["stiff neck", "fever"]
    },
    expectedUrgency: "EMERGENCY_NOW",
    expectedEmergency: true,
    validate: (res) => res.matchedRedFlags.some(rf => rf.scenarioCode === "T06")
  },
  {
    id: "T07",
    name: "Abdominal pain with persistent vomiting",
    intake: {
      age: 45,
      isCaregiver: false,
      chiefComplaint: "Severe lower abdominal pain with repeated vomiting",
      symptoms: ["Abdominal pain", "Vomiting"],
      duration: "hours",
      severityScore: 8
    },
    expectedUrgency: "URGENT_TODAY",
    expectedEmergency: false
  },
  {
    id: "T08",
    name: "Mild common upper respiratory symptoms",
    intake: {
      age: 28,
      isCaregiver: false,
      chiefComplaint: "Runny nose and mild dry cough",
      symptoms: ["Cough"],
      duration: "3-7 days",
      severityScore: 2
    },
    expectedUrgency: "ROUTINE_SOON",
    expectedEmergency: false
  },
  {
    id: "T09",
    name: "Fever in young infant / age eligibility (< 2 years)",
    intake: {
      age: 1, // Infant: 1 year old
      isCaregiver: true,
      chiefComplaint: "Fever and restlessness",
      symptoms: ["Fever"],
      duration: "1-2 days",
      severityScore: 5
    },
    expectedUrgency: "UNABLE_TO_ASSESS",
    expectedEmergency: false,
    validate: (res) => res.scenarioCode === "T09" && res.reasoning.includes("under 2 years")
  },
  {
    id: "T10",
    name: "Pregnancy with concerning symptoms",
    intake: {
      age: 30,
      isCaregiver: false,
      isPregnant: true,
      chiefComplaint: "Abdominal cramping and spotting",
      symptoms: ["Abdominal pain"],
      duration: "hours",
      severityScore: 6
    },
    expectedUrgency: "URGENT_TODAY",
    expectedEmergency: false,
    validate: (res) => res.scenarioCode === "T10"
  },
  {
    id: "T11",
    name: "Older frail user with multiple risk factors",
    intake: {
      age: 82,
      isCaregiver: true,
      chiefComplaint: "Increasing weakness and confusion",
      symptoms: ["Fatigue", "Weakness"],
      duration: "1-2 days",
      severityScore: 6
    },
    expectedUrgency: "URGENT_TODAY",
    expectedEmergency: false
  },
  {
    id: "T12",
    name: "User unsure of symptom onset (Unknown preserved)",
    intake: {
      age: 40,
      isCaregiver: false,
      chiefComplaint: "Dull headache",
      symptoms: ["Headache"],
      duration: "unknown",
      severityScore: 3
    },
    expectedUrgency: "ROUTINE_SOON",
    expectedEmergency: false,
    validate: () => true
  },
  {
    id: "T13",
    name: "User lists contradictory answers",
    intake: {
      age: 35,
      isCaregiver: false,
      contradictoryFlags: true,
      chiefComplaint: "No fever but simultaneously reporting 104F",
      symptoms: ["Fever"],
      duration: "1-2 days",
      severityScore: 4
    },
    expectedUrgency: "UNABLE_TO_ASSESS",
    expectedEmergency: false,
    validate: (res) => res.scenarioCode === "T13"
  }
];

export function runTests(): boolean {
  console.log("=================================================================");
  console.log("   AI Symptom Checker - Deterministic Safety Engine Verification");
  console.log("=================================================================\n");

  let passed = 0;
  let failed = 0;

  for (const tc of TEST_CASES) {
    const result = evaluateSafetyTriage(tc.intake);
    const urgencyMatches = result.urgency === tc.expectedUrgency;
    const emergencyMatches = result.isEmergency === tc.expectedEmergency;
    const customValidation = tc.validate ? tc.validate(result) : true;

    if (urgencyMatches && emergencyMatches && customValidation) {
      console.log(`[PASS] [${tc.id}] ${tc.name}`);
      console.log(`       Outcome: ${result.urgency} | isEmergency: ${result.isEmergency}`);
      passed++;
    } else {
      console.error(`[FAIL] [${tc.id}] ${tc.name}`);
      console.error(`       Expected: ${tc.expectedUrgency} (isEmergency: ${tc.expectedEmergency})`);
      console.error(`       Received: ${result.urgency} (isEmergency: ${result.isEmergency})`);
      failed++;
    }
  }

  console.log("\n-----------------------------------------------------------------");
  console.log(`Results: ${passed} passed, ${failed} failed across ${TEST_CASES.length} test scenarios.`);
  console.log("=================================================================");

  if (failed > 0) {
    process.exit(1);
  }
  return true;
}

runTests();
