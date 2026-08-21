"use client";

import {
  CalendarOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import type { SavedSimulationDTO } from "@/src/lib/simulation/simulation-types";

type SimulationCardProps = {
  simulation: SavedSimulationDTO;
  onDelete: (id: string) => void;
  deleting: boolean;
};

const formatAmount = (value: number) =>
  new Intl.NumberFormat("pl-PL", { maximumFractionDigits: 0 }).format(value);

const formatDate = (iso: string) => {
  const date = new Date(iso);
  return date.toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export default function SimulationCard({
  simulation,
  onDelete,
  deleting,
}: SimulationCardProps) {
  const router = useRouter();

  const {
    id,
    name,
    knowsMonthlyAmount,
    userMonthlyInvestment,
    recommendedMonthlyPayment,
    simulationSuccessRate,
    userSimulationSuccessRate,
    createdAt,
  } = simulation;

  const showUserContribution =
    knowsMonthlyAmount &&
    userMonthlyInvestment != null &&
    userMonthlyInvestment > 0 &&
    userSimulationSuccessRate != null;

  return (
    <article
      className="w-full rounded-2xl border border-(--btn-border) overflow-hidden transition-all duration-200 hover:border-(--cta-from)/40"
      style={{
        background: "var(--card-background)",
        boxShadow: "var(--card-shadow)",
        backdropFilter: "var(--card-backdrop-filter)",
      }}
    >
      {/* --- Header --- */}
      <header className="px-6 py-5 border-b border-(--btn-border)">
        <h3 className="text-xl md:text-2xl font-semibold text-(--text) truncate">
          {name}
        </h3>
        <p className="text-xs text-(--muted) mt-1 inline-flex items-center gap-1.5">
          <CalendarOutlined style={{ fontSize: 12 }} />
          Zapisano {formatDate(createdAt)}
        </p>
      </header>

      {/* --- KPIs --- */}
      <div className="px-6 py-4">
        <div
          className={`grid gap-3 ${showUserContribution ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"}`}
        >
          <div className="rounded-lg border border-(--btn-border) px-4 py-3 bg-[linear-gradient(135deg,rgba(14,165,164,0.09),rgba(249,115,22,0.07))] flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.14em] text-(--muted)">
                Rekomendowana składka
              </p>
              <div className="mt-0.5 flex items-baseline gap-1">
                <span className="text-xl font-semibold text-(--text)">
                  {formatAmount(recommendedMonthlyPayment)}
                </span>
                <span className="text-xs text-(--muted)">zł/mies</span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[10px] uppercase tracking-[0.14em] text-(--muted)">
                Skuteczność
              </p>
              <p className="text-sm font-semibold text-(--text) mt-0.5">
                {(simulationSuccessRate * 100).toFixed(1)}%
              </p>
            </div>
          </div>

          {showUserContribution && (
            <div className="rounded-lg border border-(--btn-border) px-4 py-3 bg-[linear-gradient(135deg,rgba(59,130,246,0.10),rgba(14,165,164,0.08))] flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-[0.14em] text-(--muted)">
                  Twoja składka
                </p>
                <div className="mt-0.5 flex items-baseline gap-1">
                  <span className="text-xl font-semibold text-(--text)">
                    {formatAmount(userMonthlyInvestment!)}
                  </span>
                  <span className="text-xs text-(--muted)">zł/mies</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[10px] uppercase tracking-[0.14em] text-(--muted)">
                  Skuteczność
                </p>
                <p className="text-sm font-semibold text-(--text) mt-0.5">
                  {(userSimulationSuccessRate! * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- Actions --- */}
      <footer className="px-6 py-4 border-t border-(--btn-border) flex flex-wrap gap-2 justify-end">
        <button
          type="button"
          onClick={() =>
            router.push(`/my-simulations/${encodeURIComponent(id)}`)
          }
          className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-(--btn-border) text-(--text) hover:bg-blue-500/10 hover:border-blue-500/40 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <EyeOutlined />
          Zobacz szczegóły
        </button>

        <button
          type="button"
          onClick={() =>
            router.push(`/my-simulations/edit/${encodeURIComponent(id)}`)
          }
          className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-(--btn-border) text-(--text) hover:bg-emerald-500/10 hover:border-emerald-500/40 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
        >
          <EditOutlined />
          Edytuj
        </button>

        <button
          type="button"
          onClick={() => onDelete(id)}
          disabled={deleting}
          className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-red-500/30 text-red-500 hover:bg-red-500/10 hover:border-red-500/60 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <DeleteOutlined />
          {deleting ? "Usuwanie..." : "Usuń"}
        </button>
      </footer>
    </article>
  );
}
