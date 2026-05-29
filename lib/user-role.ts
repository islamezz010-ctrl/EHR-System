export type UserRole = "admin" | "staff" | "patient";

export const USER_ROLE_STORAGE_KEY = "medi-dash-user-role";

export const ROLE_OPTIONS: {
  id: UserRole;
  title: string;
  description: string;
}[] = [
  {
    id: "admin",
    title: "Admin",
    description: "Full access to clinic operations, billing, and analytics.",
  },
  {
    id: "staff",
    title: "Nurse / Doctor",
    description: "Clinical workspace, appointments, and patient care tools.",
  },
  {
    id: "patient",
    title: "Patient / Visitor",
    description: "View your records, messages, and appointment information.",
  },
];

export function getStoredRole(): UserRole | null {
  if (typeof window === "undefined") return null;
  const value = sessionStorage.getItem(USER_ROLE_STORAGE_KEY);
  if (value === "admin" || value === "staff" || value === "patient") {
    return value;
  }
  return null;
}

export function setStoredRole(role: UserRole) {
  sessionStorage.setItem(USER_ROLE_STORAGE_KEY, role);
}

export function clearStoredRole() {
  sessionStorage.removeItem(USER_ROLE_STORAGE_KEY);
}

export function getRoleLabel(role: UserRole) {
  return ROLE_OPTIONS.find((option) => option.id === role)?.title ?? role;
}
