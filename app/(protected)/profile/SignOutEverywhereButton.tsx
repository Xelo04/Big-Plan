"use client";

import LoadingPage from "@/src/components/LoadingPage";
import { useNotify } from "@/src/components/NotificationProvider";
import { authClient } from "@/src/lib/auth-client";
import { Button } from "antd";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogoutOutlined } from "@ant-design/icons";

export default function SignOutEverywhereButton() {
  const notification = useNotify();

  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogoutEverywhere() {
    setLoading(true);
    const { error } = await authClient.revokeSessions();

    if (error) {
      setLoading(false);
      notification.error({
        title: "Wylogowanie ze wszystkich urządzeń nie powiodło się",
        description:
          "Wystąpił nieoczekiwany błąd. Skontaktuj się z administratorem, jeśli problem będzie się powtarzał.",
      });
    } else {
      router.push("/sign-in");
      setLoading(false);
      notification.success({
        title: "Poprawnie wylogowano ze wszystkich urządzeń.",
      });
    }
  }

  if (loading) return <LoadingPage />;

  return (
    <section>
      <Button
        type="default"
        onClick={handleLogoutEverywhere}
        loading={loading}
        icon={
          <LogoutOutlined
            style={{ color: "var(--danger-text)", fontSize: 15 }}
          />
        }
        style={{
          borderRadius: 9,
          color: "var(--danger-text)",
          border: "1px solid var(--danger-border)",
          background: "var(--danger-bg)",
          padding: "8px 12px",
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
        }}
        className="btn-rounded-custom"
      >
        Wyloguj się ze wszystkich urządzeń
      </Button>
    </section>
  );
}
