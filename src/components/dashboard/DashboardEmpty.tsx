"use client";

import { useRouter } from "next/navigation";
import { ArrowRightOutlined, RocketOutlined } from "@ant-design/icons";

type DashboardEmptyProps = {
  userName: string;
};

export default function DashboardEmpty({ userName }: DashboardEmptyProps) {
  const router = useRouter();

  return (
    <div className="w-full max-w-5xl mx-auto p-6 md:p-10 flex flex-col gap-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-semibold text-(--text)">
          Cześć, {userName}!
        </h1>
        <p className="text-base text-(--muted) mt-2">
          Witaj w Big Plan. Zacznijmy budować Twoją finansową przyszłość.
        </p>
      </div>

      {/* Hero CTA */}
      <div
        className="rounded-3xl border border-(--btn-border) p-8 md:p-12 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, rgba(37,99,235,0.15), rgba(79,70,229,0.10) 50%, rgba(249,115,22,0.10))",
          boxShadow: "var(--card-shadow)",
        }}
      >
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex-1 min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/15 border border-blue-500/30 px-3 py-1 mb-4">
              <RocketOutlined style={{ color: "#3b82f6" }} />
              <span className="text-xs font-semibold text-blue-500 uppercase tracking-wider">
                Pierwszy krok
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-semibold text-(--text) mb-3">
              Zbuduj swój pierwszy plan emerytalny
            </h2>
            <p className="text-sm md:text-base text-(--muted) max-w-2xl">
              Nasz kalkulator oparty o symulacje Monte Carlo przeanalizuje 10
              000 scenariuszy rynkowych, aby wyliczyć optymalną składkę
              inwestycyjną. Zajmie Ci to mniej niż 3 minuty.
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push("/calculator")}
            className="cursor-pointer inline-flex items-center gap-3 px-6 py-4 rounded-xl text-base font-semibold bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 transition-all whitespace-nowrap"
          >
            Stwórz swój plan
            <ArrowRightOutlined />
          </button>
        </div>
      </div>

      {/* Jak to działa */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            step: "1",
            title: "Podaj swoje cele",
            desc: "Ile chcesz mieć na emeryturze, kiedy przestaniesz pracować, jaka jest Twoja obecna sytuacja.",
          },
          {
            step: "2",
            title: "Wybierz profil ryzyka",
            desc: "Zdecyduj, ile chcesz mieć akcji vs obligacji. Każda decyzja to inny scenariusz zysków.",
          },
          {
            step: "3",
            title: "Otrzymaj rekomendację",
            desc: "Zobacz precyzyjną składkę miesięczną i skuteczność planu w tysiącach symulacji.",
          },
        ].map((item) => (
          <div
            key={item.step}
            className="rounded-2xl border border-(--btn-border) p-5 bg-(--card-background)"
          >
            <div className="w-10 h-10 rounded-full bg-blue-500/15 border border-blue-500/30 flex items-center justify-center mb-3">
              <span className="text-blue-500 font-bold">{item.step}</span>
            </div>
            <h3 className="text-lg font-semibold text-(--text) mb-2">
              {item.title}
            </h3>
            <p className="text-sm text-(--muted)">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
