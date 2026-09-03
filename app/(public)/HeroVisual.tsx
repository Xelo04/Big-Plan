"use client";

import { useState, useEffect } from "react";
import {
  SafetyCertificateOutlined,
  RiseOutlined,
  PieChartOutlined,
  DollarOutlined,
} from "@ant-design/icons";

export default function HeroVisual() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Efekt 3D Tilt reagujący na ruch myszki
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2; // -1 to 1
      const y = (e.clientY / window.innerHeight - 0.5) * 2; // -1 to 1
      setMousePos({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div
      className="relative w-full h-120 md:h-137.5 flex items-center justify-center select-none"
      style={{ perspective: "1200px" }}
    >
      {/* Centralna poświata w tle */}
      <div className="absolute w-95 h-95 bg-linear-to-tr from-blue-600/20 via-blue-400/10 to-transparent blur-[100px] rounded-full pointer-events-none" />

      {/* Kontener 3D reagujący na ruch myszki */}
      <div
        className="relative w-full max-w-115 h-95 transition-transform duration-200 ease-out"
        style={{
          transform: `rotateY(${mousePos.x * 12}deg) rotateX(${-mousePos.y * 12}deg)`,
          transformStyle: "preserve-3d",
        }}
      >
        {/* KARTA 1: Główny Wykres Monte Carlo          */}
        <div
          className="absolute inset-x-2 top-8 rounded-3xl border border-(--btn-border) p-6 backdrop-blur-xl bg-(--card-background) shadow-2xl"
          style={{
            transform: "translateZ(40px)",
            boxShadow: "0 30px 60px -15px rgba(0,0,0,0.2)",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                <RiseOutlined style={{ fontSize: 20 }} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-(--muted) font-semibold">
                  Symulacja Monte Carlo
                </p>
                <p className="text-base font-bold text-(--text)">
                  Prognoza Portfela
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Cel osiągnięty
            </span>
          </div>

          {/* Symulowany Wykres Fali */}
          <div className="h-32 w-full relative flex items-end pt-2">
            <svg
              className="w-full h-full overflow-visible"
              viewBox="0 0 300 100"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="chartGradBlue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M 0,90 Q 50,85 100,60 T 200,40 T 300,10 L 300,100 L 0,100 Z"
                fill="url(#chartGradBlue)"
              />
              {/* Szare linie "Monte Carlo" w tle */}
              <path
                d="M 0,90 Q 50,80 100,70 T 200,50 T 300,30"
                fill="none"
                stroke="var(--icon-muted)"
                strokeOpacity={0.3}
                strokeWidth="1.5"
              />
              <path
                d="M 0,90 Q 50,95 100,80 T 200,70 T 300,60"
                fill="none"
                stroke="var(--icon-muted)"
                strokeOpacity={0.3}
                strokeWidth="1.5"
              />
              {/* Główna linia P50 */}
              <path
                d="M 0,90 Q 50,85 100,60 T 200,40 T 300,10"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="3.5"
                strokeLinecap="round"
                className="animate-pulse"
                style={{ animationDuration: "3s" }}
              />
            </svg>
          </div>

          <div className="flex justify-between items-center mt-4 pt-3 border-t border-(--btn-border) text-xs text-(--muted)">
            <span>Dziś: 0 PLN</span>
            <span className="font-semibold text-blue-600 dark:text-blue-400">
              Wiek 65: 2 450 000 PLN
            </span>
          </div>
        </div>

        {/* KARTA 2: Wskaźnik Bezpieczeństwa    */}
        <div
          className="absolute -right-6 -top-4 rounded-2xl border border-(--btn-border) p-4 backdrop-blur-xl bg-(--card-background) shadow-xl flex items-center gap-3"
          style={{
            transform: "translateZ(80px)",
          }}
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <SafetyCertificateOutlined style={{ fontSize: 20 }} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-(--muted)">
              Skuteczność Planu
            </p>
            <p className="text-sm font-bold text-(--text) mt-0.5">
              90.4% Bezpieczeństwa
            </p>
          </div>
        </div>

        {/* KARTA 3: Alokacja Portfela */}
        <div
          className="absolute -left-8 bottom-6 rounded-2xl border border-(--btn-border) p-4 backdrop-blur-xl bg-(--card-background) shadow-xl flex items-center gap-4"
          style={{
            transform: "translateZ(100px)",
          }}
        >
          <div className="relative w-12 h-12 flex items-center justify-center">
            {/* Animowany donut chart za pomocą CSS */}
            <div
              className="w-12 h-12 rounded-full border-4 border-blue-500 border-r-orange-500 animate-spin-slow"
              style={{ animationDuration: "8s" }}
            />
            <PieChartOutlined
              className="absolute text-blue-600 dark:text-blue-400"
              style={{ fontSize: 16 }}
            />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-(--muted)">
              Alokacja Portfela
            </p>
            <p className="text-sm font-bold text-(--text) mt-0.5">
              60% Akcje / 40% Obligacje
            </p>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium inline-block mt-1 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              ✓ Zrównoważony
            </span>
          </div>
        </div>

        {/* KARTA 4: Wpłata Miesięczna */}
        <div
          className="absolute right-4 -bottom-6 rounded-2xl border border-(--btn-border) px-4 py-3 backdrop-blur-xl bg-(--card-background) shadow-xl flex items-center gap-3"
          style={{
            transform: "translateZ(60px)",
          }}
        >
          <div className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <DollarOutlined style={{ fontSize: 16 }} />
          </div>
          <div>
            <p className="text-[10px] text-(--muted) uppercase tracking-wider">
              Rekomendacja
            </p>
            <p className="text-sm font-bold text-(--text) mt-0.5">
              500 PLN / mies.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
