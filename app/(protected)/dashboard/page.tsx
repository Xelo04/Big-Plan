import { getSupabaseAdmin } from "@/src/lib/db/supabase";
import { getSession } from "@/src/lib/auth/get-session";
import { redirect } from "next/navigation";
import DashboardView from "@/src/components/dashboard/DashboardView";
import DashboardEmpty from "@/src/components/dashboard/DashboardEmpty";
import type { DashboardSimulation } from "@/src/lib/dashboard/dashboard-types";
import type {
  PortfolioAssetDTO,
  PortfolioDTO,
} from "@/src/lib/portfolio/portfolio-types";

export const dynamic = "force-dynamic";

type RawSimulation = {
  id: string;
  name: string;
  stocksPct: number;
  bondsPct: number;
  simulationSuccessRate: number;
  recommendedMonthlyPayment: number;
  portfolio: PortfolioDTO | PortfolioDTO[] | null;
};

export default async function DashboardPage() {
  const session = await getSession();
  if (!session?.user?.id) redirect("/sign-in");

  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("saved_simulation")
    .select(
      `id, name, stocksPct, bondsPct, simulationSuccessRate, recommendedMonthlyPayment,
       portfolio:portfolio (
         id, simulationId, createdAt, updatedAt,
         assets:portfolio_asset (*)
       )`,
    )
    .eq("userId", session.user.id)
    .order("updatedAt", { ascending: false });

  const rawSimulations = (data ?? []) as RawSimulation[];

  const simulations: DashboardSimulation[] = rawSimulations.map((sim) => {
    const raw = sim.portfolio;
    const portfolio = Array.isArray(raw) ? (raw[0] ?? null) : (raw ?? null);
    const assets = (portfolio?.assets ?? []) as PortfolioAssetDTO[];

    return {
      id: sim.id,
      name: sim.name,
      stocksPct: sim.stocksPct,
      bondsPct: sim.bondsPct,
      simulationSuccessRate: sim.simulationSuccessRate,
      recommendedMonthlyPayment: sim.recommendedMonthlyPayment,
      assets,
    };
  });

  const userName = session.user.name || session.user.email;

  if (simulations.length === 0) {
    return <DashboardEmpty userName={userName} />;
  }

  return <DashboardView simulations={simulations} userName={userName} />;
}
