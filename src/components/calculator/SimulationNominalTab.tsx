import { Tooltip } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import SimulationComparisonChart from "./SimulationComparisonChart";

type SimulationSeries = {
  id: number;
  detailedChartData: { label: string; value: number }[];
};

type SimulationNominalTabProps = {
  chartRenderKey: number;
  series: SimulationSeries[];
  displayEveryNthSimulation: number;
  totalSimulations: number;
  calibratedMonthlyPayment: number | null;
  simulationSuccessRate: number | null;
};

export default function SimulationNominalTab({
  chartRenderKey,
  series,
  displayEveryNthSimulation,
  totalSimulations,
  calibratedMonthlyPayment,
  simulationSuccessRate,
}: SimulationNominalTabProps) {
  return (
    <>
      <SimulationComparisonChart
        key={`sim-chart-${chartRenderKey}`}
        series={series}
        displayEveryNthSimulation={displayEveryNthSimulation}
        animate
      />

      {(calibratedMonthlyPayment != null || simulationSuccessRate != null) && (
        <div className="mt-4 rounded-2xl border border-(--btn-border) bg-[linear-gradient(135deg,rgba(14,165,164,0.09),rgba(249,115,22,0.07))] p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <p className="text-xs uppercase tracking-[0.16em] text-(--muted)">
              Rekomendacja składki
            </p>
            <Tooltip
              title={`Symulacja analizuje ${totalSimulations.toLocaleString("pl-PL")} scenariuszy rynkowych i dla każdego oblicza końcową wartość portfela. Na tej podstawie kalibrowana jest składka miesięczna tak, aby osiągnąć docelowy poziom przeżywalności symulacji i zwiększyć szanse utrzymania dodatniego salda portfela na końcu horyzontu.`}
              styles={{ root: { maxWidth: 360, fontSize: 13 } }}
              getPopupContainer={(trigger) =>
                trigger?.parentElement || document.body
              }
            >
              <InfoCircleOutlined
                className="cursor-pointer text-(--muted) hover:text-(--text)"
                style={{ fontSize: 18 }}
                aria-label="Jak dziala rekomendacja skladki"
              />
            </Tooltip>
          </div>

          {calibratedMonthlyPayment != null && (
            <div className="mt-2 flex min-h-fit items-end gap-2">
              <p className="text-3xl md:text-4xl font-semibold text-(--text) leading-none">
                {calibratedMonthlyPayment.toLocaleString("pl-PL", {
                  maximumFractionDigits: 0,
                })}
              </p>
              <p className="self-end text-base md:text-lg text-(--muted) leading-none">
                zł / mies.
              </p>
            </div>
          )}

          {simulationSuccessRate != null && (
            <div className="mt-4">
              <div className="flex items-center justify-between gap-3 text-sm">
                <p className="text-(--muted)">Skuteczność symulacji</p>
                <p className="font-semibold text-(--text)">
                  {(simulationSuccessRate * 100).toFixed(3)}%
                </p>
              </div>
              <div className="mt-2 h-2.5 rounded-full bg-black/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-linear-to-r from-[#0ea5a4] to-[#f97316]"
                  style={{
                    width: `${Math.min(100, Math.max(0, simulationSuccessRate * 100))}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
