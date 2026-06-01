"use client";

import {
  Suspense,
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { useTheme } from "next-themes";
import {
  Activity,
  AlarmClock,
  Bell,
  CalendarDays,
  ChartNoAxesColumn,
  ChevronLeft,
  ChevronRight,
  FileText,
  Menu,
  X,
  CircleDollarSign,
  ClipboardList,
  Receipt,
  Droplets,
  Eye,
  Filter,
  Heart,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  MoreVertical,
  Pill,
  Search,
  Settings,
  ShieldAlert,
  Stethoscope,
  Thermometer,
  UserPlus,
  UserRound,
  UsersRound,
  Wind,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AddPatientForm } from "@/components/add-patient-form";
import { AddMedicationForm } from "@/components/add-medication-form";
import { AddDoctorForm } from "@/components/add-doctor-form";
import { BookDoctor, type BookingInput } from "@/components/book-doctor";
import { PatientBillsPanel } from "@/components/patient-bills-panel";
import { ScheduleAppointmentForm } from "@/components/schedule-appointment-form";
import { PatientAnalytics } from "@/components/patient-analytics";
import { DataTable } from "@/components/data-table";
import { PatientBilling } from "@/components/patient-billing";
import { PatientMedicalBills } from "@/components/patient-medical-bills";
import { PatientMedicalRecords } from "@/components/patient-medical-records";
import { PatientMedications } from "@/components/patient-medications";
import { MessagesPanel } from "@/components/messages-panel";
import { PatientProfile } from "@/components/patient-profile";
import { PatientLabReports } from "@/components/patient-lab-reports";
import { PatientInsurance } from "@/components/patient-insurance";
import { PatientPrescriptions } from "@/components/patient-prescriptions";
import { PatientTreatmentPlans } from "@/components/patient-treatment-plans";
import { PatientDiagnoses } from "@/components/patient-diagnoses";
import { SidebarNavGroup } from "@/components/sidebar-nav-group";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  INITIAL_BILLINGS,
  createBillingFromVisit,
  type BillingRecord,
} from "@/lib/billing";
import {
  INITIAL_MEDICAL_BILLS,
  type MedicalBillRecord,
} from "@/lib/medical-bills";
import {
  INITIAL_MEDICAL_RECORDS,
  type MedicalRecordEntry,
} from "@/lib/medical-records";
import {
  INITIAL_MEDICATIONS,
  createMedicationFromInput,
  formatMedicationSummary,
  type NewMedicationInput,
  type MedicationRecord,
} from "@/lib/medications";
import {
  type Appointment,
  type NewPatientInput,
  type Patient,
  INITIAL_APPOINTMENTS,
  createAppointmentFromInput,
  createPatientFromInput,
  formatBillingDate,
  getAgeFromDob,
  getInitials,
  withDefaultContact,
} from "@/lib/clinical-types";
import { cn } from "@/lib/utils";
import {
  clearStoredRole,
  getRoleLabel,
  getStoredRole,
  type UserRole,
} from "@/lib/user-role";
import {
  INITIAL_PATIENT_BILLS,
  markBillsPaid,
  type PatientBill,
} from "@/lib/patient-bills";
import { getAllowedTabs, getSidebarConfig } from "@/lib/sidebar-config";
import patientsData from "@/data/patients.json";
import doctorsData from "@/data/doctors.json";

const stats = [
  {
    title: "Scheduled Visits",
    value: "12 Today",
    detail: "3 Completed, 9 Remaining",
    icon: CalendarDays,
    className:
      "bg-emerald-50 dark:bg-emerald-950/20 text-gray-900 dark:text-gray-100",
    iconClassName:
      "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-450",
  },
  {
    title: "AI Insights",
    value: "5 Critical Patient",
    detail: "Requires immediate attention",
    icon: UsersRound,
    className:
      "bg-cyan-50 dark:bg-cyan-950/20 text-gray-900 dark:text-gray-100",
    iconClassName:
      "bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-450",
  },
  {
    title: "Average Wait Time",
    value: "14 mins",
    detail: "2 mins faster than average",
    icon: AlarmClock,
    className:
      "bg-violet-50 dark:bg-violet-950/20 text-gray-900 dark:text-gray-100",
    iconClassName:
      "bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-450",
  },
  {
    title: "Revenue Status",
    value: "$4,250",
    detail: "Pending Claims",
    icon: CircleDollarSign,
    className:
      "bg-rose-50 dark:bg-rose-950/20 text-gray-900 dark:text-gray-100",
    iconClassName:
      "bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-450",
  },
];

const consultationMonths = [
  { month: "Jan", withAi: 14, withoutAi: 20 },
  { month: "Feb", withAi: 20, withoutAi: 26 },
  { month: "Mar", withAi: 24, withoutAi: 22 },
  { month: "Apr", withAi: 18, withoutAi: 16 },
  { month: "May", withAi: 13, withoutAi: 25 },
  { month: "Jun", withAi: 25, withoutAi: 17, active: true },
  { month: "Jul", withAi: 24, withoutAi: 23 },
  { month: "Aug", withAi: 20, withoutAi: 18 },
  { month: "Sep", withAi: 18, withoutAi: 27 },
  { month: "Oct", withAi: 22, withoutAi: 16 },
  { month: "Nov", withAi: 19, withoutAi: 26 },
  { month: "Dec", withAi: 23, withoutAi: 27 },
];

function PriorityDot({ priority }: { priority: string }) {
  return (
    <span
      className={cn(
        "inline-block size-2 rounded-full",
        priority === "High" && "bg-rose-500",
        priority === "Normal" && "bg-gray-900",
        priority === "Low" && "bg-gray-200",
      )}
    />
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "border-0 px-2.5",
        status === "In-Room" && "bg-emerald-100 text-emerald-700",
        status === "Waiting" && "bg-rose-100 text-rose-700",
        status === "Scheduled" && "bg-blue-100 text-blue-700",
      )}
    >
      {status}
    </Badge>
  );
}

const avatarColors = [
  { bg: "bg-violet-100", text: "text-violet-700" },
  { bg: "bg-amber-100", text: "text-amber-700" },
  { bg: "bg-emerald-100", text: "text-emerald-700" },
  { bg: "bg-rose-100", text: "text-rose-700" },
  { bg: "bg-sky-100", text: "text-sky-700" },
];

