import type { Appointment, Patient } from "@/lib/clinical-types";
import { getAgeFromDob } from "@/lib/clinical-types";
import type { MedicalBillRecord } from "@/lib/medical-bills";
import type { MedicalRecordEntry } from "@/lib/medical-records";
import type { MedicationRecord } from "@/lib/medications";

export type ProfileAppointmentRow = {
  id: string;
  visitType: string;
  date: string;
  provider: string;
  status: string;
};

export type ProfileLabRow = {
  id: string;
  date: string;
  name: string;
  result: string;
};

export type ProfileBillRow = {
  id: string;
  date: string;
  amount: string;
  status: "Paid" | "Due" | "Overdue";
};

export type ProfileMedicationRow = {
  id: string;
  medicationName: string;
  dose: string;
  frequency: string;
  condition: string;
};

export function formatProfileDate(isoOrLabel: string) {
  const parsed = new Date(isoOrLabel);
  if (!Number.isNaN(parsed.getTime()) && isoOrLabel.includes("-")) {
    return parsed.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  }
  return isoOrLabel;
}

export function getPatientProfileMeta(patient: Patient, index: number) {
  const chartNum = patient.id.replace(/\D/g, "").padStart(6, "0");
  return {
    chartId: `CH-${chartNum}`,
    legacyId: `LEG-${10000 + index}`,
    patientSince: "Jan 2019",
    preferredProvider: "Dr. Elena Vasquez",
    maritalStatus: index % 3 === 0 ? "Married" : index % 3 === 1 ? "Single" : "Divorced",
    workFor: index % 2 === 0 ? "Self-employed" : "Regional Health Corp.",
    address: `${120 + index} Oak Street, Suite ${index + 1}, Springfield, IL`,
    medicalInsurance: index % 4 === 0 ? "None" : "Active",
    visionInsurance: index % 2 === 0 ? "Yes" : "None",
    dentalInsurance: "Yes",
  };
}

export function buildProfileAppointments(
  patient: Patient,
  appointments: Appointment[],
  medicalBills: MedicalBillRecord[],
): ProfileAppointmentRow[] {
  const patientAppointments = appointments.filter(
    (a) => a.patient === patient.name,
  );
  const patientBills = medicalBills.filter((b) => b.patientId === patient.id);

  return patientAppointments.map((apt, i) => {
    const bill = patientBills[i];
    return {
      id: apt.id,
      visitType: bill?.visitType ?? apt.reason,
      date: apt.time,
      provider: bill?.clinician ?? "Dr. Elena Vasquez",
      status: apt.status,
    };
  });
}

export function buildProfileLabRows(
  records: MedicalRecordEntry[],
): ProfileLabRow[] {
  const rows: ProfileLabRow[] = [];
  for (const record of records) {
    for (const lab of record.labResults) {
      rows.push({
        id: `${record.id}_${lab.test}`,
        date: record.date,
        name: lab.test,
        result: lab.result.replace(/[^\d.]/g, "") || lab.result,
      });
    }
  }
  return rows.slice(0, 6);
}

export function buildProfileBillRows(
  bills: MedicalBillRecord[],
): ProfileBillRow[] {
  return bills.map((bill) => ({
    id: bill.id,
    date: bill.date,
    amount: new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(bill.amountDue > 0 ? bill.amountDue : bill.totalCharges),
    status:
      bill.amountDue <= 0
        ? "Paid"
        : bill.status === "Overdue"
          ? "Overdue"
          : "Due",
  }));
}

export function buildProfileMedicationRows(
  medications: MedicationRecord[],
): ProfileMedicationRow[] {
  return medications.map((m) => ({
    id: m.id,
    medicationName: m.medicationName,
    dose: m.dose,
    frequency: m.frequency,
    condition: m.condition,
  }));
}

export function getProfileSummary(patient: Patient) {
  const age = getAgeFromDob(patient.medicalProfile.dateOfBirth);
  return {
    age,
    birthDate: formatProfileDate(patient.medicalProfile.dateOfBirth),
  };
}

