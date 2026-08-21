"use client";

import { useMemo, useState, useEffect, memo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { PercentilePoint } from "@/src/lib/simulation/simulation-types";

type ChartPoint = {
  label: string;
  value: number;
};

type SimulationSeries = {
  id: number;
  detailedChartData: ChartPoint[];
};

type CombinedChartPoint = {
  label: string;
  [key: string]: number | string;
};

type SimulationComparisonChartProps = {
  series: SimulationSeries[];
  displayEveryNthSimulation?: number;
  animate?: boolean;
  precomputedPercentiles?: PercentilePoint[];
};

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ dataKey: string; value: number }>;
  label?: string;
}) => {
  if (!active || !payload) {
    return null;
  }

  const formatAmount = (value: number) =>
    new Intl.NumberFormat("pl-PL", { maximumFractionDigits: 0 }).format(value);

  const labelMap: Record<string, string> = {
    p5: "P5",
    p25: "P25",
    p50: "Mediana (P50)",
    p75: "P75",
    p95: "P95",
  };

  const colorMap: Record<string, string> = {
    p5: "#ea580c",
    p25: "#0284c7",
    p50: "#dc2626",
    p75: "#16a34a",
    p95: "#7c3aed",
  };

  const percentiles = payload
    .filter((item) => !String(item.dataKey).startsWith("sim"))
    .map((item) => ({
      key: String(item.dataKey),
      value: item.value,
    }))
    .sort((a, b) => {
      const order = { p95: 5, p75: 4, p50: 3, p25: 2, p5: 1 };
      return (
        (order[b.key as keyof typeof order] ?? 0) -
        (order[a.key as keyof typeof order] ?? 0)
      );
    });

  return (
    <div
      style={{
        borderRadius: 10,
        border: "1px solid var(--btn-border)",
        background: "var(--bg)",
        color: "var(--text)",
        fontSize: 12,
        padding: "8px 12px",
        boxShadow: "0 8px 24px rgba(15, 23, 42, 0.14)",
      }}
    >
      <p style={{ margin: "0 0 6px 0", fontWeight: 500 }}>
        Rok: {label ?? "-"}
      </p>
      {percentiles.map((item) => (
        <p
          key={item.key}
          style={{
            margin: "4px 0",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <span
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "2px",
              backgroundColor: colorMap[item.key] ?? "#999",
              flexShrink: 0,
            }}
          />
          <span style={{ fontWeight: 500 }}>
            {labelMap[item.key] ?? "Wartosc"}:
          </span>{" "}
          {formatAmount(Math.round(item.value))} zl
        </p>
      ))}
    </div>
  );
};

