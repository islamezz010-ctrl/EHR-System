"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Beaker,
  CircleDollarSign,
  FlaskConical,
  Pill,
  Receipt,
  Search,
  Stethoscope,
} from "lucide-react";

import { DataTable } from "@/components/data-table";
import { StripePayButton } from "@/components/stripe-pay-button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Patient } from "@/lib/clinical-types";
import {
  DEMO_PATIENT_ID,
  getPatientBillsForAccount,
  summarizePatientBills,
  type PatientBillCategory,
  type PatientBillItem,
  type PatientBillStatus,
} from "@/lib/patient-bills";
import { cn, formatCurrency } from "@/lib/utils";

const CATEGORY_META: Record<
  PatientBillCategory,
  { label: string; icon: typeof Pill; tone: string }
> = {
  Medication: {
    label: "Medications",
    icon: Pill,
    tone: "bg-violet-100 text-violet-700 dark:bg-violet-950/30 dark:text-violet-400",
  },
  Consultation: {
    label: "Consultations & Appointments",
    icon: Stethoscope,
    tone: "bg-sky-100 text-sky-700 dark:bg-sky-950/30 dark:text-sky-400",
  },
  Lab: {
    label: "Lab Work",
    icon: FlaskConical,
    tone: "bg-teal-100 text-teal-700 dark:bg-teal-950/30 dark:text-teal-400",
  },
};

function BillStatusBadge({ status }: { status: PatientBillStatus }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "border-0",
        status === "Paid" &&
          "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400",
        status === "Pending" &&
          "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
        status === "Overdue" &&
          "bg-rose-100 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400",
      )}
    >
      {status}
    </Badge>
  );
}

type PatientBillsPanelProps = {
  bills: PatientBillItem[];
  onBillsPaid: (billIds: string[]) => void;
  patients?: Patient[];
};

