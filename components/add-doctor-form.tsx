"use client";

import { useState } from "react";
import { UserPlus, Stethoscope } from "lucide-react";

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

type FormState = {
  name: string;
  specialization: string;
  fee: string;
  available: string;
  photo: string;
  contact: string;
};

const specializationOptions = [
  { value: "Cardiology", label: "Cardiology" },
  { value: "Dermatology", label: "Dermatology" },
  { value: "Pediatrics", label: "Pediatrics" },
  { value: "Orthopedics", label: "Orthopedics" },
  { value: "Neurology", label: "Neurology" },
  { value: "General", label: "General" },
];

function createEmpty(): FormState {
  return {
    name: "",
    specialization: "",
    fee: "",
    available: "",
    photo: "",
    contact: "",
  };
}

type AddDoctorInput = {
  name: string;
  specialization: string;
  fee: number;
  available: string;
  photo: string;
  contact: string;
};

type Props = {
  onAdd: (input: AddDoctorInput) => void;
};

export function AddDoctorForm({ onAdd }: Props) {
  const [form, setForm] = useState<FormState>(createEmpty);
  const [error, setError] = useState<string | null>(null);

  const update = <K extends keyof FormState>(k: K, v: FormState[K]) => {
    setError(null);
    setForm((p) => ({ ...p, [k]: v }));
  };

  const handleAdd = () => {
    if (!form.name.trim()) return setError("Doctor name is required.");
    if (!form.specialization.trim())
      return setError("Specialization is required.");
    const fee = Number(form.fee) || 0;

    onAdd({
      name: form.name.trim(),
      specialization: form.specialization.trim(),
      fee,
      available: form.available.trim(),
      photo: form.photo.trim(),
      contact: form.contact.trim(),
    });

    setForm(createEmpty());
    setError(null);
  };

  return (
    <Card className="rounded-xl border-0 py-5 shadow-sm">
      <CardHeader className="px-5">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <Stethoscope className="size-5 text-primary" />
          Add Doctor
        </CardTitle>
        <CardDescription>Add a doctor and their availability.</CardDescription>
      </CardHeader>
      <CardContent className="px-5">
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium text-foreground">
                Doctor name
              </label>
              <Input
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="e.g. Dr. Sarah Khan"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Specialization
              </label>
              <CustomSelect
                options={specializationOptions}
                value={form.specialization}
                onChange={(val) => update("specialization", val)}
                placeholder="Select specialization"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Consultation fee
              </label>
              <Input
                value={form.fee}
                onChange={(e) => update("fee", e.target.value)}
                placeholder="e.g. 50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Available times / days
              </label>
              <Input
                value={form.available}
                onChange={(e) => update("available", e.target.value)}
                placeholder="e.g. Mon-Fri 09:00-15:00"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Contact
              </label>
              <Input
                value={form.contact}
                onChange={(e) => update("contact", e.target.value)}
                placeholder="Phone or email"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Photo URL
              </label>
              <Input
                value={form.photo}
                onChange={(e) => update("photo", e.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>

          {error ? (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}

          <div className="flex justify-end">
            <Button onClick={handleAdd}>
              <UserPlus className="size-4" />
              Add Doctor
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export type { AddDoctorInput };
