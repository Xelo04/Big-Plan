"use client";

export default function Footer() {
  return (
    <footer className="w-full px-6 py-4 text-center text-sm text-(--muted)">
      <p>@{new Date().getFullYear()} Big Plan</p>
      <p className="mx-auto mt-2 max-w-4xl text-xs leading-relaxed">
        Narzędzie ma charakter wyłącznie edukacyjny i analityczny. Przedstawione
        wyliczenia są wynikami obliczeń matematycznych i nie stanowią
        rekomendacji inwestycyjnej ani doradztwa w rozumieniu przepisów prawa.
      </p>
    </footer>
  );
}
