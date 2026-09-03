"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRightOutlined,
  LineChartOutlined,
  SafetyOutlined,
  DollarOutlined,
  GlobalOutlined,
  CloudOutlined,
  RocketOutlined,
} from "@ant-design/icons";
import HeroVisual from "./HeroVisual";

export default function WelcomePage() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="w-full overflow-x-hidden">
      {/*  HERO SECTION                                */}
      <section
        className="relative min-h-[calc(100vh-73px)] flex items-center justify-center overflow-hidden pb-12"
        style={{
          background: `
            radial-gradient(circle at 20% 30%, rgba(59,130,246,0.15), transparent 40%),
            radial-gradient(circle at 80% 70%, rgba(59,130,246,0.08), transparent 40%),
            radial-gradient(circle at 50% 50%, rgba(37,99,235,0.05), transparent 60%)
          `,
        }}
      >
        <StarField />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center py-10 lg:py-0 mt-[-5vh]">
          {/* LEFT: Tekst */}
          <div className="flex flex-col gap-6 text-center lg:text-left">
            <h1 className="text-4xl md:text-6xl font-bold leading-[1.1] tracking-tight text-(--text)">
              Odzyskaj kontrolę nad{" "}
              <span
                className="inline-block bg-clip-text text-transparent bg-linear-to-r from-blue-600 via-blue-400 to-blue-600 animate-shimmer"
                style={{ backgroundSize: "200% 100%" }}
              >
                swoją przyszłością
              </span>
            </h1>

            <p className="text-base md:text-lg text-(--muted) max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Zbuduj kompleksowy plan emerytalny oparty o rynkowe realia.
              Przeanalizuj 10 000 scenariuszy symulacji Monte Carlo, śledź swój
              prawdziwy portfel aktywów i optymalizuj go dzięki wbudowanemu
              silnikowi rebalancingu.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mt-2">
              <button
                type="button"
                onClick={() => router.push("/sign-up")}
                className="cursor-pointer inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-semibold bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/40 transition-all hover:scale-[1.02]"
              >
                Rozpocznij planowanie
                <ArrowRightOutlined />
              </button>

              <button
                type="button"
                onClick={() => router.push("/calculator")}
                className="cursor-pointer inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-semibold border-2 border-(--btn-border) text-(--text) hover:border-(--text)/40 backdrop-blur-sm bg-(--card-background) transition-all"
              >
                Kalkulator bez logowania
              </button>
            </div>
          </div>

          {/* RIGHT: Floating UI Mockup */}
          <div className="relative h-100 md:h-125 lg:h-137.5 w-full flex items-center justify-center lg:pl-10">
            <HeroVisual />
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          className={`absolute bottom-6 left-1/2 -translate-x-1/2 transition-opacity duration-500 ${
            scrolled ? "opacity-0" : "opacity-100"
          }`}
        >
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-(--muted)">
              Przewiń
            </span>
            <div className="w-6 h-10 rounded-full border-2 border-(--btn-border) flex items-start justify-center p-2">
              <div className="w-1 h-2 rounded-full bg-(--text) animate-bounce" />
            </div>
          </div>
        </div>
      </section>

      {/* Sekcja z krokami */}
      <section className="relative py-24 md:py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.2em] text-blue-500 font-semibold mb-3">
              Krok po Kroku
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-(--text) mb-4">
              Od pomysłu do niezależności
            </h2>
            <p className="text-base text-(--muted) max-w-2xl mx-auto">
              Proces zarządzania majątkiem sprowadzony do 3 intuicyjnych kroków,
              zbudowany na solidnych matematycznych podstawach.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                num: "01",
                icon: (
                  <DollarOutlined style={{ fontSize: 32, color: "#3b82f6" }} />
                ),
                title: "Zdefiniuj cele",
                desc: "Określ swój docelowy budżet miesięczny, wiek emerytalny i horyzont inwestycyjny. My nałożymy na to prognozy rynkowe.",
              },
              {
                num: "02",
                icon: (
                  <LineChartOutlined
                    style={{ fontSize: 32, color: "#3b82f6" }}
                  />
                ),
                title: "Oszacuj prawdopodobieństwo",
                desc: "Nasz symulator sprawdzi 10 000 wariantów historycznych, podając Ci precyzyjną, bezpieczną kwotę jaką musisz odkładać.",
              },
              {
                num: "03",
                icon: (
                  <SafetyOutlined style={{ fontSize: 32, color: "#3b82f6" }} />
                ),
                title: "Śledź prawdziwy portfel",
                desc: "Zbuduj swój portfel inwestycyjny podłączony do żywych notowań z giełdy i śledź, kiedy aktywa wymagają rebalancingu.",
              },
            ].map((step) => (
              <div
                key={step.num}
                className="group relative rounded-3xl border border-(--btn-border) p-8 bg-(--card-background) hover:border-blue-500/40 transition-all hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1"
              >
                <div className="absolute top-6 right-6 text-6xl font-bold text-(--muted) opacity-10 group-hover:opacity-20 transition-opacity">
                  {step.num}
                </div>
                <div className="mb-6 relative z-10">{step.icon}</div>
                <h3 className="text-xl font-semibold text-(--text) mb-3 relative z-10">
                  {step.title}
                </h3>
                <p className="text-sm text-(--muted) leading-relaxed relative z-10">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/*  FEATURES */}
      <section className="relative py-24 md:py-32 px-6 bg-[linear-gradient(135deg,var(--bg),var(--card-background))]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.2em] text-blue-500 font-semibold mb-3">
              Możliwości Big Plan
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-(--text) mb-4">
              Zaprojektowany dla świadomych inwestorów.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <LineChartOutlined />,
                title: "Silnik Monte Carlo",
                desc: "Oparty o faktyczne wahania giełdy, generuje bezpieczny scenariusz dla Twoich inwestycji.",
              },
              {
                icon: <DollarOutlined />,
                title: "Rzeczywiste notowania",
                desc: "Notowania z giełdy odświeżane automatycznie przez Yahoo Finance.",
              },
              {
                icon: <SafetyOutlined />,
                title: "Narzędzie Rebalancingu",
                desc: "Nigdy nie rozbij swojej alokacji ryzyka. Big Plan poinformuje Cię, co musisz sprzedać i kupić by wrócić do celu.",
              },
              {
                icon: <GlobalOutlined />,
                title: "Multiwalutowość",
                desc: "Dodawaj do portfela aktywa w EUR, USD, GBP czy CHF. Kursy pobierane są automatycznie z Narodowego Banku Polskiego, a wszystkie kwoty przeliczane na PLN.",
              },
              {
                icon: <CloudOutlined />,
                title: "W pełni online",
                desc: "Twoje symulacje zapisywane są bezpiecznie na platformie. Zarządzaj planami skądkolwiek zechcesz.",
              },
              {
                icon: <RocketOutlined />,
                title: "Rozpocznij od zaraz",
                desc: "Nie musisz podpinać konta maklerskiego. Przetestuj pierwszą symulację bez logowania w 2 minuty.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group rounded-2xl border border-(--btn-border) p-6 bg-(--card-background) hover:border-blue-500/40 transition-all hover:shadow-lg hover:shadow-blue-500/10"
              >
                <div className="w-12 h-12 rounded-xl bg-linear-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-500 text-xl mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-(--text) mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-(--muted) leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/*  FINAL CTA                                   */}
      <section className="relative py-24 md:py-32 px-6">
        <div className="relative max-w-4xl mx-auto">
          <div
            className="relative overflow-hidden rounded-3xl border border-(--btn-border) p-10 md:p-16 text-center bg-(--card-background)"
            style={{
              boxShadow: "0 30px 60px -20px rgba(59, 130, 246, 0.25)",
            }}
          >
            {/* Delikatna poświata wewnątrz karty */}
            <div
              className="absolute inset-0 pointer-events-none opacity-60"
              style={{
                background: `
                  radial-gradient(circle at 50% 0%, rgba(59,130,246,0.15), transparent 60%),
                  radial-gradient(circle at 100% 100%, rgba(37,99,235,0.10), transparent 50%)
                `,
              }}
            />

            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-bold text-(--text) mb-6 leading-tight">
                Pieniądze przestaną być zagadką.
                <br />
                <span className="inline-block bg-clip-text text-transparent bg-linear-to-r from-blue-600 via-blue-400 to-blue-600">
                  Zaplanuj je już dziś.
                </span>
              </h2>
              <p className="text-base md:text-lg text-(--muted) mb-10 max-w-2xl mx-auto">
                Załóż darmowe konto i przenieś zarządzanie domowymi
                oszczędnościami na instytucjonalny poziom z Big Plan.
              </p>

              <button
                type="button"
                onClick={() => router.push("/sign-up")}
                className="cursor-pointer inline-flex items-center justify-center gap-3 px-10 py-5 rounded-xl text-lg font-semibold bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all hover:scale-[1.02]"
              >
                Załóż darmowe konto
                <ArrowRightOutlined />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/*  STAR FIELD BACKGROUND                       */
function StarField() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const stars = Array.from({ length: 100 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.3,
      alpha: Math.random() * 0.8 + 0.2,
      speed: Math.random() * 0.02 + 0.005,
    }));

    let animationId: number;

    const isDark =
      document.documentElement.getAttribute("data-theme") === "dark" ||
      document.documentElement.classList.contains("dark");
    const starColor = isDark ? "255,255,255" : "100,116,139";

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach((s) => {
        s.alpha += s.speed;
        if (s.alpha > 1 || s.alpha < 0.2) s.speed = -s.speed;

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${starColor},${s.alpha})`;
        ctx.fill();
      });
      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
}
