import PortfolioDetails from "@/src/components/portfolio/PortfolioDetails";
import { getSupabaseAdmin } from "@/src/lib/db/supabase";
import { getSession } from "@/src/lib/auth/get-session";
import { redirect } from "next/navigation";
import type {
  PortfolioAssetDTO,
  PortfolioDTO,
} from "@/src/lib/portfolio/portfolio-types";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ simulationId: string }>;
};

type SimulationInfo = {
  name: string;
  stocksPct: number;
  bondsPct: number;
};

export default async function PortfolioDetailsPage({ params }: PageProps) {
  const session = await getSession();
  if (!session?.user?.id) redirect("/sign-in");
  const { simulationId } = await params;

  const supabase = getSupabaseAdmin();

  const { data: simulationRow } = await supabase
    .from("saved_simulation")
    .select("userId, name, stocksPct, bondsPct")
    .eq("id", simulationId)
    .maybeSingle();

  if (!simulationRow || simulationRow.userId !== session.user.id) {
    return (
      <PortfolioDetails
        simulationId={simulationId}
        initialPortfolio={null}
        simulationInfo={null}
      />
    );
  }

  const simulationInfo: SimulationInfo = {
    name: simulationRow.name,
    stocksPct: simulationRow.stocksPct,
    bondsPct: simulationRow.bondsPct,
  };

  const { data: portfolioRow } = await supabase
    .from("portfolio")
    .select("*, assets:portfolio_asset(*)")
    .eq("simulationId", simulationId)
    .maybeSingle();

  let portfolio: PortfolioDTO | null = null;
  if (portfolioRow) {
    const assets = (portfolioRow.assets ?? []) as PortfolioAssetDTO[];
    assets.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
    portfolio = { ...(portfolioRow as PortfolioDTO), assets };
  }

  return (
    <PortfolioDetails
      simulationId={simulationId}
      initialPortfolio={portfolio}
      simulationInfo={simulationInfo}
    />
  );
}
