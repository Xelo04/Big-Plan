import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/src/lib/auth/get-session";
import { getSupabaseAdmin, newId } from "@/src/lib/db/supabase";

const MAX_SIMULATIONS_PER_USER = 1;
const MAX_NAME_LENGTH = 80;

const percentilePointSchema = z.object({
  label: z.string(),
  p5: z.number(),
  p25: z.number(),
  p50: z.number(),
  p75: z.number(),
  p95: z.number(),
});

const createSimulationSchema = z.object({
  name: z.string().trim().min(1).max(MAX_NAME_LENGTH),
  currentAge: z.number().int().min(0),
  expectedDeathAge: z.number().int().min(1),
  workEndAge: z.number().int().min(1),
  statePensionAge: z.number().int().min(1),
  estimatedPension: z.number().min(0),
  monthlyNeed: z.number().min(0),
  currentPortfolioValue: z.number().min(0).optional().default(0),
  stocksPct: z.number().int().min(0).max(100),
  bondsPct: z.number().int().min(0).max(100),
  knowsMonthlyAmount: z.boolean(),
  userMonthlyInvestment: z.number().min(0).optional().nullable(),
  recommendedMonthlyPayment: z.number().min(0),
  simulationSuccessRate: z.number().min(0).max(1),
  userSimulationSuccessRate: z.number().min(0).max(1).optional().nullable(),
  recommendedChartPercentiles: z.array(percentilePointSchema).min(1),
  userChartPercentiles: z.array(percentilePointSchema).optional().nullable(),
  totalSimulations: z.number().int().min(1).optional(),
});

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Brak aktywnej sesji." },
        { status: 401 },
      );
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("saved_simulation")
      .select(
        `id, name, currentAge, expectedDeathAge, workEndAge, statePensionAge,
         estimatedPension, monthlyNeed, currentPortfolioValue, stocksPct, bondsPct, knowsMonthlyAmount,
         userMonthlyInvestment, recommendedMonthlyPayment, simulationSuccessRate,
         userSimulationSuccessRate, recommendedChartPercentiles, userChartPercentiles,
         totalSimulations, createdAt, updatedAt`,
      )
      .eq("userId", session.user.id)
      .order("createdAt", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ simulations: data ?? [] }, { status: 200 });
  } catch (err) {
    console.error("GET /api/simulations error:", err);
    return NextResponse.json(
      { error: "Wystąpił błąd serwera." },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Brak aktywnej sesji." },
        { status: 401 },
      );
    }

    const supabase = getSupabaseAdmin();
    const userId = session.user.id;

    const { count, error: countError } = await supabase
      .from("saved_simulation")
      .select("*", { count: "exact", head: true })
      .eq("userId", userId);

    if (countError) throw countError;
    if ((count ?? 0) >= MAX_SIMULATIONS_PER_USER) {
      return NextResponse.json(
        {
          error: `Osiągnięto limit ${MAX_SIMULATIONS_PER_USER} zapisanych symulacji. Usuń starą symulację, aby zapisać nową.`,
        },
        { status: 403 },
      );
    }

    const body = await req.json();
    const parsed = createSimulationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Nieprawidłowe dane." },
        { status: 400 },
      );
    }

    const data = parsed.data;
    if (data.stocksPct + data.bondsPct !== 100) {
      return NextResponse.json(
        { error: "Suma akcji i obligacji musi wynosić 100%." },
        { status: 400 },
      );
    }

    const id = newId();
    const now = new Date().toISOString();

    const { data: simulation, error } = await supabase
      .from("saved_simulation")
      .insert({
        id,
        userId,
        name: data.name,
        currentAge: data.currentAge,
        expectedDeathAge: data.expectedDeathAge,
        workEndAge: data.workEndAge,
        statePensionAge: data.statePensionAge,
        estimatedPension: data.estimatedPension,
        monthlyNeed: data.monthlyNeed,
        currentPortfolioValue: data.currentPortfolioValue ?? 0,
        stocksPct: data.stocksPct,
        bondsPct: data.bondsPct,
        knowsMonthlyAmount: data.knowsMonthlyAmount,
        userMonthlyInvestment: data.userMonthlyInvestment ?? null,
        recommendedMonthlyPayment: data.recommendedMonthlyPayment,
        simulationSuccessRate: data.simulationSuccessRate,
        userSimulationSuccessRate: data.userSimulationSuccessRate ?? null,
        recommendedChartPercentiles: data.recommendedChartPercentiles,
        userChartPercentiles: data.userChartPercentiles ?? null,
        totalSimulations: data.totalSimulations ?? 10000,
        createdAt: now,
        updatedAt: now,
      })
      .select("id, name")
      .single();

    if (error) throw error;

    return NextResponse.json(
      { ok: true, simulation: { id: simulation.id, name: simulation.name } },
      { status: 201 },
    );
  } catch (err) {
    console.error("POST /api/simulations error:", err);
    return NextResponse.json(
      { error: "Wystąpił błąd serwera." },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Brak aktywnej sesji." },
        { status: 401 },
      );
    }

    const simulationId = new URL(req.url).searchParams.get("id");
    if (!simulationId) {
      return NextResponse.json(
        { error: "Brak identyfikatora symulacji." },
        { status: 400 },
      );
    }

    const supabase = getSupabaseAdmin();
    const { data: existing, error: findError } = await supabase
      .from("saved_simulation")
      .select("userId")
      .eq("id", simulationId)
      .maybeSingle();

    if (findError) throw findError;
    if (!existing) {
      return NextResponse.json(
        { error: "Symulacja nie została znaleziona." },
        { status: 404 },
      );
    }
    if (existing.userId !== session.user.id) {
      return NextResponse.json({ error: "Brak uprawnień." }, { status: 403 });
    }

    const { error } = await supabase
      .from("saved_simulation")
      .delete()
      .eq("id", simulationId);

    if (error) throw error;
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("DELETE /api/simulations error:", err);
    return NextResponse.json(
      { error: "Wystąpił błąd serwera." },
      { status: 500 },
    );
  }
}
