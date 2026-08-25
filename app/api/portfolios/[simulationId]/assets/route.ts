import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/src/lib/auth/get-session";
import { getSupabaseAdmin, newId } from "@/src/lib/db/supabase";

const createAssetSchema = z.object({
  name: z.string().trim().min(1).max(120),
  ticker: z.string().trim().max(20).optional().nullable(),
  category: z.enum(["STOCKS", "BONDS"]),
  quantity: z.number().positive(),
  averagePrice: z.number().nonnegative(),
  currentPrice: z.number().nonnegative(),
  currency: z.string().trim().min(1).max(10),
  customFxRate: z.number().positive().optional().nullable(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ simulationId: string }> },
) {
  try {
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

    // upsert portfolio
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

    const now = new Date().toISOString();
    const { data: asset, error: assetError } = await supabase
      .from("portfolio_asset")
      .insert({
        id: newId(),
        portfolioId,
        name: parsed.data.name,
        ticker: parsed.data.ticker ?? null,
        category: parsed.data.category,
        quantity: parsed.data.quantity,
        averagePrice: parsed.data.averagePrice,
        currentPrice: parsed.data.currentPrice,
        currency: parsed.data.currency,
        customFxRate: parsed.data.customFxRate ?? null,
        createdAt: now,
        updatedAt: now,
      })
      .select("*")
      .single();

    if (assetError) throw assetError;

    return NextResponse.json({ ok: true, asset }, { status: 201 });
  } catch (err) {
    console.error("POST asset error:", err);
    return NextResponse.json({ error: "Błąd serwera." }, { status: 500 });
  }
}
