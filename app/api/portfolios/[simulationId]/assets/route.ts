import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/src/lib/db/prisma";
import { getSession } from "@/src/lib/auth/get-session";

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

    const simulation = await prisma.savedSimulation.findUnique({
      where: { id: simulationId },
      select: { userId: true },
    });

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

    const portfolio = await prisma.portfolio.upsert({
      where: { simulationId },
      create: { simulationId },
      update: {},
    });

    const asset = await prisma.portfolioAsset.create({
      data: {
        portfolioId: portfolio.id,
        ...parsed.data,
      },
    });

    return NextResponse.json({ ok: true, asset }, { status: 201 });
  } catch (err) {
    console.error("POST asset error:", err);
    return NextResponse.json({ error: "Błąd serwera." }, { status: 500 });
  }
}
