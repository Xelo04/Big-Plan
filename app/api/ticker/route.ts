import { NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2";

type YahooQuoteResponse = {
  regularMarketPrice?: number;
  currency?: string;
  shortName?: string;
  longName?: string;
  symbol?: string;
};

const yahooFinance = new YahooFinance();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const ticker = searchParams.get("symbol");

    if (!ticker) {
      return NextResponse.json({ error: "Brak tickera" }, { status: 400 });
    }

    const quote = (await yahooFinance.quote(ticker)) as YahooQuoteResponse;

    if (!quote || typeof quote.regularMarketPrice !== "number") {
      return NextResponse.json(
        { error: "Nie znaleziono instrumentu lub ceny." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      price: quote.regularMarketPrice,
      currency: quote.currency || "USD",
      name: quote.shortName || quote.longName || ticker,
    });
  } catch (error) {
    console.error("Ticker fetch error:", error);
    return NextResponse.json(
      { error: "Błąd podczas pobierania danych z giełdy." },
      { status: 500 },
    );
  }
}
