import medicationsJson from "@/data/medications.json";

export type MedicationRecord = (typeof medicationsJson)[number];
export type NewMedicationInput = Omit<MedicationRecord, "id">;

export const INITIAL_MEDICATIONS: MedicationRecord[] = medicationsJson;

export function getMedicationsForPatient(
  medications: MedicationRecord[],
  patientId: string,
) {
  return medications.filter((m) => m.patientId === patientId);
}

export function createMedicationFromInput(
  input: NewMedicationInput,
  id: string,
): MedicationRecord {
  return {
    id,
    ...input,
  };
}

export function formatMedicationSummary(
  medication: Pick<MedicationRecord, "medicationName" | "dose" | "frequency">,
) {
  return `${medication.medicationName} ${medication.dose} (${medication.frequency})`;
}
