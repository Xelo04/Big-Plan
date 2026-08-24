"use client";

import { CheckCircleFilled, ExclamationCircleFilled } from "@ant-design/icons";
import { formatAmount } from "@/src/lib/portfolio/portfolio-utils";

type PortfolioRebalancingProps = {
  stats: {
    stocksValue: number;
    bondsValue: number;
    totalValue: number;
    currentStocksPct: number;
    currentBondsPct: number;
    stocksDeviation: number;
    bondsDeviation: number;
    rebalanceStatus: "OK" | "WARNING" | "CRITICAL";
  };
  targetStocksPct: number;
  targetBondsPct: number;
};

export default function PortfolioRebalancing({
  stats,
  targetStocksPct,
  targetBondsPct,
}: PortfolioRebalancingProps) {
  if (stats.totalValue === 0) return null;

  const { rebalanceStatus, stocksDeviation, totalValue } = stats;
  const isRebalancingNeeded = rebalanceStatus !== "OK";

  // Konfiguracja nagłówka zależna od statusu
  const statusConfig = {
    CRITICAL: {
      color: "#ef4444",
      icon: (
        <ExclamationCircleFilled style={{ color: "#ef4444", fontSize: 28 }} />
      ),
      title: "Krytyczny rebalancing",
      desc: "Twój portfel odchylił się od celu o ponad 10%. Zdecydowanie zalecamy podjęcie kroków wyrównujących proporcje.",
    },
    WARNING: {
      color: "#f59e0b",
      icon: (
        <ExclamationCircleFilled style={{ color: "#f59e0b", fontSize: 28 }} />
      ),
      title: "Wymagany rebalancing",
      desc: "Twój portfel odchylił się od celu o ponad 5%. Poniżej znajdziesz kroki, jak przywrócić odpowiednie proporcje.",
    },
    OK: {
      color: "#10b981",
      icon: <CheckCircleFilled style={{ color: "#10b981", fontSize: 28 }} />,
      title: "Alokacja w normie",
      desc: "Twój portfel jest zgodny z założonym celem inwestycyjnym (+- 5%). Odpoczywaj spokojnie!",
    },
  };

  const currentStatus = statusConfig[rebalanceStatus];

  // Wariant A: Przesunięcie (Kupno / Sprzedaż)
  const targetStocksValue = totalValue * (targetStocksPct / 100);
  const targetBondsValue = totalValue * (targetBondsPct / 100);

  const stocksAction = targetStocksValue - stats.stocksValue;
  const bondsAction = targetBondsValue - stats.bondsValue;

  // Wariant B: Tylko dopłata gotówki (żeby wyrównać do niedoważonego aktywa)
  const variantB = { amount: 0, assetToBuy: "", possible: true };

  if (stocksDeviation > 0) {
    if (targetStocksPct === 0) {
      variantB.possible = false;
    } else {
      const newTotal = stats.stocksValue / (targetStocksPct / 100);
      variantB.amount = newTotal - totalValue;
      variantB.assetToBuy = "Obligacji";
    }
  } else {
    if (targetBondsPct === 0) {
      variantB.possible = false;
    } else {
      const newTotal = stats.bondsValue / (targetBondsPct / 100);
      variantB.amount = newTotal - totalValue;
      variantB.assetToBuy = "Akcji";
    }
  }

  return (
    <div className="rounded-2xl border border-(--btn-border) p-6 bg-black/5 dark:bg-white/5">
      {/* Alert Header */}
      <div className="flex items-center gap-4">
        {currentStatus.icon}
        <div>
          <h4
            className="text-xl font-semibold"
            style={{ color: currentStatus.color }}
          >
            {currentStatus.title}
          </h4>
          <p className="text-sm text-(--muted) mt-1">{currentStatus.desc}</p>
        </div>
      </div>

      {/* Rekomendacje */}
      {isRebalancingNeeded && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {/* Wariant A */}
          <div className="rounded-xl border border-(--btn-border) p-5 bg-(--bg)">
            <p className="text-xs uppercase tracking-[0.14em] text-(--muted) mb-2">
              Wariant A: Sprzedaj i kup
            </p>
            <p className="text-sm text-(--text) mb-4">
              Zbilansuj portfel przesuwając obecny kapitał (uwaga na ew. koszty
              i podatki).
            </p>
            <ul className="text-sm font-medium space-y-2">
              {stocksAction < 0 && (
                <li className="text-red-500">
                  ↓ Sprzedaj Akcje za {formatAmount(Math.abs(stocksAction))} PLN
                </li>
              )}
              {stocksAction > 0 && (
                <li className="text-emerald-500">
                  ↑ Kup Akcje za {formatAmount(stocksAction)} PLN
                </li>
              )}
              {bondsAction < 0 && (
                <li className="text-red-500">
                  ↓ Sprzedaj Obligacje za {formatAmount(Math.abs(bondsAction))}{" "}
                  PLN
                </li>
              )}
              {bondsAction > 0 && (
                <li className="text-emerald-500">
                  ↑ Kup Obligacje za {formatAmount(bondsAction)} PLN
                </li>
              )}
            </ul>
          </div>

          {/* Wariant B */}
          <div className="rounded-xl border border-(--btn-border) p-5 bg-[linear-gradient(135deg,rgba(59,130,246,0.10),rgba(14,165,164,0.08))]">
            <p className="text-xs uppercase tracking-[0.14em] text-(--muted) mb-2">
              Wariant B: Sama dopłata
            </p>
            {variantB.possible ? (
              <>
                <p className="text-sm text-(--text) mb-4">
                  Wyrównaj proporcje dopłacając nowe środki bez konieczności
                  sprzedaży czegokolwiek.
                </p>
                <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  Wpłać <strong>{formatAmount(variantB.amount)} PLN</strong> i
                  za całą kwotę kup <strong>{variantB.assetToBuy}</strong>.
                </div>
              </>
            ) : (
              <p className="text-sm text-(--text)">
                Wariant niedostępny, ponieważ docelowa waga przerośniętego
                aktywa to 0%. Musisz je sprzedać.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
