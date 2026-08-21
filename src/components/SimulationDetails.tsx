"use client";

import { useCallback, useEffect, useState } from "react";
import { Button, Tabs, Tooltip } from "antd";
import {
  ArrowLeftOutlined,
  BarChartOutlined,
  EditOutlined,
  InfoCircleOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useNotify } from "./NotificationProvider";
import SimulationComparisonChart from "./SimulationComparisonChart";
import type { SavedSimulationDTO } from "@/src/lib/simulation-types";

type SimulationDetailsProps = {
  simulationId: string;
};

const formatAmount = (value: number) =>
  new Intl.NumberFormat("pl-PL", { maximumFractionDigits: 0 }).format(value);

const formatDate = (iso: string) => {
  const date = new Date(iso);
  return date.toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function SimulationDetails({
  simulationId,
}: SimulationDetailsProps) {
  const router = useRouter();
  const notify = useNotify();

  const [simulation, setSimulation] = useState<SavedSimulationDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const fetchSimulation = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/simulations/${encodeURIComponent(simulationId)}`,
        {
          credentials: "include",
        },
      );

      if (res.status === 404 || res.status === 403) {
        setNotFound(true);
        return;
      }

      if (!res.ok) {
        notify.error({
          title: "Nie udało się pobrać symulacji",
          description: "Spróbuj odświeżyć stronę.",
        });
        return;
      }

      const data = (await res.json()) as { simulation: SavedSimulationDTO };
      setSimulation(data.simulation);
    } catch (err) {
      console.error("fetch simulation error:", err);
      notify.error({
        title: "Nie udało się pobrać symulacji",
        description: "Sprawdź połączenie internetowe.",
      });
    } finally {
      setLoading(false);
    }
  }, [simulationId, notify]);

  useEffect(() => {
    fetchSimulation();
  }, [fetchSimulation]);

  if (loading) {
    return (
      <div className="w-full max-w-5xl mx-auto p-6">
        <div className="h-8 w-40 rounded bg-black/5 animate-pulse mb-4" />
        <div className="h-12 w-2/3 rounded bg-black/5 animate-pulse mb-2" />
        <div className="h-4 w-1/3 rounded bg-black/5 animate-pulse mb-6" />
        <div
          className="h-125 rounded-2xl border border-(--btn-border) animate-pulse"
          style={{ background: "var(--card-background)" }}
        />
      </div>
    );
  }

  if (notFound || !simulation) {
    return (
      <div className="w-full max-w-5xl mx-auto p-6">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => router.push("/my-simulations")}
          className="mb-6"
        >
          Wróć do listy symulacji
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
            Symulacja nie istnieje
          </h2>
          <p className="text-sm text-(--muted) mb-6 max-w-md">
            Ta symulacja została usunięta lub nie masz do niej dostępu.
          </p>
          <Button
            type="primary"
            size="large"
            onClick={() => router.push("/my-simulations")}
            style={{
              borderRadius: 9,
              background:
                "linear-gradient(90deg, var(--cta-from) 0%, var(--cta-to) 100%)",
              border: 0,
            }}
          >
            Wróć do listy
          </Button>
        </div>
      </div>
    );
  }

  const {
    name,
    currentAge,
    expectedDeathAge,
    workEndAge,
    statePensionAge,
    estimatedPension,
    monthlyNeed,
    stocksPct,
    bondsPct,
    knowsMonthlyAmount,
    userMonthlyInvestment,
    recommendedMonthlyPayment,
    simulationSuccessRate,
    userSimulationSuccessRate,
    recommendedChartPercentiles,
    userChartPercentiles,
    totalSimulations,
    createdAt,
    updatedAt,
  } = simulation;

  const showUserContribution =
    knowsMonthlyAmount &&
    userMonthlyInvestment != null &&
    userMonthlyInvestment > 0 &&
    userSimulationSuccessRate != null &&
    userChartPercentiles != null;

  const recommendationContent = (
    <>
      <SimulationComparisonChart
        series={[]}
        precomputedPercentiles={recommendedChartPercentiles}
      />

      <div className="mt-4 rounded-2xl border border-(--btn-border) p-5 bg-[linear-gradient(135deg,rgba(14,165,164,0.09),rgba(249,115,22,0.07))]">
        <div className="flex items-start justify-between gap-3">
          <p className="text-xs uppercase tracking-[0.16em] text-(--muted)">
            Rekomendacja składki
          </p>
          <Tooltip
            title={`Symulacja przeanalizowała ${totalSimulations.toLocaleString("pl-PL")} scenariuszy rynkowych. Rekomendowana składka pozwala osiągnąć wysoki poziom bezpieczeństwa portfela.`}
            styles={{ root: { maxWidth: 360, fontSize: 13 } }}
          >
            <InfoCircleOutlined
              className="cursor-pointer text-(--muted) hover:text-(--text)"
              style={{ fontSize: 18 }}
            />
          </Tooltip>
        </div>

        <div className="mt-2 flex min-h-fit items-end gap-2">
          <p className="text-3xl md:text-4xl font-semibold text-(--text) leading-none">
            {formatAmount(recommendedMonthlyPayment)}
          </p>
          <p className="self-end text-base md:text-lg text-(--muted) leading-none">
            zł / mies.
          </p>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between gap-3 text-sm">
            <p className="text-(--muted)">Skuteczność symulacji</p>
            <p className="font-semibold text-(--text)">
              {(simulationSuccessRate * 100).toFixed(3)}%
            </p>
          </div>
          <div className="mt-2 h-2.5 rounded-full bg-black/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-linear-to-r from-[#0ea5a4] to-[#f97316]"
              style={{
                width: `${Math.min(100, Math.max(0, simulationSuccessRate * 100))}%`,
              }}
            />
          </div>
        </div>
      </div>
    </>
  );

  const userContributionContent = showUserContribution ? (
    <>
      <SimulationComparisonChart
        series={[]}
        precomputedPercentiles={userChartPercentiles!}
      />

      <div className="mt-4 rounded-2xl border border-(--btn-border) p-5 bg-[linear-gradient(135deg,rgba(59,130,246,0.10),rgba(14,165,164,0.08))]">
        <div className="flex items-start justify-between gap-3">
          <p className="text-xs uppercase tracking-[0.16em] text-(--muted)">
            Twoja składka
          </p>
          <Tooltip
            title="Wynik dla składki miesięcznej zadeklarowanej przez Ciebie przy tworzeniu symulacji."
            styles={{ root: { maxWidth: 360, fontSize: 13 } }}
          >
            <InfoCircleOutlined
              className="cursor-pointer text-(--muted) hover:text-(--text)"
              style={{ fontSize: 18 }}
            />
          </Tooltip>
        </div>

        <div className="mt-2 flex min-h-fit items-end gap-2">
          <p className="text-3xl md:text-4xl font-semibold text-(--text) leading-none">
            {formatAmount(userMonthlyInvestment!)}
          </p>
          <p className="self-end text-base md:text-lg text-(--muted) leading-none">
            zł / mies.
          </p>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between gap-3 text-sm">
            <p className="text-(--muted)">Skuteczność symulacji</p>
            <p className="font-semibold text-(--text)">
              {(userSimulationSuccessRate! * 100).toFixed(3)}%
            </p>
          </div>
          <div className="mt-2 h-2.5 rounded-full bg-black/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-linear-to-r from-[#3b82f6] to-[#0ea5a4]"
              style={{
                width: `${Math.min(100, Math.max(0, userSimulationSuccessRate! * 100))}%`,
              }}
            />
          </div>
        </div>
      </div>
    </>
  ) : null;

  const parametersContent = (
    <div className="rounded-2xl border border-(--btn-border) p-6">
      <p className="text-sm font-semibold text-(--text) mb-4">
        Parametry symulacji
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-(--muted)">Obecny wiek</span>
          <span className="font-medium text-(--text)">{currentAge} lat</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-(--muted)">Wiek zakończenia pracy</span>
          <span className="font-medium text-(--text)">{workEndAge} lat</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-(--muted)">Wiek emerytury państwowej</span>
          <span className="font-medium text-(--text)">
            {statePensionAge} lat
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-(--muted)">Przewidywany wiek śmierci</span>
          <span className="font-medium text-(--text)">
            {expectedDeathAge} lat
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-(--muted)">Potrzebna kwota miesięcznie</span>
          <span className="font-medium text-(--text)">
            {formatAmount(monthlyNeed)} zł
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-(--muted)">Szacowana emerytura ZUS</span>
          <span className="font-medium text-(--text)">
            {formatAmount(estimatedPension)} zł
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-(--muted)">Skład portfela</span>
          <span className="font-medium text-(--text)">
            {stocksPct}% akcje · {bondsPct}% obligacje
          </span>
        </div>
        {knowsMonthlyAmount && userMonthlyInvestment != null && (
          <div className="flex items-center justify-between">
            <span className="text-(--muted)">Twoja składka miesięczna</span>
            <span className="font-medium text-(--text)">
              {formatAmount(userMonthlyInvestment)} zł
            </span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-5xl mx-auto p-6">
      {/* --- Nav back --- */}
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => router.push("/my-simulations")}
        className="mb-4"
      >
        Wróć do listy
      </Button>

      {/* --- Header --- */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl md:text-3xl font-semibold text-(--text) truncate">
            {name}
          </h1>
          <p className="text-xs text-(--muted) mt-1">
            Zapisano {formatDate(createdAt)}
            {updatedAt !== createdAt && (
              <> · Zaktualizowano {formatDate(updatedAt)}</>
            )}
          </p>
        </div>

        <Button
          icon={<EditOutlined />}
          size="large"
          onClick={() =>
            router.push(
              `/my-simulations/edit/${encodeURIComponent(simulation.id)}`,
            )
          }
        >
          Edytuj
        </Button>
      </div>

      {/* --- Content --- */}
      <div className="flex flex-col gap-4">
        {showUserContribution ? (
          <Tabs
            items={[
              {
                key: "user",
                label: (
                  <span className="inline-flex items-center gap-2">
                    <UserOutlined />
                    Twoja składka
                  </span>
                ),
                children: userContributionContent,
              },
              {
                key: "recommended",
                label: (
                  <span className="inline-flex items-center gap-2">
                    <BarChartOutlined />
                    Rekomendowana składka
                  </span>
                ),
                children: recommendationContent,
              },
            ]}
          />
        ) : (
          recommendationContent
        )}

        {parametersContent}
      </div>
    </div>
  );
}
