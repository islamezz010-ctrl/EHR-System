"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { CalendarDays, Eye, Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CustomSelect } from "@/components/ui/custom-select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/data-table";
import type { Appointment } from "@/lib/clinical-types";
import {
  type AppointmentStatus,
  type NewPatientInput,
  buildAppointmentDateIso,
} from "@/lib/clinical-types";

type FormState = {
  name: string;
  visitReason: string;
  appointmentDate: string;
  appointmentTime: string;
  status: AppointmentStatus;
  age: string;
  gender: string;
  phone: string;
  email: string;
  bloodPressure: string;
  heartRate: string;
  temperature: string;
  oxygenSaturation: string;
};

const genderOptions = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Non-binary", label: "Non-binary" },
  { value: "Other", label: "Other" },
  { value: "Prefer not to say", label: "Prefer not to say" },
];

function createEmptyForm(): FormState {
  return {
    name: "",
    visitReason: "",
    appointmentDate: "",
    appointmentTime: "",
    status: "Scheduled",
    age: "",
    gender: "",
    phone: "",
    email: "",
    bloodPressure: "",
    heartRate: "",
    temperature: "",
    oxygenSaturation: "",
  };
}

type ScheduleAppointmentFormProps = {
  onSchedule: (input: NewPatientInput) => void;
  appointments?: Appointment[];
};

function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-medium text-foreground">
      {children}
    </label>
  );
}

function validateForm(form: FormState): string | null {
  if (!form.name.trim()) return "Your name is required.";
  if (!form.visitReason.trim()) return "Visit reason is required.";
  if (!form.appointmentDate) return "Appointment date is required.";
  if (!form.appointmentTime) return "Appointment time is required.";
  const age = Number(form.age);
  if (!form.age.trim() || Number.isNaN(age) || age < 0 || age > 120) {
    return "Enter a valid age between 0 and 120.";
  }
  if (!form.gender.trim()) return "Gender is required.";
  if (!form.phone.trim()) return "Phone number is required.";
  if (!form.email.trim()) return "Email is required.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    return "Enter a valid email address.";
  }
  if (!form.bloodPressure.trim()) return "Blood pressure is required.";
  if (!form.heartRate.trim()) return "Heart rate is required.";
  if (!form.temperature.trim()) return "Temperature is required.";
  if (!form.oxygenSaturation.trim()) return "O₂ saturation is required.";
  return null;
}

