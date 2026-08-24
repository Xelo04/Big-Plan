import PortfolioDetails from "@/src/components/portfolio/PortfolioDetails";

type PageProps = {
  params: Promise<{ simulationId: string }>;
};

export default async function PortfolioDetailsPage({ params }: PageProps) {
  const { simulationId } = await params;
  return <PortfolioDetails simulationId={simulationId} />;
}
