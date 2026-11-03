import { NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2";
import { getSession } from "@/src/lib/auth/get-session";
import { getSupabaseAdmin } from "@/src/lib/db/supabase";
import { hasValidOrigin } from "@/src/lib/utils/request";

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
    if (!hasValidOrigin(req)) {
      return NextResponse.json({ error: "Niedozwolone źródło żądania." }, { status: 403 });
    }

    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Brak sesji" }, { status: 401 });
    }

    const { simulationId } = await params;
    const supabase = getSupabaseAdmin();

    // auth check
    const { data: simulation } = await supabase
      .from("saved_simulation")
      .select("userId")
      .eq("id", simulationId)
      .maybeSingle();

    if (!simulation || simulation.userId !== session.user.id) {
      return NextResponse.json({ error: "Brak dostępu" }, { status: 403 });
    }

    const { data: portfolio } = await supabase
      .from("portfolio")
      .select("id, assets:portfolio_asset(id, ticker, currentPrice)")
      .eq("simulationId", simulationId)
      .maybeSingle();

    if (!portfolio?.assets?.length) {
      return NextResponse.json(
        { ok: true, message: "Pusty portfel" },
        { status: 200 },
      );
    }

    const assetsWithTickers = portfolio.assets.filter(
      (a: { ticker: string | null }) => a.ticker,
    );

    if (assetsWithTickers.length === 0) {
      return NextResponse.json(
        { ok: true, message: "Brak aktywów z tickerem" },
        { status: 200 },
      );
    }

    const symbols = assetsWithTickers.map((a: { ticker: string }) => a.ticker);
    const rawQuotes = await yahooFinance.quote(symbols);
    const quotesList = (
      Array.isArray(rawQuotes) ? rawQuotes : [rawQuotes]
    ) as YahooQuote[];

    await Promise.all(
      assetsWithTickers.map(
        async (asset: { id: string; ticker: string; currentPrice: number }) => {
          const quote = quotesList.find(
            (q) => q.symbol?.toUpperCase() === asset.ticker?.toUpperCase(),
          );
          if (
            quote &&
            typeof quote.regularMarketPrice === "number" &&
            quote.regularMarketPrice !== asset.currentPrice
          ) {
            await supabase
              .from("portfolio_asset")
              .update({
                currentPrice: quote.regularMarketPrice,
                updatedAt: new Date().toISOString(),
              })
              .eq("id", asset.id);
          }
        },
      ),
    );

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("Portfolio sync error:", error);
    return NextResponse.json(
      { error: "Błąd podczas synchronizacji" },
      { status: 500 },
    );
  }
}
