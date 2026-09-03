import SimulationEditor from "@/src/components/simulations/SimulationEditor";
import { getSupabaseAdmin } from "@/src/lib/db/supabase";
import { getSession } from "@/src/lib/auth/get-session";
import { redirect } from "next/navigation";
import type { SavedSimulationDTO } from "@/src/lib/simulation/simulation-types";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditSimulationPage({ params }: PageProps) {
  const session = await getSession();
  if (!session?.user?.id) redirect("/sign-in");

  const { id } = await params;
  const supabase = getSupabaseAdmin();

  const { data } = await supabase
    .from("saved_simulation")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  const simulation =
    data && data.userId === session.user.id
      ? (data as SavedSimulationDTO)
      : null;

  return <SimulationEditor initialSimulation={simulation} />;
}
