import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/src/lib/db/prisma";
import { getSession } from "@/src/lib/auth/get-session";

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
  const asset = await prisma.portfolioAsset.findUnique({
    where: { id: assetId },
    include: {
      portfolio: {
        include: { simulation: { select: { userId: true, id: true } } },
      },
    },
  });

  if (
    !asset ||
    asset.portfolio.simulation.id !== simulationId ||
    asset.portfolio.simulation.userId !== userId
  ) {
    return false;
  }
  return true;
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ simulationId: string; assetId: string }> },
) {
  try {
    const session = await getSession();
    if (!session?.user?.id)
      return NextResponse.json({ error: "Brak sesji." }, { status: 401 });

    const { simulationId, assetId } = await params;
    if (!(await verifyOwnership(simulationId, assetId, session.user.id))) {
      return NextResponse.json({ error: "Brak dostępu." }, { status: 403 });
    }

    const body = await req.json();
    const parsed = updateAssetSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json({ error: "Złe dane." }, { status: 400 });

    const asset = await prisma.portfolioAsset.update({
      where: { id: assetId },
      data: parsed.data,
    });

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
    if (!session?.user?.id)
      return NextResponse.json({ error: "Brak sesji." }, { status: 401 });

    const { simulationId, assetId } = await params;
    if (!(await verifyOwnership(simulationId, assetId, session.user.id))) {
      return NextResponse.json({ error: "Brak dostępu." }, { status: 403 });
    }

    await prisma.portfolioAsset.delete({ where: { id: assetId } });
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Błąd serwera." }, { status: 500 });
  }
}
