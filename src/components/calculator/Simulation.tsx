"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button, Tabs, Tooltip } from "antd";
import {
  BarChartOutlined,
  InfoCircleOutlined,
  UserOutlined,
} from "@ant-design/icons";
import type { FormValues } from "./Calculator";
import SimulationComparisonChart from "./SimulationComparisonChart";
import SimulationParametersForm from "./SimulationParametersForm";
import SaveSimulationModal from "./SaveSimulationModal";
import { useNotify } from "../notifications/NotificationProvider";
import { wartosciPortfelaSymulacja } from "@/app/(public)/calculator/calculator";
import { extractPercentiles } from "@/src/lib/simulation/extract-percentiles";
import type { SaveSimulationPayload } from "@/src/lib/simulation/simulation-types";
import type { PendingSimulationResults } from "@/src/lib/simulation/pending-simulation";

type SimulationProps = {
  formValues: FormValues;
  portfolio: {
    stocks: number;
    bonds: number;
  };
  knowsMonthlyAmount: boolean;
  userMonthlyInvestment?: number;
  startingMonthlyPayment: number;
  onLoadingChange?: (isLoading: boolean) => void;
  isLoggedIn?: boolean;
  saveModalOpen?: boolean;
  onSaveModalClose?: () => void;
  onSimulationReady?: (ready: boolean) => void;
  onSaved?: () => void;
  onSimulationResults?: (results: PendingSimulationResults) => void;
};

type SimulationResult = {
  id: number;
  detailedChartData: { label: string; value: number }[];
};

type SimulationInputs = {
  currentAge: number;
  expectedDeathAge: number;
  workEndAge: number;
  statePensionAge: number;
  estimatedPension: number;
  monthlyNeed: number;
  stocksPct: number;
  monthlyInvestment: number;
};

const sameInputs = (a: SimulationInputs | null, b: SimulationInputs | null) =>
  !!a &&
  !!b &&
  a.currentAge === b.currentAge &&
  a.expectedDeathAge === b.expectedDeathAge &&
  a.workEndAge === b.workEndAge &&
  a.statePensionAge === b.statePensionAge &&
  a.estimatedPension === b.estimatedPension &&
  a.monthlyNeed === b.monthlyNeed &&
  a.stocksPct === b.stocksPct &&
  a.monthlyInvestment === b.monthlyInvestment;