export function PatientBillsPanel({
  bills,
  onBillsPaid,
  patients = [],
}: PatientBillsPanelProps) {
  const patientName =
    patients.find((patient) => patient.id === DEMO_PATIENT_ID)?.name ??
    "Jonathan Wick";
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<
    PatientBillCategory | "All"
  >("All");

  const accountBills = useMemo(
    () => getPatientBillsForAccount(bills, DEMO_PATIENT_ID),
    [bills],
  );

  const summary = useMemo(
    () => summarizePatientBills(accountBills),
    [accountBills],
  );

  const filtered = useMemo(() => {
    let rows = accountBills;
    if (activeCategory !== "All") {
      rows = rows.filter((bill) => bill.category === activeCategory);
    }
    if (!searchQuery.trim()) return rows;
    const q = searchQuery.toLowerCase();
    return rows.filter(
      (bill) =>
        bill.description.toLowerCase().includes(q) ||
        bill.provider.toLowerCase().includes(q) ||
        bill.category.toLowerCase().includes(q) ||
        bill.status.toLowerCase().includes(q),
    );
  }, [accountBills, activeCategory, searchQuery]);

  const columns = useMemo<ColumnDef<PatientBillItem>[]>(
    () => [
      {
        accessorKey: "category",
        header: "Type",
        cell: ({ row }) => {
          const meta = CATEGORY_META[row.original.category];
          const Icon = meta.icon;
          return (
            <span className="inline-flex items-center gap-1.5 text-sm">
              <Icon className="size-3.5 text-muted-foreground" />
              {row.original.category}
            </span>
          );
        },
      },
      {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => (
          <span className="font-medium">{row.original.description}</span>
        ),
      },
      { accessorKey: "provider", header: "Provider" },
      { accessorKey: "date", header: "Date" },
      {
        accessorKey: "amount",
        header: "Total",
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {formatCurrency(row.original.amount)}
          </span>
        ),
      },
      {
        accessorKey: "patientOwes",
        header: "You owe",
        cell: ({ row }) => (
          <span className="font-semibold">
            {formatCurrency(row.original.patientOwes)}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <BillStatusBadge status={row.original.status} />,
      },
    ],
    [],
  );

  const categoryFilters: (PatientBillCategory | "All")[] = [
    "All",
    "Medication",
    "Consultation",
    "Lab",
  ];

  return (
    <div className="space-y-5">
      <section className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="rounded-xl border-0 py-4 shadow-sm">
            <CardContent className="flex items-center gap-3 px-5">
              <span className="grid size-10 place-items-center rounded-lg bg-violet-100 text-violet-700 dark:bg-violet-950/30 dark:text-violet-400">
                <Pill className="size-5" />
              </span>
              <div>
                <p className="text-sm text-muted-foreground">Medications</p>
                <p className="text-xl font-bold">
                  {formatCurrency(summary.medication.due)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {summary.medication.count} items
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-xl border-0 py-4 shadow-sm">
            <CardContent className="flex items-center gap-3 px-5">
              <span className="grid size-10 place-items-center rounded-lg bg-sky-100 text-sky-700 dark:bg-sky-950/30 dark:text-sky-400">
                <Stethoscope className="size-5" />
              </span>
              <div>
                <p className="text-sm text-muted-foreground">Consultations</p>
                <p className="text-xl font-bold">
                  {formatCurrency(summary.consultation.due)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {summary.consultation.count} items
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-xl border-0 py-4 shadow-sm">
            <CardContent className="flex items-center gap-3 px-5">
              <span className="grid size-10 place-items-center rounded-lg bg-teal-100 text-teal-700 dark:bg-teal-950/30 dark:text-teal-400">
                <Beaker className="size-5" />
              </span>
              <div>
                <p className="text-sm text-muted-foreground">Lab work</p>
                <p className="text-xl font-bold">
                  {formatCurrency(summary.lab.due)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {summary.lab.count} items
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-xl border-0 py-5 shadow-sm lg:row-span-1">
          <CardHeader className="px-5 pb-2">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <CircleDollarSign className="size-5 text-primary" />
              Total balance
            </CardTitle>
            <CardDescription>
              Outstanding balance for {patientName}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 px-5">
            <div className="rounded-lg bg-muted/40 p-4">
              <p className="text-sm text-muted-foreground">Amount you owe</p>
              <p className="mt-1 text-3xl font-bold tracking-tight">
                {formatCurrency(summary.totalDue)}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                {summary.openCount} unpaid bill
                {summary.openCount === 1 ? "" : "s"} · Insurance covered{" "}
                {formatCurrency(summary.insuranceTotal)} of{" "}
                {formatCurrency(summary.totalCharges)} in charges
              </p>
            </div>
            <StripePayButton
              bills={accountBills}
              totalDue={summary.totalDue}
              onPaymentComplete={onBillsPaid}
            />
          </CardContent>
        </Card>
      </section>

      <Card className="rounded-xl border-0 py-5 shadow-sm">
        <CardHeader className="gap-4 px-5">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <Receipt className="size-5 text-primary" />
              Your bills
            </CardTitle>
            <CardDescription className="mt-1">
              Medication, consultation, and lab charges for your account
            </CardDescription>
          </div>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {categoryFilters.map((category) => {
                const isActive = activeCategory === category;
                const meta =
                  category === "All" ? null : CATEGORY_META[category];
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setActiveCategory(category)}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                      isActive
                        ? "bg-teal-500 text-white"
                        : "bg-muted text-muted-foreground hover:bg-muted/80",
                    )}
                  >
                    {category === "All" ? "All bills" : meta?.label}
                  </button>
                );
              })}
            </div>
            <div className="relative w-full lg:max-w-xs">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search bills…"
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-5">
          <DataTable
            columns={columns}
            data={filtered}
            searchValue={searchQuery}
            emptyMessage="No bills match your filters."
          />
        </CardContent>
      </Card>
    </div>
  );
}
