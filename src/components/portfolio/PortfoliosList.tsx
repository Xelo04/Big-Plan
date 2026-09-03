"use client";

import { useRouter } from "next/navigation";
import { Button } from "antd";
import { WalletOutlined, PlusOutlined } from "@ant-design/icons";
import PortfolioCard from "./PortfolioCard";
import type { PortfolioListItemDTO } from "@/src/lib/portfolio/portfolio-types";
import { useFxRates } from "@/src/lib/portfolio/use-fx-rates";

type PortfoliosListProps = {
  initialItems: PortfolioListItemDTO[];
};

export default function PortfoliosList({ initialItems }: PortfoliosListProps) {
  const router = useRouter();
  const { rates: fxRates } = useFxRates();

  const items = initialItems;

  if (items.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-semibold text-(--text) mb-6">
          Moje portfele
        </h1>
        <div className="rounded-2xl border border-(--btn-border) p-10 flex flex-col items-center text-center bg-(--card-background)">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
            style={{
              background:
                "linear-gradient(135deg, rgba(14,165,164,0.15), rgba(249,115,22,0.12))",
            }}
          >
            <WalletOutlined style={{ fontSize: 28, color: "var(--text)" }} />
          </div>
          <h2 className="text-xl font-semibold text-(--text) mb-2">
            Nie masz jeszcze żadnych portfeli
          </h2>
          <p className="text-sm text-(--muted) mb-6 max-w-md">
            Portfele są powiązane z Twoimi symulacjami. Stwórz swoją pierwszą
            symulację, aby móc dodać do niej rzeczywisty portfel.
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
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <h1 className="text-2xl md:text-3xl font-semibold text-(--text) mb-2">
        Moje portfele
      </h1>
      <p className="text-sm text-(--muted) mb-6">
        Tutaj znajdziesz portfele przypisane do Twoich zapisanych symulacji.
      </p>

      <div className="flex flex-col gap-5">
        {items.map((item) => (
          <PortfolioCard
            key={item.simulation.id}
            item={item}
            fxRates={fxRates}
          />
        ))}
      </div>
    </div>
  );
}
