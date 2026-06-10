"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CustomSelect } from "@/components/ui/custom-select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import doctorsData from "@/data/doctors.json";

export type Doctor = {
  id: string;
  name: string;
  specialization: string;
  photo: string;
  fee: number;
  available: string;
};

type BookingInput = {
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  visitReason: string;
  specialization: string;
  fee: number;
};

type Props = {
  doctors?: Doctor[];
  onBook?: (input: BookingInput) => void;
};

export function BookDoctor({
  doctors = doctorsData as Doctor[],
  onBook,
}: Props) {
  const [query, setQuery] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [bookingForm, setBookingForm] = useState({
    date: "",
    time: "",
    visitReason: "",
  });

  const specializations = useMemo(() => {
    return Array.from(new Set(doctors.map((d) => d.specialization)));
  }, [doctors]);

  const specializationOptions = useMemo(() => {
    const opts = [{ value: "", label: "All specializations" }];
    specializations.forEach((s) => {
      opts.push({ value: s, label: s });
    });
    return opts;
  }, [specializations]);

  const filtered = useMemo(() => {
    return doctors.filter((d) => {
      if (specialization && d.specialization !== specialization) return false;
      if (query && !d.name.toLowerCase().includes(query.toLowerCase()))
        return false;
      return true;
    });
  }, [doctors, specialization, query]);

  const handleBookClick = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
  };

  const handleConfirmBooking = () => {
    if (!selectedDoctor || !bookingForm.date || !bookingForm.time) {
      alert("Please fill in all fields");
      return;
    }

    onBook?.({
      doctorId: selectedDoctor.id,
      doctorName: selectedDoctor.name,
      date: bookingForm.date,
      time: bookingForm.time,
      visitReason:
        bookingForm.visitReason || `Consultation with ${selectedDoctor.name}`,
      specialization: selectedDoctor.specialization,
      fee: selectedDoctor.fee,
    });

    setSelectedDoctor(null);
    setBookingForm({ date: "", time: "", visitReason: "" });
  };

  return (
    <>
      <Card className="rounded-xl border-0 py-5 shadow-sm">
        <CardHeader className="px-5">
          <CardTitle className="text-lg font-semibold">Book a Doctor</CardTitle>
        </CardHeader>
        <CardContent className="px-5">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Input
              placeholder="Search doctor name"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <CustomSelect
              options={specializationOptions}
              value={specialization}
              onChange={setSpecialization}
              placeholder="All specializations"
              className="sm:w-56 min-w-[200px]"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {filtered.map((d) => (
              <div
                key={d.id}
                className="flex items-center gap-4 rounded-md border p-3"
              >
                <img
                  src={d.photo}
                  alt={d.name}
                  className="size-14 rounded-md object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="truncate font-medium">{d.name}</h4>
                    <div className="text-sm text-muted-foreground">
                      ${d.fee}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {d.specialization} • {d.available}
                  </p>
                  <div className="mt-3">
                    <Button size="sm" onClick={() => handleBookClick(d)}>
                      Book
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No doctors match your search.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Booking Dialog */}
      <Dialog
        open={!!selectedDoctor}
        onOpenChange={(open) => !open && setSelectedDoctor(null)}
      >
        <DialogContent className="sm:max-w-md">
          {selectedDoctor && (
            <>
              <DialogHeader>
                <DialogTitle>Book Appointment</DialogTitle>
                <DialogDescription>
                  {selectedDoctor.name} - {selectedDoctor.specialization}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Appointment Date
                  </label>
                  <input
                    type="date"
                    value={bookingForm.date}
                    onChange={(e) =>
                      setBookingForm((p) => ({ ...p, date: e.target.value }))
                    }
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Time</label>
                  <input
                    type="time"
                    value={bookingForm.time}
                    onChange={(e) =>
                      setBookingForm((p) => ({ ...p, time: e.target.value }))
                    }
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Reason for visit
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Regular checkup"
                    value={bookingForm.visitReason}
                    onChange={(e) =>
                      setBookingForm((p) => ({
                        ...p,
                        visitReason: e.target.value,
                      }))
                    }
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                  />
                </div>

                <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-800">
                  <p className="text-xs text-muted-foreground">
                    Consultation Fee
                  </p>
                  <p className="text-lg font-semibold">${selectedDoctor.fee}</p>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedDoctor(null)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleConfirmBooking} className="flex-1">
                    Confirm Booking
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export type { BookingInput };

export default BookDoctor;
