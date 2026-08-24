import { NextResponse } from "next/server";
import prisma from "@/src/lib/db/prisma";
import { getSession } from "@/src/lib/auth/get-session";
import YahooFinance from "yahoo-finance2";

type YahooQuote = {
  symbol?: string;
  regularMarketPrice?: number;
};

const yahooFinance = new YahooFinance();

export async function POST(
  req: Request,
  { params }: { params: Promise<{ simulationId: string }> },
) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Brak sesji" }, { status: 401 });
    }

    const { simulationId } = await params;

    // Pobierz portfel z aktywami
    const portfolio = await prisma.portfolio.findUnique({
      where: { simulationId },
      include: { assets: true },
    });

    if (!portfolio || portfolio.assets.length === 0) {
      return NextResponse.json(
        { ok: true, message: "Pusty portfel" },
        { status: 200 },
      );
    }

    // Filtrujemy tylko aktywa, które mają ticker
    const assetsWithTickers = portfolio.assets.filter((a) => a.ticker);

    if (assetsWithTickers.length === 0) {
      return NextResponse.json(
        { ok: true, message: "Brak aktywów z tickerem" },
        { status: 200 },
      );
    }

    // Pobieramy notowania masowo z Yahoo
    const symbols = assetsWithTickers.map((a) => a.ticker as string);

    const rawQuotes = await yahooFinance.quote(symbols);
    const quotesList = (
      Array.isArray(rawQuotes) ? rawQuotes : [rawQuotes]
    ) as YahooQuote[];

    // Aktualizujemy bazę danych
    const updatePromises = assetsWithTickers.map((asset) => {
      const quote = quotesList.find(
        (q) => q.symbol?.toUpperCase() === asset.ticker?.toUpperCase(),
      );

      if (quote && typeof quote.regularMarketPrice === "number") {
        if (quote.regularMarketPrice !== asset.currentPrice) {
          return prisma.portfolioAsset.update({
            where: { id: asset.id },
            data: { currentPrice: quote.regularMarketPrice },
          });
        }
      }
      return Promise.resolve();
    });

    await Promise.all(updatePromises);

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("Portfolio sync error:", error);
    return NextResponse.json(
      { error: "Błąd podczas synchronizacji" },
      { status: 500 },
    );
  }
}
