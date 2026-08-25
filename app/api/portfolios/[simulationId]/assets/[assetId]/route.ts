import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/src/lib/auth/get-session";
import { getSupabaseAdmin } from "@/src/lib/db/supabase";

const updateAssetSchema = z.object({
  name: z.string().trim().min(1).max(120),
  ticker: z.string().trim().max(20).optional().nullable(),
  category: z.enum(["STOCKS", "BONDS"]),
  quantity: z.number().positive(),
  averagePrice: z.number().nonnegative(),
  currentPrice: z.number().nonnegative(),
  currency: z.string().trim().min(1).max(10),
  customFxRate: z.number().positive().optional().nullable(),
});

async function verifyOwnership(
  simulationId: string,
  assetId: string,
  userId: string,
) {
  const supabase = getSupabaseAdmin();
  const { data: asset, error } = await supabase
    .from("portfolio_asset")
    .select(
      `
      id,
      portfolio:portfolio!inner (
        id,
        simulationId,
        simulation:saved_simulation!inner (
          id,
          userId
        )
      )
    `,
    )
    .eq("id", assetId)
    .maybeSingle();

  if (error || !asset) return false;

  const portfolio = Array.isArray(asset.portfolio)
    ? asset.portfolio[0]
    : asset.portfolio;
  if (!portfolio) return false;

  const simulation = Array.isArray(portfolio.simulation)
    ? portfolio.simulation[0]
    : portfolio.simulation;

  return (
    portfolio.simulationId === simulationId && simulation?.userId === userId
  );
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ simulationId: string; assetId: string }> },
) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Brak sesji." }, { status: 401 });
    }

    const { simulationId, assetId } = await params;
    if (!(await verifyOwnership(simulationId, assetId, session.user.id))) {
      return NextResponse.json({ error: "Brak dostępu." }, { status: 403 });
    }

    const body = await req.json();
    const parsed = updateAssetSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Złe dane." }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data: asset, error } = await supabase
      .from("portfolio_asset")
      .update({
        ...parsed.data,
        ticker: parsed.data.ticker ?? null,
        customFxRate: parsed.data.customFxRate ?? null,
        updatedAt: new Date().toISOString(),
      })
      .eq("id", assetId)
      .select("*")
      .single();

    if (error) throw error;
    return NextResponse.json({ ok: true, asset }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Błąd serwera." }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ simulationId: string; assetId: string }> },
) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Brak sesji." }, { status: 401 });
    }

    const { simulationId, assetId } = await params;
    if (!(await verifyOwnership(simulationId, assetId, session.user.id))) {
      return NextResponse.json({ error: "Brak dostępu." }, { status: 403 });
    }

    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from("portfolio_asset")
      .delete()
      .eq("id", assetId);

    if (error) throw error;
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Błąd serwera." }, { status: 500 });
  }
}
