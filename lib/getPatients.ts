import fs from 'fs';
import path from 'path';

export interface PatientRecord {
  id: string;
  name: string;
  avatar: string;
  currentAppointment: {
    time: string;
    visitReason: string;
    priority: 'High' | 'Normal' | 'Low';
    status: 'In-Room' | 'Waiting' | 'Scheduled';
  };
  medicalProfile: {
    dateOfBirth: string;
    gender: string;
    bloodType: string;
    allergies: string[];
    chronicConditions: string[];
    currentMedications: string[];
    vitals: {
      bloodPressure: string;
      heartRate: string;
      temperature: string;
      oxygenSaturation: string;
    };
    recentNotes: string;
  };
}

export function getLocalPatients(): PatientRecord[] {
  // Find the exact path to the json file from the project root
  const filePath = path.join(process.cwd(), 'data', 'patients.json');
  const jsonData = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(jsonData);
}