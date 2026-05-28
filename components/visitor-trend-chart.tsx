"use client";

import { useCallback, useMemo, useRef, useState } from "react";

import type { ChartPoint } from "@/lib/analytics";
import { buildSmoothPath } from "@/lib/analytics";
import { cn } from "@/lib/utils";

type VisitorTrendChartProps = {
  data: ChartPoint[];
  className?: string;
};

const WIDTH = 880;
const HEIGHT = 280;
const PADDING = { top: 24, right: 24, bottom: 40, left: 48 };

export function VisitorTrendChart({ data, className }: VisitorTrendChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const chart = useMemo(() => {
    const innerW = WIDTH - PADDING.left - PADDING.right;
    const innerH = HEIGHT - PADDING.top - PADDING.bottom;
    const maxCount = Math.max(1, ...data.map((d) => d.count));

    const coords = data.map((point, index) => {
      const x =
        data.length <= 1
          ? PADDING.left + innerW / 2
          : PADDING.left + (index / (data.length - 1)) * innerW;
      const y = PADDING.top + innerH - (point.count / maxCount) * innerH;
      return { ...point, x, y };
    });

    const linePath = buildSmoothPath(
      coords.map((p) => ({
        x: p.x,
        y: p.y,
      })),
    );

    const areaPath =
      coords.length > 0
        ? `${linePath} L ${coords[coords.length - 1].x} ${PADDING.top + innerH} L ${coords[0].x} ${PADDING.top + innerH} Z`
        : "";

    const yTicks = [0, Math.ceil(maxCount / 2), maxCount];

    return { coords, linePath, areaPath, maxCount, innerW, innerH, yTicks };
  }, [data]);

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

  if (data.length === 0) {
    return (
      <div
        className={cn(
          "flex h-[280px] items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground",
          className,
        )}
      >
        No visitor data for the selected filters.
      </div>
    );
  }

  return (
    <div className={cn("relative w-full", className)}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full touch-none select-none"
        role="img"
        aria-label="Patient visitors trend chart"
        onMouseMove={(e) => handlePointerMove(e.clientX)}
        onMouseLeave={() => setHoverIndex(null)}
        onTouchMove={(e) => {
          const touch = e.touches[0];
          if (touch) handlePointerMove(touch.clientX);
        }}
        onTouchEnd={() => setHoverIndex(null)}
      >
        {chart.yTicks.map((tick) => {
          const y =
            PADDING.top +
            chart.innerH -
            (tick / chart.maxCount) * chart.innerH;
          return (
            <g key={tick}>
              <line
                x1={PADDING.left}
                x2={WIDTH - PADDING.right}
                y1={y}
                y2={y}
                className="stroke-border"
                strokeDasharray="4 4"
              />
              <text
                x={PADDING.left - 10}
                y={y + 4}
                textAnchor="end"
                className="fill-muted-foreground text-[11px]"
              >
                {tick}
              </text>
            </g>
          );
        })}

        {chart.areaPath ? (
          <path
            d={chart.areaPath}
            className="fill-primary/15"
          />
        ) : null}

        {chart.linePath ? (
          <path
            d={chart.linePath}
            fill="none"
            className="stroke-primary"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : null}

        {chart.coords.map((point, index) => (
          <circle
            key={point.date}
            cx={point.x}
            cy={point.y}
            r={hoverIndex === index ? 6 : 3}
            className={cn(
              "fill-primary stroke-background transition-all",
              hoverIndex === index ? "stroke-2" : "stroke-0",
            )}
          />
        ))}

        {active ? (
          <>
            <line
              x1={active.x}
              x2={active.x}
              y1={PADDING.top}
              y2={PADDING.top + chart.innerH}
              className="stroke-primary/40"
              strokeDasharray="4 4"
            />
            <circle
              cx={active.x}
              cy={active.y}
              r={7}
              className="fill-primary stroke-background stroke-2"
            />
          </>
        ) : null}

        {chart.coords
          .filter(
            (_, i) =>
              i === 0 ||
              i === chart.coords.length - 1 ||
              i % Math.ceil(chart.coords.length / 6) === 0,
          )
          .map((point) => (
            <text
              key={`label-${point.date}`}
              x={point.x}
              y={HEIGHT - 12}
              textAnchor="middle"
              className="fill-muted-foreground text-[10px]"
            >
              {point.label}
            </text>
          ))}
      </svg>

      {active ? (
        <div
          className="pointer-events-none absolute z-10 min-w-[140px] rounded-lg border border-border bg-popover px-3 py-2 text-sm shadow-lg"
          style={{
            left: `${(active.x / WIDTH) * 100}%`,
            top: `${(active.y / HEIGHT) * 100}%`,
            transform: "translate(-50%, calc(-100% - 14px))",
          }}
        >
          <p className="font-medium text-foreground">{active.label}</p>
          <p className="text-muted-foreground">
            <span className="font-semibold text-primary">{active.count}</span>{" "}
            {active.count === 1 ? "visitor" : "visitors"}
          </p>
        </div>
      ) : null}
    </div>
  );
}
