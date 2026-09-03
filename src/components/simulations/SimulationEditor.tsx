"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button, Card, Input, Tabs, Tooltip } from "antd";
import {
  ArrowLeftOutlined,
  BarChartOutlined,
  CloudUploadOutlined,
  InfoCircleOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useNotify } from "../notifications/NotificationProvider";
import SimulationComparisonChart from "../calculator/SimulationComparisonChart";
import SimulationParametersForm from "../calculator/SimulationParametersForm";
import EditSaveConfirmModal from "./EditSaveConfirmModal";
import EditDiscardConfirmModal from "./EditDiscardConfirmModal";
import { wartosciPortfelaSymulacja } from "@/app/(public)/calculator/calculator";
import { extractPercentiles } from "@/src/lib/simulation/extract-percentiles";
import type {
  SavedSimulationDTO,
  UpdateSimulationPayload,
} from "@/src/lib/simulation/simulation-types";

type SimulationEditorProps = {
  initialSimulation: SavedSimulationDTO | null;
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
  currentPortfolioValue: number;
};

const MAX_NAME_LENGTH = 80;
const EMPTY_SERIES: SimulationResult[] = [];

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
  a.monthlyInvestment === b.monthlyInvestment &&
  a.currentPortfolioValue === b.currentPortfolioValue;

