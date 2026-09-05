"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";

type PortfolioMiniChartPoint = {
  label: string;
  value: number;
};

type PortfolioMiniChartProps = {
  data: PortfolioMiniChartPoint[];
  stroke: string;
  yMax?: number;
};

export default function PortfolioMiniChart({
  data,
  stroke,
  yMax,
}: PortfolioMiniChartProps) {
  const formatValue = (value: number) =>
    new Intl.NumberFormat("pl-PL", {
      maximumFractionDigits: 0,
    }).format(Math.round(value));

  return (
    <div className="h-40 w-full rounded-lg bg-[color-mix(in_srgb,var(--bg)_92%,white_8%)] p-2">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 14, right: 26, left: 6, bottom: 2 }}
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
            tickFormatter={(value) => formatValue(Number(value))}
            tick={{ fontSize: 12, fill: "var(--text)" }}
            tickLine={{ stroke: "rgba(148,163,184,0.65)" }}
            axisLine={{ stroke: "rgba(148,163,184,0.65)" }}
            tickMargin={8}
            width={58}
            allowDecimals={false}
            tickCount={4}
            domain={[0, yMax ?? "auto"]}
          />
          <RechartsTooltip
            formatter={(value) => [
              formatValue(Number(value ?? 0)) + " zł",
              "Wartość",
            ]}
            labelFormatter={(label) => `Rok życia: ${String(label ?? "-")}`}
            contentStyle={{
              borderRadius: 10,
              border: "1px solid var(--btn-border)",
              background: "var(--bg)",
              color: "var(--text)",
              fontSize: 12,
              boxShadow: "0 8px 24px rgba(15, 23, 42, 0.14)",
            }}
            labelStyle={{ color: "var(--text)", fontWeight: 600 }}
            itemStyle={{ color: "var(--text)" }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={stroke}
            strokeWidth={2.5}
            dot={{ r: 3.5, fill: stroke }}
            activeDot={{ r: 5 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
