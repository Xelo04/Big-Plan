"use client";

import { useMemo } from "react";
import type { PortfolioAssetDTO } from "@/src/lib/portfolio/portfolio-types";
import {
  formatAmount,
  calculatePortfolioStats,
} from "@/src/lib/portfolio/portfolio-utils";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

type PortfolioSummaryProps = {
  assets: PortfolioAssetDTO[];
  targetStocksPct: number;
  targetBondsPct: number;
  fxRates: Record<string, number>;
};

const STOCKS_COLOR = "#f97316"; // Pomarańczowy
const BONDS_COLOR = "#0ea5a4"; // Morski/Turkusowy

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

  // Dane do wykresu kołowego
  const pieData = [
    { name: "Akcje", value: stats.stocksValue, color: STOCKS_COLOR },
    { name: "Obligacje", value: stats.bondsValue, color: BONDS_COLOR },
  ].filter((d) => d.value > 0);

  const noData = stats.totalValue === 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* 1. Kafel: Wartość portfela */}
      <div className="rounded-2xl border border-(--btn-border) bg-[linear-gradient(135deg,rgba(14,165,164,0.09),rgba(249,115,22,0.07))] p-4 sm:p-5">
        <p className="text-xs uppercase tracking-[0.16em] text-(--muted)">
          Wartość portfela
        </p>
        <div className="mt-2 flex flex-wrap items-baseline gap-2">
          <p className="text-3xl font-semibold leading-none text-(--text) sm:text-4xl">
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

      {/* 2. Kafel: Alokacja (Tekst + Wykres Kołowy) */}
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-(--btn-border) bg-black/5 p-4 dark:bg-white/5 sm:flex-row sm:gap-6 sm:p-5">
        {/* Lewa strona: Teksty */}
        <div className="flex-1 w-full">
          <p className="text-xs uppercase tracking-[0.16em] text-(--muted) mb-4">
            Alokacja aktywów
          </p>

          <div className="flex flex-col gap-4">
            <AllocationRow
              label="Akcje"
              actual={stats.currentStocksPct}
              target={targetStocksPct}
              color={STOCKS_COLOR}
            />
            <AllocationRow
              label="Obligacje"
              actual={stats.currentBondsPct}
              target={targetBondsPct}
              color={BONDS_COLOR}
            />
          </div>

          <p className="text-[10px] text-(--muted) mt-4">
            Alokacja docelowa pochodzi z symulacji.
          </p>
        </div>

        {/* Prawa strona: Wykres Kołowy Donut */}
        <div className="relative hidden h-28 w-28 shrink-0 items-center justify-center sm:flex sm:h-35 sm:w-35">
          {noData ? (
            <span className="text-xs text-(--muted)">Brak aktywów</span>
          ) : (
            <>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={pieData.length > 1 ? 3 : 0}
                    dataKey="value"
                    isAnimationActive={false}
                  >
                    {pieData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </>
          )}
        </div>
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
        <span className="text-(--text) font-medium flex items-center gap-1.5">
          <span
            className="w-2.5 h-2.5 rounded-full inline-block"
            style={{ backgroundColor: color }}
          />
          {label}
        </span>
        <span className="text-(--muted)">
          <span className="font-semibold text-(--text)">
            {actual.toFixed(1)}%
          </span>
          {" / "}
          <span className="text-xs">cel {target}%</span>
        </span>
      </div>
      <div className="h-2 rounded-full bg-black/10 overflow-hidden relative">
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
