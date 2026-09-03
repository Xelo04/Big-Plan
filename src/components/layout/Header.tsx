"use client";

import ThemeToggle from "@/src/components/theme/ThemeToggle";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserOutlined, LogoutOutlined } from "@ant-design/icons";
import Image from "next/image";
import { User } from "@/src/lib/auth/auth";
import { Button, Tooltip } from "antd";
import { authClient } from "@/src/lib/auth/auth-client";
import { useState } from "react";
import LoadingPage from "./LoadingPage";

export default function Header({ user }: { user: User | null }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

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
      <div className="max-w-7xl mx-auto flex items-center justify-between">
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

        <div className="flex items-center gap-6">
          {/* Nawigacja widoczna dla zalogowanych użytkowników */}
          {user && (
            <nav className="hidden sm:flex gap-5">
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

          <div className="flex items-center gap-3">
            <ThemeToggle />

            {user ? (
              <>
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
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
