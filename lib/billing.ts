export type BillingStatus = "Paid" | "Pending" | "Overdue";

export type BillingRecord = {
  id: string;
  patientId: string;
  patientName: string;
  service: string;
  amount: number;
  status: BillingStatus;
  date: string;
};

export const INITIAL_BILLINGS: BillingRecord[] = [
  {
    id: "bill_1",
    patientId: "p_001",
    patientName: "Jonathan Wick",
    service: "Hypertension Consultation",
    amount: 185,
    status: "Pending",
    date: "May 28, 2026",
  },
  {
    id: "bill_2",
    patientId: "p_002",
    patientName: "Sarah Connor",
    service: "Diabetes Follow-up & Labs",
    amount: 240,
    status: "Paid",
    date: "May 27, 2026",
  },
  {
    id: "bill_3",
    patientId: "p_003",
    patientName: "Michael Scott",
    service: "Annual Physical",
    amount: 320,
    status: "Pending",
    date: "May 28, 2026",
  },
  {
    id: "bill_4",
    patientId: "p_004",
    patientName: "Emily Chen",
    service: "Migraine Assessment",
    amount: 165,
    status: "Overdue",
    date: "May 20, 2026",
  },
  {
    id: "bill_5",
    patientId: "p_005",
    patientName: "David Miller",
    service: "Post-Op Follow-up",
    amount: 210,
    status: "Paid",
    date: "May 25, 2026",
  },
  {
    id: "bill_6",
    patientId: "p_006",
    patientName: "Olivia Taylor",
    service: "Prenatal Check",
    amount: 275,
    status: "Pending",
    date: "May 28, 2026",
  },
];

export function createBillingFromVisit(
  patientId: string,
  patientName: string,
  service: string,
  dateLabel: string,
): BillingRecord {
  return {
    id: `bill_${patientId}`,
    patientId,
    patientName,
    service,
    amount: 150,
    status: "Pending",
    date: dateLabel,
  };
}
