"use client";

import { useMemo, useState } from "react";
import { Activity, ChartPie, TrendingUp, UsersRound } from "lucide-react";

import { PatientsChart } from "@/components/patients-chart";
import { CustomSelect } from "@/components/ui/custom-select";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
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

const diagnosisDistribution = [
  {
    label: "Hypertension",
    visits: 312,
    change: 8.4,
    avgAge: 58,
    followUps: 146,
    color: "#2563eb",
  },
  {
    label: "Type 2 Diabetes",
    visits: 238,
    change: 4.9,
    avgAge: 54,
    followUps: 121,
    color: "#14b8a6",
  },
  {
    label: "Upper Respiratory Infection",
    visits: 182,
    change: 12.7,
    avgAge: 34,
    followUps: 48,
    color: "#f97316",
  },
  {
    label: "Asthma / COPD",
    visits: 141,
    change: 6.1,
    avgAge: 47,
    followUps: 63,
    color: "#8b5cf6",
  },
  {
    label: "Musculoskeletal Pain",
    visits: 129,
    change: -2.8,
    avgAge: 43,
    followUps: 39,
    color: "#ec4899",
  },
  {
    label: "Fever / Viral Syndrome",
    visits: 106,
    change: 9.5,
    avgAge: 29,
    followUps: 24,
    color: "#ef4444",
  },
  {
    label: "Preventive Care",
    visits: 84,
    change: 3.2,
    avgAge: 41,
    followUps: 18,
    color: "#22c55e",
  },
  {
    label: "Other Chronic Care",
    visits: 56,
    change: -1.6,
    avgAge: 62,
    followUps: 31,
    color: "#64748b",
  },
];

const visitFormatter = new Intl.NumberFormat("en-US");
const diagnosisTotal = diagnosisDistribution.reduce(
  (sum, item) => sum + item.visits,
  0,
);
const diagnosisFollowUps = diagnosisDistribution.reduce(
  (sum, item) => sum + item.followUps,
  0,
);
const respiratoryVisits =
  diagnosisDistribution.find(
    (item) => item.label === "Upper Respiratory Infection",
  )?.visits ?? 0;
const diagnosisSlices = (() => {
  let angle = 0;
  return diagnosisDistribution.map((item) => {
    const percentage = item.visits / diagnosisTotal;
    const startAngle = angle;
    angle += percentage * 360;

    return {
      ...item,
      percentage,
      startAngle,
      endAngle: angle,
    };
  });
})();

