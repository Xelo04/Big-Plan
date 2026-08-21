"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useNotify } from "../notifications/NotificationProvider";
import { handlePostAuth } from "@/src/lib/auth/post-auth-actions";
import { loadPendingSimulation } from "@/src/lib/simulation/pending-simulation";

/**
 * Renderowany w protected layout. Sprawdza czy jest jakiś pending action
 * (np. zapis symulacji po logowaniu przez Google) i obsługuje ją.
 *
 * Uruchamia się tylko raz per sesja przeglądarki.
 */
export default function PostAuthHandler() {
  const router = useRouter();
  const pathname = usePathname();
  const notify = useNotify();
  const handledRef = useRef(false);

  useEffect(() => {
    if (handledRef.current) return;

    // Sprawdź tylko jeśli w sessionStorage jest coś do obsłużenia
    const pending = loadPendingSimulation();
    if (!pending) return;

    // Nie odpalaj jeśli user jest już na my-simulations (mógł tam trafić z SignInForm)
    // albo na calculator z resumeSave (fallback error flow)
    if (pathname === "/my-simulations") return;
    if (pathname === "/calculator") return;

    handledRef.current = true;

    handlePostAuth(notify).then((result) => {
      if (result.handled) {
        router.push(result.redirectTo);
      }
    });
  }, [pathname, notify, router]);

  return null;
}
