export type VisitType =
  | "Urgent"
  | "New Symptom Visit"
  | "Annual Medicare Wellness Visit"
  | "Follow Up Visit"
  | "Chronic Care Visit";

export type MedicalBillStatus = "Overdue" | "Due";

export type MedicalBillRecord = {
  id: string;
  patientId: string;
  amountDue: number;
  totalCharges: number;
  insuranceCoverage: number;
  status: MedicalBillStatus;
  dueDate: string;
  clinician: string;
  visitType: VisitType;
  date: string;
  lineItems: {
    description: string;
    amount: number;
    insurancePays: number;
    patientOwes: number;
  }[];
};

export const INITIAL_MEDICAL_BILLS: MedicalBillRecord[] = [
  {
    id: "mb_1",
    patientId: "p_001",
    amountDue: 42.5,
    totalCharges: 185,
    insuranceCoverage: 142.5,
    status: "Due",
    dueDate: "Jun 15, 2026",
    clinician: "Dr. Elena Vasquez",
    visitType: "Chronic Care Visit",
    date: "May 28, 2026",
    lineItems: [
      {
        description: "Office visit — established patient",
        amount: 120,
        insurancePays: 96,
        patientOwes: 24,
      },
      {
        description: "Blood pressure monitoring",
        amount: 35,
        insurancePays: 28,
        patientOwes: 7,
      },
      {
        description: "EKG interpretation",
        amount: 30,
        insurancePays: 18.5,
        patientOwes: 11.5,
      },
    ],
  },
  {
    id: "mb_2",
    patientId: "p_001",
    amountDue: 0,
    totalCharges: 240,
    insuranceCoverage: 240,
    status: "Due",
    dueDate: "Paid",
    clinician: "Dr. James Patel",
    visitType: "Follow Up Visit",
    date: "Apr 12, 2026",
    lineItems: [
      {
        description: "Diabetes follow-up consultation",
        amount: 150,
        insurancePays: 150,
        patientOwes: 0,
      },
      {
        description: "HbA1c lab panel",
        amount: 90,
        insurancePays: 90,
        patientOwes: 0,
      },
    ],
  },
  {
    id: "mb_3",
    patientId: "p_002",
    amountDue: 55,
    totalCharges: 165,
    insuranceCoverage: 110,
    status: "Overdue",
    dueDate: "May 10, 2026",
    clinician: "Dr. Sarah Kim",
    visitType: "New Symptom Visit",
    date: "May 20, 2026",
    lineItems: [
      {
        description: "New patient evaluation",
        amount: 110,
        insurancePays: 77,
        patientOwes: 33,
      },
      {
        description: "Migraine assessment & plan",
        amount: 55,
        insurancePays: 33,
        patientOwes: 22,
      },
    ],
  },
  {
    id: "mb_4",
    patientId: "p_003",
    amountDue: 80,
    totalCharges: 320,
    insuranceCoverage: 240,
    status: "Due",
    dueDate: "Jun 20, 2026",
    clinician: "Dr. Michael Reed",
    visitType: "Annual Medicare Wellness Visit",
    date: "May 28, 2026",
    lineItems: [
      {
        description: "Annual wellness exam",
        amount: 200,
        insurancePays: 160,
        patientOwes: 40,
      },
      {
        description: "Preventive screening bundle",
        amount: 120,
        insurancePays: 80,
        patientOwes: 40,
      },
    ],
  },
  {
    id: "mb_5",
    patientId: "p_004",
    amountDue: 95,
    totalCharges: 275,
    insuranceCoverage: 180,
    status: "Overdue",
    dueDate: "May 5, 2026",
    clinician: "Dr. Elena Vasquez",
    visitType: "Urgent",
    date: "Apr 28, 2026",
    lineItems: [
      {
        description: "Urgent care visit",
        amount: 175,
        insurancePays: 105,
        patientOwes: 70,
      },
      {
        description: "Rapid strep test",
        amount: 45,
        insurancePays: 36,
        patientOwes: 9,
      },
      {
        description: "Prescription — acute treatment",
        amount: 55,
        insurancePays: 39,
        patientOwes: 16,
      },
    ],
  },
];

export function getMedicalBillsForPatient(
  bills: MedicalBillRecord[],
  patientId: string,
) {
  return bills.filter((b) => b.patientId === patientId);
}
