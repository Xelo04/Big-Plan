import { NextResponse } from "next/server";
import { getSession } from "@/src/lib/auth/get-session";
import { getSupabaseAdmin } from "@/src/lib/db/supabase";

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
    const supabase = getSupabaseAdmin();

    const { data: simulation, error: simError } = await supabase
      .from("saved_simulation")
      .select("userId, name, stocksPct, bondsPct")
      .eq("id", simulationId)
      .maybeSingle();

    if (simError) throw simError;
    if (!simulation) {
      return NextResponse.json({ error: "Nie znaleziono." }, { status: 404 });
    }
    if (simulation.userId !== session.user.id) {
      return NextResponse.json({ error: "Brak uprawnień." }, { status: 403 });
    }

    const { data: portfolio, error: portError } = await supabase
      .from("portfolio")
      .select("*, assets:portfolio_asset(*)")
      .eq("simulationId", simulationId)
      .maybeSingle();

    if (portError) throw portError;

    // posortuj assets po createdAt
    if (portfolio?.assets && Array.isArray(portfolio.assets)) {
      portfolio.assets.sort(
        (a: { createdAt: string }, b: { createdAt: string }) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
    }

    return NextResponse.json(
      {
        portfolio,
        simulation: {
          name: simulation.name,
          stocksPct: simulation.stocksPct,
          bondsPct: simulation.bondsPct,
        },
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("GET portfolio error:", err);
    return NextResponse.json({ error: "Błąd serwera." }, { status: 500 });
  }
}
