export type PatientBillCategory = "Medication" | "Consultation" | "Lab";

export type PatientBillStatus = "Paid" | "Pending" | "Overdue";

export type PatientBillItem = {
  id: string;
  patientId: string;
  category: PatientBillCategory;
  description: string;
  provider: string;
  date: string;
  amount: number;
  insuranceCoverage: number;
  patientOwes: number;
  status: PatientBillStatus;
  dueDate: string;
};

/** Alias used by dashboard state. */
export type PatientBill = PatientBillItem;

/** Demo patient account used for the Patient / Visitor role. */
export const DEMO_PATIENT_ID = "p_001";

export const INITIAL_PATIENT_BILLS: PatientBillItem[] = [
  {
    id: "pb_med_1",
    patientId: DEMO_PATIENT_ID,
    category: "Medication",
    description: "Lisinopril 20 mg — 30-day refill",
    provider: "Medi EHR Pharmacy",
    date: "May 22, 2026",
    amount: 48,
    insuranceCoverage: 38,
    patientOwes: 10,
    status: "Pending",
    dueDate: "Jun 10, 2026",
  },
  {
    id: "pb_med_2",
    patientId: DEMO_PATIENT_ID,
    category: "Medication",
    description: "Amlodipine 5 mg — 30-day refill",
    provider: "Medi EHR Pharmacy",
    date: "May 22, 2026",
    amount: 42,
    insuranceCoverage: 34,
    patientOwes: 8,
    status: "Pending",
    dueDate: "Jun 10, 2026",
  },
  {
    id: "pb_med_3",
    patientId: DEMO_PATIENT_ID,
    category: "Medication",
    description: "Zolpidem 10 mg — 15 tablets (new prescription)",
    provider: "Medi EHR Sleep Clinic Pharmacy",
    date: "May 15, 2026",
    amount: 65,
    insuranceCoverage: 45,
    patientOwes: 20,
    status: "Overdue",
    dueDate: "May 25, 2026",
  },
  {
    id: "pb_con_1",
    patientId: DEMO_PATIENT_ID,
    category: "Consultation",
    description: "Hypertension follow-up — office visit",
    provider: "Dr. Elena Vasquez",
    date: "May 28, 2026",
    amount: 185,
    insuranceCoverage: 142.5,
    patientOwes: 42.5,
    status: "Pending",
    dueDate: "Jun 15, 2026",
  },
  {
    id: "pb_con_2",
    patientId: DEMO_PATIENT_ID,
    category: "Consultation",
    description: "Chronic care management — telehealth",
    provider: "Dr. James Patel",
    date: "Apr 12, 2026",
    amount: 95,
    insuranceCoverage: 95,
    patientOwes: 0,
    status: "Paid",
    dueDate: "Paid",
  },
  {
    id: "pb_con_3",
    patientId: DEMO_PATIENT_ID,
    category: "Consultation",
    description: "Annual wellness appointment",
    provider: "Dr. Michael Reed",
    date: "Mar 8, 2026",
    amount: 200,
    insuranceCoverage: 160,
    patientOwes: 40,
    status: "Overdue",
    dueDate: "Apr 1, 2026",
  },
  {
    id: "pb_lab_1",
    patientId: DEMO_PATIENT_ID,
    category: "Lab",
    description: "HbA1c — diabetes monitoring panel",
    provider: "Medi EHR Diagnostics Lab",
    date: "May 28, 2026",
    amount: 90,
    insuranceCoverage: 72,
    patientOwes: 18,
    status: "Pending",
    dueDate: "Jun 15, 2026",
  },
  {
    id: "pb_lab_2",
    patientId: DEMO_PATIENT_ID,
    category: "Lab",
    description: "Comprehensive metabolic panel (CMP)",
    provider: "Medi EHR Diagnostics Lab",
    date: "May 28, 2026",
    amount: 75,
    insuranceCoverage: 60,
    patientOwes: 15,
    status: "Pending",
    dueDate: "Jun 15, 2026",
  },
  {
    id: "pb_lab_3",
    patientId: DEMO_PATIENT_ID,
    category: "Lab",
    description: "Lipid panel — cholesterol screening",
    provider: "Medi EHR Diagnostics Lab",
    date: "Apr 12, 2026",
    amount: 68,
    insuranceCoverage: 68,
    patientOwes: 0,
    status: "Paid",
    dueDate: "Paid",
  },
];

export function getPatientBillsForAccount(
  bills: PatientBillItem[],
  patientId: string = DEMO_PATIENT_ID,
) {
  return bills.filter((bill) => bill.patientId === patientId);
}

export function getOutstandingBills(bills: PatientBillItem[]) {
  return bills.filter((bill) => bill.patientOwes > 0 && bill.status !== "Paid");
}

export function summarizePatientBills(bills: PatientBillItem[]) {
  const outstanding = getOutstandingBills(bills);
  const totalDue = outstanding.reduce((sum, bill) => sum + bill.patientOwes, 0);
  const totalCharges = bills.reduce((sum, bill) => sum + bill.amount, 0);
  const insuranceTotal = bills.reduce(
    (sum, bill) => sum + bill.insuranceCoverage,
    0,
  );

  const byCategory = (category: PatientBillCategory) => {
    const categoryBills = bills.filter((bill) => bill.category === category);
    const categoryDue = getOutstandingBills(categoryBills).reduce(
      (sum, bill) => sum + bill.patientOwes,
      0,
    );
    return { count: categoryBills.length, due: categoryDue };
  };

  return {
    totalDue,
    totalCharges,
    insuranceTotal,
    openCount: outstanding.length,
    medication: byCategory("Medication"),
    consultation: byCategory("Consultation"),
    lab: byCategory("Lab"),
  };
}

export function markBillsPaid(
  bills: PatientBillItem[],
  billIds: string[],
): PatientBillItem[] {
  const idSet = new Set(billIds);
  return bills.map((bill) =>
    idSet.has(bill.id)
      ? {
          ...bill,
          status: "Paid" as const,
          patientOwes: 0,
          dueDate: "Paid",
        }
      : bill,
  );
}
