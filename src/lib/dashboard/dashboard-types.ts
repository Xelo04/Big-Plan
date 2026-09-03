import type { PortfolioAssetDTO } from "../portfolio/portfolio-types";

export type DashboardSimulation = {
  id: string;
  name: string;
  stocksPct: number;
  bondsPct: number;
  simulationSuccessRate: number;
  recommendedMonthlyPayment: number;
  assets: PortfolioAssetDTO[];
};

export type CurrencyStat = {
  currency: string;
  valuePLN: number;
  pct: number;
};

export type AssetPerformance = {
  id: string;
  name: string;
  ticker: string | null;
  profit: number;
  profitPct: number;
  currentValuePLN: number;
};

export type DashboardStats = {
  totalValue: number;
  totalInvested: number;
  totalProfit: number;
  totalProfitPct: number;
  stocksValue: number;
  bondsValue: number;
  stocksPct: number;
  bondsPct: number;
  targetStocksPct: number;
  targetBondsPct: number;
  topByProfit: AssetPerformance[];
  worstByProfit: AssetPerformance[];
  topByProfitPct: AssetPerformance[];
  worstByProfitPct: AssetPerformance[];
  currencies: CurrencyStat[];
  needsRebalancing: DashboardSimulation[];
};
