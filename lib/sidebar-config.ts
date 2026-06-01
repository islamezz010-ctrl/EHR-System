import {
  Activity,
  CalendarDays,
  ChartNoAxesColumn,
  ClipboardList,
  FileText,
  FlaskConical,
  LayoutDashboard,
  MessageSquare,
  Pill,
  Receipt,
  Shield,
  Stethoscope,
  UserPlus,
  UserRound,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

import type { UserRole } from "@/lib/user-role";

export type SidebarNavItem = {
  label: string;
  icon: LucideIcon;
};

const ALL_NAV_ITEMS: SidebarNavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Appointment Queue", icon: ClipboardList },
  { label: "Clinical Workspace", icon: Stethoscope },
  { label: "Billing", icon: Receipt },
  { label: "Analytics", icon: ChartNoAxesColumn },
  { label: "Messages", icon: MessageSquare },
];

const ALL_PATIENT_INFO_ITEMS: SidebarNavItem[] = [
  { label: "Profile", icon: UserRound },
  { label: "Patient Records", icon: UsersRound },
  { label: "Add Patient", icon: UserPlus },
  { label: "Add Doctor", icon: UserPlus },
];

const ALL_MEDICAL_INFO_ITEMS: SidebarNavItem[] = [
  { label: "Medications", icon: Pill },
  { label: "Add Medication", icon: Pill },
  { label: "Medical Records", icon: FileText },
  { label: "Lab Reports", icon: FlaskConical },
  { label: "Insurance", icon: Shield },
  { label: "Medical Bills", icon: Receipt },
];

export type SidebarConfig = {
  navItems: SidebarNavItem[];
  patientInfoItems: SidebarNavItem[];
  medicalInfoItems: SidebarNavItem[];
  showPatientInfoGroup: boolean;
  showMedicalInfoGroup: boolean;
  defaultTab: string;
};

export function getSidebarConfig(role: UserRole): SidebarConfig {
  switch (role) {
    case "admin":
      return {
        navItems: ALL_NAV_ITEMS,
        patientInfoItems: ALL_PATIENT_INFO_ITEMS,
        medicalInfoItems: ALL_MEDICAL_INFO_ITEMS,
        showPatientInfoGroup: true,
        showMedicalInfoGroup: true,
        defaultTab: "Dashboard",
      };
    case "staff":
      return {
        navItems: ALL_NAV_ITEMS.filter(
          (item) =>
            item.label !== "Dashboard" &&
            item.label !== "Analytics" &&
            item.label !== "Billing",
        ),
        patientInfoItems: ALL_PATIENT_INFO_ITEMS.filter(
          (item) => item.label !== "Add Patient",
        ),
        medicalInfoItems: ALL_MEDICAL_INFO_ITEMS,
        showPatientInfoGroup: true,
        showMedicalInfoGroup: true,
        defaultTab: "Appointment Queue",
      };
    case "patient":
      return {
        navItems: [
          { label: "My Profile", icon: UserRound },
          { label: "Schedule", icon: CalendarDays },
          { label: "Book a Doctor", icon: Stethoscope },
          { label: "Bills", icon: Receipt },
        ],
        patientInfoItems: [],
        medicalInfoItems: [
          ...ALL_MEDICAL_INFO_ITEMS.filter(
            (item) =>
              item.label !== "Medical Bills" && item.label !== "Add Medication",
          ),
          { label: "Prescriptions", icon: Pill },
          { label: "Treatment Plans", icon: ClipboardList },
          { label: "Diagnoses", icon: Activity },
        ],
        showPatientInfoGroup: false,
        showMedicalInfoGroup: true,
        defaultTab: "Schedule",
      };
  }
}

export function getAllowedTabs(config: SidebarConfig): Set<string> {
  const tabs = new Set<string>();
  for (const item of config.navItems) tabs.add(item.label);
  for (const item of config.patientInfoItems) tabs.add(item.label);
  for (const item of config.medicalInfoItems) tabs.add(item.label);
  return tabs;
}
