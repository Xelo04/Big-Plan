"use client";

import { useMemo, useState } from "react";
import { Select } from "antd";
import { calculateDashboardStats } from "@/src/lib/dashboard/dashboard-utils";
import { useFxRates } from "@/src/lib/portfolio/use-fx-rates";
import type { DashboardSimulation } from "@/src/lib/dashboard/dashboard-types";
import DashboardKPI from "./DashboardKPI";
import DashboardAllocationChart from "./DashboardAllocationChart";
import DashboardHighlights from "./DashboardHighlights";
import DashboardAlerts from "./DashboardAlerts";

type DashboardViewProps = {
  simulations: DashboardSimulation[];
  userName: string;
};

const ALL_KEY = "__all__";

export default function DashboardView({
  simulations,
  userName,
}: DashboardViewProps) {
  const { rates: fxRates } = useFxRates();
  const [selected, setSelected] = useState<string>(ALL_KEY);

  const activeSimulations = useMemo(() => {
    if (selected === ALL_KEY) return simulations;
    const found = simulations.find((s) => s.id === selected);
    return found ? [found] : [];
  }, [selected, simulations]);

  const stats = useMemo(
    () => calculateDashboardStats(activeSimulations, fxRates),
    [activeSimulations, fxRates],
  );

  const totalAssetsCount = useMemo(
    () => activeSimulations.reduce((acc, s) => acc + s.assets.length, 0),
    [activeSimulations],
  );

  const selectOptions = [
    { value: ALL_KEY, label: "Cały majątek" },
    ...simulations.map((sim) => ({
      value: sim.id,
      label: sim.name,
    })),
  ];

  return (
    <div className="w-full max-w-6xl mx-auto p-6 flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-(--text)">
            Cześć, {userName}!
          </h1>
          <p className="text-sm text-(--muted) mt-1">
            Oto podsumowanie Twojego majątku.
          </p>
        </div>

        {simulations.length > 1 && (
          <div className="min-w-60">
            <Select
              value={selected}
              onChange={setSelected}
              size="large"
              style={{ width: "100%" }}
              options={selectOptions}
            />
          </div>
        )}
      </div>

      {stats.needsRebalancing.length > 0 && (
        <DashboardAlerts needsRebalancing={stats.needsRebalancing} />
      )}

      <DashboardKPI stats={stats} totalAssetsCount={totalAssetsCount} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DashboardAllocationChart stats={stats} />
        <DashboardHighlights stats={stats} />
      </div>
    </div>
  );
}