export default function Simulation({
  formValues,
  portfolio,
  knowsMonthlyAmount,
  userMonthlyInvestment,
  startingMonthlyPayment,
  onLoadingChange,
  isLoggedIn = false,
  saveModalOpen = false,
  onSaveModalClose,
  onSimulationReady,
  onSaved,
  onSimulationResults,
}: SimulationProps) {
  const notify = useNotify();

  const totalSimulations = 10000;
  const totalTrialSimulations = 1000;
  const targetSuccessRate = 0.9;
  const targetTolerance = 0.005;
  const visibleSimulationStep = Math.max(1, Math.ceil(totalSimulations / 100));
  const chunkCount = 200;

  const [results, setResults] = useState<SimulationResult[]>([]);
  const [userPaymentResults, setUserPaymentResults] = useState<
    SimulationResult[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [calibratedMonthlyPayment, setCalibratedMonthlyPayment] = useState<
    number | null
  >(null);
  const [simulationSuccessRate, setSimulationSuccessRate] = useState<
    number | null
  >(null);
  const [userSimulationSuccessRate, setUserSimulationSuccessRate] = useState<
    number | null
  >(null);
  const [chartRenderKey, setChartRenderKey] = useState(0);
  const [draftInputs, setDraftInputs] = useState<SimulationInputs>({
    currentAge: formValues.currentAge,
    expectedDeathAge: formValues.expectedDeathAge,
    workEndAge: formValues.workEndAge,
    statePensionAge: formValues.statePensionAge,
    estimatedPension: formValues.estimatedPension,
    monthlyNeed: formValues.monthlyNeed,
    stocksPct: portfolio.stocks,
    monthlyInvestment: userMonthlyInvestment ?? 0,
  });
  const [lastRunInputs, setLastRunInputs] = useState<SimulationInputs | null>(
    null,
  );
  const [saveLoading, setSaveLoading] = useState(false);

  const loadingProgressRef = useRef<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const finishTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const runIdRef = useRef(0);

  const scheduleSimulation = useCallback(
    (inputs: SimulationInputs) => {
      runIdRef.current += 1;
      const runId = runIdRef.current;

      setIsLoading(true);
      onLoadingChange?.(true);
      loadingProgressRef.current = 0;
      setResults([]);
      setUserPaymentResults([]);
      setCalibratedMonthlyPayment(null);
      setSimulationSuccessRate(null);
      setUserSimulationSuccessRate(null);

      timeoutRef.current = setTimeout(() => {
        if (runIdRef.current !== runId) return;

        const stocksWeight = inputs.stocksPct / 100;
        const bondsWeight = (100 - inputs.stocksPct) / 100;
        const validUserMonthlyPayment =
          knowsMonthlyAmount &&
          Number.isFinite(inputs.monthlyInvestment) &&
          inputs.monthlyInvestment > 0
            ? inputs.monthlyInvestment
            : null;

        const successRateForPayment = (payment: number, trials: number) => {
          let successCount = 0;
          for (let i = 0; i < trials; i++) {
            const detailedChartData = wartosciPortfelaSymulacja(
              inputs.monthlyNeed,
              inputs.estimatedPension,
              inputs.currentAge,
              inputs.workEndAge,
              inputs.statePensionAge,
              inputs.expectedDeathAge,
              stocksWeight,
              bondsWeight,
              payment,
            );
            const finalValue =
              detailedChartData[detailedChartData.length - 1]?.value ?? 0;
            if (finalValue >= 0) {
              successCount += 1;
            }
          }
          return successCount / trials;
        };

        const findPaymentForTargetSuccessRate = () => {
          let lower = 0;
          let upper = Math.max(startingMonthlyPayment, 1);
          let upperRate = successRateForPayment(upper, totalTrialSimulations);
          let expandSteps = 0;

          while (
            upperRate < targetSuccessRate - targetTolerance &&
            expandSteps < 10
          ) {
            lower = upper;
            upper *= 1.6;
            upperRate = successRateForPayment(upper, totalTrialSimulations);
            expandSteps += 1;
          }

          for (let i = 0; i < 12; i++) {
            const mid = (lower + upper) / 2;
            const midRate = successRateForPayment(mid, totalTrialSimulations);
            if (midRate >= targetSuccessRate) {
              upper = mid;
            } else {
              lower = mid;
            }
          }

          return { payment: upper };
        };

        const { payment: optimizedMonthlyPayment } =
          findPaymentForTargetSuccessRate();

        const generated: SimulationResult[] = [];
        const userGenerated: SimulationResult[] = [];
        let successCount = 0;
        let userSuccessCount = 0;
        const chunkSize = Math.max(
          1,
          Math.floor(totalSimulations / chunkCount),
        );
        let processed = 0;
        const computeStart = performance.now();

        const runChunk = (startIdx: number) => {
          if (runIdRef.current !== runId) return;

          const end = Math.min(totalSimulations, startIdx + chunkSize);

          for (let idx = startIdx; idx < end; idx++) {
            const detailedChartData = wartosciPortfelaSymulacja(
              inputs.monthlyNeed,
              inputs.estimatedPension,
              inputs.currentAge,
              inputs.workEndAge,
              inputs.statePensionAge,
              inputs.expectedDeathAge,
              stocksWeight,
              bondsWeight,
              optimizedMonthlyPayment,
            );

            const finalValue =
              detailedChartData[detailedChartData.length - 1]?.value ?? 0;

            if (finalValue >= 0) {
              successCount += 1;
            }

            generated.push({ id: idx + 1, detailedChartData });

            if (validUserMonthlyPayment != null) {
              const userDetailedChartData = wartosciPortfelaSymulacja(
                inputs.monthlyNeed,
                inputs.estimatedPension,
                inputs.currentAge,
                inputs.workEndAge,
                inputs.statePensionAge,
                inputs.expectedDeathAge,
                stocksWeight,
                bondsWeight,
                validUserMonthlyPayment,
              );

              const userFinalValue =
                userDetailedChartData[userDetailedChartData.length - 1]
                  ?.value ?? 0;

              if (userFinalValue >= 0) {
                userSuccessCount += 1;
              }

              userGenerated.push({
                id: idx + 1,
                detailedChartData: userDetailedChartData,
              });
            }
          }

          processed += end - startIdx;
          loadingProgressRef.current = Math.round(
            (processed / totalSimulations) * 98,
          );

          if (end < totalSimulations) {
            timeoutRef.current = setTimeout(() => runChunk(end), 0);
            return;
          }

          const elapsedCompute = performance.now() - computeStart;
          const minLoadingMs = 1000;
          const remaining = Math.max(0, minLoadingMs - elapsedCompute);

          finishTimeoutRef.current = setTimeout(() => {
            if (runIdRef.current !== runId) return;

            loadingProgressRef.current = 100;
            setResults(generated);
            setUserPaymentResults(userGenerated);
            setCalibratedMonthlyPayment(optimizedMonthlyPayment);
            setSimulationSuccessRate(successCount / totalSimulations);
            setUserSimulationSuccessRate(
              validUserMonthlyPayment != null
                ? userSuccessCount / totalSimulations
                : null,
            );
            setLastRunInputs(inputs);
            setChartRenderKey((prev) => prev + 1);

            // Powiadom rodzica o wynikach (do sessionStorage jeśli user zaloguje się później)
            const recommendedPercentiles = extractPercentiles(generated);
            const userPercentiles =
              userGenerated.length > 0
                ? extractPercentiles(userGenerated)
                : null;

            onSimulationResults?.({
              calibratedMonthlyPayment: optimizedMonthlyPayment,
              simulationSuccessRate: successCount / totalSimulations,
              userSimulationSuccessRate:
                validUserMonthlyPayment != null
                  ? userSuccessCount / totalSimulations
                  : null,
              recommendedChartPercentiles: recommendedPercentiles,
              userChartPercentiles: userPercentiles,
              lastRunInputs: inputs,
              totalSimulations,
            });

            finishTimeoutRef.current = setTimeout(() => {
              if (runIdRef.current !== runId) return;
              setIsLoading(false);
              onLoadingChange?.(false);
            }, 160);
          }, remaining);
        };

        runChunk(0);
      }, 24);
    },
    [
      startingMonthlyPayment,
      totalSimulations,
      totalTrialSimulations,
      chunkCount,
      knowsMonthlyAmount,
      onLoadingChange,
      onSimulationResults,
    ],
  );

  const runSimulation = () => {
    scheduleSimulation(draftInputs);
  };

  useEffect(() => {
    queueMicrotask(() => {
      scheduleSimulation({
        currentAge: formValues.currentAge,
        expectedDeathAge: formValues.expectedDeathAge,
        workEndAge: formValues.workEndAge,
        statePensionAge: formValues.statePensionAge,
        estimatedPension: formValues.estimatedPension,
        monthlyNeed: formValues.monthlyNeed,
        stocksPct: portfolio.stocks,
        monthlyInvestment: userMonthlyInvestment ?? 0,
      });
    });

    return () => {
      runIdRef.current += 1;

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      if (finishTimeoutRef.current) {
        clearTimeout(finishTimeoutRef.current);
      }
    };
  }, [
    formValues.currentAge,
    formValues.estimatedPension,
    formValues.expectedDeathAge,
    formValues.monthlyNeed,
    formValues.statePensionAge,
    formValues.workEndAge,
    portfolio.stocks,
    userMonthlyInvestment,
    scheduleSimulation,
  ]);

  useEffect(() => {
    queueMicrotask(() => {
      setDraftInputs({
        currentAge: formValues.currentAge,
        expectedDeathAge: formValues.expectedDeathAge,
        workEndAge: formValues.workEndAge,
        statePensionAge: formValues.statePensionAge,
        estimatedPension: formValues.estimatedPension,
        monthlyNeed: formValues.monthlyNeed,
        stocksPct: portfolio.stocks,
        monthlyInvestment: userMonthlyInvestment ?? 0,
      });
    });
  }, [
    formValues.currentAge,
    formValues.estimatedPension,
    formValues.expectedDeathAge,
    formValues.monthlyNeed,
    formValues.statePensionAge,
    formValues.workEndAge,
    portfolio.stocks,
    userMonthlyInvestment,
  ]);

  const handleSaveSimulation = async (name: string) => {
    if (
      calibratedMonthlyPayment == null ||
      simulationSuccessRate == null ||
      !lastRunInputs
    ) {
      notify.error({
        title: "Błąd zapisu",
        description:
          "Brak wyników symulacji do zapisania. Uruchom symulację ponownie.",
      });
      return;
    }

    setSaveLoading(true);

    try {
      const recommendedPercentiles = extractPercentiles(results);
      const userPercentiles =
        userPaymentResults.length > 0
          ? extractPercentiles(userPaymentResults)
          : null;

      const payload: SaveSimulationPayload = {
        name,
        currentAge: lastRunInputs.currentAge,
        expectedDeathAge: lastRunInputs.expectedDeathAge,
        workEndAge: lastRunInputs.workEndAge,
        statePensionAge: lastRunInputs.statePensionAge,
        estimatedPension: lastRunInputs.estimatedPension,
        monthlyNeed: lastRunInputs.monthlyNeed,
        stocksPct: lastRunInputs.stocksPct,
        bondsPct: 100 - lastRunInputs.stocksPct,
        knowsMonthlyAmount,
        userMonthlyInvestment:
          knowsMonthlyAmount && lastRunInputs.monthlyInvestment > 0
            ? lastRunInputs.monthlyInvestment
            : null,
        recommendedMonthlyPayment: calibratedMonthlyPayment,
        simulationSuccessRate,
        userSimulationSuccessRate: userSimulationSuccessRate ?? null,
        recommendedChartPercentiles: recommendedPercentiles,
        userChartPercentiles: userPercentiles,
        totalSimulations,
      };

      const res = await fetch("/api/simulations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await res.json()) as { error?: string };

      if (!res.ok) {
        notify.error({
          title: "Błąd zapisu",
          description: data.error ?? "Nie udało się zapisać symulacji.",
        });
        return;
      }

      notify.success({
        title: "Symulacja zapisana",
        description: `"${name}" została zapisana pomyślnie.`,
      });

      onSaved?.();
    } catch (err) {
      console.error("Save simulation error:", err);
      notify.error({
        title: "Błąd zapisu",
        description: "Wystąpił nieoczekiwany błąd. Spróbuj ponownie.",
      });
    } finally {
      setSaveLoading(false);
    }
  };

  const recommendationContent = (
    <>
      <SimulationComparisonChart
        key={`sim-chart-${chartRenderKey}`}
        series={results}
        displayEveryNthSimulation={visibleSimulationStep}
        animate
      />

      {(calibratedMonthlyPayment != null || simulationSuccessRate != null) && (
        <div className="mt-4 rounded-2xl border border-(--btn-border) p-5 bg-[linear-gradient(135deg,rgba(14,165,164,0.09),rgba(249,115,22,0.07))]">
          <div className="flex items-start justify-between gap-3">
            <p className="text-xs uppercase tracking-[0.16em] text-(--muted)">
              Rekomendacja składki
            </p>
            <Tooltip
              title={`Symulacja analizuje ${totalSimulations.toLocaleString("pl-PL")} scenariuszy rynkowych i dla każdego oblicza końcową wartość portfela. Na tej podstawie kalibrowana jest składka miesięczna tak, aby osiągnąć docelowy poziom bezpieczeństwa i zwiększyć szanse utrzymania dodatniego salda portfela na końcu horyzontu.`}
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

  const userContributionContent = (
    <>
      <SimulationComparisonChart
        key={`sim-user-chart-${chartRenderKey}`}
        series={userPaymentResults}
        displayEveryNthSimulation={visibleSimulationStep}
        animate
      />

      <div className="mt-4 rounded-2xl border border-(--btn-border) p-5 bg-[linear-gradient(135deg,rgba(59,130,246,0.10),rgba(14,165,164,0.08))]">
        <div className="flex items-start justify-between gap-3">
          <p className="text-xs uppercase tracking-[0.16em] text-(--muted)">
            Skuteczność Twojej składki
          </p>
          <Tooltip
            title="Ten widok pokazuje, jak poradziłby sobie portfel przy składce zadeklarowanej przez Ciebie. Wynik to odsetek scenariuszy, w których końcowa wartość portfela pozostaje nieujemna (>= 0)."
            styles={{ root: { maxWidth: 360, fontSize: 13 } }}
            getPopupContainer={(trigger) =>
              trigger?.parentElement || document.body
            }
          >
            <InfoCircleOutlined
              className="cursor-pointer text-(--muted) hover:text-(--text)"
              style={{ fontSize: 18 }}
              aria-label="Jak czytać skuteczność Twojej składki"
            />
          </Tooltip>
        </div>

        {draftInputs.monthlyInvestment > 0 && (
          <div className="mt-2 flex min-h-fit items-end gap-2">
            <p className="text-3xl md:text-4xl font-semibold text-(--text) leading-none">
              {draftInputs.monthlyInvestment.toLocaleString("pl-PL", {
                maximumFractionDigits: 0,
              })}
            </p>
            <p className="self-end text-base md:text-lg text-(--muted) leading-none">
              zł / mies.
            </p>
          </div>
        )}

        {userSimulationSuccessRate != null && (
          <div className="mt-4">
            <div className="flex items-center justify-between gap-3 text-sm">
              <p className="text-(--muted)">Skuteczność symulacji</p>
              <p className="font-semibold text-(--text)">
                {(userSimulationSuccessRate * 100).toFixed(3)}%
              </p>
            </div>
            <div className="mt-2 h-2.5 rounded-full bg-black/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-linear-to-r from-[#3b82f6] to-[#0ea5a4]"
                style={{
                  width: `${Math.min(100, Math.max(0, userSimulationSuccessRate * 100))}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );

  const tabItems = (() => {
    const items: Array<{
      key: string;
      label: React.ReactNode;
      children: React.ReactNode;
    }> = [];

    const showUserTab =
      knowsMonthlyAmount &&
      draftInputs.monthlyInvestment > 0 &&
      userPaymentResults.length > 0;

    if (showUserTab) {
      items.push({
        key: "user-contribution",
        label: (
          <span className="inline-flex items-center gap-2">
            <UserOutlined />
            Twoja składka
          </span>
        ),
        children: userContributionContent,
      });
    }

    items.push({
      key: "nominal-values",
      label: (
        <span className="inline-flex items-center gap-2">
          <BarChartOutlined />
          Rekomendowana składka
        </span>
      ),
      children: recommendationContent,
    });

    return items;
  })();

  const hasPendingChanges = useMemo(
    () => !sameInputs(draftInputs, lastRunInputs),
    [draftInputs, lastRunInputs],
  );

  // Symulacja jest gotowa niezależnie od tego czy user jest zalogowany
  const simulationReady =
    !isLoading &&
    !hasPendingChanges &&
    results.length > 0 &&
    calibratedMonthlyPayment != null &&
    simulationSuccessRate != null;

  // Zapisać może tylko zalogowany
  const canSave = isLoggedIn && simulationReady;

  useEffect(() => {
    onSimulationReady?.(simulationReady);
  }, [simulationReady, onSimulationReady]);

  return (
    <div className="w-full">
      {isLoading ? (
        <div className="mt-6 rounded-2xl border border-(--btn-border) overflow-hidden bg-[radial-gradient(circle_at_18%_18%,rgba(14,165,164,0.14),transparent_42%),radial-gradient(circle_at_82%_8%,rgba(249,115,22,0.12),transparent_38%),linear-gradient(135deg,var(--card),var(--bg))] pointer-events-none">
          <div className="p-6 md:p-8">
            <div className="flex items-center justify-between gap-4 mb-3">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-(--muted)">
                  Symulacja Monte Carlo
                </p>
                <h3 className="text-xl md:text-2xl font-semibold mt-1">
                  Liczymy bezpieczne prognozy dla Twojego portfela
                </h3>
              </div>
              <div className="h-11 w-11 rounded-full border-2 border-(--btn-border) border-t-(--accent) animate-spin" />
            </div>

            <div className="mt-0">
              <div className="mb-4">
                <p className="text-sm font-medium">
                  Analizujemy {totalSimulations.toLocaleString("pl-PL")}{" "}
                  scenariuszy
                </p>
              </div>

              <div className="h-36 rounded-xl border border-(--btn-border) bg-linear-to-r from-black/5 to-black/2 overflow-hidden relative">
                <div className="absolute inset-0 animate-pulse bg-[linear-gradient(90deg,rgba(255,255,255,0.02),rgba(255,255,255,0.06),rgba(255,255,255,0.02))]" />
                <div className="absolute left-6 top-6 w-1/2 h-3 rounded bg-black/10" />
                <div className="absolute left-6 top-14 w-5/6 h-3 rounded bg-black/8" />
                <div className="absolute left-6 top-22 w-2/3 h-3 rounded bg-black/8" />
              </div>
            </div>
          </div>
        </div>
      ) : results.length > 0 ? (
        <div className="mt-6">
          <Tabs items={tabItems} />

          <SimulationParametersForm
            inputs={draftInputs}
            hasPendingChanges={hasPendingChanges}
            showMonthlyInvestmentField={knowsMonthlyAmount}
            onInputsChange={setDraftInputs}
          />

          <div className="mt-6 flex justify-center">
            <Button
              type="primary"
              size="large"
              onClick={runSimulation}
              className="w-full max-w-sm h-12 text-base font-semibold"
            >
              {hasPendingChanges
                ? "Ponów symulacje z nowymi danymi"
                : "Ponów symulacje (te same dane)"}
            </Button>
          </div>
        </div>
      ) : null}

      <SaveSimulationModal
        open={canSave && saveModalOpen}
        loading={saveLoading}
        onConfirm={handleSaveSimulation}
        onCancel={() => onSaveModalClose?.()}
      />
    </div>
  );
}
