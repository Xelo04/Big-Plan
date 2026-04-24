"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "antd";
import type { FormValues } from "./Calculator";
import SimulationComparisonChart from "./SimulationComparisonChart";
import SimulationParametersForm from "./SimulationParametersForm";
import { wartosciPortfelaSymulacja } from "@/app/(public)/calculator/calculator";

type SimulationProps = {
  formValues: FormValues;
  portfolio: {
    stocks: number;
    bonds: number;
  };
  startingMonthlyPayment: number;
  onLoadingChange?: (isLoading: boolean) => void;
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
  a.stocksPct === b.stocksPct;

export default function Simulation({
  formValues,
  portfolio,
  startingMonthlyPayment,
  onLoadingChange,
}: SimulationProps) {
  const totalSimulations = 1000;
  const normalizedTotalSimulations = Math.max(1, Math.floor(totalSimulations));
  const visibleSimulationStep = Math.max(
    1,
    Math.ceil(normalizedTotalSimulations / 120),
  );
  const chunkCount = Math.max(
    1,
    Math.min(
      normalizedTotalSimulations,
      Math.ceil(Math.sqrt(normalizedTotalSimulations)),
    ),
  );
  const [results, setResults] = useState<SimulationResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const loadingProgressRef = useRef<number>(0);
  const [chartRenderKey, setChartRenderKey] = useState(0);
  const [draftInputs, setDraftInputs] = useState<SimulationInputs>({
    currentAge: formValues.currentAge,
    expectedDeathAge: formValues.expectedDeathAge,
    workEndAge: formValues.workEndAge,
    statePensionAge: formValues.statePensionAge,
    estimatedPension: formValues.estimatedPension,
    monthlyNeed: formValues.monthlyNeed,
    stocksPct: portfolio.stocks,
  });
  const [lastRunInputs, setLastRunInputs] = useState<SimulationInputs | null>(
    null,
  );
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const finishTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const progressStartRef = useRef<number | null>(null);
  const runIdRef = useRef(0);

  const scheduleSimulation = useCallback(
    (inputs: SimulationInputs) => {
      runIdRef.current += 1;
      const runId = runIdRef.current;

      // start time anchor for progress, chunked generation will update progress directly
      progressStartRef.current = performance.now();

      // reset state
      setIsLoading(true);
      onLoadingChange?.(true);
      loadingProgressRef.current = 0;
      setResults([]);

      timeoutRef.current = setTimeout(() => {
        if (runIdRef.current !== runId) return;

        const stocksWeight = inputs.stocksPct / 100;
        const bondsWeight = (100 - inputs.stocksPct) / 100;

        const generated: SimulationResult[] = [];
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
              startingMonthlyPayment,
            );

            generated.push({ id: idx + 1, detailedChartData });
          }

          processed += end - startIdx;
          // update progress smoothly based on processed count
          loadingProgressRef.current = Math.round(
            (processed / totalSimulations) * 98,
          );

          if (end < totalSimulations) {
            // schedule next chunk to keep UI responsive
            timeoutRef.current = setTimeout(() => runChunk(end), 0);
            return;
          }

          // finished generating all simulations
          const elapsedCompute = performance.now() - computeStart;
          const minLoadingMs = 1000;
          const remaining = Math.max(0, minLoadingMs - elapsedCompute);

          finishTimeoutRef.current = setTimeout(() => {
            if (runIdRef.current !== runId) return;

            loadingProgressRef.current = 100;
            setResults(generated);
            setLastRunInputs(inputs);
            setChartRenderKey((prev) => prev + 1);

            finishTimeoutRef.current = setTimeout(() => {
              if (runIdRef.current !== runId) return;
              setIsLoading(false);
              onLoadingChange?.(false);
            }, 160);
          }, remaining);
        };

        // start the chunked processing
        runChunk(0);
      }, 24);
    },
    [startingMonthlyPayment, chunkCount, totalSimulations, onLoadingChange],
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
  ]);

  const hasPendingChanges = useMemo(
    () => !sameInputs(draftInputs, lastRunInputs),
    [draftInputs, lastRunInputs],
  );

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
          <SimulationComparisonChart
            key={`sim-chart-${chartRenderKey}`}
            series={results}
            displayEveryNthSimulation={visibleSimulationStep}
            animate
          />

          <SimulationParametersForm
            inputs={draftInputs}
            hasPendingChanges={hasPendingChanges}
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
    </div>
  );
}
