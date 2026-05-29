import appointmentsJson from "@/data/appointments.json";
import patientsJson from "@/data/patients.json";

type BasePatient = (typeof patientsJson)[number];

export type Patient = BasePatient & {
  contact: {
    phone: string;
    email: string;
  };
};

export function withDefaultContact(
  patient: BasePatient,
  index: number,
): Patient {
  const first = patient.name.split(" ")[0]?.toLowerCase() ?? "patient";
  return {
    ...patient,
    contact: {
      phone: `+1 (555) ${String(100 + index).padStart(3, "0")}-${String(2000 + index).slice(-4)}`,
      email: `${first}@patientmail.com`,
    },
  };
}

export type AppointmentStatus = "In-Room" | "Waiting" | "Scheduled";

export type Appointment = {
  id: string;
  time: string;
  appointmentDateIso: string;
  patient: string;
  initials: string;
  reason: string;
  priority: "High" | "Normal" | "Low";
  status: AppointmentStatus;
};

export const INITIAL_APPOINTMENTS: Appointment[] = appointmentsJson as Appointment[];

export type NewPatientInput = {
  name: string;
  visitReason: string;
  appointmentDate: string;
  status: AppointmentStatus;
  age: number;
  gender: string;
  phone: string;
  email: string;
  vitals: {
    bloodPressure: string;
    heartRate: string;
    temperature: string;
    oxygenSaturation: string;
  };
};

export function buildAppointmentDateIso(date: string, time: string) {
  if (!date || !time) return "";
  return `${date}T${time}`;
}

export function getAgeFromDob(dob: string) {
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return 0;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return Math.max(0, age);
}

export function ageToDateOfBirth(age: number) {
  const year = new Date().getFullYear() - age;
  return `${year}-06-15`;
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function formatAppointmentTime(isoDate: string) {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatBillingDate(isoDate: string) {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function withVitalUnits(
  vitals: NewPatientInput["vitals"],
): Patient["medicalProfile"]["vitals"] {
  const bp = vitals.bloodPressure.trim();
  const hr = vitals.heartRate.trim();
  const temp = vitals.temperature.trim();
  const o2 = vitals.oxygenSaturation.trim();

  return {
    bloodPressure: bp.includes("mmHg") ? bp : `${bp} mmHg`,
    heartRate: hr.toLowerCase().includes("bpm") ? hr : `${hr} bpm`,
    temperature: temp.includes("°") ? temp : `${temp}°C`,
    oxygenSaturation: o2.includes("%") ? o2 : `${o2}%`,
  };
}

export function createPatientFromInput(
  input: NewPatientInput,
  id: string,
): Patient {
  const time = formatAppointmentTime(input.appointmentDate);

  return {
    id,
    name: input.name.trim(),
    avatar: "",
    currentAppointment: {
      time,
      visitReason: input.visitReason.trim(),
      priority: "Normal",
      status: input.status,
    },
    contact: {
      phone: input.phone.trim(),
      email: input.email.trim(),
    },
    medicalProfile: {
      dateOfBirth: ageToDateOfBirth(input.age),
      gender: input.gender.trim(),
      bloodType: "—",
      allergies: ["None Reported"],
      chronicConditions: [],
      currentMedications: [],
      vitals: withVitalUnits(input.vitals),
      recentNotes: "Patient record created on registration.",
    },
  };
}

export function createAppointmentFromInput(
  input: NewPatientInput,
  id: string,
): Appointment {
  return {
    id,
    time: formatAppointmentTime(input.appointmentDate),
    appointmentDateIso: input.appointmentDate,
    patient: input.name.trim(),
    initials: getInitials(input.name),
    reason: input.visitReason.trim(),
    priority: "Normal",
    status: input.status,
  };
}
