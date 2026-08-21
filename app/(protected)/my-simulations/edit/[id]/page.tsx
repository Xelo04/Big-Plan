import SimulationEditor from "@/src/components/SimulationEditor";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditSimulationPage({ params }: PageProps) {
  const { id } = await params;
  return <SimulationEditor simulationId={id} />;
}
