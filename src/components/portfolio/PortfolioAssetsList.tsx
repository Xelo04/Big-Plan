"use client";

import { DeleteOutlined, EditOutlined, ApiOutlined } from "@ant-design/icons";
import { Tooltip } from "antd";
import {
  ASSET_CATEGORY_LABELS,
  type AssetCategory,
  type PortfolioAssetDTO,
} from "@/src/lib/portfolio/portfolio-types";
import { toPLN } from "@/src/lib/portfolio/portfolio-utils";

type PortfolioAssetsListProps = {
  assets: PortfolioAssetDTO[];
  onEdit: (asset: PortfolioAssetDTO) => void;
  onDelete: (asset: PortfolioAssetDTO) => void;
  deletingId: string | null;
  fxRates: Record<string, number>;
};

const formatAmount = (value: number) =>
  new Intl.NumberFormat("pl-PL", { maximumFractionDigits: 2 }).format(value);

const formatQuantity = (value: number) =>
  new Intl.NumberFormat("pl-PL", { maximumFractionDigits: 6 }).format(value);

export default function PortfolioAssetsList({
  assets,
  onEdit,
  onDelete,
  deletingId,
  fxRates,
}: PortfolioAssetsListProps) {
  return (
    <div className="flex flex-col gap-3">
      {assets.map((asset) => {
        const invested = asset.quantity * asset.averagePrice;
        const current = asset.quantity * asset.currentPrice;
        const investedPLN = toPLN(
          invested,
          asset.currency,
          asset.customFxRate,
          fxRates,
        );
        const currentPLN = toPLN(
          current,
          asset.currency,
          asset.customFxRate,
          fxRates,
        );
        const profit = currentPLN - investedPLN;
        const profitPct = investedPLN > 0 ? (profit / investedPLN) * 100 : 0;
        const profitPositive = profit >= 0;

        return (
          <article
            key={asset.id}
            className="w-full min-w-0 rounded-xl border border-(--btn-border) p-3 sm:p-4"
            style={{
              background: "var(--card-background)",
              boxShadow: "var(--card-shadow)",
              backdropFilter: "var(--card-backdrop-filter)",
            }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Left: name + ticker + category */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="break-words text-lg font-semibold text-(--text)">
                    {asset.name}
                  </h3>
                  {asset.ticker && (
                    <span className="inline-flex items-center gap-1 text-xs font-mono px-2 py-0.5 rounded bg-black/10 text-(--muted)">
                      {asset.ticker}
                      <Tooltip title="Cena tego aktywa jest automatycznie aktualizowana z giełdy (Yahoo Finance)">
                        <ApiOutlined
                          style={{
                            fontSize: 12,
                            color: "#10b981",
                          }}
                        />
                      </Tooltip>
                    </span>
                  )}
                  <span
                    className="text-[10px] uppercase tracking-[0.14em] px-2 py-0.5 rounded"
                    style={{
                      background:
                        asset.category === "STOCKS"
                          ? "rgba(249, 115, 22, 0.15)"
                          : "rgba(14, 165, 164, 0.15)",
                      color:
                        asset.category === "STOCKS" ? "#f97316" : "#0ea5a4",
                    }}
                  >
                    {ASSET_CATEGORY_LABELS[asset.category as AssetCategory] ??
                      asset.category}
                  </span>
                </div>
                <p className="mt-1 break-words text-xs text-(--muted)">
                  {formatQuantity(asset.quantity)} szt. ·{" "}
                  {formatAmount(asset.averagePrice)} {asset.currency} zakup ·{" "}
                  {formatAmount(asset.currentPrice)} {asset.currency} obecnie
                </p>
              </div>

              {/* Middle: values */}
              <div className="flex flex-col sm:items-end shrink-0">
                <p className="text-lg font-semibold text-(--text)">
                  {formatAmount(currentPLN)} PLN
                </p>
                <p
                  className="text-xs font-medium"
                  style={{ color: profitPositive ? "#10b981" : "#ef4444" }}
                >
                  {profitPositive ? "+" : ""}
                  {formatAmount(profit)} PLN ({profitPositive ? "+" : ""}
                  {profitPct.toFixed(2)}%)
                </p>
              </div>

              {/* Right: actions */}
              <div className="flex w-full gap-2 sm:w-auto">
                <button
                  type="button"
                  onClick={() => onEdit(asset)}
                  className="inline-flex min-w-0 flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border border-(--btn-border) px-3 py-2 text-xs font-medium text-(--text) transition-colors hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400 sm:flex-none sm:py-1.5"
                >
                  <EditOutlined />
                  Edytuj
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(asset)}
                  disabled={deletingId === asset.id}
                  className="inline-flex min-w-0 flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border border-red-500/30 px-3 py-2 text-xs font-medium text-red-500 transition-colors hover:border-red-500/60 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none sm:py-1.5"
                >
                  <DeleteOutlined />
                  {deletingId === asset.id ? "Usuwanie..." : "Usuń"}
                </button>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
