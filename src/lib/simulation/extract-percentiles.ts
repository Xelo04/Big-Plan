import type { PercentilePoint } from "./simulation-types";

type ChartPoint = {
  label: string;
  value: number;
};

type SimulationResult = {
  id: number;
  detailedChartData: ChartPoint[];
};

function quantile(sortedValues: number[], q: number): number {
  if (sortedValues.length === 0) return 0;
  const pos = (sortedValues.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  const next = sortedValues[base + 1] ?? sortedValues[base];
  return sortedValues[base] + rest * (next - sortedValues[base]);
}

export function extractPercentiles(
  series: SimulationResult[],
): PercentilePoint[] {
  if (series.length === 0) return [];

  const labels = Array.from(
    new Set(
      series.flatMap((item) => item.detailedChartData.map((p) => p.label)),
    ),
  ).sort((a, b) => Number(a) - Number(b));

  return labels.map((label) => {
    const valuesAtLabel: number[] = [];

    for (const item of series) {
      const found = item.detailedChartData.find((p) => p.label === label);
      valuesAtLabel.push(found?.value ?? 0);
    }

    valuesAtLabel.sort((a, b) => a - b);

    return {
      label,
      p5: quantile(valuesAtLabel, 0.05),
      p25: quantile(valuesAtLabel, 0.25),
      p50: quantile(valuesAtLabel, 0.5),
      p75: quantile(valuesAtLabel, 0.75),
      p95: quantile(valuesAtLabel, 0.95),
    };
  });
}
