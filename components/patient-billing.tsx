"use client";

import { useMemo, useState } from "react";
import { CircleDollarSign, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
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
import type { BillingRecord, BillingStatus } from "@/lib/billing";
import { cn } from "@/lib/utils";

function BillingStatusBadge({ status }: { status: BillingStatus }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "border-0",
        status === "Paid" && "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400",
        status === "Pending" && "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
        status === "Overdue" && "bg-rose-100 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400",
      )}
    >
      {status}
    </Badge>
  );
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

type PatientBillingProps = {
  billings: BillingRecord[];
};

export function PatientBilling({ billings }: PatientBillingProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return billings;
    const q = searchQuery.toLowerCase();
    return billings.filter(
      (b) =>
        b.patientName.toLowerCase().includes(q) ||
        b.service.toLowerCase().includes(q) ||
        b.status.toLowerCase().includes(q),
    );
  }, [billings, searchQuery]);

  const totals = useMemo(() => {
    const pending = billings
      .filter((b) => b.status === "Pending")
      .reduce((sum, b) => sum + b.amount, 0);
    const overdue = billings
      .filter((b) => b.status === "Overdue")
      .reduce((sum, b) => sum + b.amount, 0);
    const paid = billings
      .filter((b) => b.status === "Paid")
      .reduce((sum, b) => sum + b.amount, 0);
    return { pending, overdue, paid };
  }, [billings]);

  return (
    <div className="space-y-5">
      <section className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-xl border-0 py-4 shadow-sm">
          <CardContent className="flex items-center gap-3 px-5">
            <span className="grid size-10 place-items-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
              <CircleDollarSign className="size-5" />
            </span>
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-xl font-bold">{formatCurrency(totals.pending)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-xl border-0 py-4 shadow-sm">
          <CardContent className="flex items-center gap-3 px-5">
            <span className="grid size-10 place-items-center rounded-lg bg-rose-100 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400">
              <CircleDollarSign className="size-5" />
            </span>
            <div>
              <p className="text-sm text-muted-foreground">Overdue</p>
              <p className="text-xl font-bold">{formatCurrency(totals.overdue)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-xl border-0 py-4 shadow-sm">
          <CardContent className="flex items-center gap-3 px-5">
            <span className="grid size-10 place-items-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
              <CircleDollarSign className="size-5" />
            </span>
            <div>
              <p className="text-sm text-muted-foreground">Paid</p>
              <p className="text-xl font-bold">{formatCurrency(totals.paid)}</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <Card className="rounded-xl border-0 py-5 shadow-sm">
        <CardHeader className="gap-4 px-5 md:grid-cols-[1fr_auto]">
          <CardTitle className="text-lg font-semibold">Patient Billing</CardTitle>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search billing…"
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="px-5">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead>Patient</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length > 0 ? (
                filtered.map((bill) => (
                  <TableRow key={bill.id}>
                    <TableCell className="font-medium">{bill.patientName}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {bill.service}
                    </TableCell>
                    <TableCell>{bill.date}</TableCell>
                    <TableCell className="font-semibold">
                      {formatCurrency(bill.amount)}
                    </TableCell>
                    <TableCell>
                      <BillingStatusBadge status={bill.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm">
                        View Invoice
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                    No billing records found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
