"use client";

import ThemeToggle from "@/src/components/theme/ThemeToggle";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  UserOutlined,
  LogoutOutlined,
  MenuOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import Image from "next/image";
import { User } from "@/src/lib/auth/auth";
import { Button, Tooltip } from "antd";
import { authClient } from "@/src/lib/auth/auth-client";
import { useState } from "react";
import LoadingPage from "./LoadingPage";

export default function Header({ user }: { user: User | null }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      setLoading(true);
      await authClient.signOut();
      window.location.href = "/";
    } catch (error) {
      console.error("Sign out error:", error);
      setLoading(false);
    }
  };

  if (loading) return <LoadingPage />;

  return (
    <header className="w-full px-4 py-3 border-b border-(--btn-border) bg-(--bg) text-(--text)">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-2.5 group">
          <Image
            src="/logo.png"
            alt="Big Plan Logo"
            width={32}
            height={32}
            className="w-8 h-8 object-contain transition-transform group-hover:scale-105"
            priority
          />
          <span className="text-lg font-semibold tracking-tight">Big Plan</span>
        </Link>

        <div className="flex items-center gap-3 md:gap-6">
          {/* Nawigacja widoczna dla zalogowanych użytkowników */}
          {user && (
            <nav className="hidden md:flex gap-5">
              <Link
                href="/dashboard"
                className="text-sm hover:text-(--cta-from) transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/calculator"
                className="text-sm hover:text-(--cta-from) transition-colors"
              >
                Kalkulator
              </Link>
              <Link
                href="/my-simulations"
                className="text-sm hover:text-(--cta-from) transition-colors"
              >
                Moje symulacje
              </Link>
              <Link
                href="/my-portfolios"
                className="text-sm hover:text-(--cta-from) transition-colors"
              >
                Moje portfele
              </Link>
            </nav>
          )}

          <div className="flex items-center gap-2 md:gap-3">
            <div className="hidden md:block">
              <ThemeToggle />
            </div>

            {user ? (
              <>
                <div className="hidden md:block">
                  <Tooltip title="Mój profil">
                    <button
                      type="button"
                      onClick={() => router.push("/profile")}
                      className="w-10 h-10 rounded-full border border-(--btn-border) flex items-center justify-center overflow-hidden cursor-pointer hover:border-(--cta-from) transition-colors bg-(--btn-bg)"
                    >
                      {user.image ? (
                        <Image
                          src={user.image}
                          alt={user.name || "Avatar"}
                          width={36}
                          height={36}
                          className="w-full h-full object-cover rounded-full"
                          unoptimized
                        />
                      ) : (
                        <UserOutlined style={{ fontSize: 18 }} />
                      )}
                    </button>
                  </Tooltip>
                </div>

                <div className="hidden md:block">
                  <Tooltip title="Wyloguj się">
                    <Button
                      type="default"
                      shape="circle"
                      size="large"
                      onClick={handleSignOut}
                      className="w-10 h-10 flex items-center justify-center border-(--btn-border) text-red-500 hover:text-red-600 hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                      icon={<LogoutOutlined style={{ fontSize: 18 }} />}
                    />
                  </Tooltip>
                </div>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-3">
                <button
                  className="btn-color-up"
                  onClick={() => router.push("/sign-up")}
                >
                  Stwórz plan
                </button>
                <button
                  className="btn-no-color"
                  onClick={() => router.push("/sign-in")}
                >
                  Zaloguj się
                </button>
              </div>
            )}

            <button
              type="button"
              aria-label={menuOpen ? "Zamknij menu" : "Otwórz menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
              className="md:hidden w-10 h-10 rounded-lg border border-(--btn-border) flex items-center justify-center cursor-pointer hover:border-(--cta-from) transition-colors"
            >
              {menuOpen ? <CloseOutlined /> : <MenuOutlined />}
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <>
          <button
            type="button"
            aria-label="Zamknij menu"
            onClick={() => setMenuOpen(false)}
            className="fixed inset-0 z-40 cursor-pointer bg-black/40 md:hidden"
          />
          <aside
            aria-label="Menu nawigacyjne"
            className="fixed right-0 top-0 z-50 flex h-full w-[min(21rem,85vw)] flex-col overflow-y-auto border-l border-(--btn-border) bg-(--bg) p-6 text-(--text) shadow-2xl md:hidden"
          >
            <div className="mb-8 flex items-center justify-between">
              <span className="text-lg font-semibold">Menu</span>
              <button
                type="button"
                aria-label="Zamknij menu"
                onClick={() => setMenuOpen(false)}
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border border-(--btn-border) hover:border-(--cta-from) transition-colors"
              >
                <CloseOutlined />
              </button>
            </div>

            <div className="mb-6 flex items-center gap-3 border-b border-(--btn-border) pb-6">
              {user ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      router.push("/profile");
                    }}
                    className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-(--btn-border) bg-(--btn-bg)"
                  >
                    {user.image ? (
                      <Image
                        src={user.image}
                        alt={user.name || "Avatar"}
                        width={44}
                        height={44}
                        className="h-full w-full rounded-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <UserOutlined style={{ fontSize: 20 }} />
                    )}
                  </button>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {user.name || "Użytkownik"}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        router.push("/profile");
                      }}
                      className="cursor-pointer text-xs text-(--muted) hover:text-(--cta-from)"
                    >
                      Mój profil
                    </button>
                  </div>
                </>
              ) : (
                <p className="text-sm text-(--muted)">Witaj w Big Plan</p>
              )}
            </div>

            <div className="mb-6 flex items-center justify-between rounded-lg border border-(--btn-border) px-3 py-2">
              <span className="text-sm">Motyw</span>
              <ThemeToggle />
            </div>

            {user ? (
              <nav className="flex flex-col gap-1">
                {[
                  ["/dashboard", "Dashboard"],
                  ["/calculator", "Kalkulator"],
                  ["/my-simulations", "Moje symulacje"],
                  ["/my-portfolios", "Moje portfele"],
                ].map(([href, label]) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMenuOpen(false)}
                    className="rounded-lg px-3 py-3 text-sm hover:bg-(--btn-bg) hover:text-(--cta-from) transition-colors"
                  >
                    {label}
                  </Link>
                ))}
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="mt-2 flex items-center gap-2 rounded-lg px-3 py-3 text-left text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer"
                >
                  <LogoutOutlined />
                  Wyloguj się
                </button>
              </nav>
            ) : (
              <div className="flex flex-col gap-2">
                <button
                  className="btn-color-up w-full justify-center"
                  onClick={() => {
                    setMenuOpen(false);
                    router.push("/sign-up");
                  }}
                >
                  Stwórz plan
                </button>
                <button
                  className="btn-no-color w-full justify-center"
                  onClick={() => {
                    setMenuOpen(false);
                    router.push("/sign-in");
                  }}
                >
                  Zaloguj się
                </button>
              </div>
            )}
          </aside>
        </>
      )}
    </header>
  );
}
