import type { FormValues } from "@/src/components/Calculator";
import type {
  PercentilePoint,
  SaveSimulationPayload,
} from "./simulation-types";

const STORAGE_KEY = "pendingSimulation";
const MAX_AGE_MS = 30 * 60 * 1000; // 30 minut

export type PendingSimulationResults = {
  calibratedMonthlyPayment: number;
  simulationSuccessRate: number;
  userSimulationSuccessRate: number | null;
  recommendedChartPercentiles: PercentilePoint[];
  userChartPercentiles: PercentilePoint[] | null;
  lastRunInputs: {
    currentAge: number;
    expectedDeathAge: number;
    workEndAge: number;
    statePensionAge: number;
    estimatedPension: number;
    monthlyNeed: number;
    stocksPct: number;
    monthlyInvestment: number;
  };
  totalSimulations: number;
};

export type PendingSimulation = {
  name?: string;
  formValues: FormValues;
  knowsMonthlyAmount: boolean;
  portfolioType: "aggressive" | "defensive" | "allStocks";
  startingMonthlyPayment: number;
  results: PendingSimulationResults;
  savedAt: number;
};

export function savePendingSimulation(data: PendingSimulation) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error("Failed to save pending simulation:", err);
  }
}

export function loadPendingSimulation(): PendingSimulation | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as PendingSimulation;

    if (Date.now() - parsed.savedAt > MAX_AGE_MS) {
      clearPendingSimulation();
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function clearPendingSimulation() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}

export function pendingSimulationToPayload(
  pending: PendingSimulation,
  name: string,
): SaveSimulationPayload {
  const inputs = pending.results.lastRunInputs;

  return {
    name,
    currentAge: inputs.currentAge,
    expectedDeathAge: inputs.expectedDeathAge,
    workEndAge: inputs.workEndAge,
    statePensionAge: inputs.statePensionAge,
    estimatedPension: inputs.estimatedPension,
    monthlyNeed: inputs.monthlyNeed,
    stocksPct: inputs.stocksPct,
    bondsPct: 100 - inputs.stocksPct,
    knowsMonthlyAmount: pending.knowsMonthlyAmount,
    userMonthlyInvestment:
      pending.knowsMonthlyAmount && inputs.monthlyInvestment > 0
        ? inputs.monthlyInvestment
        : null,
    recommendedMonthlyPayment: pending.results.calibratedMonthlyPayment,
    simulationSuccessRate: pending.results.simulationSuccessRate,
    userSimulationSuccessRate: pending.results.userSimulationSuccessRate,
    recommendedChartPercentiles: pending.results.recommendedChartPercentiles,
    userChartPercentiles: pending.results.userChartPercentiles,
    totalSimulations: pending.results.totalSimulations,
  };
}
