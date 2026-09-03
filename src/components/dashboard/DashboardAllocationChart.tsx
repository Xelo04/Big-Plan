"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import type { DashboardStats } from "@/src/lib/dashboard/dashboard-types";
import { formatAmount } from "@/src/lib/portfolio/portfolio-utils";

type Props = { stats: DashboardStats };

const STOCKS_COLOR = "#f97316";
const BONDS_COLOR = "#0ea5a4";

const CURRENCY_COLORS: Record<string, string> = {
  PLN: "#3b82f6",
  USD: "#10b981",
  EUR: "#f59e0b",
  GBP: "#8b5cf6",
  CHF: "#ef4444",
};

export default function DashboardAllocationChart({ stats }: Props) {
  const data = [
    { name: "Akcje", value: stats.stocksValue, color: STOCKS_COLOR },
    { name: "Obligacje", value: stats.bondsValue, color: BONDS_COLOR },
  ].filter((d) => d.value > 0);

  const noData = stats.totalValue === 0;

  return (
    <div className="rounded-2xl border border-(--btn-border) p-6 bg-(--card-background)">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-(--text)">Skład portfela</h3>
      </div>

      {noData ? (
        <div className="h-64 flex items-center justify-center text-(--muted) text-sm">
          Brak aktywów do wyświetlenia
        </div>
      ) : (
        <>
          <div className="relative h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={data.length > 1 ? 3 : 0}
                  dataKey="value"
                  isAnimationActive={false}
                >
                  {data.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-xs text-(--muted)">Wartość</p>
              <p className="text-2xl font-semibold text-(--text)">
                {formatAmount(stats.totalValue)}
              </p>
              <p className="text-xs text-(--muted)">PLN</p>
            </div>
          </div>

          {/* Legenda alokacji akcje/obligacje */}
          <div className="mt-4 space-y-3">
            <AllocationRow
              label="Akcje"
              actual={stats.stocksPct}
              target={stats.targetStocksPct}
              color={STOCKS_COLOR}
            />
            <AllocationRow
              label="Obligacje"
              actual={stats.bondsPct}
              target={stats.targetBondsPct}
              color={BONDS_COLOR}
            />
          </div>

          {/* Podział walutowy */}
          {stats.currencies.length > 0 && (
            <div className="mt-6 pt-4 border-t border-(--btn-border)">
              <p className="text-xs uppercase tracking-wider text-(--muted) mb-3">
                Podział walutowy
              </p>

              <div className="h-3 w-full rounded-full overflow-hidden flex bg-black/10">
                {stats.currencies.map((c) => (
                  <div
                    key={c.currency}
                    style={{
                      width: `${c.pct}%`,
                      background: CURRENCY_COLORS[c.currency] ?? "#94a3b8",
                    }}
                    title={`${c.currency}: ${c.pct.toFixed(1)}%`}
                  />
                ))}
              </div>

              <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                {stats.currencies.map((c) => (
                  <div
                    key={c.currency}
                    className="inline-flex items-center gap-2 text-xs"
                  >
                    <span
                      className="inline-block w-2.5 h-2.5 rounded-sm"
                      style={{
                        background: CURRENCY_COLORS[c.currency] ?? "#94a3b8",
                      }}
                    />
                    <span className="font-medium text-(--text)">
                      {c.currency}
                    </span>
                    <span className="text-(--muted)">{c.pct.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
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
        <div className="inline-flex items-center gap-2">
          <span
            className="inline-block w-3 h-3 rounded-sm"
            style={{ background: color }}
          />
          <span className="text-(--text) font-medium">{label}</span>
        </div>
        <span className="text-(--muted)">
          <span className="font-semibold text-(--text)">
            {actual.toFixed(1)}%
          </span>
          {" / "}
          <span>cel {target.toFixed(0)}%</span>
        </span>
      </div>
    </div>
  );
}
