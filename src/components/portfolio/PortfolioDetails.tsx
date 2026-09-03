"use client";

import { useCallback, useEffect, useState } from "react";
import { Button, Card, Modal } from "antd";
import {
  ArrowLeftOutlined,
  PlusOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useNotify } from "../notifications/NotificationProvider";
import PortfolioSummary from "./PortfolioSummary";
import PortfolioAssetsList from "./PortfolioAssetsList";
import AssetFormModal from "./AssetFormModal";
import PortfolioRebalancing from "./PortfolioRebalancing";
import { useFxRates } from "@/src/lib/portfolio/use-fx-rates";
import { calculatePortfolioStats } from "@/src/lib/portfolio/portfolio-utils";
import type {
  CreateAssetPayload,
  PortfolioAssetDTO,
  PortfolioDTO,
} from "@/src/lib/portfolio/portfolio-types";

type SimulationInfo = {
  name: string;
  stocksPct: number;
  bondsPct: number;
};

type PortfolioDetailsProps = {
  simulationId: string;
  initialPortfolio: PortfolioDTO | null;
  simulationInfo: SimulationInfo | null;
};

export default function PortfolioDetails({
  simulationId,
  initialPortfolio,
  simulationInfo,
}: PortfolioDetailsProps) {
  const router = useRouter();
  const notify = useNotify();
  const [modal, modalContextHolder] = Modal.useModal();
  const { rates: fxRates } = useFxRates();

  const [portfolio, setPortfolio] = useState<PortfolioDTO | null>(
    initialPortfolio,
  );
  const [formOpen, setFormOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<PortfolioAssetDTO | null>(
    null,
  );
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const refreshPortfolio = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/portfolios/${encodeURIComponent(simulationId)}`,
        { credentials: "include" },
      );
      if (!res.ok) return;
      const data = (await res.json()) as { portfolio: PortfolioDTO | null };
      setPortfolio(data.portfolio);
    } catch (err) {
      console.error("refresh portfolio error:", err);
    }
  }, [simulationId]);

  // Cichy sync z Yahoo Finance po wejściu w portfel
  useEffect(() => {
    if (!simulationInfo) return;

    const syncPrices = async () => {
      try {
        const res = await fetch(
          `/api/portfolios/${encodeURIComponent(simulationId)}/sync`,
          { method: "POST", credentials: "include" },
        );
        if (!res.ok) return;
        const data = (await res.json()) as { ok?: boolean; message?: string };
        if (
          data.ok &&
          data.message !== "Brak aktywów z tickerem" &&
          data.message !== "Pusty portfel"
        ) {
          await refreshPortfolio();
        }
      } catch (err) {
        console.error("Background sync failed", err);
      }
    };

    syncPrices();
  }, [simulationId, simulationInfo, refreshPortfolio]);

  const handleFormSubmit = async (payload: CreateAssetPayload) => {
    setSaving(true);
    try {
      const url = editingAsset
        ? `/api/portfolios/${encodeURIComponent(simulationId)}/assets/${encodeURIComponent(editingAsset.id)}`
        : `/api/portfolios/${encodeURIComponent(simulationId)}/assets`;

      const method = editingAsset ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Błąd");

      notify.success({
        title: "Sukces",
        description: `Zapisano ${payload.name}.`,
      });
      setFormOpen(false);
      setEditingAsset(null);
      await refreshPortfolio();
    } catch {
      notify.error({ title: "Błąd zapisu", description: "Wystąpił błąd." });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (asset: PortfolioAssetDTO) => {
    modal.confirm({
      title: "Usunąć aktywo?",
      content: `Aktywo "${asset.name}" zostanie trwale usunięte.`,
      okText: "Usuń",
      cancelText: "Anuluj",
      okButtonProps: { danger: true },
      centered: true,
      async onOk() {
        setDeletingId(asset.id);
        try {
          const res = await fetch(
            `/api/portfolios/${encodeURIComponent(simulationId)}/assets/${encodeURIComponent(asset.id)}`,
            {
              method: "DELETE",
              credentials: "include",
            },
          );
          if (!res.ok) throw new Error("Błąd");
          notify.success({
            title: "Usunięto",
            description: `Aktywo ${asset.name} usunięte.`,
          });
          await refreshPortfolio();
        } catch {
          notify.error({ title: "Błąd", description: "Nie udało się usunąć." });
        } finally {
          setDeletingId(null);
        }
      },
    });
  };

  if (!simulationInfo) {
    return (
      <div className="w-full max-w-5xl mx-auto p-6">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => router.push("/my-portfolios")}
          className="mb-6"
        >
          Wróć do listy portfeli
        </Button>
        <div
          className="rounded-2xl border border-(--btn-border) p-10 flex flex-col items-center text-center"
          style={{
            background: "var(--card-background)",
            boxShadow: "var(--card-shadow)",
            backdropFilter: "var(--card-backdrop-filter)",
          }}
        >
          <h2 className="text-xl font-semibold text-(--text) mb-2">
            Portfel nie istnieje
          </h2>
          <p className="text-sm text-(--muted) mb-6 max-w-md">
            Ta symulacja została usunięta lub nie masz do niej dostępu.
          </p>
          <Button
            type="primary"
            size="large"
            onClick={() => router.push("/my-portfolios")}
          >
            Wróć do listy portfeli
          </Button>
        </div>
      </div>
    );
  }

  const assets = portfolio?.assets ?? [];
  const isEmpty = assets.length === 0;

  return (
    <div className="w-full max-w-5xl mx-auto p-6">
      {modalContextHolder}

      {/* --- Top bar --- */}
      <div className="mb-6">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => router.push("/my-portfolios")}
          size="large"
        >
          Wróć do listy portfeli
        </Button>
      </div>

      {/* --- Główny kontener --- */}
      <Card className="w-full">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 pb-2 border-b border-(--btn-border)">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold text-(--text)">
                Portfel: {simulationInfo.name}
              </h1>
              <p className="text-sm text-(--muted) mt-1">
                Cel inwestycyjny: {simulationInfo.stocksPct}% Akcje ·{" "}
                {simulationInfo.bondsPct}% Obligacje
              </p>
            </div>
            <Button
              size="large"
              onClick={() =>
                router.push(
                  `/my-simulations/${encodeURIComponent(simulationId)}`,
                )
              }
            >
              Zobacz symulację
            </Button>
          </div>

          {isEmpty ? (
            <div className="rounded-2xl border border-(--btn-border) p-10 flex flex-col items-center text-center bg-black/5 dark:bg-white/5">
              <WalletOutlined style={{ fontSize: 32, marginBottom: 16 }} />
              <h2 className="text-xl font-semibold mb-2">Portfel jest pusty</h2>
              <p className="text-sm text-(--muted) mb-6">
                Dodaj swój pierwszy instrument inwestycyjny powiązany z tą
                symulacją.
              </p>
              <Button
                type="primary"
                size="large"
                onClick={() => setFormOpen(true)}
              >
                Dodaj pierwsze aktywo
              </Button>
            </div>
          ) : (
            <>
              <PortfolioSummary
                assets={assets}
                targetStocksPct={simulationInfo.stocksPct}
                targetBondsPct={simulationInfo.bondsPct}
                fxRates={fxRates}
              />

              <PortfolioRebalancing
                stats={calculatePortfolioStats(
                  assets,
                  fxRates,
                  simulationInfo.stocksPct,
                  simulationInfo.bondsPct,
                )}
                targetStocksPct={simulationInfo.stocksPct}
                targetBondsPct={simulationInfo.bondsPct}
              />

              <div className="flex justify-between items-center mt-2 border-t border-(--btn-border) pt-6">
                <h3 className="text-lg font-semibold text-(--text)">
                  Lista aktywów
                </h3>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setEditingAsset(null);
                    setFormOpen(true);
                  }}
                >
                  Dodaj aktywo
                </Button>
              </div>

              <PortfolioAssetsList
                assets={assets}
                onEdit={(a) => {
                  setEditingAsset(a);
                  setFormOpen(true);
                }}
                onDelete={handleDeleteClick}
                deletingId={deletingId}
                fxRates={fxRates}
              />
            </>
          )}
        </div>
      </Card>

      <AssetFormModal
        open={formOpen}
        loading={saving}
        editingAsset={editingAsset}
        onConfirm={handleFormSubmit}
        onCancel={() => {
          setFormOpen(false);
          setEditingAsset(null);
        }}
        fxRates={fxRates}
      />
    </div>
  );
}
