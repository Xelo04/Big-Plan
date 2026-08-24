import type { PortfolioAssetDTO } from "./portfolio-types";

export function toPLN(
  value: number,
  currency: string,
  customFxRate: number | null,
  liveRates: Record<string, number> = {},
) {
  if (currency === "PLN") return value;

  if (customFxRate != null && customFxRate > 0) return value * customFxRate;

  const liveRate = liveRates[currency];
  if (liveRate) return value * liveRate;

  return value;
}

export const formatAmount = (value: number) =>
  new Intl.NumberFormat("pl-PL", { maximumFractionDigits: 0 }).format(value);

export const formatQuantity = (value: number) =>
  new Intl.NumberFormat("pl-PL", { maximumFractionDigits: 6 }).format(value);

export function calculatePortfolioStats(
  assets: PortfolioAssetDTO[],
  fxRates: Record<string, number>,
  targetStocksPct: number,
  targetBondsPct: number,
) {
  let stocksValue = 0;
  let bondsValue = 0;
  let totalInvested = 0;

  assets.forEach((a) => {
    const currentPLN = toPLN(
      a.quantity * a.currentPrice,
      a.currency,
      a.customFxRate,
      fxRates,
    );
    const investedPLN = toPLN(
      a.quantity * a.averagePrice,
      a.currency,
      a.customFxRate,
      fxRates,
    );

    totalInvested += investedPLN;
    if (a.category === "STOCKS") stocksValue += currentPLN;
    if (a.category === "BONDS") bondsValue += currentPLN;
  });

  const totalValue = stocksValue + bondsValue;
  const currentStocksPct =
    totalValue > 0 ? (stocksValue / totalValue) * 100 : 0;
  const currentBondsPct = totalValue > 0 ? (bondsValue / totalValue) * 100 : 0;

  const stocksDeviation = currentStocksPct - targetStocksPct;
  const bondsDeviation = currentBondsPct - targetBondsPct;

  const deviation = Math.abs(stocksDeviation);
  let rebalanceStatus: "OK" | "WARNING" | "CRITICAL" = "OK";

  if (totalValue > 0) {
    if (deviation >= 10) rebalanceStatus = "CRITICAL";
    else if (deviation >= 5) rebalanceStatus = "WARNING";
  }

  const profit = totalValue - totalInvested;
  const profitPct = totalInvested > 0 ? (profit / totalInvested) * 100 : 0;

  return {
    stocksValue,
    bondsValue,
    totalValue,
    totalInvested,
    currentStocksPct,
    currentBondsPct,
    stocksDeviation,
    bondsDeviation,
    rebalanceStatus,
    profit,
    profitPct,
  };
}
