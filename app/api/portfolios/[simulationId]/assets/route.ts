import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/src/lib/auth/get-session";
import { getSupabaseAdmin, newId } from "@/src/lib/db/supabase";
import { exceedsBodyLimit, hasValidOrigin } from "@/src/lib/utils/request";

const createAssetSchema = z.object({
  name: z.string().trim().min(1).max(120),
  ticker: z.string().trim().max(20).optional().nullable(),
  category: z.enum(["STOCKS", "BONDS"]),
  quantity: z.number().positive(),
  averagePrice: z.number().nonnegative(),
  currentPrice: z.number().nonnegative(),
  currency: z.string().trim().min(1).max(10),
  customFxRate: z.number().positive().optional().nullable(),
  merge: z.boolean().optional(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ simulationId: string }> },
) {
  try {
    if (!hasValidOrigin(req)) {
      return NextResponse.json({ error: "Niedozwolone źródło żądania." }, { status: 403 });
    }

    if (exceedsBodyLimit(req)) {
      return NextResponse.json(
        { error: "Żądanie jest zbyt duże." },
        { status: 413 },
      );
    }

    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Brak sesji." }, { status: 401 });
    }

    const { simulationId } = await params;
    const supabase = getSupabaseAdmin();

    const { data: simulation, error: simError } = await supabase
      .from("saved_simulation")
      .select("userId")
      .eq("id", simulationId)
      .maybeSingle();

    if (simError) throw simError;
    if (!simulation || simulation.userId !== session.user.id) {
      return NextResponse.json({ error: "Brak dostępu." }, { status: 403 });
    }

    const body = await req.json();
    const parsed = createAssetSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Nieprawidłowe dane." },
        { status: 400 },
      );
    }

    const data = parsed.data;

    // Upsert portfolio
    let portfolioId: string;
    const { data: existingPortfolio } = await supabase
      .from("portfolio")
      .select("id")
      .eq("simulationId", simulationId)
      .maybeSingle();

    if (existingPortfolio?.id) {
      portfolioId = existingPortfolio.id;
    } else {
      const pid = newId();
      const now = new Date().toISOString();
      const { data: created, error: createPortError } = await supabase
        .from("portfolio")
        .insert({
          id: pid,
          simulationId,
          createdAt: now,
          updatedAt: now,
        })
        .select("id")
        .single();

      if (createPortError) throw createPortError;
      portfolioId = created.id;
    }

    // 1. SZUKANIE DUPLIKATU w Supabase (po Tickerze ALBO po Nazwie)
    const normalizedTicker = data.ticker?.trim().toUpperCase() ?? null;
    const normalizedName = data.name.trim().toLowerCase();

    const { data: existingAssets, error: fetchAssetsError } = await supabase
      .from("portfolio_asset")
      .select("id, name, ticker, quantity, averagePrice, customFxRate")
      .eq("portfolioId", portfolioId)
      .eq("currency", data.currency);

    if (fetchAssetsError) throw fetchAssetsError;

    const duplicateAsset = (existingAssets ?? []).find((a) => {
      const tickerMatch =
        normalizedTicker &&
        a.ticker &&
        a.ticker.trim().toUpperCase() === normalizedTicker;
      const nameMatch =
        a.name && a.name.trim().toLowerCase() === normalizedName;
      return tickerMatch || nameMatch;
    });

    if (duplicateAsset) {
      // 2. Jeśli znaleziono duplikat, ale klient NIE wysłał "merge: true" -> zwracamy kod 409 Conflict
      if (!data.merge) {
        return NextResponse.json(
          {
            error: "duplicate_found",
            existingAsset: {
              id: duplicateAsset.id,
              name: duplicateAsset.name,
            },
          },
          { status: 409 },
        );
      }

      // 3. Jeśli klient potłumaczył w Modalu "Tak, scal" i przysłał "merge: true" -> robimy UPDATE
      const oldTotalCost =
        duplicateAsset.quantity * duplicateAsset.averagePrice;
      const newTotalCost = data.quantity * data.averagePrice;
      const totalQuantity = duplicateAsset.quantity + data.quantity;
      const newAveragePrice =
        totalQuantity > 0
          ? (oldTotalCost + newTotalCost) / totalQuantity
          : data.averagePrice;

      const now = new Date().toISOString();

      const { data: mergedAsset, error: updateError } = await supabase
        .from("portfolio_asset")
        .update({
          quantity: totalQuantity,
          averagePrice: newAveragePrice,
          currentPrice: data.currentPrice,
          customFxRate:
            data.customFxRate ?? duplicateAsset.customFxRate ?? null,
          updatedAt: now,
        })
        .eq("id", duplicateAsset.id)
        .select("*")
        .single();

      if (updateError) throw updateError;

      return NextResponse.json(
        { ok: true, asset: mergedAsset, merged: true },
        { status: 200 },
      );
    }

    // 4. Jeśli brak duplikatu -> zwykły INSERT
    const now = new Date().toISOString();
    const { data: asset, error: assetError } = await supabase
      .from("portfolio_asset")
      .insert({
        id: newId(),
        portfolioId,
        name: data.name,
        ticker: normalizedTicker,
        category: data.category,
        quantity: data.quantity,
        averagePrice: data.averagePrice,
        currentPrice: data.currentPrice,
        currency: data.currency,
        customFxRate: data.customFxRate ?? null,
        createdAt: now,
        updatedAt: now,
      })
      .select("*")
      .single();

    if (assetError) throw assetError;

    return NextResponse.json(
      { ok: true, asset, merged: false },
      { status: 201 },
    );
  } catch (err) {
    console.error("POST asset error:", err);
    return NextResponse.json({ error: "Błąd serwera." }, { status: 500 });
  }
}
