"use client";

import ThemeToggle from "@/src/components/ThemeToggle";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  UserOutlined,
  CalculatorOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import Image from "next/image";
import { User } from "../lib/auth";
import { Button, Dropdown } from "antd";
import type { MenuProps } from "antd";
import { authClient } from "../lib/auth-client";
import { useState } from "react";
import LoadingPage from "./LoadingPage";

export default function Header({ user }: { user: User | null }) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const menuItems: MenuProps["items"] = [
    { key: "profile", label: "Profil", icon: <UserOutlined /> },
    { key: "calculator", label: "Kalkulator", icon: <CalculatorOutlined /> },
    { key: "signout", label: "Wyloguj się", icon: <LogoutOutlined /> },
  ];

  const handleMenuClick: MenuProps["onClick"] = async ({ key }) => {
    if (key === "profile") router.push("/profile");
    if (key === "calculator") router.push("/calculator");
    if (key === "signout") {
      setLoading(true);
      await authClient.signOut();
      router.push("/");
      setLoading(false);
    }
  };

  if (loading) return <LoadingPage />;

  return (
    <header className="w-full px-4 py-3 border-b border-[var(--btn-border)] bg-[var(--bg)] text-[var(--text)]">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="text-lg font-semibold">
          Big Plan
        </Link>

        <div className="flex items-center gap-7">
          <nav className="hidden sm:flex gap-4">
            <Link href="/about" className="text-sm">
              About
            </Link>
            <Link href="/docs" className="text-sm">
              Docs
            </Link>
          </nav>

          <ThemeToggle />

          {user ? (
            <div className="flex items-center gap-3">
              <Dropdown
                menu={{ items: menuItems, onClick: handleMenuClick }}
                trigger={["click"]}
                placement="bottomRight"
              >
                <Button
                  type="default"
                  shape="circle"
                  size="large"
                  className="btn-rounded-custom w-12 h-12 p-0 text-xl flex items-center justify-center"
                  icon={
                    user.image ? (
                      <div className="relative w-10 h-10 rounded-full overflow-hidden">
                        <Image
                          src={user.image}
                          alt={`${user.name}`}
                          fill
                          style={{ objectFit: "cover", display: "block" }}
                        />
                      </div>
                    ) : (
                      <UserOutlined style={{ fontSize: 20 }} />
                    )
                  }
                />
              </Dropdown>
            </div>
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
    </header>
  );
}
