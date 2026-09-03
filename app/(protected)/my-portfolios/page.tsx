import PortfoliosList from "@/src/components/portfolio/PortfoliosList";
import { getSupabaseAdmin } from "@/src/lib/db/supabase";
import { getSession } from "@/src/lib/auth/get-session";
import { redirect } from "next/navigation";
import type {
  PortfolioDTO,
  PortfolioListItemDTO,
} from "@/src/lib/portfolio/portfolio-types";

export const dynamic = "force-dynamic";

type RawSimulation = {
  id: string;
  name: string;
  stocksPct: number;
  bondsPct: number;
  updatedAt: string;
  portfolio: PortfolioDTO | PortfolioDTO[] | null;
};

export default async function MyPortfoliosPage() {
  const session = await getSession();
  if (!session?.user?.id) redirect("/sign-in");

  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("saved_simulation")
    .select(
      `id, name, stocksPct, bondsPct, updatedAt,
       portfolio:portfolio (
         id, simulationId, createdAt, updatedAt,
         assets:portfolio_asset (*)
       )`,
    )
    .eq("userId", session.user.id)
    .order("updatedAt", { ascending: false });

  const simulations = (data ?? []) as RawSimulation[];

  const items: PortfolioListItemDTO[] = simulations.map((sim) => {
    const raw = sim.portfolio;
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

  return <PortfoliosList initialItems={items} />;
}
