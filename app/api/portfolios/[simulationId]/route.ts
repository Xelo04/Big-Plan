import { NextResponse } from "next/server";
import prisma from "@/src/lib/db/prisma";
import { getSession } from "@/src/lib/auth/get-session";

export async function GET(
  _req: Request,
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
      select: { userId: true, name: true, stocksPct: true, bondsPct: true },
    });

    if (!simulation) {
      return NextResponse.json({ error: "Nie znaleziono." }, { status: 404 });
    }

    if (simulation.userId !== session.user.id) {
      return NextResponse.json({ error: "Brak uprawnień." }, { status: 403 });
    }

    const portfolio = await prisma.portfolio.findUnique({
      where: { simulationId },
      include: {
        assets: { orderBy: { createdAt: "asc" } },
      },
    });

    return NextResponse.json({ portfolio, simulation }, { status: 200 });
  } catch (err) {
    console.error("GET portfolio error:", err);
    return NextResponse.json({ error: "Błąd serwera." }, { status: 500 });
  }
}
