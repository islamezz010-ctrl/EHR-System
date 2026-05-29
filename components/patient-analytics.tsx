"use client";

import { useMemo, useState } from "react";
import { UsersRound } from "lucide-react";

import { PatientsChart } from "@/components/patients-chart";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Appointment, Patient } from "@/lib/clinical-types";
import {
  type AnalyticsFilters,
  buildVisitRecords,
  filterVisits,
  getDefaultDateRange,
  getUniqueGenders,
  getUniqueVisitReasons,
} from "@/lib/analytics";
import {
  getPatientsChartData,
  type PatientsPeriod,
} from "@/lib/patients-chart";

type PatientAnalyticsProps = {
  patients: Patient[];
  appointments: Appointment[];
};

function FilterLabel({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="text-xs font-medium text-muted-foreground"
    >
      {children}
    </label>
  );
}

const selectClassName =
  "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

export function PatientAnalytics({
  patients,
  appointments,
}: PatientAnalyticsProps) {
  const allVisits = useMemo(
    () => buildVisitRecords(patients, appointments),
    [patients, appointments],
  );

  const defaultRange = useMemo(
    () => getDefaultDateRange(allVisits),
    [allVisits],
  );

  const [filters, setFilters] = useState<AnalyticsFilters>(() => ({
    dateFrom: defaultRange.dateFrom,
    dateTo: defaultRange.dateTo,
    visitReason: "all",
    ageMin: "",
    ageMax: "",
    gender: "all",
  }));

  const [chartPeriod, setChartPeriod] = useState<PatientsPeriod>("Monthly");

  const visitReasons = useMemo(
    () => getUniqueVisitReasons(allVisits),
    [allVisits],
  );
  const genders = useMemo(() => getUniqueGenders(allVisits), [allVisits]);

  const filteredVisits = useMemo(
    () => filterVisits(allVisits, filters),
    [allVisits, filters],
  );

  const chartData = useMemo(
    () => getPatientsChartData(filteredVisits, chartPeriod),
    [filteredVisits, chartPeriod],
  );

  const updateFilter = <K extends keyof AnalyticsFilters>(
    key: K,
    value: AnalyticsFilters[K],
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-5">
      <Card className="rounded-xl border-0 py-5 shadow-sm">
        <CardHeader className="px-5 pb-2">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <UsersRound className="size-5 text-primary" />
            Total Patient Visitors
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5">
          <p className="text-5xl font-bold tracking-tight text-primary">
            {filteredVisits.length}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Matching your current calendar, visit reason, age, and gender filters
          </p>
        </CardContent>
      </Card>

      <Card className="rounded-xl border-0 py-5 shadow-sm">
        <CardHeader className="px-5">
          <CardTitle className="text-lg font-semibold">Filters</CardTitle>
        </CardHeader>
        <CardContent className="px-5">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <div className="space-y-1.5">
              <FilterLabel htmlFor="date-from">From</FilterLabel>
              <input
                id="date-from"
                type="date"
                value={filters.dateFrom}
                onChange={(e) => updateFilter("dateFrom", e.target.value)}
                className={selectClassName}
              />
            </div>
            <div className="space-y-1.5">
              <FilterLabel htmlFor="date-to">To</FilterLabel>
              <input
                id="date-to"
                type="date"
                value={filters.dateTo}
                onChange={(e) => updateFilter("dateTo", e.target.value)}
                className={selectClassName}
              />
            </div>
            <div className="space-y-1.5">
              <FilterLabel htmlFor="visit-reason-filter">
                Visit reason
              </FilterLabel>
              <select
                id="visit-reason-filter"
                value={filters.visitReason}
                onChange={(e) => updateFilter("visitReason", e.target.value)}
                className={selectClassName}
              >
                <option value="all">All reasons</option>
                {visitReasons.map((reason) => (
                  <option key={reason} value={reason}>
                    {reason}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <FilterLabel htmlFor="age-min">Min age</FilterLabel>
              <Input
                id="age-min"
                type="number"
                min={0}
                max={120}
                placeholder="Any"
                value={filters.ageMin}
                onChange={(e) => updateFilter("ageMin", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <FilterLabel htmlFor="age-max">Max age</FilterLabel>
              <Input
                id="age-max"
                type="number"
                min={0}
                max={120}
                placeholder="Any"
                value={filters.ageMax}
                onChange={(e) => updateFilter("ageMax", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <FilterLabel htmlFor="gender-filter">Gender</FilterLabel>
              <select
                id="gender-filter"
                value={filters.gender}
                onChange={(e) => updateFilter("gender", e.target.value)}
                className={selectClassName}
              >
                <option value="all">All genders</option>
                {genders.map((gender) => (
                  <option key={gender} value={gender}>
                    {gender}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <PatientsChart
        data={chartData}
        period={chartPeriod}
        onPeriodChange={setChartPeriod}
      />
    </div>
  );
}
