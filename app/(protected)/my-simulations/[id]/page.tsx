import SimulationDetails from "@/src/components/simulations/SimulationDetails";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function SimulationDetailsPage({ params }: PageProps) {
  const { id } = await params;
  return <SimulationDetails simulationId={id} />;
}
