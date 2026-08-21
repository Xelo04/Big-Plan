"use client";

import type { NotificationInstance } from "antd/es/notification/interface";
import {
  clearPendingSimulation,
  loadPendingSimulation,
  pendingSimulationToPayload,
} from "../simulation/pending-simulation";

export type PostAuthResult = {
  redirectTo: string;
  handled: boolean;
};

/**
 * Wywoływane po udanym logowaniu/rejestracji.
 * Sprawdza sessionStorage na pending actions (np. zapis symulacji)
 * i wykonuje je zanim user zostanie przekierowany.
 */
export async function handlePostAuth(
  notification: NotificationInstance,
  defaultRedirect = "/dashboard",
): Promise<PostAuthResult> {
  const pending = loadPendingSimulation();

  if (!pending) {
    return { redirectTo: defaultRedirect, handled: false };
  }

  const name =
    pending.name?.trim() ||
    `Symulacja z ${new Date(pending.savedAt).toLocaleDateString("pl-PL")}`;

  try {
    const payload = pendingSimulationToPayload(pending, name);

    const res = await fetch("/api/simulations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    const data = (await res.json()) as { error?: string };

    if (!res.ok) {
      // Limit 3 symulacji — user musi usunąć starą
      if (res.status === 403) {
        notification.warning({
          title: "Nie zapisano symulacji",
          description:
            data.error ??
            "Osiągnięto limit zapisanych symulacji. Usuń starą, aby dodać nową. Dane symulacji zostaną zachowane przez 30 minut.",
          duration: 10,
        });
        // Zostawiamy sessionStorage — user usuwa starą i może zapisać
        return { redirectTo: "/my-simulations", handled: true };
      }

      // Inny błąd
      notification.error({
        title: "Nie udało się zapisać symulacji",
        description:
          data.error ??
          "Wystąpił błąd przy zapisie. Dane symulacji zostaną zachowane przez 30 minut — możesz spróbować ponownie z kalkulatora.",
        duration: 10,
      });
      // Zostawiamy sessionStorage
      return { redirectTo: defaultRedirect, handled: true };
    }

    // Sukces
    clearPendingSimulation();

    notification.success({
      title: "Symulacja zapisana",
      description: `"${name}" została dodana do Twoich symulacji.`,
      duration: 6,
    });

    return { redirectTo: "/my-simulations", handled: true };
  } catch (err) {
    console.error("handlePostAuth error:", err);
    notification.error({
      title: "Nie udało się zapisać symulacji",
      description:
        "Wystąpił nieoczekiwany błąd. Dane symulacji zostaną zachowane przez 30 minut — możesz spróbować ponownie z kalkulatora.",
      duration: 10,
    });
    return { redirectTo: defaultRedirect, handled: true };
  }
}
