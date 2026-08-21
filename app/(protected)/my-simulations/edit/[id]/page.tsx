import SimulationEditor from "@/src/components/simulations/SimulationEditor";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditSimulationPage({ params }: PageProps) {
  const { id } = await params;
  return <SimulationEditor simulationId={id} />;
}
