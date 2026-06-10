"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ClipboardList,
  Search,
  Activity,
  Calendar,
  ShieldCheck,
  HeartPulse,
  User,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CustomSelect } from "@/components/ui/custom-select";
import type { Patient } from "@/lib/clinical-types";
import type { MedicalRecordEntry } from "@/lib/medical-records";
import { cn } from "@/lib/utils";

type PatientDiagnosesProps = {
  patients: Patient[];
  records: MedicalRecordEntry[];
};

type DiagnosisItem = {
  id: string;
  condition: string;
  icdCode: string;
  dateDiagnosed: string;
  status: "Active" | "Resolved";
  severity: "Chronic" | "Acute" | "Mild";
  provider: string;
  notes: string;
};

export function PatientDiagnoses({ patients, records }: PatientDiagnosesProps) {
  const [selectedPatientId, setSelectedPatientId] = useState(
    patients[0]?.id ?? "",
  );
  const [statusFilter, setStatusFilter] = useState<
    "All" | "Active" | "Resolved"
  >("All");
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

  const patientOptions = useMemo(() => {
    return patients.map((p) => ({
      value: p.id,
      label: p.name,
    }));
  }, [patients]);

  // Build diagnoses list based on patient data & medical records
  const diagnoses = useMemo((): DiagnosisItem[] => {
    if (!selectedPatient) return [];

    const items: DiagnosisItem[] = [];
    const chronic = selectedPatient.medicalProfile.chronicConditions;

    // Add chronic conditions
    chronic.forEach((cond, index) => {
      let icd = "I10"; // Default Essential Hypertension
      let severity: "Chronic" | "Acute" | "Mild" = "Chronic";
      let notes =
        "Ongoing management of chronic condition. Patient on active pharmaceutical therapy.";
      let date = "Jan 12, 2019";

      if (cond.includes("Diabetes")) {
        icd = "E11.9";
        notes =
          "Type 2 Diabetes Mellitus without complications. Monitoring HbA1c and glycemic values.";
        date = "Oct 22, 2021";
      } else if (cond.includes("Asthma")) {
        icd = "J45.909";
        notes = "Mild persistent asthma. Maintenance inhaler prescribed.";
        date = "Mar 05, 2022";
      } else if (cond.includes("Insomnia")) {
        icd = "G47.00";
        notes = "Chronic insomnia disorder. Non-restorative sleep reported.";
        date = "Aug 14, 2023";
      } else if (cond.includes("Anxiety")) {
        icd = "F41.1";
        notes = "Generalized anxiety disorder. Under active follow-up.";
        date = "Nov 19, 2024";
      } else if (cond.includes("Osteoarthritis")) {
        icd = "M19.90";
        notes =
          "Osteoarthritis, unspecified site. Conservative management with OTC pain relievers.";
        date = "Feb 28, 2020";
      } else if (cond.includes("GERD")) {
        icd = "K21.9";
        notes =
          "Gastro-esophageal reflux disease without esophagitis. Lifestyle measures reinforced.";
        date = "Jun 11, 2023";
      }

      items.push({
        id: `diag_ch_${index}_${selectedPatient.id}`,
        condition: cond,
        icdCode: icd,
        dateDiagnosed: date,
        status: "Active",
        severity,
        provider: "Dr. Elena Vasquez",
        notes,
      });
    });

    // Extract acute visit diagnoses from their medical records
    const patientRecords = records.filter(
      (r) => r.patientId === selectedPatientId,
    );
    patientRecords.forEach((record, index) => {
      if (
        record.visitType.includes("Urgent") ||
        record.visitType.includes("Symptom")
      ) {
        let condition = "Acute Pharyngitis";
        let icd = "J02.9";
        let notes =
          "Acute onset throat pain, positive rapid antigen strep screen. Finished full course antibiotics.";
        let status: "Active" | "Resolved" = "Resolved"; // Past acute visits are usually resolved
        let severity: "Chronic" | "Acute" | "Mild" = "Acute";

        if (record.clinicalFindings.includes("Migraine")) {
          condition = "Acute Migraine Headache";
          icd = "G43.909";
          notes =
            "Acute migraine exacerbation. Handled and resolved with clinic Sumatriptan dose.";
        }

        items.push({
          id: `diag_rec_${index}_${selectedPatient.id}`,
          condition,
          icdCode: icd,
          dateDiagnosed: record.date,
          status,
          severity,
          provider: record.clinician,
          notes,
        });
      }
    });

    return items;
  }, [selectedPatient, records, selectedPatientId]);

  const filtered = useMemo(() => {
    let result = diagnoses;

    // Apply Status Filter
    if (statusFilter !== "All") {
      result = result.filter((d) => d.status === statusFilter);
    }

    // Apply Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (d) =>
          d.condition.toLowerCase().includes(q) ||
          d.icdCode.toLowerCase().includes(q) ||
          d.notes.toLowerCase().includes(q),
      );
    }

    return result;
  }, [diagnoses, statusFilter, searchQuery]);

  const activeCount = useMemo(
    () => diagnoses.filter((d) => d.status === "Active").length,
    [diagnoses],
  );
  const resolvedCount = useMemo(
    () => diagnoses.filter((d) => d.status === "Resolved").length,
    [diagnoses],
  );

  if (!selectedPatient) {
    return (
      <div className="p-5 text-center text-muted-foreground">
        No patient selected.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">
            Clinical Diagnoses
          </h2>
          <p className="text-sm text-muted-foreground">
            Active health conditions, resolved diagnoses, and ICD-10 medical
            records
          </p>
        </div>
        <CustomSelect
          options={patientOptions}
          value={selectedPatientId}
          onChange={setSelectedPatientId}
          placeholder="Select patient"
          disabled={patients.length === 0}
          className="max-w-md w-full"
          showSearch
          showAvatars
        />
      </div>

      {/* Stats Section */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-card">
          <div className="flex items-center gap-4">
            <div className="grid size-12 place-items-center rounded-lg bg-red-50 text-red-500 dark:bg-red-950/30">
              <HeartPulse className="size-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Active Conditions</p>
              <h3 className="text-2xl font-bold text-red-600 dark:text-red-400">
                {activeCount}
              </h3>
            </div>
          </div>
        </Card>
        <Card className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-card">
          <div className="flex items-center gap-4">
            <div className="grid size-12 place-items-center rounded-lg bg-emerald-50 text-emerald-500 dark:bg-emerald-950/30">
              <ShieldCheck className="size-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                Resolved Conditions
              </p>
              <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {resolvedCount}
              </h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Diagnoses Panel */}
      <Card className="rounded-xl border-0 py-5 shadow-sm">
        <CardHeader className="gap-4 px-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Filter buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant={statusFilter === "All" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("All")}
                className={
                  statusFilter === "All"
                    ? "bg-primary text-primary-foreground hover:bg-primary/80"
                    : "bg-white dark:bg-gray-800"
                }
              >
                All ({diagnoses.length})
              </Button>
              <Button
                variant={statusFilter === "Active" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("Active")}
                className={
                  statusFilter === "Active"
                    ? "bg-primary text-primary-foreground hover:bg-primary/80"
                    : "bg-white dark:bg-gray-800"
                }
              >
                Active ({activeCount})
              </Button>
              <Button
                variant={statusFilter === "Resolved" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("Resolved")}
                className={
                  statusFilter === "Resolved"
                    ? "bg-primary text-primary-foreground hover:bg-primary/80"
                    : "bg-white dark:bg-gray-800"
                }
              >
                Resolved ({resolvedCount})
              </Button>
            </div>

            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search diagnoses/codes…"
                className="pl-9 bg-white dark:bg-gray-800"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-5">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No matching diagnoses found.
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((diag) => (
                <div
                  key={diag.id}
                  className="rounded-xl border border-slate-100 p-5 dark:border-slate-800 bg-white dark:bg-card shadow-xs flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-md font-bold text-slate-850 dark:text-slate-50">
                        {diag.condition}
                      </h4>
                      <Badge
                        variant="outline"
                        className="font-mono text-xs border-slate-200"
                      >
                        {diag.icdCode}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={cn(
                          "border-0 text-[10px] uppercase font-bold tracking-wider",
                          diag.status === "Active"
                            ? "bg-rose-100 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400"
                            : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400",
                        )}
                      >
                        {diag.status}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={cn(
                          "border-0 text-[10px] uppercase font-bold tracking-wider",
                          diag.severity === "Chronic" &&
                            "bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400",
                          diag.severity === "Acute" &&
                            "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400",
                          diag.severity === "Mild" &&
                            "bg-slate-100 text-slate-700 dark:bg-slate-950/30 dark:text-slate-400",
                        )}
                      >
                        {diag.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {diag.notes}
                    </p>
                  </div>

                  <div className="shrink-0 flex flex-col gap-1.5 text-xs text-muted-foreground sm:text-right border-t border-slate-50 pt-3 sm:border-t-0 sm:pt-0">
                    <div className="flex items-center gap-1.5 sm:justify-end">
                      <Calendar className="size-3.5" />
                      <span>
                        Diagnosed: <strong>{diag.dateDiagnosed}</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:justify-end">
                      <User className="size-3.5" />
                      <span>
                        Physician: <strong>{diag.provider}</strong>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
