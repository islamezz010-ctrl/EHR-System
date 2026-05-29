import fs from "fs";

const firstNames = [
  "Emma", "Liam", "Olivia", "Noah", "Ava", "Ethan", "Sophia", "Mason", "Isabella", "William",
  "Mia", "James", "Charlotte", "Benjamin", "Amelia", "Lucas", "Harper", "Henry", "Evelyn", "Alexander",
  "Abigail", "Sebastian", "Emily", "Jack", "Elizabeth", "Aiden", "Sofia", "Owen", "Avery", "Samuel",
  "Ella", "Matthew", "Scarlett", "Joseph", "Grace", "Levi", "Chloe", "Mateo", "Victoria", "David",
  "Riley", "John", "Aria", "Wyatt", "Lily", "Carter", "Aurora", "Julian", "Zoey", "Luke",
  "Penelope", "Grayson", "Layla", "Isaac", "Nora", "Jayden", "Camila", "Theodore", "Hannah", "Gabriel",
  "Lillian", "Anthony", "Addison", "Dylan", "Eleanor", "Leo", "Natalie", "Lincoln", "Luna", "Jaxon",
];

const lastNames = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez",
  "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin",
  "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson",
  "Walker", "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores",
  "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell", "Carter", "Roberts",
  "Gomez", "Phillips", "Evans", "Turner", "Diaz", "Parker", "Cruz", "Edwards", "Collins", "Reyes",
  "Stewart", "Morris", "Murphy", "Cook", "Rogers", "Morgan", "Cooper", "Peterson", "Bailey", "Reed",
];

const visitReasons = [
  "Hypertension Check", "Diabetes Follow-up", "Annual Physical", "Migraine Assessment",
  "Post-Op Follow-up", "Routine Prenatal Check", "Asthma Flare-up", "Cardiology Consult",
  "Dermatology Screening", "Orthopedic Evaluation", "Mental Health Review", "Allergy Testing",
  "Vaccination Update", "Lab Results Review", "Chronic Pain Management", "Sleep Study Follow-up",
  "Nutrition Counseling", "Physical Therapy Referral", "Medication Review", "Wellness Exam",
];

