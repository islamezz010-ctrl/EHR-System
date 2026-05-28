"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useTheme } from "next-themes";
import {
  Activity,
  AlarmClock,
  Bell,
  CalendarDays,
  ChartNoAxesColumn,
  ChevronLeft,
  ChevronRight,
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
  Reply,
  Trash2,
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
import { PatientAnalytics } from "@/components/patient-analytics";
import { PatientBilling } from "@/components/patient-billing";
import { PatientMedications } from "@/components/patient-medications";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  INITIAL_BILLINGS,
  createBillingFromVisit,
  type BillingRecord,
} from "@/lib/billing";
import {
  INITIAL_MEDICATIONS,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import patientsData from "@/data/patients.json";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Appointment Queue", icon: ClipboardList },
  { label: "Clinical Workspace", icon: Stethoscope },
  { label: "Patient Records", icon: UsersRound },
  { label: "Medications", icon: Pill },
  { label: "Add Patient", icon: UserPlus },
  { label: "Billing", icon: Receipt },
  { label: "Analytics", icon: ChartNoAxesColumn },
  { label: "Messages", icon: MessageSquare },
];

const stats = [
  {
    title: "Scheduled Visits",
    value: "12 Today",
    detail: "3 Completed, 9 Remaining",
    icon: CalendarDays,
    className: "bg-emerald-50 dark:bg-emerald-950/20 text-gray-900 dark:text-gray-100",
    iconClassName: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-450",
  },
  {
    title: "AI Insights",
    value: "5 Critical Patient",
    detail: "Requires immediate attention",
    icon: UsersRound,
    className: "bg-cyan-50 dark:bg-cyan-950/20 text-gray-900 dark:text-gray-100",
    iconClassName: "bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-450",
  },
  {
    title: "Average Wait Time",
    value: "14 mins",
    detail: "2 mins faster than average",
    icon: AlarmClock,
    className: "bg-violet-50 dark:bg-violet-950/20 text-gray-900 dark:text-gray-100",
    iconClassName: "bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-450",
  },
  {
    title: "Revenue Status",
    value: "$4,250",
    detail: "Pending Claims",
    icon: CircleDollarSign,
    className: "bg-rose-50 dark:bg-rose-950/20 text-gray-900 dark:text-gray-100",
    iconClassName: "bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-450",
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

const diagnosisItems = [
  { label: "Diabetes", value: "40%", color: "bg-[#3432d9]" },
  { label: "Hypertension", value: "25%", color: "bg-[#4d22d8]" },
  { label: "Respiratory", value: "20%", color: "bg-[#315cf6]" },
  { label: "Fever/Infection", value: "15%", color: "bg-[#5574f2]" },
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
                      statusFilter === null && "bg-gray-100 dark:bg-gray-700 font-medium",
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
                        statusFilter === s && "bg-gray-100 dark:bg-gray-700 font-medium",
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
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 dark:bg-slate-800/40 hover:bg-gray-50 dark:hover:bg-slate-800/50">
                <TableHead>Patient</TableHead>
                <TableHead>Appointment</TableHead>
                <TableHead>Visit Reason</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Key Vitals</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients.length > 0 ? (
                filteredPatients.map((patient, index) => {
                  const color = avatarColors[index % avatarColors.length];
                  return (
                    <TableRow
                      key={patient.id}
                      className="group transition-colors hover:bg-gray-50/80 dark:hover:bg-gray-800/40 border-gray-100 dark:border-gray-850"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <span
                            className={cn(
                              "grid size-9 shrink-0 place-items-center rounded-full text-xs font-bold dark:bg-opacity-20",
                              color.bg,
                              color.text,
                            )}
                          >
                            {getInitials(patient.name)}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-gray-950 dark:text-gray-50">
                              {patient.name}
                            </p>
                            <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                              {patient.medicalProfile.gender},{" "}
                              {getAgeFromDob(patient.medicalProfile.dateOfBirth)}y •{" "}
                              {patient.medicalProfile.bloodType}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-700 dark:text-gray-300">
                        {patient.currentAppointment.time}
                      </TableCell>
                      <TableCell className="max-w-[160px] truncate text-sm text-gray-700 dark:text-gray-300">
                        {patient.currentAppointment.visitReason}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <PriorityDot
                            priority={patient.currentAppointment.priority}
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {patient.currentAppointment.priority}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge
                          status={patient.currentAppointment.status}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <Heart className="size-3 text-rose-400" />
                            {patient.medicalProfile.vitals.heartRate}
                          </span>
                          <span className="flex items-center gap-1">
                            <Droplets className="size-3 text-blue-400" />
                            {patient.medicalProfile.vitals.bloodPressure.split(
                              " ",
                            )[0]}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-white dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 opacity-80 transition-opacity group-hover:opacity-100"
                            onClick={() => setSelectedPatient(patient)}
                          >
                            <Eye className="size-4" />
                            View Profile
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-12 text-center text-gray-500"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <UsersRound className="size-8 text-gray-300" />
                      <p>No patients found matching your search.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
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
                        patients.findIndex(
                          (p) => p.id === selectedPatient.id,
                        ) % avatarColors.length
                      ].bg,
                      avatarColors[
                        patients.findIndex(
                          (p) => p.id === selectedPatient.id,
                        ) % avatarColors.length
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
                      {getAgeFromDob(selectedPatient.medicalProfile.dateOfBirth)} years
                      old • Blood Type:{" "}
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
    return (
      patients.find((p) => p.name === selectedAppointment.patient) ?? null
    );
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
                    statusFilter === null && "bg-gray-100 dark:bg-gray-700 font-medium",
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
                    statusFilter === "In-Room" && "bg-gray-100 dark:bg-gray-700 font-medium",
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
                    statusFilter === "Waiting" && "bg-gray-100 dark:bg-gray-700 font-medium",
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
                    statusFilter === "Scheduled" && "bg-gray-100 dark:bg-gray-700 font-medium",
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
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 dark:bg-slate-800/40 hover:bg-gray-50 dark:hover:bg-slate-800/50">
              <TableHead className="w-10">
                <span className="block size-4 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800" />
              </TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Patient Name</TableHead>
              <TableHead>Visit Reason</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAppointments.length > 0 ? (
              filteredAppointments.map((appointment) => (
                <TableRow key={appointment.id} className="border-gray-100 dark:border-gray-850">
                  <TableCell>
                    <span className="block size-4 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800" />
                  </TableCell>
                  <TableCell className="text-gray-750 dark:text-gray-300">{appointment.time}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <span className="grid size-7 place-items-center rounded-full bg-amber-100 dark:bg-amber-950/40 text-[10px] font-bold text-amber-800 dark:text-amber-400">
                        {appointment.initials}
                      </span>
                      <span className="text-gray-950 dark:text-gray-200">{appointment.patient}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-750 dark:text-gray-300">{appointment.reason}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-gray-750 dark:text-gray-300">
                      <PriorityDot priority={appointment.priority} />
                      {appointment.priority}
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={appointment.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-white dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
                        onClick={() => setSelectedAppointment(appointment)}
                      >
                        <ClipboardList className="size-4" />
                        View Record
                      </Button>
                      <Button
                        size="sm"
                        className="bg-[#3d3bdc] hover:bg-[#3432c4]"
                      >
                        <UserRound className="size-4" />
                        Start Session
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-8 text-center text-gray-500"
                >
                  No appointments found matching your search.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
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
                  <h4 className="mb-2 text-sm font-semibold">Recent Clinical Notes</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {selectedPatient.medicalProfile.recentNotes}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No linked patient record found. Appointment details are shown above.
              </p>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
    </>
  );
}

type MessageItem = {
  id: number;
  patient: string;
  initials: string;
  avatarBg: string;
  lastMessage: string;
  time: string;
  unread: number;
};

const initialMessages: MessageItem[] = [
  {
    id: 1,
    patient: "Jonathan Wick",
    initials: "JW",
    avatarBg: "bg-violet-100 text-violet-700",
    lastMessage:
      "I've been taking the new dosage. My morning headaches are slightly better.",
    time: "10:15 AM",
    unread: 2,
  },
  {
    id: 2,
    patient: "Sarah Connor",
    initials: "SC",
    avatarBg: "bg-amber-100 text-amber-700",
    lastMessage: "Are my HbA1c results available yet?",
    time: "Yesterday",
    unread: 1,
  },
  {
    id: 3,
    patient: "David Miller",
    initials: "DM",
    avatarBg: "bg-sky-100 text-sky-700",
    lastMessage:
      "The swelling has gone down significantly. Should I start PT?",
    time: "Mon",
    unread: 0,
  },
];

function Messages({
  onUnreadTotalChange,
}: {
  onUnreadTotalChange: (total: number) => void;
}) {
  const [messages, setMessages] = useState<MessageItem[]>(initialMessages);
  const [showMessage, setShowMessage] = useState<MessageItem | null>(null);
  const [replyMessage, setReplyMessage] = useState<MessageItem | null>(null);
  const [replyText, setReplyText] = useState("");

  const syncUnreadTotal = useCallback(
    (list: MessageItem[]) => {
      onUnreadTotalChange(list.reduce((sum, m) => sum + m.unread, 0));
    },
    [onUnreadTotalChange],
  );

  useEffect(() => {
    syncUnreadTotal(messages);
  }, [messages, syncUnreadTotal]);

  const markAsRead = (id: number) => {
    setMessages((prev) => {
      const next = prev.map((m) =>
        m.id === id ? { ...m, unread: 0 } : m,
      );
      return next;
    });
  };

  const handleDelete = (id: number) => {
    setMessages((prev) => {
      const next = prev.filter((m) => m.id !== id);
      return next;
    });
    if (showMessage?.id === id) setShowMessage(null);
    if (replyMessage?.id === id) setReplyMessage(null);
  };

  const handleSendReply = () => {
    if (!replyMessage || !replyText.trim()) return;
    setMessages((prev) =>
      prev.map((m) =>
        m.id === replyMessage.id
          ? { ...m, lastMessage: replyText.trim(), time: "Just now", unread: 0 }
          : m,
      ),
    );
    setReplyText("");
    setReplyMessage(null);
  };

  return (
    <>
      <Card className="rounded-xl border-0 py-5 shadow-sm">
        <CardHeader className="px-5">
          <CardTitle className="text-lg font-semibold">Patient Messages</CardTitle>
        </CardHeader>
        <CardContent className="px-5">
          <div className="space-y-3">
            {messages.length > 0 ? (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className="flex items-center gap-4 rounded-lg border border-transparent p-3 transition-colors hover:border-border hover:bg-accent/50"
                >
                  <button
                    type="button"
                    className="flex min-w-0 flex-1 items-center gap-4 text-left cursor-pointer"
                    onClick={() => {
                      markAsRead(msg.id);
                      setShowMessage(msg);
                    }}
                  >
                    <span
                      className={cn(
                        "grid size-12 shrink-0 place-items-center rounded-full font-bold",
                        msg.avatarBg,
                      )}
                    >
                      {msg.initials}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <h4 className="truncate text-sm font-semibold">
                          {msg.patient}
                        </h4>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {msg.time}
                        </span>
                      </div>
                      <p className="truncate text-sm text-muted-foreground">
                        {msg.lastMessage}
                      </p>
                    </div>
                    {msg.unread > 0 && (
                      <Badge className="min-w-[20px] border-0 bg-primary px-2 text-center text-primary-foreground">
                        {msg.unread}
                      </Badge>
                    )}
                  </button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Actions for ${msg.patient}`}
                      >
                        <MoreVertical className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          markAsRead(msg.id);
                          setReplyMessage(msg);
                        }}
                      >
                        <Reply className="size-4" />
                        Reply
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          markAsRead(msg.id);
                          setShowMessage(msg);
                        }}
                      >
                        <Eye className="size-4" />
                        Show
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => handleDelete(msg.id)}
                      >
                        <Trash2 className="size-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No messages yet.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={!!showMessage}
        onOpenChange={(open) => !open && setShowMessage(null)}
      >
        <DialogContent className="sm:max-w-lg">
          {showMessage && (
            <>
              <DialogHeader>
                <DialogTitle>{showMessage.patient}</DialogTitle>
                <DialogDescription>{showMessage.time}</DialogDescription>
              </DialogHeader>
              <p className="text-sm leading-relaxed">{showMessage.lastMessage}</p>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowMessage(null);
                    setReplyMessage(showMessage);
                  }}
                >
                  <Reply className="size-4" />
                  Reply
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(showMessage.id)}
                >
                  <Trash2 className="size-4" />
                  Delete
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!replyMessage}
        onOpenChange={(open) => {
          if (!open) {
            setReplyMessage(null);
            setReplyText("");
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          {replyMessage && (
            <>
              <DialogHeader>
                <DialogTitle>Reply to {replyMessage.patient}</DialogTitle>
                <DialogDescription>
                  Original: {replyMessage.lastMessage}
                </DialogDescription>
              </DialogHeader>
              <textarea
                className="min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Type your reply…"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setReplyMessage(null);
                    setReplyText("");
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleSendReply} disabled={!replyText.trim()}>
                  Send Reply
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function Home() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [profileOpen, setProfileOpen] = useState(false);
  const [activeMonth, setActiveMonth] = useState("Jun");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [messagesUnreadCount, setMessagesUnreadCount] = useState(3);
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [patients, setPatients] = useState<Patient[]>(() =>
    patientsData.map((p, i) => withDefaultContact(p, i)),
  );
  const [billings, setBillings] = useState<BillingRecord[]>(INITIAL_BILLINGS);
  const [medications] = useState<MedicationRecord[]>(INITIAL_MEDICATIONS);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  useEffect(() => {
    if (activeTab === "Messages") {
      setMessagesUnreadCount(0);
    }
  }, [activeTab]);

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

  const selectedMonth = useMemo(
    () =>
      consultationMonths.find((item) => item.month === activeMonth) ??
      consultationMonths[5],
    [activeMonth],
  );
  const selectedMonthIndex = consultationMonths.findIndex(
    (item) => item.month === selectedMonth.month,
  );

  return (
    <main className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <div className={cn("grid min-h-screen transition-all duration-300", isSidebarCollapsed ? "lg:grid-cols-[80px_1fr]" : "lg:grid-cols-[256px_1fr]")}>
        <aside className={cn(
          "flex border-b border-border bg-sidebar py-4 lg:min-h-screen lg:flex-col lg:border-b-0 lg:border-r transition-all duration-300 relative",
          isSidebarCollapsed ? "lg:px-3 lg:w-20" : "lg:px-5 lg:w-64"
        )}>
          <div className="flex w-full items-center justify-between gap-4 lg:block relative">
            <div className={cn(
              "flex items-center gap-3 px-1 transition-all duration-300",
              isSidebarCollapsed ? "lg:flex-col lg:items-center lg:gap-2 lg:px-0" : ""
            )}>
              <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#3d3bdc] text-white">
                <Activity className="size-5" />
              </div>
              <span className={cn(
                "text-2xl font-semibold tracking-normal transition-all duration-300",
                isSidebarCollapsed ? "lg:hidden opacity-0 w-0 overflow-hidden" : "opacity-100"
              )}>
                Medi EHR
              </span>
            </div>

            {/* Sidebar toggle button */}
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className={cn(
                "hidden lg:flex absolute items-center justify-center rounded-md border border-gray-150 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-500 hover:text-gray-950 dark:hover:text-gray-100 shadow-sm hover:shadow-md cursor-pointer transition-all duration-300 z-10",
                isSidebarCollapsed 
                  ? "left-1/2 -translate-x-1/2 top-14 size-7" 
                  : "right-0 top-1 size-7"
              )}
              title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isSidebarCollapsed ? (
                <ChevronRight className="size-4" />
              ) : (
                <ChevronLeft className="size-4" />
              )}
            </button>

            <nav className={cn(
              "hidden border-t border-gray-100 dark:border-gray-800 pt-8 lg:block transition-all duration-300",
              isSidebarCollapsed ? "lg:mt-16" : "lg:mt-8"
            )}>
              <div className="space-y-2">
                {navItems.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => setActiveTab(item.label)}
                    title={isSidebarCollapsed ? item.label : undefined}
                    className={cn(
                      "flex h-11 w-full items-center gap-3 rounded-md px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-950 dark:hover:text-gray-100 relative group cursor-pointer",
                      activeTab === item.label && "bg-gray-100 dark:bg-gray-800 text-gray-950 dark:text-gray-100",
                      isSidebarCollapsed && "lg:px-0 lg:justify-center"
                    )}
                  >
                    <item.icon className="size-4 shrink-0" />
                    <span className={cn(
                      "min-w-0 flex-1 truncate transition-all duration-300",
                      isSidebarCollapsed ? "lg:hidden opacity-0 w-0" : "opacity-100"
                    )}>
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
              </div>
            </nav>
          </div>

          <div className="mt-auto hidden space-y-2 lg:block">
            <ThemeToggle collapsed={isSidebarCollapsed} />

            <button 
              className={cn(
                "flex h-11 w-full items-center gap-3 rounded-md px-4 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-950 dark:hover:text-gray-100 transition-all cursor-pointer",
                isSidebarCollapsed && "lg:px-0 lg:justify-center"
              )}
              title={isSidebarCollapsed ? "Settings" : undefined}
            >
              <Settings className="size-4 shrink-0" />
              <span className={cn(
                "transition-all duration-300",
                isSidebarCollapsed ? "lg:hidden opacity-0 w-0" : "opacity-100"
              )}>
                Settings
              </span>
            </button>
          </div>
        </aside>

        <section className="min-w-0">
          <header className="flex h-20 items-center justify-between bg-white dark:bg-gray-900 px-5 shadow-sm lg:px-8 border-b border-gray-100 dark:border-gray-800 transition-colors duration-300">
            <h1 className="text-2xl font-semibold tracking-normal text-gray-950 dark:text-gray-50">
              {activeTab}
            </h1>
            <div className="flex items-center gap-2 sm:gap-4">
              <Button variant="ghost" size="icon" aria-label="Search" className="text-gray-500 hover:text-gray-950 dark:text-gray-400 dark:hover:text-gray-100">
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
              <div className="relative">
                <button
                  onClick={() => setProfileOpen((open) => !open)}
                  className="flex h-10 items-center gap-2 rounded-md px-2 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-gray-200 transition-colors cursor-pointer"
                  aria-expanded={profileOpen}
                  aria-haspopup="menu"
                >
                  <span className="grid size-8 place-items-center rounded-full bg-orange-100 dark:bg-orange-950/40 text-xs text-orange-700 dark:text-orange-400 font-bold">
                    KM
                  </span>
                  <span className="hidden sm:inline">Kaira M.</span>
                </button>
                {profileOpen ? (
                  <div className="absolute right-0 top-12 z-20 w-48 overflow-hidden rounded-md bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 py-1 text-sm shadow-xl ring-1 ring-gray-200 dark:ring-transparent">
                    <button className="flex w-full items-center gap-2 px-3 py-2 text-left font-medium hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-250 cursor-pointer">
                      <UserRound className="size-4" />
                      Account
                    </button>
                    <button className="flex w-full items-center gap-2 px-3 py-2 text-left font-medium text-rose-600 dark:text-rose-450 hover:bg-rose-50 dark:hover:bg-rose-950/20 cursor-pointer">
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
              <AppointmentQueue appointments={appointments} patients={patients} />
            ) : activeTab === "Patient Records" ? (
              <PatientRecords patients={patients} />
            ) : activeTab === "Medications" ? (
              <PatientMedications
                patients={patients}
                medications={medications}
              />
            ) : activeTab === "Add Patient" ? (
              <AddPatientForm onAdd={handleAddPatient} />
            ) : activeTab === "Billing" ? (
              <PatientBilling billings={billings} />
            ) : activeTab === "Analytics" ? (
              <PatientAnalytics
                patients={patients}
                appointments={appointments}
              />
            ) : activeTab === "Messages" ? (
              <Messages
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

                <section className="grid gap-5 xl:grid-cols-[1fr_316px]">
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
                            <span className="text-gray-600 dark:text-gray-355">With AI</span>
                            <span className="font-bold text-gray-950 dark:text-gray-100">
                              {selectedMonth.withAi}
                            </span>
                            <span className="h-6 w-1 rounded-full bg-gray-900 dark:bg-gray-200" />
                            <span className="text-gray-600 dark:text-gray-355">Without AI</span>
                            <span className="font-bold text-gray-950 dark:text-gray-100">
                              {selectedMonth.withoutAi}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-xl border-0 py-5 shadow-sm">
                    <CardHeader className="px-5">
                      <CardTitle className="text-lg font-semibold">
                        Diagnosis Distribution
                      </CardTitle>
                      <CardAction>
                        <Button
                          variant="outline"
                          size="icon-sm"
                          className="bg-white dark:bg-gray-800 dark:text-gray-150 dark:border-gray-700"
                          aria-label="Diagnosis options"
                        >
                          <MoreVertical className="size-4" />
                        </Button>
                      </CardAction>
                    </CardHeader>
                    <CardContent className="px-5">
                      <div className="relative h-44">
                        <div className="absolute left-1 top-2 grid size-32 place-items-center rounded-full bg-[#3432d9] text-2xl font-semibold text-white">
                          40%
                        </div>
                        <div className="absolute right-8 top-0 grid size-16 place-items-center rounded-full bg-[#315cf6] text-sm font-semibold text-white">
                          20%
                        </div>
                        <div className="absolute bottom-0 right-12 grid size-24 place-items-center rounded-full bg-[#4d22d8] text-lg font-semibold text-white">
                          25%
                        </div>
                        <div className="absolute right-0 top-11 grid size-12 place-items-center rounded-full bg-[#5574f2] text-xs font-semibold text-white">
                          15%
                        </div>
                      </div>
                      <div className="space-y-2 pt-1">
                        {diagnosisItems.map((item) => (
                          <div
                            key={item.label}
                            className="flex items-center gap-2 text-sm"
                          >
                            <span
                              className={cn("size-3 rounded-sm", item.color)}
                            />
                            <span className="min-w-0 flex-1 truncate text-gray-600 dark:text-gray-400">
                              {item.label}
                            </span>
                            <span className="font-semibold text-gray-950 dark:text-gray-250">{item.value}</span>
                          </div>
                        ))}
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
