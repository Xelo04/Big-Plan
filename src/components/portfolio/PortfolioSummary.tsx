"use client";

import { useMemo } from "react";
import type { PortfolioAssetDTO } from "@/src/lib/portfolio/portfolio-types";
import {
  formatAmount,
  calculatePortfolioStats,
} from "@/src/lib/portfolio/portfolio-utils";

type PortfolioSummaryProps = {
  assets: PortfolioAssetDTO[];
  targetStocksPct: number;
  targetBondsPct: number;
  fxRates: Record<string, number>;
};

export default function PortfolioSummary({
  assets,
  targetStocksPct,
  targetBondsPct,
  fxRates,
}: PortfolioSummaryProps) {
  const stats = useMemo(() => {
    return calculatePortfolioStats(
      assets,
      fxRates,
      targetStocksPct,
      targetBondsPct,
    );
  }, [assets, fxRates, targetStocksPct, targetBondsPct]);

  const profitPositive = stats.profit >= 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Wartość portfela */}
      <div className="rounded-2xl border border-(--btn-border) p-5 bg-[linear-gradient(135deg,rgba(14,165,164,0.09),rgba(249,115,22,0.07))]">
        <p className="text-xs uppercase tracking-[0.16em] text-(--muted)">
          Wartość portfela
        </p>
        <div className="mt-2 flex items-baseline gap-2">
          <p className="text-3xl md:text-4xl font-semibold text-(--text) leading-none">
            {formatAmount(stats.totalValue)}
          </p>
          <p className="text-base text-(--muted)">PLN</p>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 text-sm">
          <span className="text-(--muted)">Zainwestowano</span>
          <span className="font-semibold text-(--text)">
            {formatAmount(stats.totalInvested)} zł
          </span>
        </div>

        <div className="mt-2 flex items-center justify-between gap-3 text-sm">
          <span className="text-(--muted)">Zysk / strata</span>
          <span
            className="font-semibold"
            style={{ color: profitPositive ? "#10b981" : "#ef4444" }}
          >
            {profitPositive ? "+" : ""}
            {formatAmount(stats.profit)} zł ({profitPositive ? "+" : ""}
            {stats.profitPct.toFixed(2)}%)
          </span>
        </div>
      </div>

      {/* Alokacja */}
      <div className="rounded-2xl border border-(--btn-border) p-5 bg-black/5 dark:bg-white/5">
        <p className="text-xs uppercase tracking-[0.16em] text-(--muted) mb-3">
          Alokacja aktywów
        </p>

        <div className="flex flex-col gap-3">
          <AllocationRow
            label="Akcje"
            actual={stats.currentStocksPct}
            target={targetStocksPct}
            color="#f97316"
          />
          <AllocationRow
            label="Obligacje"
            actual={stats.currentBondsPct}
            target={targetBondsPct}
            color="#0ea5a4"
          />
        </div>

        <p className="text-xs text-(--muted) mt-4">
          Alokacja docelowa pochodzi z symulacji.
        </p>
      </div>
    </div>
  );
}

function AllocationRow({
  label,
  actual,
  target,
  color,
}: {
  label: string;
  actual: number;
  target: number;
  color: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1.5">
        <span className="text-(--text) font-medium">{label}</span>
        <span className="text-(--muted)">
          <span className="font-semibold text-(--text)">
            {actual.toFixed(1)}%
          </span>
          {" / "}
          <span>docelowo {target}%</span>
        </span>
      </div>
      <div className="h-2.5 rounded-full bg-black/10 overflow-hidden relative">
        {/* Docelowy pasek (jasny) */}
        <div
          className="absolute top-0 left-0 h-full opacity-30"
          style={{ width: `${Math.min(100, target)}%`, background: color }}
        />
        {/* Rzeczywisty pasek */}
        <div
          className="absolute top-0 left-0 h-full rounded-full"
          style={{ width: `${Math.min(100, actual)}%`, background: color }}
        />
      </div>
    </div>
  );
}
