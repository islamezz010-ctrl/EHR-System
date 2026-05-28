import medicationsJson from "@/data/medications.json";

export type MedicationRecord = (typeof medicationsJson)[number];

export const INITIAL_MEDICATIONS: MedicationRecord[] = medicationsJson;

export function getMedicationsForPatient(
  medications: MedicationRecord[],
  patientId: string,
) {
  return medications.filter((m) => m.patientId === patientId);
}
