"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Shield,
  CreditCard,
  CheckCircle2,
  FileText,
  ArrowRight,
  DollarSign,
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
import { CustomSelect } from "@/components/ui/custom-select";
import type { Patient, Appointment } from "@/lib/clinical-types";
import { getPatientInsuranceInfo } from "@/lib/patient-profile";
import { cn } from "@/lib/utils";

type PatientInsuranceProps = {
  patients: Patient[];
  appointments: Appointment[];
};

export function PatientInsurance({
  patients,
  appointments,
}: PatientInsuranceProps) {
  const [selectedPatientId, setSelectedPatientId] = useState(
    patients[0]?.id ?? "",
  );
  const [verifying, setVerifying] = useState(false);
  const [verifiedSuccess, setVerifiedSuccess] = useState(false);

  useEffect(() => {
    if (patients.length === 0) {
      setSelectedPatientId("");
      return;
    }
    if (!patients.some((p) => p.id === selectedPatientId)) {
      setSelectedPatientId(patients[0].id);
    }
  }, [patients, selectedPatientId]);

  const patientOptions = useMemo(() => {
    return patients.map((p) => ({
      value: p.id,
      label: p.name,
    }));
  }, [patients]);

  const patientIndex = patients.findIndex((p) => p.id === selectedPatientId);
  const selectedPatient = patients[patientIndex] ?? null;

  const insuranceInfo = useMemo(() => {
    if (!selectedPatient || patientIndex === -1) return null;
    return getPatientInsuranceInfo(selectedPatient, patientIndex, appointments);
  }, [selectedPatient, patientIndex, appointments]);

  const handleVerify = () => {
    setVerifying(true);
    setVerifiedSuccess(false);
    setTimeout(() => {
      setVerifying(false);
      setVerifiedSuccess(true);
      setTimeout(() => setVerifiedSuccess(false), 3000);
    }, 1500);
  };

  const claimsHistory = useMemo(() => {
    if (!selectedPatient) return [];

    // Generate deterministic claims based on patient index
    const services = [
      {
        code: "99213",
        desc: "Outpatient Visit",
        charges: 120,
        cover: 100,
        patientPay: 20,
      },
      {
        code: "85025",
        desc: "Complete Blood Count",
        charges: 45,
        cover: 45,
        patientPay: 0,
      },
      {
        code: "99214",
        desc: "Clinical Care Visit",
        charges: 180,
        cover: 150,
        patientPay: 30,
      },
      {
        code: "71046",
        desc: "Chest X-Ray",
        charges: 90,
        cover: 72,
        patientPay: 18,
      },
    ];

    return [
      {
        id: `CLM-${1000 + patientIndex * 3 + 1}`,
        date: "May 10, 2026",
        service: services[patientIndex % services.length].desc,
        code: services[patientIndex % services.length].code,
        billed: services[patientIndex % services.length].charges,
        covered: services[patientIndex % services.length].cover,
        status: "Approved",
      },
      {
        id: `CLM-${1000 + patientIndex * 3 + 2}`,
        date: "Apr 15, 2026",
        service: services[(patientIndex + 1) % services.length].desc,
        code: services[(patientIndex + 1) % services.length].code,
        billed: services[(patientIndex + 1) % services.length].charges,
        covered: services[(patientIndex + 1) % services.length].cover,
        status: "Approved",
      },
      {
        id: `CLM-${1000 + patientIndex * 3 + 3}`,
        date: "May 28, 2026",
        service: "Routine Care Evaluation",
        code: "99396",
        billed: 150,
        covered: 0,
        status: "Processing",
      },
    ];
  }, [selectedPatient, patientIndex]);

  if (!selectedPatient || !insuranceInfo) {
    return (
      <div className="p-5 text-center text-muted-foreground">
        No patient selected.
      </div>
    );
  }

  // Generate mock Policy ID and Group ID
  const policyId = `POL-${selectedPatient.id.replace(/\D/g, "")}-${23000 + patientIndex}`;
  const groupId = `GRP-${10450 + patientIndex * 50}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">
            Insurance Coverage
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage insurance policies, view copays, and track claims
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

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        {/* Insurance Card Visual Representation */}
        <div className="flex flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br from-[#10b981] via-[#059669] to-[#047857] p-6 text-white shadow-xl min-h-[220px]">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                Health Plan Card
              </span>
              <h3 className="text-2xl font-extrabold tracking-tight">
                {insuranceInfo.primaryInsurance}
              </h3>
            </div>
            <Shield className="size-10 opacity-90" />
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider opacity-70">
                Member Name
              </p>
              <p className="text-sm font-bold tracking-wide">
                {selectedPatient.name}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider opacity-70">
                Member ID
              </p>
              <p className="font-mono text-sm font-bold">{policyId}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider opacity-70">
                Group Number
              </p>
              <p className="font-mono text-sm font-bold">{groupId}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider opacity-70">
                Copay (PCP/Spec)
              </p>
              <p className="text-sm font-bold">
                {insuranceInfo.primaryCopay} /{" "}
                {patientIndex % 2 === 0 ? "$45" : "$35"}
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-white/20 pt-4 text-xs font-medium">
            <span>Coverage Active</span>
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-full bg-emerald-300 animate-pulse" />
              Real-time Verified
            </span>
          </div>
        </div>

        {/* Coverage Details Card */}
        <Card className="rounded-xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-md font-bold">
              Policy Information
            </CardTitle>
            <CardDescription>
              Primary coverage details and verify active benefits
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-y-3 text-sm">
              <span className="text-muted-foreground">Carrier:</span>
              <span className="font-semibold text-right">
                {insuranceInfo.primaryInsurance}
              </span>

              <span className="text-muted-foreground">Secondary Carrier:</span>
              <span className="font-semibold text-right">
                {insuranceInfo.secondaryInsurance}
              </span>

              <span className="text-muted-foreground">Primary Copay:</span>
              <span className="font-semibold text-right text-teal-600 dark:text-teal-400">
                {insuranceInfo.primaryCopay}
              </span>

              <span className="text-muted-foreground">Secondary Copay:</span>
              <span className="font-semibold text-right text-teal-600 dark:text-teal-400">
                {insuranceInfo.secondaryCopay}
              </span>

              <span className="text-muted-foreground">Dental Plan:</span>
              <span className="font-semibold text-right text-emerald-600 dark:text-emerald-400">
                Covered (100% preventive)
              </span>

              <span className="text-muted-foreground">Vision Plan:</span>
              <span className="font-semibold text-right text-emerald-600 dark:text-emerald-400">
                Covered ($10 Copay)
              </span>
            </div>

            <div className="border-t border-slate-100 pt-4 dark:border-slate-800">
              <Button
                onClick={handleVerify}
                disabled={verifying}
                className="w-full bg-primary hover:bg-primary/80 text-primary-foreground"
              >
                {verifying
                  ? "Verifying Benefits..."
                  : verifiedSuccess
                    ? "Benefits Active!"
                    : "Verify Eligibility"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Claims History Card */}
      <Card className="rounded-xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-card">
        <CardHeader>
          <CardTitle className="text-md font-bold">
            Recent Claims & Submissions
          </CardTitle>
          <CardDescription>
            Statements filed with the insurer for medical services
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-semibold uppercase tracking-wider text-muted-foreground dark:border-slate-800 dark:bg-slate-900/30">
                  <th className="px-6 py-3">Claim ID</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Service</th>
                  <th className="px-6 py-3">Billed</th>
                  <th className="px-6 py-3">Insurer Paid</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {claimsHistory.map((claim) => (
                  <tr
                    key={claim.id}
                    className="hover:bg-slate-50/30 dark:hover:bg-slate-900/10"
                  >
                    <td className="px-6 py-4 font-mono font-medium">
                      {claim.id}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {claim.date}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold">{claim.service}</p>
                        <p className="text-[10px] text-muted-foreground">
                          Code: {claim.code}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium">
                      ${claim.billed.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 font-medium text-emerald-600 dark:text-emerald-400">
                      ${claim.covered.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant="outline"
                        className={cn(
                          "border-0 text-[10px] uppercase font-bold tracking-wider",
                          claim.status === "Approved"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
                        )}
                      >
                        {claim.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
