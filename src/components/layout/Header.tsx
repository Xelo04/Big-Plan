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
    setLoading(true);
    await authClient.signOut();
    router.push("/");
    setLoading(false);
  };

  if (loading) return <LoadingPage />;

  return (
    <header className="w-full px-4 py-3 border-b border-(--btn-border) bg-(--bg) text-(--text)">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="text-lg font-semibold">
          Big Plan
        </Link>

        <div className="flex items-center gap-6">
          <nav className="hidden sm:flex gap-5">
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

          <div className="flex items-center gap-3">
            <ThemeToggle />

            {user ? (
              <>
                <Tooltip title="Mój profil">
                  <Button
                    type="default"
                    shape="circle"
                    size="large"
                    onClick={() => router.push("/profile")}
                    className="btn-rounded-custom w-10 h-10 p-0 text-xl flex items-center justify-center overflow-hidden border-(--btn-border) cursor-pointer"
                    icon={
                      user.image ? (
                        <div className="relative w-full h-full rounded-full overflow-hidden">
                          <Image
                            src={user.image}
                            alt={`${user.name}`}
                            fill
                            style={{ objectFit: "cover", display: "block" }}
                          />
                        </div>
                      ) : (
                        <UserOutlined style={{ fontSize: 18 }} />
                      )
                    }
                  />
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
                  Zacznij Inwestować
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
