"use client";

import { useRouter } from "next/navigation";
import {
  ArrowRightOutlined,
  EyeOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import { Tooltip } from "antd";
import type { PortfolioListItemDTO } from "@/src/lib/portfolio/portfolio-types";
import {
  formatAmount,
  calculatePortfolioStats,
} from "@/src/lib/portfolio/portfolio-utils";

export default function PortfolioCard({
  item,
  fxRates,
}: {
  item: PortfolioListItemDTO;
  fxRates: Record<string, number>;
}) {
  const router = useRouter();
  const { simulation, portfolio } = item;

  const assets = portfolio?.assets ?? [];
  const hasAssets = assets.length > 0;

  // Używamy utilsa do pobrania statystyk
  const stats = calculatePortfolioStats(
    assets,
    fxRates,
    simulation.stocksPct,
    simulation.bondsPct,
  );
  const profitPositive = stats.profit >= 0;

  // Konfiguracja kropki statusu
  const statusConfig = {
    CRITICAL: { color: "#ef4444", text: "Krytyczny rebalancing (>10%)" },
    WARNING: { color: "#f59e0b", text: "Wymagany rebalancing (>5%)" },
    OK: { color: "#10b981", text: "Alokacja w normie" },
  };
  const currentStatus = statusConfig[stats.rebalanceStatus];

  return (
    <article
      className="w-full rounded-2xl border border-(--btn-border) overflow-hidden transition-all duration-200 hover:border-(--cta-from)/40"
      style={{
        background: "var(--card-background)",
        boxShadow: "var(--card-shadow)",
        backdropFilter: "var(--card-backdrop-filter)",
      }}
    >
      <header className="px-6 py-5 border-b border-(--btn-border)">
        <div className="flex items-center gap-3">
          <h3 className="text-xl md:text-2xl font-semibold text-(--text) truncate">
            {simulation.name}
          </h3>
          {hasAssets && (
            <Tooltip title={currentStatus.text} placement="top">
              <span
                className="inline-block w-3 h-3 rounded-full shrink-0 shadow-sm"
                style={{ backgroundColor: currentStatus.color }}
              />
            </Tooltip>
          )}
        </div>
        <p className="text-xs text-(--muted) mt-1">
          Cel: {simulation.stocksPct}% Akcje · {simulation.bondsPct}% Obligacje
        </p>
      </header>

      <div className="px-6 py-5">
        {!hasAssets ? (
          <div className="flex items-center gap-3 text-(--muted)">
            <WalletOutlined style={{ fontSize: 20 }} />
            <span className="text-sm">
              Brak dodanych aktywów w tym portfelu. Kliknij &quot;Przejdź do
              portfela&quot;, aby dodać pierwszy instrument.
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-lg border border-(--btn-border) px-4 py-3 bg-[linear-gradient(135deg,rgba(14,165,164,0.09),rgba(249,115,22,0.07))]">
              <p className="text-[10px] uppercase tracking-[0.14em] text-(--muted)">
                Obecna wartość
              </p>
              <div className="mt-0.5 flex items-baseline gap-1">
                <span className="text-xl font-semibold text-(--text)">
                  {formatAmount(stats.totalValue)}
                </span>
                <span className="text-xs text-(--muted)">PLN</span>
              </div>
            </div>

            <div className="rounded-lg border border-(--btn-border) px-4 py-3 bg-[linear-gradient(135deg,rgba(59,130,246,0.10),rgba(14,165,164,0.08))]">
              <p className="text-[10px] uppercase tracking-[0.14em] text-(--muted)">
                Zysk / Strata
              </p>
              <div className="mt-0.5 flex items-baseline gap-1">
                <span
                  className="text-xl font-semibold"
                  style={{ color: profitPositive ? "#10b981" : "#ef4444" }}
                >
                  {profitPositive ? "+" : ""}
                  {formatAmount(stats.profit)}
                </span>
                <span className="text-xs text-(--muted)">PLN</span>
              </div>
            </div>

            <div className="rounded-lg border border-(--btn-border) px-4 py-3 flex flex-col justify-center">
              <p className="text-[10px] uppercase tracking-[0.14em] text-(--muted)">
                Liczba aktywów
              </p>
              <div className="mt-0.5 flex items-baseline gap-1">
                <span className="text-xl font-semibold text-(--text)">
                  {assets.length}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <footer className="px-6 py-4 border-t border-(--btn-border) flex flex-wrap gap-2 justify-end">
        <button
          type="button"
          onClick={() =>
            router.push(`/my-simulations/${encodeURIComponent(simulation.id)}`)
          }
          className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-(--btn-border) text-(--text) hover:bg-blue-500/10 hover:border-blue-500/40 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <EyeOutlined />
          Zobacz symulację
        </button>

        <button
          type="button"
          onClick={() =>
            router.push(`/my-portfolios/${encodeURIComponent(simulation.id)}`)
          }
          className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-blue-500/30 text-blue-600 hover:bg-blue-500/10 hover:border-blue-500/60 transition-colors"
        >
          Przejdź do portfela
          <ArrowRightOutlined />
        </button>
      </footer>
    </article>
  );
}
