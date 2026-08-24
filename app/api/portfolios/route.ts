import { NextResponse } from "next/server";
import prisma from "@/src/lib/db/prisma";
import { getSession } from "@/src/lib/auth/get-session";

export async function GET() {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Brak aktywnej sesji." },
        { status: 401 },
      );
    }

    // Pobierz wszystkie symulacje usera wraz z ich ewentualnymi portfelami
    const simulations = await prisma.savedSimulation.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        name: true,
        stocksPct: true,
        bondsPct: true,
        updatedAt: true,
        portfolio: {
          include: {
            assets: true,
          },
        },
      },
    });

    const items = simulations.map((sim) => ({
      simulation: {
        id: sim.id,
        name: sim.name,
        stocksPct: sim.stocksPct,
        bondsPct: sim.bondsPct,
        updatedAt: sim.updatedAt,
      },
      portfolio: sim.portfolio,
    }));

    return NextResponse.json({ items }, { status: 200 });
  } catch (err) {
    console.error("GET portfolios error:", err);
    return NextResponse.json({ error: "Błąd serwera." }, { status: 500 });
  }
}
