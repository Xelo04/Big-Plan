"use client";

import type { DashboardStats } from "@/src/lib/dashboard/dashboard-types";
import { formatAmount } from "@/src/lib/portfolio/portfolio-utils";

type Props = {
  stats: DashboardStats;
  totalAssetsCount: number;
};

export default function DashboardKPI({ stats, totalAssetsCount }: Props) {
  const profitPositive = stats.totalProfit >= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Wartość portfela */}
      <div className="rounded-2xl border border-(--btn-border) p-5 bg-[linear-gradient(135deg,rgba(14,165,164,0.12),rgba(249,115,22,0.08))]">
        <p className="text-[10px] uppercase tracking-[0.16em] text-(--muted)">
          Obecna wartość
        </p>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-3xl md:text-4xl font-semibold text-(--text) leading-none">
            {formatAmount(stats.totalValue)}
          </span>
          <span className="text-sm text-(--muted)">PLN</span>
        </div>
        <p className="text-xs text-(--muted) mt-2">Suma wszystkich aktywów</p>
      </div>

      {/* Zysk/strata */}
      <div className="rounded-2xl border border-(--btn-border) p-5 bg-[linear-gradient(135deg,rgba(59,130,246,0.10),rgba(14,165,164,0.08))]">
        <p className="text-[10px] uppercase tracking-[0.16em] text-(--muted)">
          Zysk / Strata
        </p>
        <div className="mt-2 flex items-baseline gap-1">
          <span
            className="text-3xl md:text-4xl font-semibold leading-none"
            style={{ color: profitPositive ? "#10b981" : "#ef4444" }}
          >
            {profitPositive ? "+" : ""}
            {formatAmount(stats.totalProfit)}
          </span>
          <span className="text-sm text-(--muted)">PLN</span>
        </div>
        <p
          className="text-xs mt-2 font-medium"
          style={{ color: profitPositive ? "#10b981" : "#ef4444" }}
        >
          {profitPositive ? "+" : ""}
          {stats.totalProfitPct.toFixed(2)}%
        </p>
      </div>

      {/* Zainwestowany kapitał */}
      <div className="rounded-2xl border border-(--btn-border) p-5">
        <p className="text-[10px] uppercase tracking-[0.16em] text-(--muted)">
          Zainwestowano
        </p>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-3xl md:text-4xl font-semibold text-(--text) leading-none">
            {formatAmount(stats.totalInvested)}
          </span>
          <span className="text-sm text-(--muted)">PLN</span>
        </div>
        <p className="text-xs text-(--muted) mt-2">Twój wkład kapitałowy</p>
      </div>

      {/* Liczba aktywów */}
      <div className="rounded-2xl border border-(--btn-border) p-5 bg-[linear-gradient(135deg,rgba(14,165,164,0.09),rgba(59,130,246,0.10))]">
        <p className="text-[10px] uppercase tracking-[0.16em] text-(--muted)">
          Liczba aktywów
        </p>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-3xl md:text-4xl font-semibold text-(--text) leading-none">
            {totalAssetsCount}
          </span>
        </div>
      </div>
    </div>
  );
}
