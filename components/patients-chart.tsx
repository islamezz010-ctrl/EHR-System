"use client";

import { useCallback, useMemo, useRef, useState } from "react";

import {
  buildSmoothPath,
  type PatientsChartPoint,
  type PatientsPeriod,
} from "@/lib/patients-chart";
import { cn } from "@/lib/utils";

const TEAL = "#26C6DA";
const GRID = "#E2E8F0";
const AXIS_LABEL = "#A0AEC0";
function getYScale(maxCount: number) {
  const padded = Math.max(10, Math.ceil(maxCount * 1.15 / 10) * 10);
  const step = padded <= 50 ? 10 : padded <= 100 ? 20 : padded <= 200 ? 50 : 100;
  const yMax = Math.ceil(padded / step) * step;
  const ticks: number[] = [];
  for (let t = 0; t <= yMax; t += step) ticks.push(t);
  return { yMax, ticks };
}

const PERIODS: PatientsPeriod[] = ["Weekly", "Monthly", "Yearly"];

const WIDTH = 880;
const HEIGHT = 320;
const PADDING = { top: 32, right: 28, bottom: 48, left: 52 };

type PatientsChartProps = {
  data: PatientsChartPoint[];
  className?: string;
  period: PatientsPeriod;
  onPeriodChange: (period: PatientsPeriod) => void;
};

export function PatientsChart({
  data,
  className,
  period,
  onPeriodChange,
}: PatientsChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const yScale = useMemo(
    () => getYScale(Math.max(...data.map((p) => p.count), 0)),
    [data],
  );

  const chart = useMemo(() => {
    const innerW = WIDTH - PADDING.left - PADDING.right;
    const innerH = HEIGHT - PADDING.top - PADDING.bottom;
    const maxCount = yScale.yMax;

    const coords = data.map((point, index) => {
      const x =
        data.length <= 1
          ? PADDING.left + innerW / 2
          : PADDING.left + (index / (data.length - 1)) * innerW;
      const y =
        PADDING.top + innerH - (Math.min(point.count, maxCount) / maxCount) * innerH;
      return { ...point, x, y };
    });

    const linePath = buildSmoothPath(
      coords.map((p) => ({ x: p.x, y: p.y })),
    );

    return { coords, linePath, innerH };
  }, [data, yScale.yMax]);

  const handlePointerMove = useCallback(
    (clientX: number) => {
      if (!svgRef.current || chart.coords.length === 0) return;
      const rect = svgRef.current.getBoundingClientRect();
      const scaleX = WIDTH / rect.width;
      const svgX = (clientX - rect.left) * scaleX;

      let nearest = 0;
      let minDist = Infinity;
      chart.coords.forEach((point, index) => {
        const dist = Math.abs(point.x - svgX);
        if (dist < minDist) {
          minDist = dist;
          nearest = index;
        }
      });
      setHoverIndex(nearest);
    },
    [chart.coords],
  );

  const active =
    hoverIndex !== null && chart.coords[hoverIndex]
      ? chart.coords[hoverIndex]
      : null;

  return (
    <div
      className={cn(
        "rounded-2xl bg-white p-6 shadow-[0_4px_24px_rgba(15,23,42,0.08)] dark:bg-card dark:shadow-none",
        className,
      )}
    >
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <h3 className="text-xl font-bold tracking-tight text-[#1A202C] dark:text-slate-50">
          Patients
        </h3>

        <div className="flex items-center gap-8 self-center sm:self-auto">
          {PERIODS.map((item) => {
            const isActive = period === item;
            return (
              <button
                key={item}
                type="button"
                onClick={() => onPeriodChange(item)}
                className="group flex flex-col items-center gap-2"
              >
                <span
                  className={cn(
                    "text-sm font-medium transition-colors",
                    isActive
                      ? "text-[#26C6DA]"
                      : "text-[#A0AEC0] hover:text-[#718096]",
                  )}
                >
                  {item}
                </span>
                <span
                  className={cn(
                    "h-1 w-10 rounded-full transition-colors",
                    isActive ? "bg-[#26C6DA]" : "bg-transparent",
                  )}
                />
              </button>
            );
          })}
        </div>
      </div>

      {data.length === 0 ? (
        <div className="flex h-[280px] items-center justify-center text-sm text-[#A0AEC0]">
          No patient data for the selected filters.
        </div>
      ) : (
        <div className="relative w-full">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            className="w-full touch-none select-none"
            role="img"
            aria-label="Patients trend chart"
            onMouseMove={(e) => handlePointerMove(e.clientX)}
            onMouseLeave={() => setHoverIndex(null)}
            onTouchMove={(e) => {
              const touch = e.touches[0];
              if (touch) handlePointerMove(touch.clientX);
            }}
            onTouchEnd={() => setHoverIndex(null)}
          >
            {yScale.ticks.map((tick) => {
              const y =
                PADDING.top +
                chart.innerH -
                (tick / yScale.yMax) * chart.innerH;
              return (
                <g key={tick}>
                  <line
                    x1={PADDING.left}
                    x2={WIDTH - PADDING.right}
                    y1={y}
                    y2={y}
                    stroke={GRID}
                    strokeWidth={1}
                  />
                  <text
                    x={PADDING.left - 12}
                    y={y + 4}
                    textAnchor="end"
                    fill={AXIS_LABEL}
                    fontSize={12}
                  >
                    {tick}
                  </text>
                </g>
              );
            })}

            {chart.linePath ? (
              <path
                d={chart.linePath}
                fill="none"
                stroke={TEAL}
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ) : null}

            {active ? (
              <circle
                cx={active.x}
                cy={active.y}
                r={6}
                fill={TEAL}
                stroke="#fff"
                strokeWidth={2}
              />
            ) : null}

            {chart.coords.map((point) => (
              <text
                key={point.label}
                x={point.x}
                y={HEIGHT - 16}
                textAnchor="middle"
                fill={AXIS_LABEL}
                fontSize={12}
              >
                {point.label}
              </text>
            ))}
          </svg>

          {active ? (
            <div
              className="pointer-events-none absolute z-10 rounded-xl bg-white px-4 py-3 text-center shadow-[0_8px_24px_rgba(15,23,42,0.12)] dark:bg-popover dark:shadow-lg"
              style={{
                left: `${(active.x / WIDTH) * 100}%`,
                top: `${(active.y / HEIGHT) * 100}%`,
                transform: "translate(-50%, calc(-100% - 18px))",
              }}
            >
              <div
                className="absolute -bottom-1.5 left-1/2 size-3 -translate-x-1/2 rotate-45 bg-white shadow-sm dark:bg-popover"
                aria-hidden
              />
              <p className="text-2xl font-bold leading-none text-[#1A202C] dark:text-slate-50">
                {active.count}
              </p>
              <p className="mt-1 text-xs text-[#A0AEC0]">patients</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
