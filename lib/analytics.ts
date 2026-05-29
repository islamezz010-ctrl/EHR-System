import type { Appointment, Patient } from "@/lib/clinical-types";
import { getAgeFromDob } from "@/lib/clinical-types";

export type VisitRecord = {
  id: string;
  patientId: string;
  patientName: string;
  visitDateIso: string;
  visitReason: string;
  age: number;
  gender: string;
};

export type AnalyticsFilters = {
  dateFrom: string;
  dateTo: string;
  visitReason: string;
  ageMin: string;
  ageMax: string;
  gender: string;
};

export function buildVisitRecords(
  patients: Patient[],
  appointments: Appointment[],
): VisitRecord[] {
  const patientByName = new Map(patients.map((p) => [p.name, p]));

  return appointments
    .map((apt) => {
      const patient = patientByName.get(apt.patient);
      if (!patient || !apt.appointmentDateIso) return null;

      return {
        id: apt.id,
        patientId: patient.id,
        patientName: apt.patient,
        visitDateIso: apt.appointmentDateIso,
        visitReason: apt.reason,
        age: getAgeFromDob(patient.medicalProfile.dateOfBirth),
        gender: patient.medicalProfile.gender,
      };
    })
    .filter((v): v is VisitRecord => v !== null);
}

export function getUniqueVisitReasons(visits: VisitRecord[]) {
  return [...new Set(visits.map((v) => v.visitReason))].sort();
}

export function getUniqueGenders(visits: VisitRecord[]) {
  return [...new Set(visits.map((v) => v.gender))].sort();
}

export function getDefaultDateRange(visits: VisitRecord[]) {
  if (visits.length === 0) {
    const today = new Date();
    const from = new Date(today);
    from.setMonth(from.getMonth() - 3);
    return {
      dateFrom: from.toISOString().slice(0, 10),
      dateTo: today.toISOString().slice(0, 10),
    };
  }

  const timestamps = visits.map((v) => new Date(v.visitDateIso).getTime());
  const min = new Date(Math.min(...timestamps));
  const max = new Date(Math.max(...timestamps));
  return {
    dateFrom: min.toISOString().slice(0, 10),
    dateTo: max.toISOString().slice(0, 10),
  };
}

export function filterVisits(
  visits: VisitRecord[],
  filters: AnalyticsFilters,
): VisitRecord[] {
  const fromTime = new Date(`${filters.dateFrom}T00:00:00`).getTime();
  const toTime = new Date(`${filters.dateTo}T23:59:59`).getTime();
  const minAge = filters.ageMin ? Number(filters.ageMin) : null;
  const maxAge = filters.ageMax ? Number(filters.ageMax) : null;

  return visits.filter((visit) => {
    const visitTime = new Date(visit.visitDateIso).getTime();
    if (visitTime < fromTime || visitTime > toTime) return false;
    if (filters.visitReason !== "all" && visit.visitReason !== filters.visitReason) {
      return false;
    }
    if (filters.gender !== "all" && visit.gender !== filters.gender) {
      return false;
    }
    if (minAge !== null && !Number.isNaN(minAge) && visit.age < minAge) {
      return false;
    }
    if (maxAge !== null && !Number.isNaN(maxAge) && visit.age > maxAge) {
      return false;
    }
    return true;
  });
}