const SimulationComparisonChart = memo(function SimulationComparisonChart({
  series,
  displayEveryNthSimulation = 20,
  animate = false,
  precomputedPercentiles,
}: SimulationComparisonChartProps) {
  const formatAmount = (value: number) =>
    new Intl.NumberFormat("pl-PL", { maximumFractionDigits: 0 }).format(value);
  const chartAnimationDelay = 420;
  const chartAnimationDuration = 1300;

  const quantile = (sortedValues: number[], q: number) => {
    if (sortedValues.length === 0) return 0;
    const pos = (sortedValues.length - 1) * q;
    const base = Math.floor(pos);
    const rest = pos - base;
    const next = sortedValues[base + 1] ?? sortedValues[base];
    return sortedValues[base] + rest * (next - sortedValues[base]);
  };

  const visibleSeries = useMemo(
    () =>
      precomputedPercentiles
        ? []
        : series.filter(
            (item) => item.id % Math.max(1, displayEveryNthSimulation) === 1,
          ),
    [series, displayEveryNthSimulation, precomputedPercentiles],
  );

  const visibleSeriesIds = useMemo(
    () => new Set(visibleSeries.map((item) => item.id)),
    [visibleSeries],
  );

  const combinedChartData: CombinedChartPoint[] = useMemo(() => {
    if (precomputedPercentiles && precomputedPercentiles.length > 0) {
      return precomputedPercentiles.map((point) => ({
        label: point.label,
        p5: point.p5,
        p25: point.p25,
        p50: point.p50,
        p75: point.p75,
        p95: point.p95,
      }));
    }

    if (series.length === 0) {
      return [];
    }

    const labels = Array.from(
      new Set(
        series.flatMap((item) => item.detailedChartData.map((p) => p.label)),
      ),
    ).sort((a, b) => Number(a) - Number(b));

    return labels.map((label) => {
      const row: CombinedChartPoint = { label };
      const valuesAtLabel: number[] = [];

      series.forEach((item) => {
        const found = item.detailedChartData.find((p) => p.label === label);
        const value = found?.value ?? 0;

        if (visibleSeriesIds.has(item.id)) {
          row[`sim${item.id}`] = value;
        }

        valuesAtLabel.push(value);
      });

      valuesAtLabel.sort((a, b) => a - b);
      row.p5 = quantile(valuesAtLabel, 0.05);
      row.p25 = quantile(valuesAtLabel, 0.25);
      row.p50 = quantile(valuesAtLabel, 0.5);
      row.p75 = quantile(valuesAtLabel, 0.75);
      row.p95 = quantile(valuesAtLabel, 0.95);

      return row;
    });
  }, [series, visibleSeriesIds, precomputedPercentiles]);

  const percentileYDomain = useMemo<[number, number] | undefined>(() => {
    if (combinedChartData.length === 0) {
      return undefined;
    }

    const p5Values = combinedChartData.map((row) => Number(row.p5 ?? 0));
    const p95Values = combinedChartData.map((row) => Number(row.p95 ?? 0));

    const min = Math.min(...p5Values);
    const max = Math.max(...p95Values);

    const domainMin = Math.min(min, 0);
    const domainMax = Math.max(max, 0);

    if (domainMin === domainMax) {
      const pad = Math.max(1, Math.abs(domainMin) * 0.05);
      return [domainMin - pad, domainMax + pad];
    }

    return [domainMin, domainMax];
  }, [combinedChartData]);

  return (
    <div className="rounded-lg border border-(--btn-border) p-4">
      <p className="font-semibold mb-3">Porównanie wszystkich symulacji</p>
      <p className="text-xs text-(--muted) mb-2">
        Linie percentylowe: P5, P25, P50, P75 i P95.
      </p>
      <div className="h-80 w-full" style={{ position: "relative" }}>
        <ResponsiveContainer
          width="100%"
          height="100%"
          minWidth={0}
          debounce={50}
        >
          <LineChart
            data={combinedChartData}
            margin={{ top: 14, right: 20, left: 6, bottom: 2 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(148,163,184,0.22)"
              horizontal
              vertical
            />
            <XAxis
              dataKey="label"
              type="category"
              tick={{ fontSize: 12, fill: "var(--text)" }}
              tickLine={{ stroke: "rgba(148,163,184,0.65)" }}
              axisLine={{ stroke: "rgba(148,163,184,0.65)" }}
              interval="preserveStartEnd"
              minTickGap={20}
            />
            <YAxis
              tickFormatter={(value) => formatAmount(Number(value))}
              tick={{ fontSize: 12, fill: "var(--text)" }}
              tickLine={{ stroke: "rgba(148,163,184,0.65)" }}
              axisLine={{ stroke: "rgba(148,163,184,0.65)" }}
              allowDecimals={false}
              domain={percentileYDomain ?? ["auto", "auto"]}
              allowDataOverflow
            />
            <ReferenceLine
              y={0}
              stroke="rgba(148,163,184,0.9)"
              strokeWidth={1.6}
            />
            <RechartsTooltip
              content={<CustomTooltip />}
              cursor={{ stroke: "rgba(148,163,184,0.4)", strokeWidth: 1 }}
              wrapperStyle={{ zIndex: 30 }}
            />
            {visibleSeries.map((item) => (
              <Line
                key={item.id}
                type="monotone"
                dataKey={`sim${item.id}`}
                stroke="#94a3b8"
                strokeOpacity={0.18}
                strokeWidth={1}
                dot={false}
                activeDot={false}
                isAnimationActive={false}
              />
            ))}
            <Line
              type="monotone"
              dataKey="p5"
              name="P5"
              stroke="#ea580c"
              strokeWidth={2.4}
              dot={false}
              activeDot={false}
              isAnimationActive={animate}
              animationBegin={chartAnimationDelay}
              animationDuration={1300}
              animationEasing="linear"
            />
            <Line
              type="monotone"
              dataKey="p25"
              name="P25"
              stroke="#0284c7"
              strokeWidth={2.4}
              dot={false}
              activeDot={false}
              isAnimationActive={animate}
              animationBegin={chartAnimationDelay}
              animationDuration={1300}
              animationEasing="linear"
            />
            <Line
              type="monotone"
              dataKey="p50"
              name="P50"
              stroke="#dc2626"
              strokeWidth={2.8}
              dot={false}
              activeDot={false}
              isAnimationActive={animate}
              animationBegin={chartAnimationDelay}
              animationDuration={1300}
              animationEasing="linear"
            />
            <Line
              type="monotone"
              dataKey="p75"
              name="P75"
              stroke="#16a34a"
              strokeWidth={2.4}
              dot={false}
              activeDot={false}
              isAnimationActive={animate}
              animationBegin={chartAnimationDelay}
              animationDuration={1300}
              animationEasing="linear"
            />
            <Line
              type="monotone"
              dataKey="p95"
              name="P95"
              stroke="#7c3aed"
              strokeWidth={2.4}
              dot={false}
              activeDot={false}
              isAnimationActive={animate}
              animationBegin={chartAnimationDelay}
              animationDuration={1300}
              animationEasing="linear"
            />
          </LineChart>
        </ResponsiveContainer>
        <ChartRevealOverlay
          animate={animate}
          delay={chartAnimationDelay}
          duration={chartAnimationDuration}
        />
      </div>
    </div>
  );
});

export default SimulationComparisonChart;

function ChartRevealOverlay({
  animate,
  delay,
  duration,
}: {
  animate: boolean;
  delay: number;
  duration: number;
}) {
  const [covered, setCovered] = useState<boolean>(animate ? true : false);
  const [hidden, setHidden] = useState<boolean>(!animate);

  useEffect(() => {
    let revealTimer: ReturnType<typeof setTimeout> | null = null;
    let hideTimer: ReturnType<typeof setTimeout> | null = null;

    if (animate) {
      revealTimer = setTimeout(() => setCovered(false), 10);
      hideTimer = setTimeout(() => setHidden(true), delay + duration + 100);
    }
    return () => {
      if (revealTimer) clearTimeout(revealTimer);
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, [animate, delay, duration]);

  if (hidden) return null;

  const style: React.CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    width: covered ? "100%" : "0%",
    pointerEvents: "none",
    background: "var(--bg)",
    transition: `width ${duration}ms linear ${delay}ms`,
    zIndex: 20,
  };

  return <div aria-hidden style={style} />;
}
