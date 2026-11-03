import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/src/lib/auth/get-session";
import { getSupabaseAdmin } from "@/src/lib/db/supabase";
import { exceedsBodyLimit, hasValidOrigin } from "@/src/lib/utils/request";

const MAX_NAME_LENGTH = 80;

const percentilePointSchema = z.object({
  label: z.string().trim().min(1).max(80),
  p5: z.number(),
  p25: z.number(),
  p50: z.number(),
  p75: z.number(),
  p95: z.number(),
});

const updateSimulationSchema = z.object({
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
  recommendedChartPercentiles: z.array(percentilePointSchema).min(1).max(1000),
  userChartPercentiles: z.array(percentilePointSchema).max(1000).optional().nullable(),
  totalSimulations: z.number().int().min(1).max(1_000_000).optional(),
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Brak aktywnej sesji." },
        { status: 401 },
      );
    }

    const { id } = await params;
    const supabase = getSupabaseAdmin();

    const { data: simulation, error } = await supabase
      .from("saved_simulation")
      .select(
        `id, name, userId, currentAge, expectedDeathAge, workEndAge, statePensionAge,
         estimatedPension, monthlyNeed, currentPortfolioValue, stocksPct, bondsPct, knowsMonthlyAmount,
         userMonthlyInvestment, recommendedMonthlyPayment, simulationSuccessRate,
         userSimulationSuccessRate, recommendedChartPercentiles, userChartPercentiles,
         totalSimulations, createdAt, updatedAt`,
      )
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    if (!simulation) {
      return NextResponse.json(
        { error: "Symulacja nie została znaleziona." },
        { status: 404 },
      );
    }
    if (simulation.userId !== session.user.id) {
      return NextResponse.json({ error: "Brak uprawnień." }, { status: 403 });
    }

    const safeSimulation = { ...simulation };
    delete (safeSimulation as { userId?: string }).userId;

    return NextResponse.json({ simulation: safeSimulation }, { status: 200 });
  } catch (err) {
    console.error("GET simulation error:", err);
    return NextResponse.json(
      { error: "Wystąpił błąd serwera." },
      { status: 500 },
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
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
      return NextResponse.json(
        { error: "Brak aktywnej sesji." },
        { status: 401 },
      );
    }

    const { id } = await params;
    const supabase = getSupabaseAdmin();

    const { data: existing, error: findError } = await supabase
      .from("saved_simulation")
      .select("userId")
      .eq("id", id)
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

    const body = await req.json();
    const parsed = updateSimulationSchema.safeParse(body);
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

    const { data: simulation, error } = await supabase
      .from("saved_simulation")
      .update({
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
        updatedAt: new Date().toISOString(),
      })
      .eq("id", id)
      .select("id, name")
      .single();

    if (error) throw error;

    return NextResponse.json(
      {
        ok: true,
        simulation: {
          id: simulation.id,
          name: simulation.name,
        },
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("PUT /api/simulations/[id] error:", err);
    return NextResponse.json(
      { error: "Wystąpił błąd serwera." },
      { status: 500 },
    );
  }
}
