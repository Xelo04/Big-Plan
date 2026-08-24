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

type PortfolioDetailsProps = {
  simulationId: string;
};

export default function PortfolioDetails({
  simulationId,
}: PortfolioDetailsProps) {
  const router = useRouter();
  const notify = useNotify();
  const [modal, modalContextHolder] = Modal.useModal();
  const { rates: fxRates } = useFxRates();

  const [portfolio, setPortfolio] = useState<PortfolioDTO | null>(null);
  const [simulationInfo, setSimulationInfo] = useState<{
    name: string;
    stocksPct: number;
    bondsPct: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<PortfolioAssetDTO | null>(
    null,
  );
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchPortfolio = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/portfolios/${encodeURIComponent(simulationId)}`,
        { credentials: "include" },
      );
      if (!res.ok) throw new Error("Błąd");
      const data = await res.json();
      setPortfolio(data.portfolio);
      setSimulationInfo(data.simulation);
    } catch {
      notify.error({
        title: "Błąd",
        description: "Nie udało się pobrać danych portfela.",
      });
    } finally {
      setLoading(false);
    }
  }, [simulationId, notify]);

  useEffect(() => {
    fetchPortfolio().then(async () => {
      try {
        const res = await fetch(
          `/api/portfolios/${encodeURIComponent(simulationId)}/sync`,
          {
            method: "POST",
            credentials: "include",
          },
        );
        if (res.ok) {
          const data = await res.json();
          if (
            data.ok &&
            data.message !== "Brak aktywów z tickerem" &&
            data.message !== "Pusty portfel"
          ) {
            const refreshRes = await fetch(
              `/api/portfolios/${encodeURIComponent(simulationId)}`,
              { credentials: "include" },
            );
            const refreshData = await refreshRes.json();
            setPortfolio(refreshData.portfolio);
          }
        }
      } catch (err) {
        console.error("Background sync failed", err);
      }
    });
  }, [fetchPortfolio, simulationId]);

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
      await fetchPortfolio();
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
          await fetchPortfolio();
        } catch {
          notify.error({ title: "Błąd", description: "Nie udało się usunąć." });
        } finally {
          setDeletingId(null);
        }
      },
    });
  };

  if (loading) {
    return (
      <div className="w-full max-w-5xl mx-auto p-6">
        <div className="h-8 w-40 rounded bg-black/5 animate-pulse mb-6" />
        <div className="h-100 w-full rounded-2xl bg-black/5 animate-pulse" />
      </div>
    );
  }

  if (!simulationInfo)
    return <div className="p-6">Nie znaleziono portfela.</div>;

  const assets = portfolio?.assets ?? [];
  const isEmpty = assets.length === 0;

  return (
    <div className="w-full max-w-5xl mx-auto p-6">
      {modalContextHolder}

      {/* --- Top bar (Wróć do listy) - poza kartą, jak w edycji --- */}
      <div className="mb-6">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => router.push("/my-portfolios")}
          size="large"
        >
          Wróć do listy portfeli
        </Button>
      </div>

      {/* --- Główny kontener na wzór SimulationEditor --- */}
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
