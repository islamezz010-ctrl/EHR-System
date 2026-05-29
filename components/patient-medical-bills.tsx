"use client";

import { useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { CircleDollarSign, Eye, Receipt, Search } from "lucide-react";

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
  getMedicalBillsForPatient,
  type MedicalBillRecord,
  type MedicalBillStatus,
} from "@/lib/medical-bills";
import { cn } from "@/lib/utils";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function BillStatusBadge({
  status,
  dueDate,
  amountDue,
}: {
  status: MedicalBillStatus;
  dueDate: string;
  amountDue: number;
}) {
  if (amountDue <= 0) {
    return (
      <Badge
        variant="outline"
        className="border-0 bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
      >
        Paid
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        "border-0",
        status === "Overdue" &&
          "bg-rose-100 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400",
        status === "Due" &&
          "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
      )}
    >
      {status === "Overdue" ? "Overdue" : `Due ${dueDate}`}
    </Badge>
  );
}

type PatientMedicalBillsProps = {
  patients: Patient[];
  bills: MedicalBillRecord[];
};

const selectClassName =
  "flex h-9 w-full max-w-md rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

export function PatientMedicalBills({
  patients,
  bills,
}: PatientMedicalBillsProps) {
  const [selectedPatientId, setSelectedPatientId] = useState(
    patients[0]?.id ?? "",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBill, setSelectedBill] = useState<MedicalBillRecord | null>(
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

  const patientBills = useMemo(() => {
    if (!selectedPatientId) return [];
    return getMedicalBillsForPatient(bills, selectedPatientId);
  }, [bills, selectedPatientId]);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return patientBills;
    const q = searchQuery.toLowerCase();
    return patientBills.filter(
      (b) =>
        b.clinician.toLowerCase().includes(q) ||
        b.visitType.toLowerCase().includes(q) ||
        b.status.toLowerCase().includes(q) ||
        b.date.toLowerCase().includes(q),
    );
  }, [patientBills, searchQuery]);

  const summary = useMemo(() => {
    const open = patientBills.filter((b) => b.amountDue > 0);
    const totalDue = open.reduce((sum, b) => sum + b.amountDue, 0);
    const insuranceTotal = patientBills.reduce(
      (sum, b) => sum + b.insuranceCoverage,
      0,
    );
    const chargesTotal = patientBills.reduce(
      (sum, b) => sum + b.totalCharges,
      0,
    );
    return { totalDue, insuranceTotal, chargesTotal, openCount: open.length };
  }, [patientBills]);

  const columns = useMemo<ColumnDef<MedicalBillRecord>[]>(
    () => [
      {
        accessorKey: "amountDue",
        header: "Amount due",
        cell: ({ row }) => (
          <span className="font-semibold">
            {formatCurrency(row.original.amountDue)}
          </span>
        ),
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => (
          <BillStatusBadge
            status={row.original.status}
            dueDate={row.original.dueDate}
            amountDue={row.original.amountDue}
          />
        ),
      },
      { accessorKey: "clinician", header: "Clinician" },
      {
        accessorKey: "visitType",
        header: "Visit type",
        cell: ({ row }) => (
          <span className="text-muted-foreground">{row.original.visitType}</span>
        ),
      },
      { accessorKey: "date", header: "Date" },
      {
        id: "view",
        header: () => <span className="sr-only">View</span>,
        cell: ({ row }) => (
          <div className="text-right">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedBill(row.original)}
            >
              <Eye className="size-4" />
              View
            </Button>
          </div>
        ),
      },
      {
        id: "pay",
        header: () => <span className="sr-only">Pay</span>,
        cell: ({ row }) => (
          <div className="text-right">
            <Button
              size="sm"
              className="bg-teal-500 hover:bg-teal-600"
              disabled={row.original.amountDue <= 0}
              onClick={() => setSelectedBill(row.original)}
            >
              Pay bill
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  const lineItemColumns = useMemo<
    ColumnDef<MedicalBillRecord["lineItems"][number]>[]
  >(
    () => [
      { accessorKey: "description", header: "Charge" },
      {
        accessorKey: "amount",
        header: () => <span className="block text-right">Amount</span>,
        cell: ({ row }) => (
          <span className="block text-right text-sm">
            {formatCurrency(row.original.amount)}
          </span>
        ),
      },
      {
        accessorKey: "insurancePays",
        header: () => <span className="block text-right">Insurance</span>,
        cell: ({ row }) => (
          <span className="block text-right text-sm text-emerald-600 dark:text-emerald-400">
            {formatCurrency(row.original.insurancePays)}
          </span>
        ),
      },
      {
        accessorKey: "patientOwes",
        header: () => <span className="block text-right">Your portion</span>,
        cell: ({ row }) => (
          <span className="block text-right text-sm font-medium">
            {formatCurrency(row.original.patientOwes)}
          </span>
        ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-5">
      <section className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-xl border-0 py-4 shadow-sm">
          <CardContent className="flex items-center gap-3 px-5">
            <span className="grid size-10 place-items-center rounded-lg bg-rose-100 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400">
              <CircleDollarSign className="size-5" />
            </span>
            <div>
              <p className="text-sm text-muted-foreground">Amount you owe</p>
              <p className="text-xl font-bold">
                {formatCurrency(summary.totalDue)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-xl border-0 py-4 shadow-sm">
          <CardContent className="flex items-center gap-3 px-5">
            <span className="grid size-10 place-items-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
              <Receipt className="size-5" />
            </span>
            <div>
              <p className="text-sm text-muted-foreground">
                Insurance covered
              </p>
              <p className="text-xl font-bold">
                {formatCurrency(summary.insuranceTotal)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-xl border-0 py-4 shadow-sm">
          <CardContent className="flex items-center gap-3 px-5">
            <span className="grid size-10 place-items-center rounded-lg bg-sky-100 text-sky-700 dark:bg-sky-950/30 dark:text-sky-400">
              <CircleDollarSign className="size-5" />
            </span>
            <div>
              <p className="text-sm text-muted-foreground">Total charges</p>
              <p className="text-xl font-bold">
                {formatCurrency(summary.chargesTotal)}
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <Card className="rounded-xl border-0 py-5 shadow-sm">
        <CardHeader className="gap-4 px-5">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <Receipt className="size-5 text-primary" />
              Medical Bills
            </CardTitle>
            <CardDescription className="mt-1">
              Review charges, insurance coverage, and pay outstanding balances
            </CardDescription>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-1.5">
              <label
                htmlFor="bill-patient"
                className="text-xs font-medium text-muted-foreground"
              >
                Patient
              </label>
              <select
                id="bill-patient"
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
                placeholder="Search bills…"
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
              {summary.openCount} bill{summary.openCount === 1 ? "" : "s"} with
              a balance for{" "}
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
                ? "No medical bills match your search."
                : "No patients available."
            }
          />
        </CardContent>
      </Card>

      <Dialog
        open={!!selectedBill}
        onOpenChange={(open) => !open && setSelectedBill(null)}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          {selectedBill ? (
            <>
              <DialogHeader>
                <DialogTitle>Bill details</DialogTitle>
                <DialogDescription>
                  {selectedBill.visitType} · {selectedBill.date} ·{" "}
                  {selectedBill.clinician}
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-3 gap-3 rounded-lg bg-muted/40 p-4 text-center text-sm">
                <div>
                  <p className="text-muted-foreground">Total charges</p>
                  <p className="mt-1 font-semibold">
                    {formatCurrency(selectedBill.totalCharges)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Insurance pays</p>
                  <p className="mt-1 font-semibold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(selectedBill.insuranceCoverage)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">You owe</p>
                  <p className="mt-1 font-semibold text-rose-600 dark:text-rose-400">
                    {formatCurrency(selectedBill.amountDue)}
                  </p>
                </div>
              </div>

              <DataTable
                columns={lineItemColumns}
                data={selectedBill.lineItems}
                compact
                emptyMessage="No line items."
              />

              {selectedBill.amountDue > 0 ? (
                <Button className="w-full">Pay {formatCurrency(selectedBill.amountDue)}</Button>
              ) : null}
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
