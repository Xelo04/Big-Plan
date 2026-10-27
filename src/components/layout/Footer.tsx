"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full px-6 py-4 text-center text-sm text-(--muted)">
      <p>© {new Date().getFullYear()} Big Plan</p>

      <p className="mx-auto mt-2 max-w-4xl text-xs leading-relaxed">
        Narzędzie ma charakter poglądowy i nie stanowi gwarancji przyszłych
        zysków ani porady inwestycyjnej w rozumieniu przepisów prawa. Pamiętaj,
        że inwestowanie wiąże się z ryzykiem utraty kapitału.
      </p>

      <div className="mt-3 flex justify-center gap-4 text-xs underline">
        <Link href="/terms-and-conditions" className="hover:opacity-80">
          Regulamin serwisu
        </Link>
        <Link href="/privacy-policy" className="hover:opacity-80">
          Polityka prywatności
        </Link>
      </div>
    </footer>
  );
}
