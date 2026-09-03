"use client";

import { useRouter } from "next/navigation";
import { ExclamationCircleFilled, ArrowRightOutlined } from "@ant-design/icons";
import type { DashboardSimulation } from "@/src/lib/dashboard/dashboard-types";

type Props = { needsRebalancing: DashboardSimulation[] };

export default function DashboardAlerts({ needsRebalancing }: Props) {
  const router = useRouter();

  if (needsRebalancing.length === 0) return null;

  const first = needsRebalancing[0];
  const rest = needsRebalancing.length - 1;

  return (
    <div
      className="rounded-2xl border p-4 md:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      style={{
        background: "rgba(245, 158, 11, 0.08)",
        borderColor: "rgba(245, 158, 11, 0.35)",
      }}
    >
      <div className="flex items-start gap-3">
        <ExclamationCircleFilled
          style={{ color: "#f59e0b", fontSize: 22, marginTop: 2 }}
        />
        <div>
          <p className="font-semibold text-(--text)">
            Wymagany rebalancing portfela
          </p>
          <p className="text-sm text-(--muted) mt-1">
            <span className="font-medium text-(--text)">{first.name}</span>{" "}
            odchylił się od zakładanego celu o ponad 5%.
            {rest > 0 && (
              <>
                {" "}
                Dodatkowo {rest}{" "}
                {rest === 1 ? "inny portfel wymaga" : "inne portfele wymagają"}{" "}
                uwagi.
              </>
            )}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() =>
          router.push(`/my-portfolios/${encodeURIComponent(first.id)}`)
        }
        className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/25 transition-all shrink-0 whitespace-nowrap"
      >
        Zarządzaj portfelem
        <ArrowRightOutlined />
      </button>
    </div>
  );
}
