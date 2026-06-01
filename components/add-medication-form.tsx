"use client";

import { useMemo, useState } from "react";
import { ClipboardPlus, Pill } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Patient } from "@/lib/clinical-types";
import type { NewMedicationInput } from "@/lib/medications";

type FormState = {
  patientId: string;
  medicationName: string;
  dose: string;
  frequency: string;
  quantity: string;
  refills: string;
  condition: string;
  provider: string;
  prescribedBy: string;
  renewedBy: string;
};

type AddMedicationFormProps = {
  patients: Patient[];
  onAdd: (input: NewMedicationInput) => void;
};

const selectClassName =
  "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

function createEmptyForm(patientId = ""): FormState {
  return {
    patientId,
    medicationName: "",
    dose: "",
    frequency: "",
    quantity: "",
    refills: "0",
    condition: "",
    provider: "",
    prescribedBy: "",
    renewedBy: "",
  };
}

function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-medium text-foreground">
      {children}
    </label>
  );
}

function validateForm(form: FormState, patientId: string): string | null {
  if (!patientId) return "Select a patient.";
  if (!form.medicationName.trim()) return "Medication name is required.";
  if (!form.dose.trim()) return "Dose is required.";
  if (!form.frequency.trim()) return "Frequency is required.";
  if (!form.quantity.trim()) return "Quantity is required.";

  const refills = Number(form.refills);
  if (
    !form.refills.trim() ||
    !Number.isInteger(refills) ||
    refills < 0 ||
    refills > 24
  ) {
    return "Enter refills as a whole number from 0 to 24.";
  }

  if (!form.condition.trim()) return "Condition is required.";
  if (!form.provider.trim()) return "Provider is required.";
  if (!form.prescribedBy.trim()) return "Prescribed by is required.";

  return null;
}

export function AddMedicationForm({
  patients,
  onAdd,
}: AddMedicationFormProps) {
  const firstPatientId = patients[0]?.id ?? "";
  const [form, setForm] = useState<FormState>(() =>
    createEmptyForm(firstPatientId),
  );
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const selectedPatientId = patients.some(
    (patient) => patient.id === form.patientId,
  )
    ? form.patientId
    : firstPatientId;

  const selectedPatient = useMemo(
    () => patients.find((patient) => patient.id === selectedPatientId) ?? null,
    [patients, selectedPatientId],
  );

  const update = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setError(null);
    setNotice(null);
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAdd = () => {
    const validationError = validateForm(form, selectedPatientId);
    if (validationError) {
      setError(validationError);
      return;
    }

    const patientName = selectedPatient?.name ?? "patient";

    onAdd({
      patientId: selectedPatientId,
      medicationName: form.medicationName.trim(),
      dose: form.dose.trim(),
      frequency: form.frequency.trim(),
      quantity: form.quantity.trim(),
      refills: Number(form.refills),
      condition: form.condition.trim(),
      provider: form.provider.trim(),
      prescribedBy: form.prescribedBy.trim(),
      renewedBy: form.renewedBy.trim() || "—",
    });

    setNotice(`${form.medicationName.trim()} was added for ${patientName}.`);
    setForm(createEmptyForm(selectedPatientId));
    setError(null);
  };

  return (
    <Card className="rounded-xl border-0 py-5 shadow-sm">
      <CardHeader className="px-5">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <ClipboardPlus className="size-5 text-primary" />
          Add Medication
        </CardTitle>
        <CardDescription>
          Record a prescription for a patient and add it to their active
          medication list.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-5">
        <div className="space-y-8">
          <section className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Patient &amp; medication
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <FieldLabel htmlFor="medication-patient">Patient</FieldLabel>
                <select
                  id="medication-patient"
                  value={selectedPatientId}
                  onChange={(e) => update("patientId", e.target.value)}
                  className={selectClassName}
                  disabled={patients.length === 0}
                >
                  {patients.length === 0 ? (
                    <option value="">No patients available</option>
                  ) : null}
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <FieldLabel htmlFor="medication-name">Medication name</FieldLabel>
                <Input
                  id="medication-name"
                  placeholder="e.g. Lisinopril"
                  value={form.medicationName}
                  onChange={(e) => update("medicationName", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <FieldLabel htmlFor="condition">Condition</FieldLabel>
                <Input
                  id="condition"
                  placeholder="e.g. Hypertension"
                  value={form.condition}
                  onChange={(e) => update("condition", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <FieldLabel htmlFor="dose">Dose</FieldLabel>
                <Input
                  id="dose"
                  placeholder="e.g. 20 mg"
                  value={form.dose}
                  onChange={(e) => update("dose", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <FieldLabel htmlFor="frequency">Frequency</FieldLabel>
                <Input
                  id="frequency"
                  placeholder="e.g. Once daily"
                  value={form.frequency}
                  onChange={(e) => update("frequency", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <FieldLabel htmlFor="quantity">Quantity</FieldLabel>
                <Input
                  id="quantity"
                  placeholder="e.g. 30 tablets"
                  value={form.quantity}
                  onChange={(e) => update("quantity", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <FieldLabel htmlFor="refills">Refills</FieldLabel>
                <Input
                  id="refills"
                  type="number"
                  min={0}
                  max={24}
                  step={1}
                  value={form.refills}
                  onChange={(e) => update("refills", e.target.value)}
                />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Provider details
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <FieldLabel htmlFor="provider">Provider / department</FieldLabel>
                <Input
                  id="provider"
                  placeholder="e.g. Medi EHR Primary Care"
                  value={form.provider}
                  onChange={(e) => update("provider", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <FieldLabel htmlFor="prescribed-by">Prescribed by</FieldLabel>
                <Input
                  id="prescribed-by"
                  placeholder="e.g. Dr. Elaine Marsh"
                  value={form.prescribedBy}
                  onChange={(e) => update("prescribedBy", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <FieldLabel htmlFor="renewed-by">Renewed by</FieldLabel>
                <Input
                  id="renewed-by"
                  placeholder="Optional"
                  value={form.renewedBy}
                  onChange={(e) => update("renewedBy", e.target.value)}
                />
              </div>
            </div>
          </section>

          {error ? (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}

          {notice ? (
            <p className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-400">
              {notice}
            </p>
          ) : null}

          <div className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Pill className="size-4 shrink-0" />
              Medication entries are added to the selected patient immediately.
            </p>
            <Button
              type="button"
              onClick={handleAdd}
              className="sm:min-w-40"
              disabled={patients.length === 0}
            >
              <ClipboardPlus className="size-4" />
              Add Medication
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