export type PatientInsuranceInfo = {
  primaryInsurance: string;
  primaryCopay: string;
  secondaryInsurance: string;
  secondaryCopay: string;
  nextAppointmentDate: string;
  nextAppointmentCopay: string;
  pharmacyName: string;
  pharmacyAddress: string;
};

export type PatientHealthMetrics = {
  height: string;
  weight: string;
  bmi: string;
  systolic: string;
  diastolic: string;
  smokingStatus: string;
};

const PHARMACIES = [
  { name: "OptumRx", address: "2545 Main Street Irvine, CA 93715" },
  { name: "CVS Pharmacy", address: "890 Harbor Blvd, Costa Mesa, CA 92626" },
  { name: "Walgreens", address: "1200 Pacific Coast Hwy, Huntington Beach, CA 92648" },
  { name: "Rite Aid", address: "455 E Chapman Ave, Orange, CA 92866" },
];

const PRIMARY_INSURERS = [
  "Nationwide Ins Group",
  "BlueCross BlueShield",
  "Aetna Health",
  "UnitedHealthcare",
  "Cigna Medical",
];

const SECONDARY_INSURERS = [
  "Progressive Ins Group",
  "Humana Supplement",
  "MetLife Dental Plus",
  "Guardian Vision",
  "Anthem Secondary",
];

export function parseBloodPressure(bp: string) {
  const match = bp.match(/(\d+)\s*\/\s*(\d+)/);
  if (!match) {
    return { systolic: "120", diastolic: "80" };
  }
  return { systolic: match[1], diastolic: match[2] };
}

export function getPatientInsuranceInfo(
  patient: Patient,
  index: number,
  appointments: Appointment[],
): PatientInsuranceInfo {
  const scheduled = appointments
    .filter(
      (apt) =>
        apt.patient === patient.name &&
        (apt.status === "Scheduled" || apt.status === "Waiting"),
    )
    .sort(
      (a, b) =>
        new Date(a.appointmentDateIso).getTime() -
        new Date(b.appointmentDateIso).getTime(),
    );

  const nextApt = scheduled[0];
  const pharmacy = PHARMACIES[index % PHARMACIES.length];

  return {
    primaryInsurance: PRIMARY_INSURERS[index % PRIMARY_INSURERS.length],
    primaryCopay: index % 4 === 0 ? "$30" : "$20",
    secondaryInsurance: SECONDARY_INSURERS[index % SECONDARY_INSURERS.length],
    secondaryCopay: index % 3 === 0 ? "$15" : "$25",
    nextAppointmentDate: nextApt
      ? formatProfileDate(nextApt.appointmentDateIso.slice(0, 10))
      : formatProfileDate("2026-05-29"),
    nextAppointmentCopay: nextApt ? "N/A" : "N/A",
    pharmacyName: pharmacy.name,
    pharmacyAddress: pharmacy.address,
  };
}

export function getPatientHealthMetrics(
  patient: Patient,
  index: number,
): PatientHealthMetrics {
  const heights = [`5'0"`, `5'4"`, `5'7"`, `5'9"`, `5'11"`, `6'1"`];
  const weights = [130, 145, 162, 175, 188, 210];
  const height = heights[index % heights.length];
  const weight = weights[index % weights.length];
  const heightMatch = height.match(/(\d+)'(\d+)/);
  const heightInches = heightMatch
    ? parseInt(heightMatch[1], 10) * 12 + parseInt(heightMatch[2], 10)
    : 60;
  const bmi = (703 * weight) / (heightInches * heightInches);
  const { systolic, diastolic } = parseBloodPressure(
    patient.medicalProfile.vitals.bloodPressure,
  );

  return {
    height,
    weight: `${weight} lbs`,
    bmi: bmi.toFixed(2),
    systolic: `${systolic} mmHg`,
    diastolic: `${diastolic} mmHg`,
    smokingStatus: index % 5 === 0 ? "Former" : "None",
  };
}
