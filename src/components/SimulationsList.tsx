"use client";

import { useCallback, useEffect, useState } from "react";
import { Button, Modal } from "antd";
import {
  ExclamationCircleFilled,
  PlusOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import SimulationCard from "./SimulationCard";
import { useNotify } from "./NotificationProvider";
import type { SavedSimulationDTO } from "@/src/lib/simulation-types";

const MAX_SIMULATIONS = 3;

export default function SimulationsList() {
  const router = useRouter();
  const notify = useNotify();
  const [modal, modalContextHolder] = Modal.useModal();

  const [simulations, setSimulations] = useState<SavedSimulationDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchSimulations = useCallback(async () => {
    try {
      const res = await fetch("/api/simulations", {
        credentials: "include",
      });
      if (!res.ok) {
        notify.error({
          title: "Nie udało się pobrać symulacji",
          description: "Spróbuj odświeżyć stronę.",
        });
        return;
      }
      const data = (await res.json()) as { simulations: SavedSimulationDTO[] };
      setSimulations(data.simulations);
    } catch (err) {
      console.error("fetchSimulations error:", err);
      notify.error({
        title: "Nie udało się pobrać symulacji",
        description: "Sprawdź połączenie internetowe.",
      });
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    fetchSimulations();
  }, [fetchSimulations]);

  const handleDelete = (id: string) => {
    const target = simulations.find((s) => s.id === id);
    if (!target) return;

    modal.confirm({
      title: "Usunąć symulację?",
      icon: <ExclamationCircleFilled style={{ color: "var(--danger-text)" }} />,
      content: (
        <div className="text-(--text)">
          Symulacja <strong>&quot;{target.name}&quot;</strong> zostanie trwale
          usunięta. Tej operacji nie można cofnąć.
        </div>
      ),
      okText: "Usuń",
      cancelText: "Anuluj",
      okButtonProps: { danger: true },
      centered: true,
      async onOk() {
        setDeletingId(id);
        try {
          const res = await fetch(
            `/api/simulations?id=${encodeURIComponent(id)}`,
            {
              method: "DELETE",
              credentials: "include",
            },
          );
          const data = (await res.json()) as { error?: string };

          if (!res.ok) {
            notify.error({
              title: "Nie udało się usunąć symulacji",
              description: data.error ?? "Spróbuj ponownie.",
            });
            return;
          }

          setSimulations((prev) => prev.filter((s) => s.id !== id));
          notify.success({
            title: "Symulacja usunięta",
            description: `"${target.name}" została usunięta.`,
          });
        } catch (err) {
          console.error("delete simulation error:", err);
          notify.error({
            title: "Nie udało się usunąć symulacji",
            description: "Wystąpił nieoczekiwany błąd.",
          });
        } finally {
          setDeletingId(null);
        }
      },
    });
  };

  const canAddMore = simulations.length < MAX_SIMULATIONS;

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        {modalContextHolder}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-(--text)">
              Moje symulacje
            </h1>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-64 rounded-2xl border border-(--btn-border) animate-pulse"
              style={{ background: "var(--card-background)" }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      {modalContextHolder}

      {/* --- Header --- */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-(--text)">
            Moje symulacje
          </h1>
          <p className="text-sm text-(--muted) mt-1">
            {simulations.length === 0
              ? "Nie masz jeszcze zapisanych symulacji."
              : simulations.length === MAX_SIMULATIONS
                ? `Wykorzystałeś wszystkie ${MAX_SIMULATIONS} miejsca na symulacje.`
                : `Wykorzystano ${simulations.length} z ${MAX_SIMULATIONS} miejsc na symulacje.`}
          </p>
        </div>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          disabled={!canAddMore}
          onClick={() => router.push("/calculator")}
          style={{
            borderRadius: 9,
            background: canAddMore
              ? "linear-gradient(90deg, var(--cta-from) 0%, var(--cta-to) 100%)"
              : undefined,
            border: 0,
          }}
        >
          Nowa symulacja
        </Button>
      </div>

      {/* --- Limit banner --- */}
      {!canAddMore && (
        <div
          className="mb-6 rounded-xl border p-4 flex items-start gap-3"
          style={{
            background: "var(--danger-bg)",
            borderColor: "var(--danger-border)",
          }}
        >
          <ExclamationCircleFilled
            style={{ color: "var(--danger-text)", fontSize: 20, marginTop: 2 }}
          />
          <div>
            <p
              className="font-semibold"
              style={{ color: "var(--danger-text)" }}
            >
              Osiągnięto limit {MAX_SIMULATIONS} symulacji
            </p>
            <p className="text-sm mt-1" style={{ color: "var(--danger-text)" }}>
              Usuń jedną z istniejących symulacji, aby zapisać nową.
            </p>
          </div>
        </div>
      )}

      {/* --- List / Empty state --- */}
      {simulations.length === 0 ? (
        <div
          className="rounded-2xl border border-(--btn-border) p-10 flex flex-col items-center text-center"
          style={{
            background: "var(--card-background)",
            boxShadow: "var(--card-shadow)",
            backdropFilter: "var(--card-backdrop-filter)",
          }}
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
            style={{
              background:
                "linear-gradient(135deg, rgba(14,165,164,0.15), rgba(249,115,22,0.12))",
            }}
          >
            <BarChartOutlined style={{ fontSize: 28, color: "var(--text)" }} />
          </div>
          <h2 className="text-xl font-semibold text-(--text) mb-2">
            Brak zapisanych symulacji
          </h2>
          <p className="text-sm text-(--muted) mb-6 max-w-md">
            Przejdź do kalkulatora, policz swój cel i zapisz go, aby móc do
            niego wrócić w dowolnej chwili.
          </p>
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={() => router.push("/calculator")}
            style={{
              borderRadius: 9,
              background:
                "linear-gradient(90deg, var(--cta-from) 0%, var(--cta-to) 100%)",
              border: 0,
            }}
          >
            Otwórz kalkulator
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {simulations.map((simulation) => (
            <SimulationCard
              key={simulation.id}
              simulation={simulation}
              onDelete={handleDelete}
              deleting={deletingId === simulation.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
