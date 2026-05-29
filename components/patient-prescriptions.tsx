"use client";

import { useEffect, useMemo, useState } from "react";
import { Pill, Search, Calendar, Clipboard, CheckCircle2, User, RefreshCw, Phone, MapPin } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Patient, Appointment } from "@/lib/clinical-types";
import { getMedicationsForPatient, type MedicationRecord } from "@/lib/medications";
import { getPatientInsuranceInfo } from "@/lib/patient-profile";
import { cn } from "@/lib/utils";

type PatientPrescriptionsProps = {
  patients: Patient[];
  medications: MedicationRecord[];
};

const selectClassName =
  "flex h-9 w-full max-w-md rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

export function PatientPrescriptions({ patients, medications }: PatientPrescriptionsProps) {
  const [selectedPatientId, setSelectedPatientId] = useState(
    patients[0]?.id ?? "",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [refillLoadingStates, setRefillLoadingStates] = useState<Record<string, "idle" | "loading" | "requested">>({});

  useEffect(() => {
    if (patients.length === 0) {
      setSelectedPatientId("");
      return;
    }
    if (!patients.some((p) => p.id === selectedPatientId)) {
      setSelectedPatientId(patients[0].id);
    }
  }, [patients, selectedPatientId]);

  const patientIndex = patients.findIndex((p) => p.id === selectedPatientId);
  const selectedPatient = patients[patientIndex] ?? null;

  const patientPrescriptions = useMemo(() => {
    if (!selectedPatientId) return [];
    return getMedicationsForPatient(medications, selectedPatientId);
  }, [medications, selectedPatientId]);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return patientPrescriptions;
    const q = searchQuery.toLowerCase();
    return patientPrescriptions.filter(
      (m) =>
        m.medicationName.toLowerCase().includes(q) ||
        m.condition.toLowerCase().includes(q) ||
        m.prescribedBy.toLowerCase().includes(q)
    );
  }, [patientPrescriptions, searchQuery]);

  const pharmacyInfo = useMemo(() => {
    if (!selectedPatient) return null;
    const mockAppts: Appointment[] = [];
    return getPatientInsuranceInfo(selectedPatient, patientIndex, mockAppts);
  }, [selectedPatient, patientIndex]);

  const handleRefillRequest = (medId: string) => {
    setRefillLoadingStates((prev) => ({ ...prev, [medId]: "loading" }));
    setTimeout(() => {
      setRefillLoadingStates((prev) => ({ ...prev, [medId]: "requested" }));
    }, 1200);
  };

  const refillNeededCount = useMemo(() => {
    return patientPrescriptions.filter((m) => m.refills === 0).length;
  }, [patientPrescriptions]);

  if (!selectedPatient) {
    return (
      <div className="p-5 text-center text-muted-foreground">No patient selected.</div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Prescription Center</h2>
          <p className="text-sm text-muted-foreground">Active prescriptions, order refills, and view preferred pharmacy details</p>
        </div>
        <select
          value={selectedPatientId}
          onChange={(e) => setSelectedPatientId(e.target.value)}
          className={selectClassName}
          disabled={patients.length === 0}
        >
          {patients.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-card">
          <div className="flex items-center gap-4">
            <div className="grid size-12 place-items-center rounded-lg bg-teal-50 text-teal-500 dark:bg-teal-950/30">
              <Pill className="size-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Active Prescriptions</p>
              <h3 className="text-2xl font-bold">{patientPrescriptions.length}</h3>
            </div>
          </div>
        </Card>
        <Card className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-card">
          <div className="flex items-center gap-4">
            <div className="grid size-12 place-items-center rounded-lg bg-indigo-50 text-indigo-500 dark:bg-indigo-950/30">
              <RefreshCw className="size-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Refills Remaining</p>
              <h3 className="text-2xl font-bold">
                {patientPrescriptions.reduce((sum, item) => sum + (item.refills || 0), 0)}
              </h3>
            </div>
          </div>
        </Card>
        <Card className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-card">
          <div className="flex items-center gap-4">
            <div className={cn(
              "grid size-12 place-items-center rounded-lg",
              refillNeededCount > 0 
                ? "bg-amber-50 text-amber-500 dark:bg-amber-950/30" 
                : "bg-emerald-50 text-emerald-500 dark:bg-emerald-950/30"
            )}>
              <Clipboard className="size-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Action Required (0 Refills)</p>
              <h3 className="text-2xl font-bold text-amber-600 dark:text-amber-400">{refillNeededCount}</h3>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.8fr_1fr]">
        {/* Prescriptions List */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search medications & prescriptions..."
                className="pl-9 bg-white dark:bg-gray-800"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {filtered.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">
              No active prescriptions match your search.
            </Card>
          ) : (
            <div className="grid gap-4">
              {filtered.map((med) => {
                const refillState = refillLoadingStates[med.id] || "idle";
                return (
                  <Card key={med.id} className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-card">
                    <CardHeader className="flex flex-row items-start justify-between bg-slate-50/50 p-4 dark:bg-slate-900/10">
                      <div className="space-y-1">
                        <CardTitle className="text-md font-bold">{med.medicationName}</CardTitle>
                        <CardDescription className="text-xs">
                          For: <span className="font-semibold text-slate-800 dark:text-slate-200">{med.condition}</span>
                        </CardDescription>
                      </div>
                      <Badge className="border-0 bg-teal-500 text-white">Active</Badge>
                    </CardHeader>
                    <CardContent className="p-5 space-y-4">
                      <div className="grid grid-cols-2 gap-y-3 text-sm sm:grid-cols-4">
                        <div>
                          <p className="text-[10px] uppercase font-semibold text-muted-foreground">Dosage</p>
                          <p className="mt-0.5 font-medium">{med.dose}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-semibold text-muted-foreground">Frequency</p>
                          <p className="mt-0.5 font-medium">{med.frequency}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-semibold text-muted-foreground">Quantity</p>
                          <p className="mt-0.5 font-medium">{med.quantity}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-semibold text-muted-foreground">Refills Left</p>
                          <p className={cn(
                            "mt-0.5 font-bold",
                            med.refills === 0 ? "text-rose-500" : "text-slate-850 dark:text-slate-100"
                          )}>
                            {med.refills}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-4 text-xs dark:border-slate-800">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <User className="size-3.5" />
                          <span>Prescribed by: <strong className="text-foreground">{med.prescribedBy}</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Calendar className="size-3.5" />
                          <span>Last Renewed: <strong className="text-foreground">{med.renewedBy}</strong></span>
                        </div>
                      </div>

                      {/* Request Refill Interactive Button */}
                      <div className="flex justify-end pt-2">
                        {refillState === "idle" && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            disabled={med.refills === 0}
                            onClick={() => handleRefillRequest(med.id)}
                            className="bg-white dark:bg-gray-800"
                          >
                            Request Refill
                          </Button>
                        )}
                        {refillState === "loading" && (
                          <Button disabled size="sm" variant="outline">
                            <RefreshCw className="mr-2 size-3 animate-spin" />
                            Requesting...
                          </Button>
                        )}
                        {refillState === "requested" && (
                          <Button disabled size="sm" className="bg-emerald-500 text-white border-0 hover:bg-emerald-500">
                            <CheckCircle2 className="mr-2 size-4" />
                            Requested Successfully
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Pharmacy Details Panel */}
        {pharmacyInfo && (
          <Card className="h-fit rounded-xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-card">
            <CardHeader>
              <CardTitle className="text-md font-bold">Preferred Pharmacy</CardTitle>
              <CardDescription>Your prescription fulfillment settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/30">
                <Pill className="mt-1 size-5 text-teal-500 shrink-0" />
                <div className="space-y-1">
                  <h4 className="font-bold text-teal-600 dark:text-teal-400">{pharmacyInfo.pharmacyName}</h4>
                  <p className="text-xs text-muted-foreground">{pharmacyInfo.pharmacyAddress}</p>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="size-4 text-slate-400" />
                  <span>(555) 019-2834</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="size-4 text-slate-400" />
                  <span> Springfield Care Location</span>
                </div>
                <div className="flex justify-between border-t border-slate-150 pt-3 dark:border-slate-800">
                  <span className="text-xs text-muted-foreground">Hours:</span>
                  <span className="text-xs font-semibold">Mon-Fri 8:00 AM - 9:00 PM</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
