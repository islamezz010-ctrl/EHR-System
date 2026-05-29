export type MedicalRecordEntry = {
  id: string;
  patientId: string;
  date: string;
  visitType: string;
  clinician: string;
  clinicalFindings: string;
  diagnosticTests: string[];
  labResults: { test: string; result: string; flag?: "normal" | "abnormal" }[];
  progressNotes: string;
  medications: string[];
};

export const INITIAL_MEDICAL_RECORDS: MedicalRecordEntry[] = [
  {
    id: "mr_1",
    patientId: "p_001",
    date: "May 28, 2026",
    visitType: "Chronic Care Visit",
    clinician: "Dr. Elena Vasquez",
    clinicalFindings:
      "Blood pressure 138/88 mmHg, improved from prior visit. Patient reports good medication adherence. No chest pain, dyspnea, or edema. Weight stable.",
    diagnosticTests: ["12-lead EKG", "In-office blood pressure series"],
    labResults: [
      { test: "Potassium", result: "4.1 mEq/L", flag: "normal" },
      { test: "Creatinine", result: "1.0 mg/dL", flag: "normal" },
    ],
    progressNotes:
      "Hypertension adequately controlled on current regimen. Continue lisinopril 10 mg daily. Reinforce low-sodium diet and home BP monitoring twice weekly.",
    medications: ["Lisinopril 10 mg daily", "Aspirin 81 mg daily"],
  },
  {
    id: "mr_2",
    patientId: "p_001",
    date: "Apr 12, 2026",
    visitType: "Follow Up Visit",
    clinician: "Dr. James Patel",
    clinicalFindings:
      "HbA1c trending down. Fasting glucose 118 mg/dL. No hypoglycemic episodes. Foot exam without ulcers.",
    diagnosticTests: ["HbA1c", "Comprehensive metabolic panel"],
    labResults: [
      { test: "HbA1c", result: "7.2%", flag: "abnormal" },
      { test: "Fasting glucose", result: "118 mg/dL", flag: "abnormal" },
      { test: "eGFR", result: ">60 mL/min", flag: "normal" },
    ],
    progressNotes:
      "Type 2 diabetes — modest improvement. Continue metformin; discuss lifestyle goals at next visit.",
    medications: ["Metformin 500 mg BID", "Lisinopril 10 mg daily"],
  },
  {
    id: "mr_3",
    patientId: "p_002",
    date: "May 20, 2026",
    visitType: "New Symptom Visit",
    clinician: "Dr. Sarah Kim",
    clinicalFindings:
      "Recurrent throbbing headache, photophobia, nausea without vomiting. Neurologic exam non-focal. No fever.",
    diagnosticTests: ["Migraine severity scale", "Visual field screening"],
    labResults: [
      { test: "CBC", result: "Within normal limits", flag: "normal" },
    ],
    progressNotes:
      "Migraine without aura — acute episode managed in clinic. Triptan PRN prescribed; headache diary recommended.",
    medications: ["Sumatriptan 50 mg PRN", "Ibuprofen 400 mg PRN"],
  },
  {
    id: "mr_4",
    patientId: "p_003",
    date: "May 28, 2026",
    visitType: "Annual Medicare Wellness Visit",
    clinician: "Dr. Michael Reed",
    clinicalFindings:
      "General health good. BMI 26.1. Depression screen negative. Fall risk low. Immunizations reviewed and updated.",
    diagnosticTests: [
      "Depression screening (PHQ-2)",
      "Cognitive assessment",
      "Vision/hearing screening",
    ],
    labResults: [
      { test: "Lipid panel", result: "LDL 102 mg/dL", flag: "normal" },
      { test: "Vitamin D", result: "32 ng/mL", flag: "normal" },
    ],
    progressNotes:
      "Annual wellness visit completed. Colonoscopy due next year; mammography on schedule.",
    medications: ["Atorvastatin 20 mg nightly", "Vitamin D3 1000 IU daily"],
  },
  {
    id: "mr_5",
    patientId: "p_004",
    date: "Apr 28, 2026",
    visitType: "Urgent",
    clinician: "Dr. Elena Vasquez",
    clinicalFindings:
      "Acute sore throat, fever 101.2°F. Tonsillar exudate present. Cervical lymphadenopathy mild.",
    diagnosticTests: ["Rapid strep antigen test", "Throat culture (sent)"],
    labResults: [
      { test: "Rapid strep", result: "Positive", flag: "abnormal" },
    ],
    progressNotes:
      "Streptococcal pharyngitis confirmed. Amoxicillin course started; return if no improvement in 48 hours.",
    medications: ["Amoxicillin 500 mg TID × 10 days"],
  },
];

export function getMedicalRecordsForPatient(
  records: MedicalRecordEntry[],
  patientId: string,
) {
  return records.filter((r) => r.patientId === patientId);
}
