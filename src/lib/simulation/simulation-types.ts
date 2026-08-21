export type PercentilePoint = {
  label: string;
  p5: number;
  p25: number;
  p50: number;
  p75: number;
  p95: number;
};

export type SaveSimulationPayload = {
  name: string;

  currentAge: number;
  expectedDeathAge: number;
  workEndAge: number;
  statePensionAge: number;
  estimatedPension: number;
  monthlyNeed: number;

  stocksPct: number;
  bondsPct: number;

  knowsMonthlyAmount: boolean;
  userMonthlyInvestment?: number | null;

  recommendedMonthlyPayment: number;
  simulationSuccessRate: number;
  userSimulationSuccessRate?: number | null;

  recommendedChartPercentiles: PercentilePoint[];
  userChartPercentiles?: PercentilePoint[] | null;

  totalSimulations?: number;
};

export type SavedSimulationDTO = {
  id: string;
  name: string;
  currentAge: number;
  expectedDeathAge: number;
  workEndAge: number;
  statePensionAge: number;
  estimatedPension: number;
  monthlyNeed: number;
  stocksPct: number;
  bondsPct: number;
  knowsMonthlyAmount: boolean;
  userMonthlyInvestment: number | null;
  recommendedMonthlyPayment: number;
  simulationSuccessRate: number;
  userSimulationSuccessRate: number | null;
  recommendedChartPercentiles: PercentilePoint[];
  userChartPercentiles: PercentilePoint[] | null;
  totalSimulations: number;
  createdAt: string;
  updatedAt: string;
};

export type UpdateSimulationPayload = SaveSimulationPayload;
