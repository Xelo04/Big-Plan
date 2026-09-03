"use client";

import { Tabs } from "antd";
import type {
  AssetPerformance,
  DashboardStats,
} from "@/src/lib/dashboard/dashboard-types";
import { formatAmount } from "@/src/lib/portfolio/portfolio-utils";

type Props = { stats: DashboardStats };

type Mode = "amount" | "percent";

export default function DashboardHighlights({ stats }: Props) {
  return (
    <div className="rounded-2xl border border-(--btn-border) p-6 bg-(--card-background) flex flex-col gap-4">
      <div>
        <h3 className="text-lg font-semibold text-(--text)">
          Najlepsze i najgorsze inwestycje
        </h3>
      </div>

      <Tabs
        items={[
          {
            key: "amount",
            label: "Według kwoty",
            children: (
              <RankingList
                mode="amount"
                top={stats.topByProfit}
                worst={stats.worstByProfit}
              />
            ),
          },
          {
            key: "percent",
            label: "Procentowo",
            children: (
              <RankingList
                mode="percent"
                top={stats.topByProfitPct}
                worst={stats.worstByProfitPct}
              />
            ),
          },
        ]}
      />
    </div>
  );
}

function RankingList({
  mode,
  top,
  worst,
}: {
  mode: Mode;
  top: AssetPerformance[];
  worst: AssetPerformance[];
}) {
  const filteredTop = top.filter((a) =>
    mode === "amount" ? a.profit > 0 : a.profitPct > 0,
  );

  if (filteredTop.length === 0 && worst.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-(--btn-border) p-4 text-center text-sm text-(--muted)">
        Dodaj aktywa do portfela i poczekaj na zmianę cen, aby zobaczyć swoje
        najlepsze i najgorsze inwestycje.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {filteredTop.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-wider text-(--muted) mb-2">
            Najlepsze
          </p>
          <div className="space-y-2">
            {filteredTop.map((a) => (
              <PerformanceRow key={a.id} asset={a} mode={mode} positive />
            ))}
          </div>
        </div>
      )}

      {worst.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-wider text-(--muted) mb-2">
            Najgorsze
          </p>
          <div className="space-y-2">
            {worst.map((a) => (
              <PerformanceRow
                key={a.id}
                asset={a}
                mode={mode}
                positive={false}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PerformanceRow({
  asset,
  mode,
  positive,
}: {
  asset: AssetPerformance;
  mode: Mode;
  positive: boolean;
}) {
  const color = positive ? "#10b981" : "#ef4444";
  const bg = positive ? "bg-emerald-500/5" : "bg-red-500/5";
  const prefix = positive ? "+" : "";

  return (
    <div
      className={`rounded-xl border border-(--btn-border) p-3 flex items-center justify-between gap-3 ${bg}`}
    >
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-(--text) truncate">
          {asset.name}
          {asset.ticker && (
            <span className="ml-2 text-xs font-mono text-(--muted)">
              {asset.ticker}
            </span>
          )}
        </p>
      </div>
      <div className="text-right shrink-0">
        {mode === "amount" ? (
          <>
            <p className="text-base font-semibold" style={{ color }}>
              {prefix}
              {formatAmount(asset.profit)} PLN
            </p>
            <p className="text-xs text-(--muted)">
              {prefix}
              {asset.profitPct.toFixed(1)}%
            </p>
          </>
        ) : (
          <>
            <p className="text-base font-semibold" style={{ color }}>
              {prefix}
              {asset.profitPct.toFixed(1)}%
            </p>
            <p className="text-xs text-(--muted)">
              {prefix}
              {formatAmount(asset.profit)} PLN
            </p>
          </>
        )}
      </div>
    </div>
  );
}
