"use client";

import { useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Activity,
  ClipboardList,
  Eye,
  FileText,
  FlaskConical,
  Pill,
  Search,
  Stethoscope,
} from "lucide-react";

import { DataTable } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { Patient } from "@/lib/clinical-types";
import {
  getMedicalRecordsForPatient,
  type MedicalRecordEntry,
} from "@/lib/medical-records";
import { cn } from "@/lib/utils";

type PatientMedicalRecordsProps = {
  patients: Patient[];
  records: MedicalRecordEntry[];
};

const selectClassName =
  "flex h-9 w-full max-w-md rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

export function PatientMedicalRecords({
  patients,
  records,
}: PatientMedicalRecordsProps) {
  const [selectedPatientId, setSelectedPatientId] = useState(
    patients[0]?.id ?? "",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRecord, setSelectedRecord] =
    useState<MedicalRecordEntry | null>(null);

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

  const patientRecords = useMemo(() => {
    if (!selectedPatientId) return [];
    return getMedicalRecordsForPatient(records, selectedPatientId);
  }, [records, selectedPatientId]);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return patientRecords;
    const q = searchQuery.toLowerCase();
    return patientRecords.filter(
      (r) =>
        r.visitType.toLowerCase().includes(q) ||
        r.clinician.toLowerCase().includes(q) ||
        r.clinicalFindings.toLowerCase().includes(q) ||
        r.date.toLowerCase().includes(q),
    );
  }, [patientRecords, searchQuery]);

  const columns = useMemo<ColumnDef<MedicalRecordEntry>[]>(
    () => [
      {
        accessorKey: "date",
        header: "Date",
        cell: ({ row }) => (
          <span className="font-medium">{row.original.date}</span>
        ),
      },
      {
        accessorKey: "visitType",
        header: "Visit type",
        cell: ({ row }) => (
          <span className="text-muted-foreground">{row.original.visitType}</span>
        ),
      },
      { accessorKey: "clinician", header: "Clinician" },
      {
        accessorKey: "clinicalFindings",
        header: "Summary",
        cell: ({ row }) => (
          <span className="max-w-xs truncate text-muted-foreground">
            {row.original.clinicalFindings}
          </span>
        ),
      },
      {
        id: "actions",
        header: "Action",
        cell: ({ row }) => (
          <div className="text-right">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedRecord(row.original)}
            >
              <Eye className="size-4" />
              View
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-5">
      <Card className="rounded-xl border-0 py-5 shadow-sm">
        <CardHeader className="gap-4 px-5">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <FileText className="size-5 text-primary" />
              Medical Records
            </CardTitle>
            <CardDescription className="mt-1">
              Review clinical findings, test results, progress notes, and
              medications from your visits and well-care appointments
            </CardDescription>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-1.5">
              <label
                htmlFor="record-patient"
                className="text-xs font-medium text-muted-foreground"
              >
                Patient
              </label>
              <select
                id="record-patient"
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
                placeholder="Search records…"
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
              <span className="font-medium text-foreground">
                {filtered.length}
              </span>{" "}
              record{filtered.length === 1 ? "" : "s"} for{" "}
              <span className="font-medium text-foreground">
                {selectedPatient.name}
              </span>
            </p>
          ) : null}

          <DataTable
            columns={columns}
            data={filtered}
            searchValue={searchQuery}
            emptyMessage={
              selectedPatient
                ? "No medical records match your search."
                : "No patients available."
            }
          />
        </CardContent>
      </Card>

      <Dialog
        open={!!selectedRecord}
        onOpenChange={(open) => !open && setSelectedRecord(null)}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          {selectedRecord ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Stethoscope className="size-5 text-primary" />
                  {selectedRecord.visitType}
                </DialogTitle>
                <DialogDescription>
                  {selectedRecord.date} · {selectedRecord.clinician}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <section className="rounded-lg border border-border p-4">
                  <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                    <Activity className="size-4 text-primary" />
                    Clinical findings
                  </h4>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {selectedRecord.clinicalFindings}
                  </p>
                </section>

                <section className="rounded-lg border border-border p-4">
                  <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                    <FlaskConical className="size-4 text-sky-500" />
                    Diagnostic tests
                  </h4>
                  <ul className="space-y-1">
                    {selectedRecord.diagnosticTests.map((test) => (
                      <li
                        key={test}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-sky-500" />
                        {test}
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="rounded-lg border border-border p-4">
                  <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                    <FlaskConical className="size-4 text-violet-500" />
                    Lab results
                  </h4>
                  <div className="space-y-2">
                    {selectedRecord.labResults.map((lab) => (
                      <div
                        key={lab.test}
                        className="flex items-center justify-between gap-4 text-sm"
                      >
                        <span className="font-medium">{lab.test}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">
                            {lab.result}
                          </span>
                          {lab.flag ? (
                            <Badge
                              variant="outline"
                              className={cn(
                                "border-0 text-xs",
                                lab.flag === "normal" &&
                                  "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400",
                                lab.flag === "abnormal" &&
                                  "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
                              )}
                            >
                              {lab.flag}
                            </Badge>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="rounded-lg border border-border bg-muted/30 p-4">
                  <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                    <ClipboardList className="size-4 text-muted-foreground" />
                    Progress notes
                  </h4>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {selectedRecord.progressNotes}
                  </p>
                </section>

                <section className="rounded-lg border border-border p-4">
                  <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                    <Pill className="size-4 text-primary" />
                    Medications
                  </h4>
                  <ul className="space-y-1.5">
                    {selectedRecord.medications.map((med) => (
                      <li
                        key={med}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                        {med}
                      </li>
                    ))}
                  </ul>
                </section>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
