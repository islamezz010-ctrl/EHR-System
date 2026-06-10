"use client";

import { useEffect, useMemo, useState, type ComponentType } from "react";
import {
  Activity,
  Droplet,
  FileBarChart,
  Pencil,
  PencilLine,
  Pill,
  Ruler,
  Scale,
} from "lucide-react";
import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CustomSelect } from "@/components/ui/custom-select";
import type { Patient } from "@/lib/clinical-types";
import { getInitials } from "@/lib/clinical-types";
import {
  getPatientHealthMetrics,
  getPatientInsuranceInfo,
  getPatientProfileMeta,
  getProfileSummary,
} from "@/lib/patient-profile";
import { cn } from "@/lib/utils";

type PatientProfileProps = {
  patients: Patient[];
  userRole?: string;
};

function InsuranceLabel({ label, value }: { label: string; value: string }) {
  const isActive = value !== "None";
  return (
    <div className="flex items-center justify-between gap-2 text-xs">
      <span className="text-slate-500 dark:text-slate-400">{label}</span>
      <span
        className={cn(
          "rounded px-2 py-0.5 font-semibold",
          isActive
            ? "bg-teal-500 text-white"
            : "bg-teal-100 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400",
        )}
      >
        {value}
      </span>
    </div>
  );
}

function ProfileDetail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-slate-800 dark:text-slate-100">
        {value}
      </p>
    </div>
  );
}

function InsuranceColumn({
  title,
  value,
  copay,
}: {
  title: string;
  value: string;
  copay: string;
}) {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs text-slate-500 dark:text-slate-400">{title}</p>
        <p className="mt-1 text-sm font-bold text-slate-800 dark:text-slate-100">
          {value}
        </p>
      </div>
      <div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Visit copay
        </p>
        <p className="mt-1 text-sm font-bold text-slate-800 dark:text-slate-100">
          {copay}
        </p>
      </div>
    </div>
  );
}

function VitalMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <Icon className="size-5 text-slate-400" />
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 text-xl font-semibold text-teal-500">{value}</p>
    </div>
  );
}

function BpReading({
  value,
  type,
}: {
  value: string;
  type: "Systolic" | "Diastolic";
}) {
  return (
    <div className="flex items-center gap-3">
      <div>
        <p className="text-xl font-semibold text-teal-500">{value}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">({type})</p>
      </div>
      <span className="h-10 w-1.5 shrink-0 rounded-full bg-amber-200 dark:bg-amber-300/70" />
    </div>
  );
}

