"use client";

import { useEffect, useMemo, useState } from "react";
import { Pill, Search } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Patient } from "@/lib/clinical-types";
import {
  getMedicationsForPatient,
  type MedicationRecord,
} from "@/lib/medications";

type PatientMedicationsProps = {
  patients: Patient[];
  medications: MedicationRecord[];
};

const selectClassName =
  "flex h-9 w-full max-w-md rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

export function PatientMedications({
  patients,
  medications,
}: PatientMedicationsProps) {
  const [selectedPatientId, setSelectedPatientId] = useState(
    patients[0]?.id ?? "",
  );
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (patients.length === 0) {
      setSelectedPatientId("");
      return;
    }
    if (!patients.some((p) => p.id === selectedPatientId)) {
      setSelectedPatientId(patients[0].id);
    }
  }, [patients, selectedPatientId]);

  const selectedPatient = useMemo(
    () => patients.find((p) => p.id === selectedPatientId) ?? null,
    [patients, selectedPatientId],
  );

  const patientMedications = useMemo(() => {
    if (!selectedPatientId) return [];
    return getMedicationsForPatient(medications, selectedPatientId);
  }, [medications, selectedPatientId]);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return patientMedications;
    const q = searchQuery.toLowerCase();
    return patientMedications.filter(
      (m) =>
        m.medicationName.toLowerCase().includes(q) ||
        m.condition.toLowerCase().includes(q) ||
        m.provider.toLowerCase().includes(q) ||
        m.prescribedBy.toLowerCase().includes(q) ||
        m.renewedBy.toLowerCase().includes(q) ||
        m.dose.toLowerCase().includes(q),
    );
  }, [patientMedications, searchQuery]);

  return (
    <div className="space-y-5">
      <Card className="rounded-xl border-0 py-5 shadow-sm">
        <CardHeader className="gap-4 px-5">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <Pill className="size-5 text-primary" />
              Medications
            </CardTitle>
            <CardDescription className="mt-1">
              Active prescriptions and dosages for the selected patient
            </CardDescription>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-1.5">
              <label
                htmlFor="med-patient"
                className="text-xs font-medium text-muted-foreground"
              >
                Patient
              </label>
              <select
                id="med-patient"
                value={selectedPatientId}
                onChange={(e) => {
                  setSelectedPatientId(e.target.value);
                  setSearchQuery("");
                }}
                className={selectClassName}
                disabled={patients.length === 0}
              >
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search medications…"
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={!selectedPatientId}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-5">
          {selectedPatient ? (
            <p className="mb-4 text-sm text-muted-foreground">
              Showing{" "}
              <span className="font-medium text-foreground">
                {filtered.length}
              </span>{" "}
              of {patientMedications.length} active medication
              {patientMedications.length === 1 ? "" : "s"} for{" "}
              <span className="font-medium text-foreground">
                {selectedPatient.name}
              </span>
            </p>
          ) : null}

          <div className="overflow-x-auto rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead>Medication name</TableHead>
                  <TableHead>Dose</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Refills</TableHead>
                  <TableHead>Condition</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Prescribed by</TableHead>
                  <TableHead>Renewed by</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length > 0 ? (
                  filtered.map((med) => (
                    <TableRow key={med.id}>
                      <TableCell className="font-medium whitespace-nowrap">
                        {med.medicationName}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {med.dose}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {med.frequency}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {med.quantity}
                      </TableCell>
                      <TableCell>{med.refills}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        {med.condition}
                      </TableCell>
                      <TableCell className="min-w-[140px]">
                        {med.provider}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {med.prescribedBy}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {med.renewedBy}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="py-12 text-center text-muted-foreground"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Pill className="size-8 opacity-40" />
                        <p>
                          {selectedPatient
                            ? "No medications match your search."
                            : "No patients available."}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
