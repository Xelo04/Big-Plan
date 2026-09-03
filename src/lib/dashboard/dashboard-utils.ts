import { toPLN } from "../portfolio/portfolio-utils";
import type {
  AssetPerformance,
  CurrencyStat,
  DashboardSimulation,
  DashboardStats,
} from "./dashboard-types";

export function calculateDashboardStats(
  simulations: DashboardSimulation[],
  fxRates: Record<string, number>,
): DashboardStats {
  let totalValue = 0;
  let totalInvested = 0;
  let stocksValue = 0;
  let bondsValue = 0;

  const currenciesMap: Record<string, number> = {};
  const performances: AssetPerformance[] = [];
  const needsRebalancing: DashboardSimulation[] = [];

  let totalTargetStocks = 0;
  let totalTargetBonds = 0;
  let targetWeightSum = 0;

  simulations.forEach((sim) => {
    let simStocksValue = 0;
    let simBondsValue = 0;

    sim.assets.forEach((asset) => {
      const investedPLN = toPLN(
        asset.quantity * asset.averagePrice,
        asset.currency,
        asset.customFxRate,
        fxRates,
      );
      const currentPLN = toPLN(
        asset.quantity * asset.currentPrice,
        asset.currency,
        asset.customFxRate,
        fxRates,
      );

      totalInvested += investedPLN;
      totalValue += currentPLN;

      currenciesMap[asset.currency] =
        (currenciesMap[asset.currency] ?? 0) + currentPLN;

      if (asset.category === "STOCKS") {
        stocksValue += currentPLN;
        simStocksValue += currentPLN;
      }
      if (asset.category === "BONDS") {
        bondsValue += currentPLN;
        simBondsValue += currentPLN;
      }

      performances.push({
        id: asset.id,
        name: asset.name,
        ticker: asset.ticker,
        profit: currentPLN - investedPLN,
        profitPct:
          investedPLN > 0
            ? ((currentPLN - investedPLN) / investedPLN) * 100
            : 0,
        currentValuePLN: currentPLN,
      });
    });

    const simTotal = simStocksValue + simBondsValue;
    if (simTotal > 0) {
      const actualStocks = (simStocksValue / simTotal) * 100;
      const deviation = Math.abs(actualStocks - sim.stocksPct);
      if (deviation >= 5) {
        needsRebalancing.push(sim);
      }

      totalTargetStocks += sim.stocksPct * simTotal;
      totalTargetBonds += sim.bondsPct * simTotal;
      targetWeightSum += simTotal;
    }
  });

  const totalCategorized = stocksValue + bondsValue;
  const actualStocksPct =
    totalCategorized > 0 ? (stocksValue / totalCategorized) * 100 : 0;
  const actualBondsPct =
    totalCategorized > 0 ? (bondsValue / totalCategorized) * 100 : 0;

  const targetStocksPct =
    targetWeightSum > 0 ? totalTargetStocks / targetWeightSum : 0;
  const targetBondsPct =
    targetWeightSum > 0 ? totalTargetBonds / targetWeightSum : 0;

  const currencies: CurrencyStat[] = Object.entries(currenciesMap)
    .map(([currency, valuePLN]) => ({
      currency,
      valuePLN,
      pct: totalValue > 0 ? (valuePLN / totalValue) * 100 : 0,
    }))
    .sort((a, b) => b.valuePLN - a.valuePLN);

  // Top / worst po kwocie
  const sortedByProfit = [...performances].sort((a, b) => b.profit - a.profit);
  const topByProfit = sortedByProfit.slice(0, 3);
  const worstByProfit = [...sortedByProfit]
    .reverse()
    .slice(0, 3)
    .filter((a) => a.profit < 0);

  // Top / worst po procencie
  const sortedByPct = [...performances]
    .filter((p) => p.currentValuePLN > 0)
    .sort((a, b) => b.profitPct - a.profitPct);
  const topByProfitPct = sortedByPct.slice(0, 3);
  const worstByProfitPct = [...sortedByPct]
    .reverse()
    .slice(0, 3)
    .filter((a) => a.profitPct < 0);

  const profit = totalValue - totalInvested;
  const profitPct = totalInvested > 0 ? (profit / totalInvested) * 100 : 0;

  return {
    totalValue,
    totalInvested,
    totalProfit: profit,
    totalProfitPct: profitPct,
    stocksValue,
    bondsValue,
    stocksPct: actualStocksPct,
    bondsPct: actualBondsPct,
    targetStocksPct,
    targetBondsPct,
    topByProfit,
    worstByProfit,
    topByProfitPct,
    worstByProfitPct,
    currencies,
    needsRebalancing,
  };
}
