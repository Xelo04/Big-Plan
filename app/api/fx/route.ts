import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch(
      "https://api.nbp.pl/api/exchangerates/tables/A/?format=json",
      { next: { revalidate: 3600 } }, // cache na 1 godzinę
    );

    if (!res.ok) {
      throw new Error("Błąd pobierania kursów NBP");
    }

    const data = await res.json();
    const ratesArray = data[0].rates;

    const targetCurrencies = ["USD", "EUR", "GBP", "CHF"];
    const fxMap: Record<string, number> = { PLN: 1 };

    ratesArray.forEach((rate: { code: string; mid: number }) => {
      if (targetCurrencies.includes(rate.code)) {
        fxMap[rate.code] = rate.mid;
      }
    });

    return NextResponse.json({ rates: fxMap }, { status: 200 });
  } catch (err) {
    console.error("FX API Error:", err);
    // W razie awarii NBP zwracamy pusty obiekt, aplikacja użyje fallbacku 1:1
    return NextResponse.json({ rates: { PLN: 1 } }, { status: 200 });
  }
}