export function ScheduleAppointmentForm({
  onSchedule,
  appointments = [],
}: ScheduleAppointmentFormProps) {
  const [form, setForm] = useState<FormState>(createEmptyForm);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const appointmentColumns = useMemo<ColumnDef<Appointment>[]>(
    () => [
      { accessorKey: "time", header: "Time" },
      { accessorKey: "reason", header: "Reason" },
      { accessorKey: "priority", header: "Priority" },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge
            variant="outline"
            className="border-0 bg-teal-100 text-teal-700 dark:bg-teal-950/30 dark:text-teal-400"
          >
            {row.original.status}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: () => (
          <div className="flex justify-end gap-1">
            <Button variant="ghost" size="icon-sm" aria-label="View">
              <Eye className="size-4 text-slate-500" />
            </Button>
            <Button variant="ghost" size="icon-sm" aria-label="Edit">
              <Pencil className="size-4 text-slate-500" />
            </Button>
            <Button variant="ghost" size="icon-sm" aria-label="Delete">
              <Trash2 className="size-4 text-slate-500" />
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  const update = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setError(null);
    setSuccess(null);
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSchedule = () => {
    const validationError = validateForm(form);
    if (validationError) {
      setError(validationError);
      return;
    }

    const appointmentDate = buildAppointmentDateIso(
      form.appointmentDate,
      form.appointmentTime,
    );
    const age = Number(form.age);

    onSchedule({
      name: form.name,
      visitReason: form.visitReason,
      appointmentDate,
      status: form.status,
      age,
      gender: form.gender,
      phone: form.phone,
      email: form.email,
      vitals: {
        bloodPressure: form.bloodPressure,
        heartRate: form.heartRate,
        temperature: form.temperature,
        oxygenSaturation: form.oxygenSaturation,
      },
    });

    setForm(createEmptyForm());
    setError(null);
    setSuccess("Your appointment has been scheduled successfully.");
  };

  return (
    <div className="space-y-6">
      {/* Appointments List */}
      {appointments.length > 0 && (
        <Card className="rounded-xl border-0 py-5 shadow-sm">
          <CardHeader className="px-5">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <CalendarDays className="size-5 text-primary" />
              Your Appointments
            </CardTitle>
            <CardDescription>
              View and manage your scheduled appointments
            </CardDescription>
          </CardHeader>
          <CardContent className="px-5">
            <DataTable
              columns={appointmentColumns}
              data={appointments}
              emptyMessage="No appointments scheduled."
            />
          </CardContent>
        </Card>
      )}

      {/* Schedule Form */}
      <Card className="rounded-xl border-0 py-5 shadow-sm">
        <CardHeader className="px-5">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <CalendarDays className="size-5 text-primary" />
            Schedule Appointment
          </CardTitle>
          <CardDescription>
            Book a visit and share your current vitals. Your care team will
            review your request before the appointment.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-5">
          <div className="space-y-8">
            <section className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Appointment Details
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <FieldLabel htmlFor="schedule-name">Full name</FieldLabel>
                  <Input
                    id="schedule-name"
                    placeholder="e.g. Jane Doe"
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <FieldLabel htmlFor="schedule-reason">
                    Reason for visit
                  </FieldLabel>
                  <Input
                    id="schedule-reason"
                    placeholder="e.g. Follow-up check-up"
                    value={form.visitReason}
                    onChange={(e) => update("visitReason", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <FieldLabel htmlFor="schedule-date">
                    Appointment date
                  </FieldLabel>
                  <input
                    id="schedule-date"
                    type="date"
                    value={form.appointmentDate}
                    onChange={(e) => update("appointmentDate", e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30"
                  />
                </div>
                <div className="space-y-2">
                  <FieldLabel htmlFor="schedule-time">
                    Appointment time
                  </FieldLabel>
                  <input
                    id="schedule-time"
                    type="time"
                    value={form.appointmentTime}
                    onChange={(e) => update("appointmentTime", e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30"
                  />
                </div>
                <div className="space-y-2">
                  <FieldLabel htmlFor="schedule-age">Age</FieldLabel>
                  <Input
                    id="schedule-age"
                    type="number"
                    min={0}
                    max={120}
                    placeholder="e.g. 45"
                    value={form.age}
                    onChange={(e) => update("age", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <FieldLabel htmlFor="schedule-gender">Gender</FieldLabel>
                  <CustomSelect
                    options={genderOptions}
                    value={form.gender}
                    onChange={(val) => update("gender", val)}
                    placeholder="Select gender"
                  />
                </div>
                <div className="space-y-2">
                  <FieldLabel htmlFor="schedule-phone">Phone number</FieldLabel>
                  <Input
                    id="schedule-phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <FieldLabel htmlFor="schedule-email">Email</FieldLabel>
                  <Input
                    id="schedule-email"
                    type="email"
                    placeholder="you@email.com"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                  />
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Vitals
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <FieldLabel htmlFor="schedule-bp">Blood pressure</FieldLabel>
                  <Input
                    id="schedule-bp"
                    placeholder="120/80"
                    value={form.bloodPressure}
                    onChange={(e) => update("bloodPressure", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <FieldLabel htmlFor="schedule-hr">Heart rate</FieldLabel>
                  <Input
                    id="schedule-hr"
                    placeholder="72"
                    value={form.heartRate}
                    onChange={(e) => update("heartRate", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <FieldLabel htmlFor="schedule-temp">Temperature</FieldLabel>
                  <Input
                    id="schedule-temp"
                    placeholder="36.8"
                    value={form.temperature}
                    onChange={(e) => update("temperature", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <FieldLabel htmlFor="schedule-o2">O₂ saturation</FieldLabel>
                  <Input
                    id="schedule-o2"
                    placeholder="98"
                    value={form.oxygenSaturation}
                    onChange={(e) => update("oxygenSaturation", e.target.value)}
                  />
                </div>
              </div>
            </section>

            {error ? (
              <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            ) : null}

            {success ? (
              <p className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-400">
                {success}
              </p>
            ) : null}

            <div className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarDays className="size-4 shrink-0" />
                Appointments are reviewed by your care team before confirmation.
              </p>
              <Button
                type="button"
                onClick={handleSchedule}
                className="sm:min-w-40"
              >
                <CalendarDays className="size-4" />
                Book Appointment
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