const priorities = ["High", "Normal", "Low"];
const statuses = ["In-Room", "Waiting", "Scheduled"];
const genders = ["Male", "Female", "Non-binary"];
const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const allergies = [
  ["None Reported"], ["Penicillin"], ["Sulfa Drugs"], ["Latex"], ["Peanuts"],
  ["Shellfish"], ["Pollen"], ["Ibuprofen"], ["Seasonal Pollen"],
];
const conditions = [
  [], ["Type 2 Diabetes Mellitus"], ["Essential Hypertension"], ["Chronic Migraine"],
  ["Asthma"], ["Osteoarthritis"], ["Hypothyroidism"], ["Anxiety Disorder"], ["GERD"],
  ["Type 2 Diabetes Mellitus", "Hypertension"], ["Asthma", "Seasonal Allergies"],
];
const meds = [
  ["None"], ["Metformin 1000mg (2x daily)"], ["Lisinopril 20mg (1x daily)"],
  ["Sumatriptan 50mg (As needed)"], ["Albuterol HFA Inhaler (As needed)"],
  ["Atorvastatin 10mg (1x daily)"], ["Prenatal Vitamins (1x daily)"],
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getInitials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const existing = JSON.parse(fs.readFileSync("data/patients.json", "utf8"));
const usedNames = new Set(existing.map((p) => p.name));
const patients = [...existing];

let idx = 8;
while (patients.length < 70) {
  const name = `${pick(firstNames)} ${pick(lastNames)}`;
  if (usedNames.has(name)) continue;
  usedNames.add(name);

  const gender = pick(genders);
  const year = 1945 + Math.floor(Math.random() * 56);
  const month = String(1 + Math.floor(Math.random() * 12)).padStart(2, "0");
  const day = String(1 + Math.floor(Math.random() * 28)).padStart(2, "0");
  const id = `p_${String(idx).padStart(3, "0")}`;
  const reason = pick(visitReasons);
  const hour = 8 + Math.floor(Math.random() * 9);
  const min = [0, 15, 30, 45][Math.floor(Math.random() * 4)];
  const ampm = hour >= 12 ? "PM" : "AM";
  const h12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  const time = `${h12}:${String(min).padStart(2, "0")} ${ampm}`;

  patients.push({
    id,
    name,
    avatar: `https://i.pravatar.cc/150?img=${idx}`,
    currentAppointment: {
      time,
      visitReason: reason,
      priority: pick(priorities),
      status: pick(statuses),
    },
    medicalProfile: {
      dateOfBirth: `${year}-${month}-${day}`,
      gender,
      bloodType: pick(bloodTypes),
      allergies: pick(allergies),
      chronicConditions: pick(conditions),
      currentMedications: pick(meds),
      vitals: {
        bloodPressure: `${105 + Math.floor(Math.random() * 40)}/${65 + Math.floor(Math.random() * 25)} mmHg`,
        heartRate: `${60 + Math.floor(Math.random() * 35)} bpm`,
        temperature: `${(36.2 + Math.random() * 1.2).toFixed(1)}°C`,
        oxygenSaturation: `${95 + Math.floor(Math.random() * 5)}%`,
      },
      recentNotes: `Patient scheduled for ${reason.toLowerCase()}. Stable condition with ongoing monitoring recommended.`,
    },
  });
  idx++;
}

fs.writeFileSync("data/patients.json", JSON.stringify(patients, null, 2));

const monthlyTargets = [
  { month: 0, year: 2026, count: 42 },
  { month: 1, year: 2026, count: 58 },
  { month: 2, year: 2026, count: 71 },
  { month: 3, year: 2026, count: 65 },
  { month: 4, year: 2026, count: 89 },
  { month: 5, year: 2026, count: 52 },
];

const appointments = [];
let aptId = 1;

const todayApts = [
  { patient: "Jonathan Wick", time: "10:30 AM", iso: "2026-05-28T10:30:00", reason: "Hypertension Check", priority: "High", status: "In-Room" },
  { patient: "Sarah Connor", time: "11:00 AM", iso: "2026-05-28T11:00:00", reason: "Diabetes Follow-up", priority: "Normal", status: "Waiting" },
  { patient: "Michael Scott", time: "11:30 AM", iso: "2026-05-28T11:30:00", reason: "Annual Physical", priority: "Low", status: "Scheduled" },
  { patient: "Emily Chen", time: "12:00 PM", iso: "2026-05-28T12:00:00", reason: "Migraine Assessment", priority: "High", status: "Waiting" },
  { patient: "David Miller", time: "1:30 PM", iso: "2026-05-28T13:30:00", reason: "Post-Op Follow-up", priority: "Normal", status: "Scheduled" },
  { patient: "Olivia Taylor", time: "2:15 PM", iso: "2026-05-28T14:15:00", reason: "Routine Prenatal Check", priority: "Normal", status: "Scheduled" },
  { patient: "James Wilson", time: "3:00 PM", iso: "2026-05-28T15:00:00", reason: "Asthma Flare-up", priority: "High", status: "Scheduled" },
];

for (const apt of todayApts) {
  appointments.push({
    id: `apt_${aptId++}`,
    time: apt.time,
    appointmentDateIso: apt.iso,
    patient: apt.patient,
    initials: getInitials(apt.patient),
    reason: apt.reason,
    priority: apt.priority,
    status: apt.status,
  });
}

for (const target of monthlyTargets) {
  for (let i = 0; i < target.count; i++) {
    const patient = pick(patients);
    const day = 1 + Math.floor(Math.random() * 28);
    const hour = 8 + Math.floor(Math.random() * 9);
    const min = [0, 15, 30, 45][Math.floor(Math.random() * 4)];
    const iso = `${target.year}-${String(target.month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}T${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}:00`;
    const ampm = hour >= 12 ? "PM" : "AM";
    const h12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    const time = `${h12}:${String(min).padStart(2, "0")} ${ampm}`;

    appointments.push({
      id: `apt_${aptId++}`,
      time,
      appointmentDateIso: iso,
      patient: patient.name,
      initials: getInitials(patient.name),
      reason: pick(visitReasons),
      priority: pick(priorities),
      status: pick(statuses),
    });
  }
}

fs.writeFileSync("data/appointments.json", JSON.stringify(appointments, null, 2));
console.log(`Generated ${patients.length} patients and ${appointments.length} appointments`);