function PatientRecords({ patients }: { patients: Patient[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const filteredPatients = useMemo(() => {
    let result = patients;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.currentAppointment.visitReason.toLowerCase().includes(q) ||
          p.medicalProfile.chronicConditions.some((c) =>
            c.toLowerCase().includes(q),
          ),
      );
    }
    if (statusFilter) {
      result = result.filter(
        (p) => p.currentAppointment.status === statusFilter,
      );
    }
    return result;
  }, [searchQuery, statusFilter, patients]);

  const statuses = [
    ...new Set(patients.map((p) => p.currentAppointment.status)),
  ];

  const columns = useMemo<ColumnDef<Patient>[]>(
    () => [
      {
        id: "patient",
        header: "Patient",
        cell: ({ row }) => {
          const index = patients.findIndex((p) => p.id === row.original.id);
          const color = avatarColors[index % avatarColors.length];
          return (
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "grid size-9 shrink-0 place-items-center rounded-full text-xs font-bold dark:bg-opacity-20",
                  color.bg,
                  color.text,
                )}
              >
                {getInitials(row.original.name)}
              </span>
              <div className="min-w-0">
                <p className="truncate font-medium text-gray-950 dark:text-gray-50">
                  {row.original.name}
                </p>
                <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                  {row.original.medicalProfile.gender},{" "}
                  {getAgeFromDob(row.original.medicalProfile.dateOfBirth)}y •{" "}
                  {row.original.medicalProfile.bloodType}
                </p>
              </div>
            </div>
          );
        },
      },
      {
        id: "appointment",
        header: "Appointment",
        cell: ({ row }) => row.original.currentAppointment.time,
      },
      {
        id: "visitReason",
        header: "Visit Reason",
        cell: ({ row }) => (
          <span className="max-w-[160px] truncate">
            {row.original.currentAppointment.visitReason}
          </span>
        ),
      },
      {
        id: "priority",
        header: "Priority",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <PriorityDot priority={row.original.currentAppointment.priority} />
            <span>{row.original.currentAppointment.priority}</span>
          </div>
        ),
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => (
          <StatusBadge status={row.original.currentAppointment.status} />
        ),
      },
      {
        id: "vitals",
        header: "Key Vitals",
        cell: ({ row }) => (
          <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <Heart className="size-3 text-rose-400" />
              {row.original.medicalProfile.vitals.heartRate}
            </span>
            <span className="flex items-center gap-1">
              <Droplets className="size-3 text-blue-400" />
              {row.original.medicalProfile.vitals.bloodPressure.split(" ")[0]}
            </span>
          </div>
        ),
      },
      {
        id: "actions",
        header: () => <span className="block text-right">Actions</span>,
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              className="bg-white dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
              onClick={() => setSelectedPatient(row.original)}
            >
              <Eye className="size-4" />
              View Profile
            </Button>
          </div>
        ),
      },
    ],
    [patients],
  );

  return (
    <>
      <Card className="rounded-xl border-0 py-5 shadow-sm">
        <CardHeader className="gap-4 px-5 md:grid-cols-[1fr_auto]">
          <CardTitle className="text-lg font-semibold">
            Patient Records
          </CardTitle>
          <CardAction className="flex w-full flex-col gap-2 md:w-auto md:flex-row">
            <div className="relative md:w-56">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-500" />
              <Input
                placeholder="Search patients…"
                className="bg-white dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 pl-9 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="relative">
              <Button
                variant="outline"
                className="bg-white dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
                onClick={() => setFilterOpen(!filterOpen)}
              >
                <Filter className="size-4" />
                Filter
              </Button>
              {filterOpen && (
                <div className="absolute right-0 top-10 z-10 w-48 overflow-hidden rounded-md bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 py-1 shadow-lg ring-1 ring-gray-200 dark:ring-transparent">
                  <button
                    onClick={() => {
                      setStatusFilter(null);
                      setFilterOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-750 text-gray-700 dark:text-gray-200 cursor-pointer",
                      statusFilter === null &&
                        "bg-gray-100 dark:bg-gray-700 font-medium",
                    )}
                  >
                    All Statuses
                  </button>
                  {statuses.map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        setStatusFilter(s);
                        setFilterOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-750 text-gray-700 dark:text-gray-200 cursor-pointer",
                        statusFilter === s &&
                          "bg-gray-100 dark:bg-gray-700 font-medium",
                      )}
                    >
                      <span
                        className={cn(
                          "size-2 rounded-full",
                          s === "In-Room" && "bg-emerald-500",
                          s === "Waiting" && "bg-rose-500",
                          s === "Scheduled" && "bg-blue-500",
                        )}
                      />
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </CardAction>
        </CardHeader>
        <CardContent className="px-5">
          <DataTable
            columns={columns}
            data={filteredPatients}
            searchValue={searchQuery}
            emptyMessage="No patients found matching your search."
          />
          <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4 text-sm text-gray-500">
            <span>
              Showing {filteredPatients.length} of {patients.length} patients
            </span>
            <div className="flex items-center gap-1">
              {statuses.map((s) => {
                const count = patients.filter(
                  (p) => p.currentAppointment.status === s,
                ).length;
                return (
                  <Badge
                    key={s}
                    variant="outline"
                    className={cn(
                      "border-0 px-2",
                      s === "In-Room" && "bg-emerald-50 text-emerald-700",
                      s === "Waiting" && "bg-rose-50 text-rose-700",
                      s === "Scheduled" && "bg-blue-50 text-blue-700",
                    )}
                  >
                    {count} {s}
                  </Badge>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Patient Detail Dialog */}
      <Dialog
        open={!!selectedPatient}
        onOpenChange={(open) => !open && setSelectedPatient(null)}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          {selectedPatient && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-4">
                  <span
                    className={cn(
                      "grid size-14 shrink-0 place-items-center rounded-full text-lg font-bold",
                      avatarColors[
                        patients.findIndex((p) => p.id === selectedPatient.id) %
                          avatarColors.length
                      ].bg,
                      avatarColors[
                        patients.findIndex((p) => p.id === selectedPatient.id) %
                          avatarColors.length
                      ].text,
                    )}
                  >
                    {getInitials(selectedPatient.name)}
                  </span>
                  <div>
                    <DialogTitle className="text-xl">
                      {selectedPatient.name}
                    </DialogTitle>
                    <DialogDescription className="mt-1">
                      {selectedPatient.medicalProfile.gender} •{" "}
                      {getAgeFromDob(
                        selectedPatient.medicalProfile.dateOfBirth,
                      )}{" "}
                      years old • Blood Type:{" "}
                      {selectedPatient.medicalProfile.bloodType}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              {/* Vitals Grid */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-lg bg-rose-50 dark:bg-rose-950/20 p-3">
                  <div className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-450">
                    <Droplets className="size-3.5" />
                    Blood Pressure
                  </div>
                  <p className="mt-1 text-sm font-semibold text-rose-900 dark:text-rose-200">
                    {selectedPatient.medicalProfile.vitals.bloodPressure}
                  </p>
                </div>
                <div className="rounded-lg bg-violet-50 dark:bg-violet-950/20 p-3">
                  <div className="flex items-center gap-1.5 text-xs text-violet-600 dark:text-violet-450">
                    <Heart className="size-3.5" />
                    Heart Rate
                  </div>
                  <p className="mt-1 text-sm font-semibold text-violet-900 dark:text-violet-200">
                    {selectedPatient.medicalProfile.vitals.heartRate}
                  </p>
                </div>
                <div className="rounded-lg bg-amber-50 dark:bg-amber-950/20 p-3">
                  <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-450">
                    <Thermometer className="size-3.5" />
                    Temperature
                  </div>
                  <p className="mt-1 text-sm font-semibold text-amber-900 dark:text-amber-200">
                    {selectedPatient.medicalProfile.vitals.temperature}
                  </p>
                </div>
                <div className="rounded-lg bg-sky-50 dark:bg-sky-950/20 p-3">
                  <div className="flex items-center gap-1.5 text-xs text-sky-600 dark:text-sky-450">
                    <Wind className="size-3.5" />
                    O₂ Saturation
                  </div>
                  <p className="mt-1 text-sm font-semibold text-sky-900 dark:text-sky-200">
                    {selectedPatient.medicalProfile.vitals.oxygenSaturation}
                  </p>
                </div>
              </div>

              {/* Info Sections */}
              <div className="space-y-4">
                {/* Current Appointment */}
                <div className="rounded-lg border border-gray-100 dark:border-gray-800 p-4">
                  <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
                    <CalendarDays className="size-4 text-[#3d3bdc] dark:text-indigo-400" />
                    Current Appointment
                  </h4>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-350">
                    <span>{selectedPatient.currentAppointment.time}</span>
                    <span className="text-gray-300 dark:text-gray-700">•</span>
                    <span>
                      {selectedPatient.currentAppointment.visitReason}
                    </span>
                    <span className="text-gray-300 dark:text-gray-700">•</span>
                    <StatusBadge
                      status={selectedPatient.currentAppointment.status}
                    />
                  </div>
                </div>

                {/* Allergies */}
                <div className="rounded-lg border border-gray-100 dark:border-gray-800 p-4">
                  <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
                    <ShieldAlert className="size-4 text-rose-500" />
                    Allergies
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedPatient.medicalProfile.allergies.map((allergy) => (
                      <Badge
                        key={allergy}
                        variant="outline"
                        className={cn(
                          "border-0 px-2.5 py-1",
                          allergy === "None Reported"
                            ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-450"
                            : "bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-450",
                        )}
                      >
                        {allergy}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Chronic Conditions */}
                <div className="rounded-lg border border-gray-100 dark:border-gray-800 p-4">
                  <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
                    <Activity className="size-4 text-amber-500" />
                    Chronic Conditions
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedPatient.medicalProfile.chronicConditions.map(
                      (condition) => (
                        <Badge
                          key={condition}
                          variant="outline"
                          className="border-0 bg-amber-50 dark:bg-amber-950/20 px-2.5 py-1 text-amber-700 dark:text-amber-450"
                        >
                          {condition}
                        </Badge>
                      ),
                    )}
                  </div>
                </div>

                {/* Current Medications */}
                <div className="rounded-lg border border-gray-100 dark:border-gray-800 p-4">
                  <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
                    <Pill className="size-4 text-[#3d3bdc] dark:text-indigo-400" />
                    Current Medications
                  </h4>
                  <ul className="space-y-1.5">
                    {selectedPatient.medicalProfile.currentMedications.map(
                      (med) => (
                        <li
                          key={med}
                          className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-350"
                        >
                          <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[#3d3bdc] dark:bg-indigo-400" />
                          {med}
                        </li>
                      ),
                    )}
                  </ul>
                </div>

                {/* Clinical Notes */}
                <div className="rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 p-4">
                  <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
                    <ClipboardList className="size-4 text-gray-500" />
                    Recent Clinical Notes
                  </h4>
                  <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-350">
                    {selectedPatient.medicalProfile.recentNotes}
                  </p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function AppointmentQueue({
  appointments,
  patients,
}: {
  appointments: Appointment[];
  patients: Patient[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);

  const selectedPatient = useMemo(() => {
    if (!selectedAppointment) return null;
    return patients.find((p) => p.name === selectedAppointment.patient) ?? null;
  }, [selectedAppointment, patients]);

  const filteredAppointments = useMemo(() => {
    let result = appointments;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (appointment) =>
          appointment.patient.toLowerCase().includes(query) ||
          appointment.reason.toLowerCase().includes(query) ||
          appointment.time.toLowerCase().includes(query) ||
          appointment.priority.toLowerCase().includes(query) ||
          appointment.status.toLowerCase().includes(query),
      );
    }

    // Apply status filter
    if (statusFilter) {
      result = result.filter(
        (appointment) => appointment.status === statusFilter,
      );
    }

    return result;
  }, [searchQuery, statusFilter, appointments]);

  const columns = useMemo<ColumnDef<Appointment>[]>(
    () => [
      {
        id: "select",
        header: () => (
          <span className="block size-4 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800" />
        ),
        cell: () => (
          <span className="block size-4 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800" />
        ),
      },
      { accessorKey: "time", header: "Time" },
      {
        id: "patient",
        header: "Patient Name",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <span className="grid size-7 place-items-center rounded-full bg-amber-100 dark:bg-amber-950/40 text-[10px] font-bold text-amber-800 dark:text-amber-400">
              {row.original.initials}
            </span>
            <span className="text-gray-950 dark:text-gray-200">
              {row.original.patient}
            </span>
          </div>
        ),
      },
      { accessorKey: "reason", header: "Visit Reason" },
      {
        id: "priority",
        header: "Priority",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <PriorityDot priority={row.original.priority} />
            {row.original.priority}
          </div>
        ),
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        id: "actions",
        header: () => <span className="block text-right">Actions</span>,
        cell: ({ row }) => (
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              className="bg-white dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
              onClick={() => setSelectedAppointment(row.original)}
            >
              <ClipboardList className="size-4" />
              View Record
            </Button>
            <Button size="sm" className="bg-teal-500 hover:bg-teal-600">
              <UserRound className="size-4" />
              Start Session
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <>
      <Card className="rounded-xl border-0 py-5 shadow-sm">
        <CardHeader className="gap-4 px-5 md:grid-cols-[1fr_auto]">
          <CardTitle className="text-lg font-semibold">
            Appointment Queue
          </CardTitle>
          <CardAction className="flex w-full flex-col gap-2 md:w-auto md:flex-row">
            <div className="relative md:w-56">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-500" />
              <Input
                placeholder="Search"
                className="bg-white dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 pl-9 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="relative">
              <Button
                variant="outline"
                className="bg-white dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
                onClick={() => setFilterOpen(!filterOpen)}
              >
                <Filter className="size-4" />
                Filter
              </Button>
              {filterOpen && (
                <div className="absolute right-0 top-10 z-10 w-48 overflow-hidden rounded-md bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 py-1 shadow-lg ring-1 ring-gray-200 dark:ring-transparent">
                  <button
                    onClick={() => {
                      setStatusFilter(null);
                      setFilterOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-750 text-gray-700 dark:text-gray-200 cursor-pointer",
                      statusFilter === null &&
                        "bg-gray-100 dark:bg-gray-700 font-medium",
                    )}
                  >
                    All Statuses
                  </button>
                  <button
                    onClick={() => {
                      setStatusFilter("In-Room");
                      setFilterOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-750 text-gray-700 dark:text-gray-200 cursor-pointer",
                      statusFilter === "In-Room" &&
                        "bg-gray-100 dark:bg-gray-700 font-medium",
                    )}
                  >
                    <span className="size-2 rounded-full bg-emerald-500" />
                    In-Room
                  </button>
                  <button
                    onClick={() => {
                      setStatusFilter("Waiting");
                      setFilterOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-750 text-gray-700 dark:text-gray-200 cursor-pointer",
                      statusFilter === "Waiting" &&
                        "bg-gray-100 dark:bg-gray-700 font-medium",
                    )}
                  >
                    <span className="size-2 rounded-full bg-rose-500" />
                    Waiting
                  </button>
                  <button
                    onClick={() => {
                      setStatusFilter("Scheduled");
                      setFilterOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-750 text-gray-700 dark:text-gray-200 cursor-pointer",
                      statusFilter === "Scheduled" &&
                        "bg-gray-100 dark:bg-gray-700 font-medium",
                    )}
                  >
                    <span className="size-2 rounded-full bg-blue-500" />
                    Scheduled
                  </button>
                </div>
              )}
            </div>
          </CardAction>
        </CardHeader>
        <CardContent className="px-5">
          <DataTable
            columns={columns}
            data={filteredAppointments}
            searchValue={searchQuery}
            emptyMessage="No appointments found matching your search."
          />
        </CardContent>
      </Card>

      <Dialog
        open={!!selectedAppointment}
        onOpenChange={(open) => !open && setSelectedAppointment(null)}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          {selectedAppointment && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">
                  {selectedAppointment.patient}
                </DialogTitle>
                <DialogDescription>
                  {selectedAppointment.time} • {selectedAppointment.reason} •{" "}
                  <StatusBadge status={selectedAppointment.status} />
                </DialogDescription>
              </DialogHeader>

              {selectedPatient ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="rounded-lg bg-rose-50 dark:bg-rose-950/20 p-3">
                      <div className="flex items-center gap-1.5 text-xs text-rose-600">
                        <Droplets className="size-3.5" />
                        Blood Pressure
                      </div>
                      <p className="mt-1 text-sm font-semibold">
                        {selectedPatient.medicalProfile.vitals.bloodPressure}
                      </p>
                    </div>
                    <div className="rounded-lg bg-violet-50 dark:bg-violet-950/20 p-3">
                      <div className="flex items-center gap-1.5 text-xs text-violet-600">
                        <Heart className="size-3.5" />
                        Heart Rate
                      </div>
                      <p className="mt-1 text-sm font-semibold">
                        {selectedPatient.medicalProfile.vitals.heartRate}
                      </p>
                    </div>
                    <div className="rounded-lg bg-amber-50 dark:bg-amber-950/20 p-3">
                      <div className="flex items-center gap-1.5 text-xs text-amber-600">
                        <Thermometer className="size-3.5" />
                        Temperature
                      </div>
                      <p className="mt-1 text-sm font-semibold">
                        {selectedPatient.medicalProfile.vitals.temperature}
                      </p>
                    </div>
                    <div className="rounded-lg bg-sky-50 dark:bg-sky-950/20 p-3">
                      <div className="flex items-center gap-1.5 text-xs text-sky-600">
                        <Wind className="size-3.5" />
                        O₂ Saturation
                      </div>
                      <p className="mt-1 text-sm font-semibold">
                        {selectedPatient.medicalProfile.vitals.oxygenSaturation}
                      </p>
                    </div>
                  </div>
                  <div className="rounded-lg border border-border p-4">
                    <h4 className="mb-2 text-sm font-semibold">
                      Recent Clinical Notes
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {selectedPatient.medicalProfile.recentNotes}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No linked patient record found. Appointment details are shown
                  above.
                </p>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-background">
          <div className="size-8 animate-spin rounded-full border-2 border-[#26C6DA] border-t-transparent" />
        </main>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [activeTab, setActiveTab] = useState("Dashboard");

  const sidebarConfig = useMemo(
    () => (userRole ? getSidebarConfig(userRole) : null),
    [userRole],
  );

  const patientInfoTabLabels = useMemo(
    () =>
      new Set(sidebarConfig?.patientInfoItems.map((item) => item.label) ?? []),
    [sidebarConfig],
  );

  const medicalInfoTabLabels = useMemo(
    () =>
      new Set(sidebarConfig?.medicalInfoItems.map((item) => item.label) ?? []),
    [sidebarConfig],
  );

  const allowedTabs = useMemo(
    () => (sidebarConfig ? getAllowedTabs(sidebarConfig) : new Set<string>()),
    [sidebarConfig],
  );
  const [patientInfoExpanded, setPatientInfoExpanded] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const [activeMonth, setActiveMonth] = useState("Jun");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [messagesUnreadCount, setMessagesUnreadCount] = useState(3);
  const [appointments, setAppointments] =
    useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [patients, setPatients] = useState<Patient[]>(() =>
    patientsData.map((p, i) => withDefaultContact(p, i)),
  );
  const [doctors, setDoctors] = useState(() => doctorsData as any[]);
  const [billings, setBillings] = useState<BillingRecord[]>(INITIAL_BILLINGS);
  const [medications, setMedications] =
    useState<MedicationRecord[]>(INITIAL_MEDICATIONS);
  const [medicalBills] = useState<MedicalBillRecord[]>(INITIAL_MEDICAL_BILLS);
  const [patientBills, setPatientBills] = useState<PatientBill[]>(
    INITIAL_PATIENT_BILLS,
  );
  const [paymentNotice, setPaymentNotice] = useState<string | null>(null);
  const [medicalRecords] = useState<MedicalRecordEntry[]>(
    INITIAL_MEDICAL_RECORDS,
  );
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const syncViewport = () => {
      if (mq.matches) {
        setIsMobileSidebarOpen(false);
      } else {
        setIsSidebarCollapsed(false);
      }
    };
    syncViewport();
    mq.addEventListener("change", syncViewport);
    return () => mq.removeEventListener("change", syncViewport);
  }, []);

  const selectTab = useCallback((tab: string) => {
    setActiveTab(tab);
    setIsMobileSidebarOpen(false);
  }, []);

  useEffect(() => {
    const role = getStoredRole();
    if (!role) {
      router.replace("/");
      return;
    }
    setUserRole(role);
    const config = getSidebarConfig(role);
    const tabFromUrl = searchParams.get("tab");
    if (tabFromUrl && getAllowedTabs(config).has(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    } else {
      setActiveTab(config.defaultTab);
    }
    setAuthReady(true);
  }, [router, searchParams]);

  useEffect(() => {
    const payment = searchParams.get("payment");
    if (payment === "success") {
      const storedIds = sessionStorage.getItem("medi-dash-pending-bills");
      if (storedIds) {
        const ids = storedIds.split(",").filter(Boolean);
        setPatientBills((prev) => markBillsPaid(prev, ids));
        sessionStorage.removeItem("medi-dash-pending-bills");
      }
      setPaymentNotice("Payment successful. Your bills have been updated.");
      setActiveTab("Bills");
      router.replace("/dashboard?tab=Bills");
    } else if (payment === "cancelled") {
      setPaymentNotice("Payment was cancelled.");
      setActiveTab("Bills");
      router.replace("/dashboard?tab=Bills");
    }
  }, [searchParams, router]);

  const handlePatientBillsPaid = useCallback((billIds: string[]) => {
    setPatientBills((prev) => markBillsPaid(prev, billIds));
    setPaymentNotice(
      "Payment successful. Your outstanding bills are now paid.",
    );
  }, []);

  useEffect(() => {
    if (!sidebarConfig) return;
    if (!allowedTabs.has(activeTab)) {
      setActiveTab(sidebarConfig.defaultTab);
    }
  }, [activeTab, allowedTabs, sidebarConfig]);

  useEffect(() => {
    if (activeTab === "Messages") {
      setMessagesUnreadCount(0);
    }
  }, [activeTab]);

  useEffect(() => {
    if (patientInfoTabLabels.has(activeTab)) {
      setPatientInfoExpanded(true);
    }
  }, [activeTab]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(e.target as Node)
      ) {
        setProfileOpen(false);
      }
    }
    if (profileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileOpen]);

  const handleAddPatient = useCallback((input: NewPatientInput) => {
    const id = `new_${Date.now()}`;
    const patient = createPatientFromInput(input, id);
    const appointment = createAppointmentFromInput(input, `apt_${id}`);
    const billing = createBillingFromVisit(
      id,
      patient.name,
      input.visitReason.trim(),
      formatBillingDate(input.appointmentDate),
    );

    setPatients((prev) => [...prev, patient]);
    setAppointments((prev) => [...prev, appointment]);
    setBillings((prev) => [...prev, billing]);
    setActiveTab("Appointment Queue");
  }, []);

  const handleAddMedication = useCallback((input: NewMedicationInput) => {
    const medication = createMedicationFromInput(input, `med_${Date.now()}`);

    setMedications((prev) => [...prev, medication]);
    setPatients((prev) =>
      prev.map((patient) => {
        if (patient.id !== input.patientId) return patient;

        const medicationSummary = formatMedicationSummary(medication);
        const currentMedications =
          patient.medicalProfile.currentMedications.includes(medicationSummary)
            ? patient.medicalProfile.currentMedications
            : [...patient.medicalProfile.currentMedications, medicationSummary];

        return {
          ...patient,
          medicalProfile: {
            ...patient.medicalProfile,
            currentMedications,
          },
        };
      }),
    );
    setActiveTab("Medications");
  }, []);

  const handleScheduleAppointment = useCallback((input: NewPatientInput) => {
    const id = `new_${Date.now()}`;
    const patient = createPatientFromInput(input, id);
    const appointment = createAppointmentFromInput(input, `apt_${id}`);
    const billing = createBillingFromVisit(
      id,
      patient.name,
      input.visitReason.trim(),
      formatBillingDate(input.appointmentDate),
    );

    setPatients((prev) => [...prev, patient]);
    setAppointments((prev) => [...prev, appointment]);
    setBillings((prev) => [...prev, billing]);
  }, []);

  const handleAddDoctor = useCallback((input: any) => {
    const id = `doc_${Date.now()}`;
    const doctor = { id, ...input };
    setDoctors((prev) => [...prev, doctor]);
    setActiveTab("Appointment Queue");
  }, []);

  const handleBookDoctor = useCallback((booking: BookingInput) => {
    // Create appointment from doctor booking
    const appointmentId = `apt_${Date.now()}`;
    const appointment: Appointment = {
      id: appointmentId,
      time: booking.time,
      patient: "Current Patient", // In a real app, get from auth
      reason: booking.visitReason,
      priority: "Normal",
      status: "Scheduled",
      initials: "CP",
    };

    // Create billing record from doctor appointment
    const billing = createBillingFromVisit(
      appointmentId,
      "Current Patient",
      booking.visitReason,
      formatBillingDate(booking.date),
    );

    setAppointments((prev) => [...prev, appointment]);
    setBillings((prev) => [...prev, billing]);

    // Show success message and navigate
    alert(
      `Appointment booked with ${booking.doctorName} on ${booking.date} at ${booking.time}`,
    );
    setActiveTab("Appointments/Schedule");
  }, []);

  const selectedMonth = useMemo(
    () =>
      consultationMonths.find((item) => item.month === activeMonth) ??
      consultationMonths[5],
    [activeMonth],
  );
  const selectedMonthIndex = consultationMonths.findIndex(
    (item) => item.month === selectedMonth.month,
  );

  const handleLogout = () => {
    clearStoredRole();
    router.replace("/");
  };

  const roleLabel = useMemo(
    () => (userRole ? getRoleLabel(userRole) : ""),
    [userRole],
  );

  if (!authReady || !userRole || !sidebarConfig) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <div className="size-8 animate-spin rounded-full border-2 border-[#26C6DA] border-t-transparent" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {isMobileSidebarOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          aria-label="Close menu"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      ) : null}
      <div
        className={cn(
          "grid min-h-screen transition-all duration-300",
          isSidebarCollapsed
            ? "lg:grid-cols-[80px_1fr]"
            : "lg:grid-cols-[256px_1fr]",
        )}
      >
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-sidebar py-4 px-5 transition-transform duration-300 ease-in-out",
            isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full",
            "lg:relative lg:translate-x-0 lg:min-h-screen lg:border-b-0 lg:transition-all",
            isSidebarCollapsed ? "lg:px-3 lg:w-20" : "lg:px-5 lg:w-64",
          )}
        >
          <div className="flex w-full items-center justify-between gap-4 lg:block relative">
            <div
              className={cn(
                "flex items-center gap-3 px-1 transition-all duration-300",
                isSidebarCollapsed
                  ? "lg:flex-col lg:items-center lg:gap-2 lg:px-0"
                  : "",
              )}
            >
              <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#3d3bdc] text-white">
                <Activity className="size-5" />
              </div>
              <span
                className={cn(
                  "text-2xl font-semibold tracking-normal transition-all duration-300",
                  isSidebarCollapsed
                    ? "lg:hidden opacity-0 w-0 overflow-hidden"
                    : "opacity-100",
                )}
              >
                Medi EHR
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(false)}
              className="flex size-9 items-center justify-center rounded-md text-gray-500 hover:bg-gray-50 hover:text-gray-950 dark:hover:bg-gray-800/50 dark:hover:text-gray-100 lg:hidden"
              aria-label="Close menu"
            >
              <X className="size-5" />
            </button>

            {/* Sidebar toggle button */}
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className={cn(
                "hidden lg:flex absolute items-center justify-center rounded-md border border-gray-150 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-500 hover:text-gray-950 dark:hover:text-gray-100 shadow-sm hover:shadow-md cursor-pointer transition-all duration-300 z-10",
                isSidebarCollapsed
                  ? "left-1/2 -translate-x-1/2 top-14 size-7"
                  : "right-0 top-1 size-7",
              )}
              title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isSidebarCollapsed ? (
                <ChevronRight className="size-4" />
              ) : (
                <ChevronLeft className="size-4" />
              )}
            </button>

            <nav
              className={cn(
                "flex-1 overflow-y-auto border-t border-gray-100 dark:border-gray-800 pt-8 mt-8 transition-all duration-300",
                isSidebarCollapsed ? "lg:mt-16" : "lg:mt-8",
              )}
            >
              <div className="space-y-2">
                {sidebarConfig?.navItems.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => selectTab(item.label)}
                    title={isSidebarCollapsed ? item.label : undefined}
                    className={cn(
                      "flex h-11 w-full items-center gap-3 rounded-md px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-950 dark:hover:text-gray-100 relative group cursor-pointer",
                      activeTab === item.label &&
                        "bg-gray-100 dark:bg-gray-800 text-gray-950 dark:text-gray-100",
                      isSidebarCollapsed && "lg:px-0 lg:justify-center",
                    )}
                  >
                    <item.icon className="size-4 shrink-0" />
                    <span
                      className={cn(
                        "min-w-0 flex-1 truncate transition-all duration-300",
                        isSidebarCollapsed
                          ? "lg:hidden opacity-0 w-0"
                          : "opacity-100",
                      )}
                    >
                      {item.label}
                    </span>
                    {item.label === "Messages" && messagesUnreadCount > 0 ? (
                      isSidebarCollapsed ? (
                        <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-primary border border-sidebar" />
                      ) : (
                        <span className="grid size-5 shrink-0 place-items-center rounded-full bg-primary text-[11px] text-primary-foreground">
                          {messagesUnreadCount}
                        </span>
                      )
                    ) : null}
                  </button>
                ))}

                {sidebarConfig?.showPatientInfoGroup ? (
                  <SidebarNavGroup
                    label="Patient Info"
                    icon={UserRound}
                    items={sidebarConfig.patientInfoItems}
                    expanded={patientInfoExpanded}
                    onToggle={() => setPatientInfoExpanded((open) => !open)}
                    isCollapsed={isSidebarCollapsed}
                    onExpandSidebar={() => {
                      setIsSidebarCollapsed(false);
                      setPatientInfoExpanded(true);
                    }}
                    activeTab={activeTab}
                    onSelectTab={selectTab}
                    activeTabLabels={patientInfoTabLabels}
                  />
                ) : null}

                {sidebarConfig?.showMedicalInfoGroup
                  ? sidebarConfig.medicalInfoItems.map((item) => (
                      <button
                        key={item.label}
                        onClick={() => selectTab(item.label)}
                        title={isSidebarCollapsed ? item.label : undefined}
                        className={cn(
                          "flex h-11 w-full items-center gap-3 rounded-md px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-950 dark:hover:text-gray-100 relative group cursor-pointer",
                          activeTab === item.label &&
                            "bg-gray-100 dark:bg-gray-800 text-gray-950 dark:text-gray-100",
                          isSidebarCollapsed && "lg:px-0 lg:justify-center",
                        )}
                      >
                        <item.icon className="size-4 shrink-0" />
                        <span
                          className={cn(
                            "min-w-0 flex-1 truncate transition-all duration-300",
                            isSidebarCollapsed
                              ? "lg:hidden opacity-0 w-0"
                              : "opacity-100",
                          )}
                        >
                          {item.label}
                        </span>
                      </button>
                    ))
                  : null}
              </div>
            </nav>
          </div>

          <div className="mt-auto space-y-2">
            <ThemeToggle collapsed={isSidebarCollapsed} />

            <button
              className={cn(
                "flex h-11 w-full items-center gap-3 rounded-md px-4 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-950 dark:hover:text-gray-100 transition-all cursor-pointer",
                isSidebarCollapsed && "lg:px-0 lg:justify-center",
              )}
              title={isSidebarCollapsed ? "Settings" : undefined}
            >
              <Settings className="size-4 shrink-0" />
              <span
                className={cn(
                  "transition-all duration-300",
                  isSidebarCollapsed
                    ? "lg:hidden opacity-0 w-0"
                    : "opacity-100",
                )}
              >
                Settings
              </span>
            </button>
          </div>
        </aside>

        <section className="min-w-0">
          <header className="flex h-20 items-center justify-between bg-white dark:bg-gray-900 px-5 shadow-sm lg:px-8 border-b border-gray-100 dark:border-gray-800 transition-colors duration-300">
            <div className="flex min-w-0 items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 text-gray-500 hover:text-gray-950 dark:text-gray-400 dark:hover:text-gray-100 lg:hidden"
                aria-label="Open menu"
                onClick={() => setIsMobileSidebarOpen(true)}
              >
                <Menu className="size-5" />
              </Button>
              <h1 className="truncate text-2xl font-semibold tracking-normal text-gray-950 dark:text-gray-50">
                {activeTab}
              </h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Search"
                className="text-gray-500 hover:text-gray-950 dark:text-gray-400 dark:hover:text-gray-100"
              >
                <Search className="size-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="relative text-gray-500 hover:text-gray-950 dark:text-gray-400 dark:hover:text-gray-100"
                aria-label="Notifications"
              >
                <Bell className="size-5" />
                <span className="absolute right-2 top-2 size-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-gray-900" />
              </Button>
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setProfileOpen((open) => !open)}
                  className="flex h-10 items-center gap-2 rounded-md px-2 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-gray-200 transition-colors cursor-pointer"
                  aria-expanded={profileOpen}
                  aria-haspopup="menu"
                >
                  <span className="grid size-8 place-items-center rounded-full bg-orange-100 dark:bg-orange-950/40 text-xs text-orange-700 dark:text-orange-400 font-bold">
                    {userRole === "admin"
                      ? "AD"
                      : userRole === "staff"
                        ? "ND"
                        : "PT"}
                  </span>
                  <span className="hidden sm:inline">{roleLabel}</span>
                </button>
                {profileOpen ? (
                  <div className="absolute right-0 top-12 z-20 w-48 overflow-hidden rounded-md bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 py-1 text-sm shadow-xl ring-1 ring-gray-200 dark:ring-transparent">
                    <button className="flex w-full items-center gap-2 px-3 py-2 text-left font-medium hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-250 cursor-pointer">
                      <UserRound className="size-4" />
                      Account
                    </button>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left font-medium text-rose-600 dark:text-rose-450 hover:bg-rose-50 dark:hover:bg-rose-950/20 cursor-pointer"
                    >
                      <LogOut className="size-4" />
                      Logout
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </header>

          <div className="space-y-6 p-5 lg:p-8">
            {activeTab === "Appointment Queue" ? (
              <AppointmentQueue
                appointments={appointments}
                patients={patients}
              />
            ) : activeTab === "Profile" || activeTab === "My Profile" ? (
              <PatientProfile
                patients={patients}
                userRole={userRole ?? undefined}
              />
            ) : activeTab === "Lab Reports" ? (
              <PatientLabReports patients={patients} records={medicalRecords} />
            ) : activeTab === "Insurance" ? (
              <PatientInsurance
                patients={patients}
                appointments={appointments}
              />
            ) : activeTab === "Prescriptions" ? (
              <PatientPrescriptions
                patients={patients}
                medications={medications}
              />
            ) : activeTab === "Treatment Plans" ? (
              <PatientTreatmentPlans patients={patients} />
            ) : activeTab === "Diagnoses" ? (
              <PatientDiagnoses patients={patients} records={medicalRecords} />
            ) : activeTab === "Patient Records" ? (
              <PatientRecords patients={patients} />
            ) : activeTab === "Medications" ? (
              <PatientMedications
                patients={patients}
                medications={medications}
              />
            ) : activeTab === "Book a Doctor" ? (
              <BookDoctor doctors={doctors} onBook={handleBookDoctor} />
            ) : activeTab === "Add Medication" ? (
              <AddMedicationForm
                patients={patients}
                onAdd={handleAddMedication}
              />
            ) : activeTab === "Medical Records" ? (
              <PatientMedicalRecords
                patients={patients}
                records={medicalRecords}
              />
            ) : activeTab === "Medical Bills" ? (
              <PatientMedicalBills patients={patients} bills={medicalBills} />
            ) : activeTab === "Add Patient" ? (
              <AddPatientForm onAdd={handleAddPatient} />
            ) : activeTab === "Add Doctor" ? (
              <AddDoctorForm onAdd={handleAddDoctor} />
            ) : activeTab === "Appointments/Schedule" ? (
              <ScheduleAppointmentForm
                onSchedule={handleScheduleAppointment}
                appointments={appointments}
              />
            ) : activeTab === "Bills" ? (
              <>
                {paymentNotice ? (
                  <p className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-400">
                    {paymentNotice}
                  </p>
                ) : null}
                <PatientBillsPanel
                  patients={patients}
                  bills={patientBills}
                  onBillsPaid={handlePatientBillsPaid}
                />
              </>
            ) : activeTab === "Billing" ? (
              <PatientBilling billings={billings} />
            ) : activeTab === "Analytics" ? (
              <PatientAnalytics
                patients={patients}
                appointments={appointments}
              />
            ) : activeTab === "Messages" ? (
              <MessagesPanel
                onUnreadTotalChange={(total) => {
                  if (activeTab === "Messages") return;
                  setMessagesUnreadCount(total);
                }}
              />
            ) : (
              <>
                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {stats.map((stat) => (
                    <Card
                      key={stat.title}
                      className={cn(
                        "rounded-xl border-0 py-5 shadow-sm",
                        stat.className,
                      )}
                    >
                      <CardHeader className="px-5">
                        <CardTitle className="text-sm font-medium">
                          {stat.title}
                        </CardTitle>
                        <CardAction>
                          <span
                            className={cn(
                              "grid size-9 place-items-center rounded-lg",
                              stat.iconClassName,
                            )}
                          >
                            <stat.icon className="size-5" />
                          </span>
                        </CardAction>
                      </CardHeader>
                      <CardContent className="px-5">
                        <p className="text-2xl font-bold tracking-normal">
                          {stat.value}
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                          {stat.detail}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </section>

                <section className="grid gap-5">
                  <Card className="rounded-xl border-0 py-5 shadow-sm">
                    <CardHeader className="gap-3 px-5 sm:grid-cols-[1fr_auto]">
                      <CardTitle className="text-lg font-semibold">
                        AI Impact on Consultation Time
                      </CardTitle>
                      <CardAction className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-white dark:bg-gray-800 dark:text-gray-150 dark:border-gray-700"
                        >
                          This Month
                        </Button>
                        <Button
                          variant="outline"
                          size="icon-sm"
                          className="bg-white dark:bg-gray-800 dark:text-gray-150 dark:border-gray-700"
                          aria-label="Chart options"
                        >
                          <MoreVertical className="size-4" />
                        </Button>
                      </CardAction>
                    </CardHeader>
                    <CardContent className="px-5">
                      <div className="relative h-72 overflow-hidden">
                        <div className="absolute inset-x-8 top-2 bottom-8 flex flex-col justify-between text-xs text-gray-500 dark:text-gray-400">
                          {[30, 20, 10, 0, 10, 20, 30].map((value, index) => (
                            <div
                              key={`${value}-${index}`}
                              className="flex items-center gap-3"
                            >
                              <span className="w-5 text-right">{value}</span>
                              <span
                                className={cn(
                                  "h-px flex-1",
                                  value === 0
                                    ? "border-t border-dashed border-gray-500 dark:border-gray-600"
                                    : "bg-gray-100 dark:bg-gray-800/60",
                                )}
                              />
                            </div>
                          ))}
                        </div>

                        <div className="absolute inset-x-12 bottom-0 top-2 grid grid-cols-12 items-center gap-3 sm:gap-5">
                          {consultationMonths.map((item) => (
                            <button
                              key={item.month}
                              onMouseEnter={() => setActiveMonth(item.month)}
                              onFocus={() => setActiveMonth(item.month)}
                              className="group flex h-full min-w-0 flex-col items-center justify-end gap-2 outline-none cursor-pointer"
                              aria-label={`${item.month}: ${item.withAi} minutes with AI, ${item.withoutAi} minutes without AI`}
                            >
                              <div className="flex h-[224px] w-full max-w-12 flex-col justify-center">
                                <div
                                  className={cn(
                                    "rounded-t-full bg-gradient-to-b from-indigo-200 to-indigo-100 dark:from-indigo-900/30 dark:to-indigo-950/20 transition-all group-hover:from-[#3d3bdc] group-hover:to-[#4f46e5]",
                                    selectedMonth.month === item.month &&
                                      "from-[#3d3bdc] to-[#4f46e5]",
                                  )}
                                  style={{ height: `${item.withAi * 3}px` }}
                                />
                                <div
                                  className={cn(
                                    "rounded-b-full bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-750 transition-all group-hover:from-gray-800 group-hover:to-gray-950 dark:group-hover:from-gray-200 dark:group-hover:to-gray-50",
                                    selectedMonth.month === item.month &&
                                      (isDark
                                        ? "from-gray-200 to-gray-50"
                                        : "from-gray-800 to-gray-950"),
                                  )}
                                  style={{ height: `${item.withoutAi * 3}px` }}
                                />
                              </div>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {item.month}
                              </span>
                            </button>
                          ))}
                        </div>

                        <div
                          className="absolute top-[38%] hidden rounded-md bg-white dark:bg-gray-850 p-3 text-xs shadow-lg ring-1 ring-gray-200 dark:ring-gray-700 transition-all sm:block border border-transparent dark:border-gray-700"
                          style={{
                            left: `min(calc(${selectedMonthIndex} * (100% / 12) + 72px), calc(100% - 160px))`,
                          }}
                        >
                          <p className="mb-2 font-medium text-gray-500 dark:text-gray-400">
                            {selectedMonth.month} 2026
                          </p>
                          <div className="grid grid-cols-[auto_1fr_auto] gap-x-3 gap-y-1">
                            <span className="h-6 w-1 rounded-full bg-[#3d3bdc]" />
                            <span className="text-gray-600 dark:text-gray-355">
                              With AI
                            </span>
                            <span className="font-bold text-gray-950 dark:text-gray-100">
                              {selectedMonth.withAi}
                            </span>
                            <span className="h-6 w-1 rounded-full bg-gray-900 dark:bg-gray-200" />
                            <span className="text-gray-600 dark:text-gray-355">
                              Without AI
                            </span>
                            <span className="font-bold text-gray-950 dark:text-gray-100">
                              {selectedMonth.withoutAi}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </section>
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
