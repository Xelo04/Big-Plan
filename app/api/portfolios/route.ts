import { NextResponse } from "next/server";
import { getSession } from "@/src/lib/auth/get-session";
import { getSupabaseAdmin } from "@/src/lib/db/supabase";

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

    const { data: simulations, error } = await supabase
      .from("saved_simulation")
      .select(
        `
        id, name, stocksPct, bondsPct, updatedAt,
        portfolio:portfolio (
          id, simulationId, createdAt, updatedAt,
          assets:portfolio_asset (*)
        )
      `,
      )
      .eq("userId", session.user.id)
      .order("updatedAt", { ascending: false });

    if (error) throw error;

    const items = (simulations ?? []).map((sim) => {
      // supabase może zwrócić portfolio jako obiekt lub tablicę przy join
      const raw = sim.portfolio as unknown;
      const portfolio = Array.isArray(raw) ? (raw[0] ?? null) : (raw ?? null);

      return {
        simulation: {
          id: sim.id,
          name: sim.name,
          stocksPct: sim.stocksPct,
          bondsPct: sim.bondsPct,
          updatedAt: sim.updatedAt,
        },
        portfolio,
      };
    });

    return NextResponse.json({ items }, { status: 200 });
  } catch (err) {
    console.error("GET portfolios error:", err);
    return NextResponse.json({ error: "Błąd serwera." }, { status: 500 });
  }
}