function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number,
) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;

  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function describePieSlice(startAngle: number, endAngle: number) {
  const start = polarToCartesian(100, 100, 86, endAngle);
  const end = polarToCartesian(100, 100, 86, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return [
    "M 100 100",
    `L ${start.x.toFixed(2)} ${start.y.toFixed(2)}`,
    `A 86 86 0 ${largeArcFlag} 0 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`,
    "Z",
  ].join(" ");
}

function formatPercent(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

function formatChange(value: number) {
  return `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
}

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

  const visitReasonOptions = useMemo(() => {
    const opts = [{ value: "all", label: "All reasons" }];
    visitReasons.forEach((r) => {
      opts.push({ value: r, label: r });
    });
    return opts;
  }, [visitReasons]);

  const genderOptions = useMemo(() => {
    const opts = [{ value: "all", label: "All genders" }];
    genders.forEach((g) => {
      opts.push({ value: g, label: g });
    });
    return opts;
  }, [genders]);

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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 flex-wrap">
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
              <CustomSelect
                options={visitReasonOptions}
                value={filters.visitReason}
                onChange={(val) => updateFilter("visitReason", val)}
                placeholder="All reasons"
              />
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
              <CustomSelect
                options={genderOptions}
                value={filters.gender}
                onChange={(val) => updateFilter("gender", val)}
                placeholder="All genders"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <PatientsChart
        data={chartData}
        period={chartPeriod}
        onPeriodChange={setChartPeriod}
      />

      <Card className="rounded-xl border-0 py-5 shadow-sm">
        <CardHeader className="gap-3 px-5 sm:grid-cols-[1fr_auto]">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <ChartPie className="size-5 text-primary" />
              Diagnosis Distribution
            </CardTitle>
            <CardDescription className="mt-1">
              Last 90 days of coded encounters across primary care and urgent
              care
            </CardDescription>
          </div>
          <CardAction className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
            <div className="rounded-lg border border-border px-3 py-2">
              <p className="text-muted-foreground">Coded visits</p>
              <p className="mt-1 text-base font-bold text-foreground">
                {visitFormatter.format(diagnosisTotal)}
              </p>
            </div>
            <div className="rounded-lg border border-border px-3 py-2">
              <p className="text-muted-foreground">Follow-ups</p>
              <p className="mt-1 text-base font-bold text-foreground">
                {visitFormatter.format(diagnosisFollowUps)}
              </p>
            </div>
            <div className="col-span-2 rounded-lg border border-border px-3 py-2 sm:col-span-1">
              <p className="text-muted-foreground">Respiratory</p>
              <p className="mt-1 text-base font-bold text-foreground">
                {formatPercent(respiratoryVisits / diagnosisTotal)}
              </p>
            </div>
          </CardAction>
        </CardHeader>
        <CardContent className="px-5">
          <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
            <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-muted/20 p-5">
              <div className="relative grid size-64 place-items-center">
                <svg
                  viewBox="0 0 200 200"
                  role="img"
                  aria-label="Pie chart showing diagnosis distribution by visit count"
                  className="size-full drop-shadow-sm"
                >
                  {diagnosisSlices.map((item) => (
                    <path
                      key={item.label}
                      d={describePieSlice(item.startAngle, item.endAngle)}
                      fill={item.color}
                      stroke="var(--card)"
                      strokeWidth="2"
                    >
                      <title>
                        {item.label}: {visitFormatter.format(item.visits)}{" "}
                        visits, {formatPercent(item.percentage)}
                      </title>
                    </path>
                  ))}
                </svg>
                <div className="absolute inset-0 grid place-items-center">
                  <div className="grid size-24 place-items-center rounded-full bg-card text-center shadow-sm ring-1 ring-border">
                    <div>
                      <p className="text-xl font-bold">
                        {formatPercent(diagnosisSlices[0].percentage)}
                      </p>
                      <p className="text-[11px] font-medium uppercase text-muted-foreground">
                        Top share
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 grid w-full grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg bg-background p-3 ring-1 ring-border">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Activity className="size-4 text-primary" />
                    Leading diagnosis
                  </div>
                  <p className="mt-1 font-semibold">
                    {diagnosisDistribution[0].label}
                  </p>
                </div>
                <div className="rounded-lg bg-background p-3 ring-1 ring-border">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <TrendingUp className="size-4 text-emerald-600" />
                    Fastest growth
                  </div>
                  <p className="mt-1 font-semibold">
                    Upper respiratory +12.7%
                  </p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border">
              <div className="min-w-[720px]">
                <div className="grid grid-cols-[1.4fr_0.7fr_0.7fr_0.7fr_0.7fr] border-b border-border bg-muted/40 px-4 py-3 text-xs font-semibold uppercase text-muted-foreground">
                  <span>Diagnosis group</span>
                  <span className="text-right">Visits</span>
                  <span className="text-right">Share</span>
                  <span className="text-right">90d trend</span>
                  <span className="text-right">Avg age</span>
                </div>
                <div className="divide-y divide-border">
                  {diagnosisSlices.map((item) => (
                    <div
                      key={item.label}
                      className="grid grid-cols-[1.4fr_0.7fr_0.7fr_0.7fr_0.7fr] items-center gap-3 px-4 py-3 text-sm"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span
                          className="size-3 shrink-0 rounded-sm"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="min-w-0 truncate font-medium">
                          {item.label}
                        </span>
                      </div>
                      <span className="text-right font-semibold">
                        {visitFormatter.format(item.visits)}
                      </span>
                      <span className="text-right text-muted-foreground">
                        {formatPercent(item.percentage)}
                      </span>
                      <span
                        className={`text-right font-semibold ${
                          item.change >= 0
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        {formatChange(item.change)}
                      </span>
                      <span className="text-right text-muted-foreground">
                        {item.avgAge}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