export default function SimulationEditor({
  initialSimulation,
}: SimulationEditorProps) {
  const router = useRouter();
  const notify = useNotify();

  const totalSimulations = 10000;
  const totalTrialSimulations = 1000;
  const targetSuccessRate = 0.9;
  const targetTolerance = 0.005;
  const visibleSimulationStep = Math.max(1, Math.ceil(totalSimulations / 100));
  const chunkCount = 200;

  const initialInputs: SimulationInputs = useMemo(
    () =>
      initialSimulation
        ? {
            currentAge: initialSimulation.currentAge,
            expectedDeathAge: initialSimulation.expectedDeathAge,
            workEndAge: initialSimulation.workEndAge,
            statePensionAge: initialSimulation.statePensionAge,
            estimatedPension: initialSimulation.estimatedPension,
            monthlyNeed: initialSimulation.monthlyNeed,
            stocksPct: initialSimulation.stocksPct,
            monthlyInvestment: initialSimulation.userMonthlyInvestment ?? 0,
            currentPortfolioValue: initialSimulation.currentPortfolioValue ?? 0,
          }
        : {
            currentAge: 0,
            expectedDeathAge: 0,
            workEndAge: 0,
            statePensionAge: 0,
            estimatedPension: 0,
            monthlyNeed: 0,
            stocksPct: 100,
            monthlyInvestment: 0,
            currentPortfolioValue: 0,
          },
    [initialSimulation],
  );

  const [name, setName] = useState(initialSimulation?.name ?? "");
  const [draftInputs, setDraftInputs] =
    useState<SimulationInputs>(initialInputs);
  const [lastRunInputs, setLastRunInputs] = useState<SimulationInputs | null>(
    initialInputs,
  );

  const [results, setResults] = useState<SimulationResult[]>([]);
  const [userPaymentResults, setUserPaymentResults] = useState<
    SimulationResult[]
  >([]);
  const [calibratedMonthlyPayment, setCalibratedMonthlyPayment] = useState<
    number | null
  >(initialSimulation?.recommendedMonthlyPayment ?? null);
  const [simulationSuccessRate, setSimulationSuccessRate] = useState<
    number | null
  >(initialSimulation?.simulationSuccessRate ?? null);
  const [userSimulationSuccessRate, setUserSimulationSuccessRate] = useState<
    number | null
  >(initialSimulation?.userSimulationSuccessRate ?? null);

  const [hasRecomputed, setHasRecomputed] = useState(false);
  const [isRecomputing, setIsRecomputing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [chartRenderKey, setChartRenderKey] = useState(0);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [discardModalOpen, setDiscardModalOpen] = useState(false);

  const runIdRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const initialRecommendedPercentiles =
    initialSimulation?.recommendedChartPercentiles ?? null;
  const initialUserPercentiles =
    initialSimulation?.userChartPercentiles ?? null;

  const runRecompute = useCallback(
    (inputs: SimulationInputs) => {
      if (!initialSimulation) return;

      runIdRef.current += 1;
      const runId = runIdRef.current;

      setIsRecomputing(true);
      setResults([]);
      setUserPaymentResults([]);
      setCalibratedMonthlyPayment(null);
      setSimulationSuccessRate(null);
      setUserSimulationSuccessRate(null);

      const knowsMonthlyAmount = initialSimulation.knowsMonthlyAmount;

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
            const chart = wartosciPortfelaSymulacja(
              inputs.monthlyNeed,
              inputs.estimatedPension,
              inputs.currentAge,
              inputs.workEndAge,
              inputs.statePensionAge,
              inputs.expectedDeathAge,
              stocksWeight,
              bondsWeight,
              payment,
              inputs.currentPortfolioValue,
            );
            const finalValue = chart[chart.length - 1]?.value ?? 0;
            if (finalValue >= 0) successCount += 1;
          }
          return successCount / trials;
        };

        const findOptimalPayment = () => {
          let lower = 0;
          let upper = Math.max(
            1,
            initialSimulation.recommendedMonthlyPayment ?? 1000,
          );
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

          return upper;
        };

        const optimalPayment = findOptimalPayment();

        const generated: SimulationResult[] = [];
        const userGenerated: SimulationResult[] = [];
        let successCount = 0;
        let userSuccessCount = 0;
        const chunkSize = Math.max(
          1,
          Math.floor(totalSimulations / chunkCount),
        );

        const runChunk = (startIdx: number) => {
          if (runIdRef.current !== runId) return;

          const end = Math.min(totalSimulations, startIdx + chunkSize);

          for (let idx = startIdx; idx < end; idx++) {
            const chart = wartosciPortfelaSymulacja(
              inputs.monthlyNeed,
              inputs.estimatedPension,
              inputs.currentAge,
              inputs.workEndAge,
              inputs.statePensionAge,
              inputs.expectedDeathAge,
              stocksWeight,
              bondsWeight,
              optimalPayment,
              inputs.currentPortfolioValue,
            );
            const finalValue = chart[chart.length - 1]?.value ?? 0;
            if (finalValue >= 0) successCount += 1;
            generated.push({ id: idx + 1, detailedChartData: chart });

            if (validUserMonthlyPayment != null) {
              const userChart = wartosciPortfelaSymulacja(
                inputs.monthlyNeed,
                inputs.estimatedPension,
                inputs.currentAge,
                inputs.workEndAge,
                inputs.statePensionAge,
                inputs.expectedDeathAge,
                stocksWeight,
                bondsWeight,
                validUserMonthlyPayment,
                inputs.currentPortfolioValue,
              );
              const userFinalValue =
                userChart[userChart.length - 1]?.value ?? 0;
              if (userFinalValue >= 0) userSuccessCount += 1;
              userGenerated.push({
                id: idx + 1,
                detailedChartData: userChart,
              });
            }
          }

          if (end < totalSimulations) {
            timeoutRef.current = setTimeout(() => runChunk(end), 0);
            return;
          }

          if (runIdRef.current !== runId) return;

          setResults(generated);
          setUserPaymentResults(userGenerated);
          setCalibratedMonthlyPayment(optimalPayment);
          setSimulationSuccessRate(successCount / totalSimulations);
          setUserSimulationSuccessRate(
            validUserMonthlyPayment != null
              ? userSuccessCount / totalSimulations
              : null,
          );
          setLastRunInputs(inputs);
          setHasRecomputed(true);
          setChartRenderKey((prev) => prev + 1);
          setIsRecomputing(false);
        };

        runChunk(0);
      }, 24);
    },
    [initialSimulation, chunkCount],
  );

  useEffect(() => {
    return () => {
      runIdRef.current += 1;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const hasPendingChanges = useMemo(
    () => !sameInputs(draftInputs, lastRunInputs),
    [draftInputs, lastRunInputs],
  );

  const isDirty = useMemo(() => {
    if (!initialSimulation) return false;
    if (name.trim() !== initialSimulation.name) return true;
    if (hasRecomputed) return true;
    return false;
  }, [initialSimulation, name, hasRecomputed]);

  useEffect(() => {
    if (!isDirty) return;

    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const handleBackClick = () => {
    if (isDirty) {
      setDiscardModalOpen(true);
    } else {
      router.push("/my-simulations");
    }
  };

  const handleConfirmDiscard = () => {
    setDiscardModalOpen(false);
    router.push("/my-simulations");
  };

  const handleSaveClick = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      notify.error({
        title: "Nazwa jest wymagana",
        description: "Podaj nazwę symulacji przed zapisem.",
      });
      return;
    }
    setSaveModalOpen(true);
  };

  const handleConfirmSave = async () => {
    if (
      !initialSimulation ||
      calibratedMonthlyPayment == null ||
      simulationSuccessRate == null
    ) {
      notify.error({
        title: "Błąd zapisu",
        description: "Brak danych do zapisu.",
      });
      return;
    }

    setIsSaving(true);

    try {
      const knowsMonthlyAmount = initialSimulation.knowsMonthlyAmount;

      const recommendedPercentiles = hasRecomputed
        ? extractPercentiles(results)
        : (initialRecommendedPercentiles ?? []);

      const userPercentiles = hasRecomputed
        ? userPaymentResults.length > 0
          ? extractPercentiles(userPaymentResults)
          : null
        : initialUserPercentiles;

      const inputsToSave = lastRunInputs ?? draftInputs;

      const payload: UpdateSimulationPayload = {
        name: name.trim(),
        currentAge: inputsToSave.currentAge,
        expectedDeathAge: inputsToSave.expectedDeathAge,
        workEndAge: inputsToSave.workEndAge,
        statePensionAge: inputsToSave.statePensionAge,
        estimatedPension: inputsToSave.estimatedPension,
        monthlyNeed: inputsToSave.monthlyNeed,
        currentPortfolioValue: inputsToSave.currentPortfolioValue,
        stocksPct: inputsToSave.stocksPct,
        bondsPct: 100 - inputsToSave.stocksPct,
        knowsMonthlyAmount,
        userMonthlyInvestment:
          knowsMonthlyAmount && inputsToSave.monthlyInvestment > 0
            ? inputsToSave.monthlyInvestment
            : null,
        recommendedMonthlyPayment: calibratedMonthlyPayment,
        simulationSuccessRate,
        userSimulationSuccessRate: userSimulationSuccessRate ?? null,
        recommendedChartPercentiles: recommendedPercentiles,
        userChartPercentiles: userPercentiles,
        totalSimulations,
      };

      const res = await fetch(
        `/api/simulations/${encodeURIComponent(initialSimulation.id)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        },
      );

      const data = (await res.json()) as { error?: string };

      if (!res.ok) {
        notify.error({
          title: "Nie udało się zapisać zmian",
          description: data.error ?? "Spróbuj ponownie.",
        });
        return;
      }

      notify.success({
        title: "Symulacja zaktualizowana",
        description: `"${name.trim()}" została zapisana.`,
      });

      setHasRecomputed(false);
      router.push("/my-simulations");
    } catch (err) {
      console.error("update simulation error:", err);
      notify.error({
        title: "Nie udało się zapisać zmian",
        description: "Wystąpił nieoczekiwany błąd.",
      });
    } finally {
      setIsSaving(false);
      setSaveModalOpen(false);
    }
  };

  if (!initialSimulation) {
    return (
      <div className="w-full max-w-5xl mx-auto p-6">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => router.push("/my-simulations")}
          className="mb-6"
        >
          Wróć do listy symulacji
        </Button>
        <div
          className="rounded-2xl border border-(--btn-border) p-10 flex flex-col items-center text-center"
          style={{
            background: "var(--card-background)",
            boxShadow: "var(--card-shadow)",
            backdropFilter: "var(--card-backdrop-filter)",
          }}
        >
          <h2 className="text-xl font-semibold text-(--text) mb-2">
            Symulacja nie istnieje
          </h2>
          <p className="text-sm text-(--muted) mb-6 max-w-md">
            Ta symulacja została usunięta lub nie masz do niej dostępu.
          </p>
          <Button
            type="primary"
            size="large"
            onClick={() => router.push("/my-simulations")}
          >
            Wróć do listy
          </Button>
        </div>
      </div>
    );
  }

  const knowsMonthlyAmount = initialSimulation.knowsMonthlyAmount;

  const showUserContribution =
    knowsMonthlyAmount &&
    draftInputs.monthlyInvestment > 0 &&
    (hasRecomputed
      ? userPaymentResults.length > 0
      : initialUserPercentiles != null);

  const recommendationContent = (
    <>
      <SimulationComparisonChart
        key={`edit-chart-${chartRenderKey}`}
        series={hasRecomputed ? results : EMPTY_SERIES}
        displayEveryNthSimulation={visibleSimulationStep}
        precomputedPercentiles={
          hasRecomputed
            ? undefined
            : (initialRecommendedPercentiles ?? undefined)
        }
        animate={false}
      />

      {calibratedMonthlyPayment != null && simulationSuccessRate != null && (
        <div className="mt-4 rounded-2xl border border-(--btn-border) p-5 bg-[linear-gradient(135deg,rgba(14,165,164,0.09),rgba(249,115,22,0.07))]">
          <div className="flex items-start justify-between gap-3">
            <p className="text-xs uppercase tracking-[0.16em] text-(--muted)">
              Rekomendacja składki
            </p>
            <Tooltip
              title={`Symulacja przeanalizowała ${totalSimulations.toLocaleString("pl-PL")} scenariuszy rynkowych. Rekomendowana składka pozwala osiągnąć wysoki poziom bezpieczeństwa portfela.`}
              styles={{ root: { maxWidth: 360, fontSize: 13 } }}
            >
              <InfoCircleOutlined
                className="cursor-pointer text-(--muted) hover:text-(--text)"
                style={{ fontSize: 18 }}
              />
            </Tooltip>
          </div>

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
        </div>
      )}
    </>
  );

  const userContributionContent = showUserContribution ? (
    <>
      <SimulationComparisonChart
        key={`edit-user-chart-${chartRenderKey}`}
        series={hasRecomputed ? userPaymentResults : EMPTY_SERIES}
        displayEveryNthSimulation={visibleSimulationStep}
        precomputedPercentiles={
          hasRecomputed ? undefined : (initialUserPercentiles ?? undefined)
        }
        animate={false}
      />

      <div className="mt-4 rounded-2xl border border-(--btn-border) p-5 bg-[linear-gradient(135deg,rgba(59,130,246,0.10),rgba(14,165,164,0.08))]">
        <div className="flex items-start justify-between gap-3">
          <p className="text-xs uppercase tracking-[0.16em] text-(--muted)">
            Twoja składka
          </p>
        </div>

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
  ) : null;

  const tabItems: Array<{
    key: string;
    label: React.ReactNode;
    children: React.ReactNode;
  }> = [];

  if (showUserContribution) {
    tabItems.push({
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

  tabItems.push({
    key: "recommended",
    label: (
      <span className="inline-flex items-center gap-2">
        <BarChartOutlined />
        Rekomendowana składka
      </span>
    ),
    children: recommendationContent,
  });

  return (
    <div className="w-full max-w-5xl mx-auto p-6">
      {/* --- Dirty indicator --- */}
      {isDirty && (
        <div
          className="mb-4 rounded-lg border p-3 text-sm flex items-start gap-2"
          style={{
            background: "rgba(245, 158, 11, 0.08)",
            borderColor: "rgba(245, 158, 11, 0.3)",
            color: "var(--text)",
          }}
        >
          <InfoCircleOutlined
            style={{ color: "#f59e0b", fontSize: 16, marginTop: 2 }}
          />
          <span>
            Masz niezapisane zmiany. Kliknij <strong>Zapisz zmiany</strong>, aby
            zaktualizować symulację.
          </span>
        </div>
      )}

      {/* --- Card --- */}
      <Card className="w-full">
        <div className="flex flex-col gap-1">
          {/* --- Header --- */}
          <div className="flex justify-between items-center mb-4 gap-4">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={handleBackClick}
              size="large"
            >
              Wróć do listy
            </Button>

            <button
              type="button"
              onClick={handleSaveClick}
              disabled={isSaving || isRecomputing}
              className="cursor-pointer inline-flex items-center justify-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/50 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-md shadow-blue-600/20 hover:shadow-lg hover:shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap h-10"
            >
              <CloudUploadOutlined style={{ fontSize: 15 }} />
              {isSaving ? "Zapisywanie..." : "Zapisz zmiany"}
            </button>
          </div>

          {/* Nazwa symulacji */}
          <div className="mb-2">
            <label className="block text-xs uppercase tracking-[0.14em] text-(--muted) mb-2">
              Nazwa symulacji
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={MAX_NAME_LENGTH}
              size="large"
              showCount
              placeholder="Nazwa symulacji"
            />
          </div>

          {isRecomputing ? (
            <div className="mt-6 rounded-2xl border border-(--btn-border) overflow-hidden bg-[radial-gradient(circle_at_18%_18%,rgba(14,165,164,0.14),transparent_42%),radial-gradient(circle_at_82%_8%,rgba(249,115,22,0.12),transparent_38%),linear-gradient(135deg,var(--card),var(--bg))] pointer-events-none">
              <div className="p-6 md:p-8">
                <div className="flex items-center justify-between gap-4 mb-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-(--muted)">
                      Symulacja Monte Carlo
                    </p>
                    <h3 className="text-xl md:text-2xl font-semibold mt-1">
                      Przeliczamy Twoje nowe prognozy
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
          ) : (
            <div className="mt-6">
              {tabItems.length > 1 ? (
                <Tabs items={tabItems} />
              ) : (
                recommendationContent
              )}

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
                  onClick={() => runRecompute(draftInputs)}
                  disabled={isRecomputing}
                  className="w-full max-w-sm h-12 text-base font-semibold"
                >
                  {hasPendingChanges
                    ? "Ponów symulacje z nowymi danymi"
                    : "Ponów symulacje (te same dane)"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* --- Modals --- */}
      <EditSaveConfirmModal
        open={saveModalOpen}
        loading={isSaving}
        simulationName={name.trim()}
        onConfirm={handleConfirmSave}
        onCancel={() => setSaveModalOpen(false)}
      />

      <EditDiscardConfirmModal
        open={discardModalOpen}
        onConfirm={handleConfirmDiscard}
        onCancel={() => setDiscardModalOpen(false)}
      />
    </div>
  );
}
