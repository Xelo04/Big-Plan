import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@/src/generated/prisma/client";
import prisma from "@/src/lib/db/prisma";
import { getSession } from "@/src/lib/auth/get-session";

const MAX_NAME_LENGTH = 80;

const percentilePointSchema = z.object({
  label: z.string(),
  p5: z.number(),
  p25: z.number(),
  p50: z.number(),
  p75: z.number(),
  p95: z.number(),
});

const updateSimulationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nazwa symulacji jest wymagana.")
    .max(
      MAX_NAME_LENGTH,
      `Nazwa może mieć maksymalnie ${MAX_NAME_LENGTH} znaków.`,
    ),

  currentAge: z.number().int().min(0),
  expectedDeathAge: z.number().int().min(1),
  workEndAge: z.number().int().min(1),
  statePensionAge: z.number().int().min(1),
  estimatedPension: z.number().min(0),
  monthlyNeed: z.number().min(0),

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

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Brak aktywnej sesji. Zaloguj się ponownie." },
        { status: 401 },
      );
    }

    const { id } = await params;

    const simulation = await prisma.savedSimulation.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        userId: true,
        currentAge: true,
        expectedDeathAge: true,
        workEndAge: true,
        statePensionAge: true,
        estimatedPension: true,
        monthlyNeed: true,
        stocksPct: true,
        bondsPct: true,
        knowsMonthlyAmount: true,
        userMonthlyInvestment: true,
        recommendedMonthlyPayment: true,
        simulationSuccessRate: true,
        userSimulationSuccessRate: true,
        recommendedChartPercentiles: true,
        userChartPercentiles: true,
        totalSimulations: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!simulation) {
      return NextResponse.json(
        { error: "Symulacja nie została znaleziona." },
        { status: 404 },
      );
    }

    if (simulation.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Brak uprawnień do tej symulacji." },
        { status: 403 },
      );
    }

    const { userId: _userId, ...safeSimulation } = simulation;

    return NextResponse.json({ simulation: safeSimulation }, { status: 200 });
  } catch (err) {
    console.error("GET /api/simulations/[id] error:", err);
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
    const session = await getSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Brak aktywnej sesji. Zaloguj się ponownie." },
        { status: 401 },
      );
    }

    const { id } = await params;

    const existing = await prisma.savedSimulation.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Symulacja nie została znaleziona." },
        { status: 404 },
      );
    }

    if (existing.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Brak uprawnień do edycji tej symulacji." },
        { status: 403 },
      );
    }

    const body = await req.json();
    const parsed = updateSimulationSchema.safeParse(body);

    if (!parsed.success) {
      const firstError =
        parsed.error.issues[0]?.message ?? "Nieprawidłowe dane.";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const data = parsed.data;

    if (data.stocksPct + data.bondsPct !== 100) {
      return NextResponse.json(
        { error: "Suma akcji i obligacji musi wynosić 100%." },
        { status: 400 },
      );
    }

    const simulation = await prisma.savedSimulation.update({
      where: { id },
      data: {
        name: data.name,
        currentAge: data.currentAge,
        expectedDeathAge: data.expectedDeathAge,
        workEndAge: data.workEndAge,
        statePensionAge: data.statePensionAge,
        estimatedPension: data.estimatedPension,
        monthlyNeed: data.monthlyNeed,
        stocksPct: data.stocksPct,
        bondsPct: data.bondsPct,
        knowsMonthlyAmount: data.knowsMonthlyAmount,
        userMonthlyInvestment: data.userMonthlyInvestment ?? null,
        recommendedMonthlyPayment: data.recommendedMonthlyPayment,
        simulationSuccessRate: data.simulationSuccessRate,
        userSimulationSuccessRate: data.userSimulationSuccessRate ?? null,
        recommendedChartPercentiles:
          data.recommendedChartPercentiles as Prisma.InputJsonValue,
        userChartPercentiles:
          data.userChartPercentiles == null
            ? Prisma.DbNull
            : (data.userChartPercentiles as Prisma.InputJsonValue),
        totalSimulations: data.totalSimulations ?? 10000,
      },
    });

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
