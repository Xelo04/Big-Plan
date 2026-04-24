"use client";

import { useMemo, useState, useEffect } from "react";
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
  displayEveryNthSimulation?: number; // np. 20 = wyświetl co 20-tą symulację
  animate?: boolean;
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

export default function SimulationComparisonChart({
  series,
  displayEveryNthSimulation = 20,
  animate = false,
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
      series.filter(
        (item) => item.id % Math.max(1, displayEveryNthSimulation) === 1,
      ),
    [series, displayEveryNthSimulation],
  );

  const visibleSeriesIds = useMemo(
    () => new Set(visibleSeries.map((item) => item.id)),
    [visibleSeries],
  );

  const combinedChartData: CombinedChartPoint[] = useMemo(() => {
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
  }, [series, visibleSeriesIds]);

  const percentileYDomain = useMemo<[number, number] | undefined>(() => {
    if (combinedChartData.length === 0) {
      return undefined;
    }

    const percentileValues = combinedChartData.flatMap((row) => [
      Number(row.p5 ?? 0),
      Number(row.p25 ?? 0),
      Number(row.p50 ?? 0),
      Number(row.p75 ?? 0),
      Number(row.p95 ?? 0),
    ]);

    const min = Math.min(...percentileValues);
    const max = Math.max(...percentileValues);
    const domainMin = Math.min(min, 0);
    const domainMax = Math.max(max, 0);

    // Keep a visible axis range even when all percentile lines are flat.
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
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={combinedChartData}
            margin={{ top: 14, right: 20, left: 6, bottom: 2 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(148,163,184,0.22)"
            />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12, fill: "var(--text)" }}
              tickLine={{ stroke: "rgba(148,163,184,0.65)" }}
              axisLine={{ stroke: "rgba(148,163,184,0.65)" }}
            />
            <YAxis
              tickFormatter={(value) => formatAmount(Number(value))}
              tick={{ fontSize: 12, fill: "var(--text)" }}
              tickLine={{ stroke: "rgba(148,163,184,0.65)" }}
              axisLine={{ stroke: "rgba(148,163,184,0.65)" }}
              allowDecimals={false}
              domain={percentileYDomain ?? ["auto", "auto"]}
              ticks={
                percentileYDomain
                  ? [percentileYDomain[0], 0, percentileYDomain[1]]
                  : undefined
              }
              allowDataOverflow
            />
            <ReferenceLine
              y={0}
              stroke="rgba(148,163,184,0.9)"
              strokeWidth={1.6}
            />
            <RechartsTooltip
              content={<CustomTooltip />}
              contentStyle={{
                borderRadius: 10,
                border: "1px solid var(--btn-border)",
                background: "var(--bg)",
                color: "var(--text)",
                fontSize: 12,
                boxShadow: "0 8px 24px rgba(15, 23, 42, 0.14)",
              }}
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
        {/* single overlay used to reveal the chart (animates one element only) */}
        <ChartRevealOverlay
          animate={animate}
          delay={chartAnimationDelay}
          duration={chartAnimationDuration}
        />
      </div>
    </div>
  );
}

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

  useEffect(() => {
    let t: ReturnType<typeof setTimeout> | null = null;
    if (animate) {
      // schedule reveal on next tick so CSS transition runs
      t = setTimeout(() => setCovered(false), 10);
    }
    return () => {
      if (t) clearTimeout(t);
    };
  }, [animate]);

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
