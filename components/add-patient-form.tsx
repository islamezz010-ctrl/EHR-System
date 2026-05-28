"use client";

import { useState } from "react";
import { CalendarDays, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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

type AddPatientFormProps = {
  onAdd: (input: NewPatientInput) => void;
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
  if (!form.name.trim()) return "Patient name is required.";
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

export function AddPatientForm({ onAdd }: AddPatientFormProps) {
  const [form, setForm] = useState<FormState>(createEmptyForm);
  const [error, setError] = useState<string | null>(null);

  const update = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setError(null);
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAdd = () => {
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

    onAdd({
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
  };

  return (
    <Card className="rounded-xl border-0 py-5 shadow-sm">
      <CardHeader className="px-5">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <UserPlus className="size-5 text-primary" />
          Register New Patient
        </CardTitle>
        <CardDescription>
          Add appointment details and vitals. The patient will appear in the
          appointment queue immediately after you submit.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-5">
        <div className="space-y-8">
          <section className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Patient &amp; Visit
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <FieldLabel htmlFor="patient-name">Patient name</FieldLabel>
                <Input
                  id="patient-name"
                  placeholder="e.g. Jane Doe"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <FieldLabel htmlFor="visit-reason">Visit reason</FieldLabel>
                <Input
                  id="visit-reason"
                  placeholder="e.g. Annual check-up"
                  value={form.visitReason}
                  onChange={(e) => update("visitReason", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <FieldLabel htmlFor="age">Age</FieldLabel>
                <Input
                  id="age"
                  type="number"
                  min={0}
                  max={120}
                  placeholder="e.g. 45"
                  value={form.age}
                  onChange={(e) => update("age", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <FieldLabel htmlFor="gender">Gender</FieldLabel>
                <select
                  id="gender"
                  value={form.gender}
                  onChange={(e) => update("gender", e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-binary">Non-binary</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
              <div className="space-y-2">
                <FieldLabel htmlFor="status">Status</FieldLabel>
                <select
                  id="status"
                  value={form.status}
                  onChange={(e) =>
                    update("status", e.target.value as AppointmentStatus)
                  }
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                  <option value="Scheduled">Scheduled</option>
                  <option value="Waiting">Waiting</option>
                  <option value="In-Room">In-Room</option>
                </select>
              </div>
              <div className="space-y-2">
                <FieldLabel htmlFor="appointment-date">Appointment date</FieldLabel>
                <input
                  id="appointment-date"
                  type="date"
                  value={form.appointmentDate}
                  onChange={(e) => update("appointmentDate", e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30"
                />
              </div>
              <div className="space-y-2">
                <FieldLabel htmlFor="appointment-time">Appointment time</FieldLabel>
                <input
                  id="appointment-time"
                  type="time"
                  value={form.appointmentTime}
                  onChange={(e) => update("appointmentTime", e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30"
                />
              </div>
              <div className="space-y-2">
                <FieldLabel htmlFor="phone">Phone number</FieldLabel>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="patient@email.com"
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
                <FieldLabel htmlFor="blood-pressure">Blood pressure</FieldLabel>
                <Input
                  id="blood-pressure"
                  placeholder="120/80"
                  value={form.bloodPressure}
                  onChange={(e) => update("bloodPressure", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <FieldLabel htmlFor="heart-rate">Heart rate</FieldLabel>
                <Input
                  id="heart-rate"
                  placeholder="72"
                  value={form.heartRate}
                  onChange={(e) => update("heartRate", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <FieldLabel htmlFor="temperature">Temperature</FieldLabel>
                <Input
                  id="temperature"
                  placeholder="36.8"
                  value={form.temperature}
                  onChange={(e) => update("temperature", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <FieldLabel htmlFor="oxygen">O₂ saturation</FieldLabel>
                <Input
                  id="oxygen"
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

          <div className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarDays className="size-4 shrink-0" />
              New entries are added to the appointment queue with Normal priority.
            </p>
            <Button
              type="button"
              onClick={handleAdd}
              className="sm:min-w-36"
            >
              <UserPlus className="size-4" />
              Add Patient
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
