import SimulationsList from "@/src/components/simulations/SimulationsList";
import { getSupabaseAdmin } from "@/src/lib/db/supabase";
import { getSession } from "@/src/lib/auth/get-session";
import { redirect } from "next/navigation";
import type { SavedSimulationDTO } from "@/src/lib/simulation/simulation-types";

export const dynamic = "force-dynamic";

export default async function MySimulationsPage() {
  const session = await getSession();
  if (!session?.user?.id) redirect("/sign-in");

  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("saved_simulation")
    .select("*")
    .eq("userId", session.user.id)
    .order("createdAt", { ascending: false });

  return (
    <SimulationsList
      initialSimulations={(data as SavedSimulationDTO[]) || []}
    />
  );
}
