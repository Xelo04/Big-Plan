import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _admin: SupabaseClient | null = null;

export function getSupabaseAdmin() {
  if (_admin) return _admin;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Brak SUPABASE_URL lub SUPABASE_SERVICE_ROLE_KEY");
  }

  _admin = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return _admin;
}

export function newId() {
  return crypto.randomUUID();
}

export async function deleteUserData(userId: string) {
  const supabase = getSupabaseAdmin();

  const { data: simulations, error: simulationsError } = await supabase
    .from("saved_simulation")
    .select("id")
    .eq("userId", userId);

  if (simulationsError) throw simulationsError;

  const simulationIds = (simulations ?? []).map((simulation) => simulation.id);
  if (simulationIds.length > 0) {
    const { data: portfolios, error: portfoliosError } = await supabase
      .from("portfolio")
      .select("id")
      .in("simulationId", simulationIds);

    if (portfoliosError) throw portfoliosError;

    const portfolioIds = (portfolios ?? []).map((portfolio) => portfolio.id);
    if (portfolioIds.length > 0) {
      const { error: assetsError } = await supabase
        .from("portfolio_asset")
        .delete()
        .in("portfolioId", portfolioIds);

      if (assetsError) throw assetsError;

      const { error: portfoliosDeleteError } = await supabase
        .from("portfolio")
        .delete()
        .in("id", portfolioIds);

      if (portfoliosDeleteError) throw portfoliosDeleteError;
    }

    const { error: simulationsDeleteError } = await supabase
      .from("saved_simulation")
      .delete()
      .in("id", simulationIds);

    if (simulationsDeleteError) throw simulationsDeleteError;
  }

  const { data: avatarFiles, error: avatarListError } = await supabase.storage
    .from("avatars")
    .list(userId);

  if (avatarListError) throw avatarListError;
  if (avatarFiles && avatarFiles.length > 0) {
    const { error: avatarDeleteError } = await supabase.storage
      .from("avatars")
      .remove(avatarFiles.map((file) => `${userId}/${file.name}`));

    if (avatarDeleteError) throw avatarDeleteError;
  }
}
