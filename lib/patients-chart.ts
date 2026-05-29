import type { VisitRecord } from "@/lib/analytics";

export type PatientsPeriod = "Weekly" | "Monthly" | "Yearly";

export type PatientsChartPoint = {
  label: string;
  count: number;
};

/** Reference monthly series matching the design mockup. */
export const MONTHLY_PATIENTS_DEMO: PatientsChartPoint[] = [
  { label: "Jan", count: 180 },
  { label: "Feb", count: 260 },
  { label: "Mar", count: 340 },
  { label: "Apr", count: 430 },
  { label: "May", count: 357 },
  { label: "Jun", count: 300 },
];

export const WEEKLY_PATIENTS_DEMO: PatientsChartPoint[] = [
  { label: "Mon", count: 42 },
  { label: "Tue", count: 58 },
  { label: "Wed", count: 71 },
  { label: "Thu", count: 65 },
  { label: "Fri", count: 89 },
  { label: "Sat", count: 52 },
  { label: "Sun", count: 38 },
];

export const YEARLY_PATIENTS_DEMO: PatientsChartPoint[] = [
  { label: "2021", count: 2100 },
  { label: "2022", count: 2680 },
  { label: "2023", count: 3120 },
  { label: "2024", count: 3580 },
  { label: "2025", count: 3910 },
  { label: "2026", count: 2140 },
];

export function aggregateVisitsByMonth(
  visits: VisitRecord[],
): PatientsChartPoint[] {
  const counts = new Map<string, number>();
  for (const visit of visits) {
    const date = new Date(visit.visitDateIso);
    if (Number.isNaN(date.getTime())) continue;
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const keys = [...counts.keys()].sort();
  if (keys.length === 0) return [];

  const start = new Date(`${keys[0]}-01`);
  const end = new Date(`${keys[keys.length - 1]}-01`);
  const points: PatientsChartPoint[] = [];

  for (
    let cursor = new Date(start);
    cursor <= end;
    cursor.setMonth(cursor.getMonth() + 1)
  ) {
    const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`;
    points.push({
      label: cursor.toLocaleDateString("en-US", { month: "short" }),
      count: counts.get(key) ?? 0,
    });
  }

  return points.slice(-6);
}

export function aggregateVisitsByWeek(
  visits: VisitRecord[],
): PatientsChartPoint[] {
  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const counts = new Array(7).fill(0);
  for (const visit of visits) {
    const date = new Date(visit.visitDateIso);
    if (Number.isNaN(date.getTime())) continue;
    counts[date.getDay()] += 1;
  }
  return dayLabels.map((label, index) => ({
    label,
    count: counts[index],
  }));
}

export function aggregateVisitsByYear(
  visits: VisitRecord[],
): PatientsChartPoint[] {
  const counts = new Map<number, number>();
  for (const visit of visits) {
    const date = new Date(visit.visitDateIso);
    if (Number.isNaN(date.getTime())) continue;
    const year = date.getFullYear();
    counts.set(year, (counts.get(year) ?? 0) + 1);
  }

  const years = [...counts.keys()].sort();
  if (years.length === 0) return [];

  const points: PatientsChartPoint[] = [];
  for (let year = years[0]; year <= years[years.length - 1]; year++) {
    points.push({
      label: String(year),
      count: counts.get(year) ?? 0,
    });
  }

  return points.slice(-6);
}

export function getPatientsChartData(
  visits: VisitRecord[],
  period: PatientsPeriod,
): PatientsChartPoint[] {
  const aggregated =
    period === "Weekly"
      ? aggregateVisitsByWeek(visits)
      : period === "Yearly"
        ? aggregateVisitsByYear(visits)
        : aggregateVisitsByMonth(visits);

  if (aggregated.length >= 2 && aggregated.some((p) => p.count > 0)) {
    return aggregated;
  }

  if (period === "Weekly") return WEEKLY_PATIENTS_DEMO;
  if (period === "Yearly") return YEARLY_PATIENTS_DEMO;
  return MONTHLY_PATIENTS_DEMO;
}

/** Smooth SVG path through chart coordinates. */
export function buildSmoothPath(
  points: { x: number; y: number }[],
): string {
  if (points.length === 0) return "";
  if (points.length === 1) {
    return `M ${points[0].x} ${points[0].y}`;
  }

  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return path;
}
