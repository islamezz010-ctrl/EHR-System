"use client";

import { useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { FlaskConical, Search, Eye, AlertTriangle } from "lucide-react";

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
import type { MedicalRecordEntry } from "@/lib/medical-records";
import { cn } from "@/lib/utils";

type PatientLabReportsProps = {
  patients: Patient[];
  records: MedicalRecordEntry[];
};

type LabReportRow = {
  id: string;
  date: string;
  clinician: string;
  visitType: string;
  test: string;
  result: string;
  flag?: "normal" | "abnormal";
  refRange: string;
};

const selectClassName =
  "flex h-9 w-full max-w-md rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

export function PatientLabReports({ patients, records }: PatientLabReportsProps) {
  const [selectedPatientId, setSelectedPatientId] = useState(
    patients[0]?.id ?? "",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReport, setSelectedReport] = useState<LabReportRow | null>(
    null,
  );

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

  // Extract reference ranges for standard tests
  const getReferenceRange = (testName: string): string => {
    const name = testName.toLowerCase();
    if (name.includes("hba1c")) return "< 5.7%";
    if (name.includes("glucose")) return "70 - 99 mg/dL";
    if (name.includes("potassium")) return "3.5 - 5.0 mEq/L";
    if (name.includes("creatinine")) return "0.6 - 1.2 mg/dL";
    if (name.includes("lipid") || name.includes("ldl")) return "< 100 mg/dL";
    if (name.includes("vit") || name.includes("vitamin d")) return "30 - 100 ng/mL";
    return "Normal / WNL";
  };

  const labReports = useMemo(() => {
    if (!selectedPatientId) return [];
    
    const reports: LabReportRow[] = [];
    const patientRecords = records.filter((r) => r.patientId === selectedPatientId);
    
    for (const record of patientRecords) {
      if (record.labResults && record.labResults.length > 0) {
        for (const lab of record.labResults) {
          reports.push({
            id: `${record.id}_${lab.test}`,
            date: record.date,
            clinician: record.clinician,
            visitType: record.visitType,
            test: lab.test,
            result: lab.result,
            flag: lab.flag,
            refRange: getReferenceRange(lab.test),
          });
        }
      }
    }
    return reports;
  }, [records, selectedPatientId]);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return labReports;
    const q = searchQuery.toLowerCase();
    return labReports.filter(
      (r) =>
        r.test.toLowerCase().includes(q) ||
        r.result.toLowerCase().includes(q) ||
        r.clinician.toLowerCase().includes(q) ||
        r.date.toLowerCase().includes(q),
    );
  }, [labReports, searchQuery]);

  const abnormalCount = useMemo(
    () => labReports.filter((r) => r.flag === "abnormal").length,
    [labReports],
  );

  const columns = useMemo<ColumnDef<LabReportRow>[]>(
    () => [
      {
        accessorKey: "date",
        header: "Date",
        cell: ({ row }) => <span className="font-medium">{row.original.date}</span>,
      },
      {
        accessorKey: "test",
        header: "Test Name",
        cell: ({ row }) => <span className="font-semibold">{row.original.test}</span>,
      },
      {
        accessorKey: "result",
        header: "Result",
        cell: ({ row }) => (
          <span className={cn(row.original.flag === "abnormal" && "font-bold text-amber-600 dark:text-amber-400")}>
            {row.original.result}
          </span>
        ),
      },
      {
        accessorKey: "refRange",
        header: "Reference Range",
      },
      {
        accessorKey: "flag",
        header: "Status",
        cell: ({ row }) => (
          <Badge
            variant="outline"
            className={cn(
              "border-0 text-xs font-semibold uppercase tracking-wider",
              row.original.flag === "normal" &&
                "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400",
              row.original.flag === "abnormal" &&
                "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-450",
            )}
          >
            {row.original.flag ?? "Normal"}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: () => <span className="block text-right">Action</span>,
        cell: ({ row }) => (
          <div className="text-right">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedReport(row.original)}
              className="bg-white dark:bg-gray-800"
            >
              <Eye className="size-4" />
              View Detail
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-card">
          <div className="flex items-center gap-4">
            <div className="grid size-12 place-items-center rounded-lg bg-teal-50 text-teal-500 dark:bg-teal-950/30">
              <FlaskConical className="size-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Lab Tests</p>
              <h3 className="text-2xl font-bold">{labReports.length}</h3>
            </div>
          </div>
        </Card>
        <Card className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-card">
          <div className="flex items-center gap-4">
            <div className={cn(
              "grid size-12 place-items-center rounded-lg",
              abnormalCount > 0 
                ? "bg-amber-50 text-amber-500 dark:bg-amber-950/30" 
                : "bg-emerald-50 text-emerald-500 dark:bg-emerald-950/30"
            )}>
              <AlertTriangle className="size-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Abnormal Flags</p>
              <h3 className="text-2xl font-bold text-amber-600 dark:text-amber-400">{abnormalCount}</h3>
            </div>
          </div>
        </Card>
      </div>

      <Card className="rounded-xl border-0 py-5 shadow-sm">
        <CardHeader className="gap-4 px-5">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <FlaskConical className="size-5 text-teal-500" />
              Laboratory Test Reports
            </CardTitle>
            <CardDescription className="mt-1">
              Access diagnostic lab evaluations, blood counts, panels, and metabolic screens
            </CardDescription>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-1.5">
              <label
                htmlFor="lab-patient"
                className="text-xs font-medium text-muted-foreground"
              >
                Patient
              </label>
              <select
                id="lab-patient"
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
                placeholder="Search lab results…"
                className="pl-9 bg-white dark:bg-gray-800"
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
              lab result{filtered.length === 1 ? "" : "s"} for{" "}
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
                ? "No lab reports match your search criteria."
                : "No patients available."
            }
          />
        </CardContent>
      </Card>

      <Dialog
        open={!!selectedReport}
        onOpenChange={(open) => !open && setSelectedReport(null)}
      >
        <DialogContent className="sm:max-w-md">
          {selectedReport && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                  <FlaskConical className="size-5 text-teal-500" />
                  {selectedReport.test}
                </DialogTitle>
                <DialogDescription>
                  Lab Report Details • {selectedReport.date}
                </DialogDescription>
              </DialogHeader>

              <div className="mt-4 space-y-4">
                <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/30">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-500">Test Result</p>
                      <p className={cn(
                        "mt-1 text-2xl font-bold",
                        selectedReport.flag === "abnormal" ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"
                      )}>
                        {selectedReport.result}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Reference Range</p>
                      <p className="mt-1 text-lg font-semibold text-slate-850 dark:text-slate-100">
                        {selectedReport.refRange}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-slate-500">Clinical Setting / Visit</p>
                    <p className="mt-0.5 text-sm font-medium">{selectedReport.visitType}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Ordering Clinician</p>
                    <p className="mt-0.5 text-sm font-medium">{selectedReport.clinician}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Status</p>
                    <div className="mt-1">
                      <Badge className={cn(
                        selectedReport.flag === "abnormal" 
                          ? "bg-amber-100 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/30 dark:text-amber-400" 
                          : "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400",
                        "border-0"
                      )}>
                        {selectedReport.flag === "abnormal" ? "Abnormal Flag" : "Normal"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