export function PatientProfile({ patients, userRole }: PatientProfileProps) {
  const [selectedPatientId, setSelectedPatientId] = useState(
    patients[0]?.id ?? "",
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

  const patientOptions = useMemo(() => {
    return patients.map((p) => ({
      value: p.id,
      label: p.name,
    }));
  }, [patients]);

  const patientIndex = patients.findIndex((p) => p.id === selectedPatientId);
  const patient = patients[patientIndex] ?? null;

  const meta = useMemo(
    () => (patient ? getPatientProfileMeta(patient, patientIndex) : null),
    [patient, patientIndex],
  );

  const summary = useMemo(
    () => (patient ? getProfileSummary(patient) : null),
    [patient],
  );

  const insuranceInfo = useMemo(
    () => (patient ? getPatientInsuranceInfo(patient, patientIndex, []) : null),
    [patient, patientIndex],
  );

  const healthMetrics = useMemo(
    () => (patient ? getPatientHealthMetrics(patient, patientIndex) : null),
    [patient, patientIndex],
  );

  if (!patient || !meta || !summary || !insuranceInfo || !healthMetrics) {
    return (
      <p className="text-sm text-muted-foreground">No patient selected.</p>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
            {userRole === "patient" ? "My Profile" : "Patient profile"}
          </h2>
          <p className="text-sm text-muted-foreground">
            Overview and vital information
          </p>
        </div>
        {userRole !== "patient" && (
          <CustomSelect
            options={patientOptions}
            value={selectedPatientId}
            onChange={setSelectedPatientId}
            placeholder="Select patient"
            disabled={patients.length === 0}
            className="max-w-xs w-full"
            showSearch
            showAvatars
          />
        )}
      </div>

      {/* Row 1: Patient Details Card */}
      <Card className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-md dark:border-slate-800 dark:bg-card">
        <CardContent className="flex gap-0 p-0">
          <div className="flex w-36 shrink-0 flex-col justify-center gap-3 border-r border-slate-100 bg-slate-50/50 px-4 py-6 dark:border-slate-800 dark:bg-slate-900/30">
            <InsuranceLabel
              label="Medical Insurance"
              value={meta.medicalInsurance}
            />
            <InsuranceLabel
              label="Vision Insurance"
              value={meta.visionInsurance}
            />
            <InsuranceLabel
              label="Dental Insurance"
              value={meta.dentalInsurance}
            />
          </div>

          <div className="min-w-0 flex-1 p-6">
            <div className="flex flex-wrap items-start gap-4">
              <div className="relative">
                <div className="relative size-20 overflow-hidden rounded-full ring-4 ring-teal-100 dark:ring-teal-900/40">
                  {patient.avatar ? (
                    <Image
                      src={patient.avatar}
                      alt={patient.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <span className="grid size-full place-items-center bg-teal-100 text-lg font-bold text-teal-700">
                      {getInitials(patient.name)}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  className="absolute bottom-0 right-0 grid size-7 place-items-center rounded-full bg-teal-500 text-white shadow-md"
                  aria-label="Edit photo"
                >
                  <PencilLine className="size-3.5" />
                </button>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50">
                    {patient.name}
                  </h3>
                  <Badge className="border-0 bg-teal-500 text-white hover:bg-teal-500">
                    Active
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-slate-500">Patient</p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <ProfileDetail label="Role" value="Patient" />
              <ProfileDetail label="Age" value={String(summary.age)} />
              <ProfileDetail label="E-mail" value={patient.contact.email} />
              <ProfileDetail label="Birth Date" value={summary.birthDate} />
              <ProfileDetail label="Phone" value={patient.contact.phone} />
              <ProfileDetail label="Status" value={meta.maritalStatus} />
              <ProfileDetail label="Work for" value={meta.workFor} />
              <ProfileDetail
                label="Gender"
                value={patient.medicalProfile.gender}
              />
              <ProfileDetail label="Address" value={meta.address} />
            </div>

            <div className="mt-6 grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2 dark:border-slate-800">
              <ProfileDetail label="Chart ID" value={meta.chartId} />
              <ProfileDetail label="Legacy ID" value={meta.legacyId} />
              <ProfileDetail label="Patient Since" value={meta.patientSince} />
              <ProfileDetail
                label="Preferred Provider"
                value={meta.preferredProvider}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Row 2: Vitals Card + Hemoglobin & Glucose Cards */}
      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-md dark:border-slate-800 dark:bg-card">
          <CardContent className="p-0">
            <div className="grid grid-cols-3 gap-4 border-b border-slate-100 px-6 py-6 dark:border-slate-800">
              <VitalMetric
                icon={Ruler}
                label="Height"
                value={healthMetrics.height}
              />
              <VitalMetric
                icon={Scale}
                label="Weight"
                value={healthMetrics.weight}
              />
              <VitalMetric
                icon={FileBarChart}
                label="BMI"
                value={healthMetrics.bmi}
              />
            </div>

            <div className="border-b border-slate-100 px-6 py-5 dark:border-slate-800">
              <div className="mb-4 flex items-center gap-2">
                <Activity className="size-5 text-slate-400" />
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  Blood Pressure
                </p>
              </div>
              <div className="flex flex-wrap gap-8">
                <BpReading value={healthMetrics.systolic} type="Systolic" />
                <BpReading value={healthMetrics.diastolic} type="Diastolic" />
              </div>
            </div>

            <div className="px-6 py-4 text-center text-sm">
              <span className="text-slate-500 dark:text-slate-400">
                Smoking Status:{" "}
              </span>
              <span className="font-semibold text-teal-500">
                {healthMetrics.smokingStatus}
              </span>
            </div>
          </CardContent>
        </Card>

        {(userRole === "patient" || userRole === "admin") && (
          <div className="grid gap-5 grid-rows-2">
            <Card className="rounded-xl border border-slate-100 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-card">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Hemoglobin
                  </p>
                  <h3 className="text-3xl font-extrabold text-slate-900 dark:text-slate-50">
                    {healthMetrics.hemoglobin}
                  </h3>
                  <p className="text-xs text-emerald-650 dark:text-emerald-400">
                    Normal Range (13.8 - 17.2 g/dL)
                  </p>
                </div>
                <div className="grid size-12 place-items-center rounded-lg bg-rose-50 text-rose-500 dark:bg-rose-950/30">
                  <Droplet className="size-6" />
                </div>
              </div>
            </Card>

            <Card className="rounded-xl border border-slate-100 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-card">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Glucose Level
                  </p>
                  <h3 className="text-3xl font-extrabold text-slate-900 dark:text-slate-50">
                    {healthMetrics.glucose}
                  </h3>
                  <p
                    className={cn(
                      "text-xs font-semibold",
                      healthMetrics.glucose?.includes("118")
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-emerald-600 dark:text-emerald-400",
                    )}
                  >
                    {healthMetrics.glucose?.includes("118")
                      ? "Slightly Elevated (Target Fasting: < 100 mg/dL)"
                      : "Normal Fasting (Target: 70 - 100 mg/dL)"}
                  </p>
                </div>
                <div className="grid size-12 place-items-center rounded-lg bg-amber-50 text-amber-500 dark:bg-amber-950/30">
                  <Activity className="size-6" />
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Row 3: Insurance */}
      <Card className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-md dark:border-slate-800 dark:bg-card">
        <CardContent className="p-0">
          <div className="grid gap-6 p-6 sm:grid-cols-3">
            <InsuranceColumn
              title="Primary Insurance"
              value={insuranceInfo.primaryInsurance}
              copay={insuranceInfo.primaryCopay}
            />
            <InsuranceColumn
              title="Secondary Insurance"
              value={insuranceInfo.secondaryInsurance}
              copay={insuranceInfo.secondaryCopay}
            />
            <InsuranceColumn
              title="Next Appointment"
              value={insuranceInfo.nextAppointmentDate}
              copay={insuranceInfo.nextAppointmentCopay}
            />
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Last visited pharmacy
            </p>
            <div className="flex items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-teal-50 text-teal-500 dark:bg-teal-950/30">
                <Pill className="size-5" />
              </span>
              <div>
                <p className="text-sm font-bold text-teal-500">
                  {insuranceInfo.pharmacyName}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {insuranceInfo.pharmacyAddress}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
