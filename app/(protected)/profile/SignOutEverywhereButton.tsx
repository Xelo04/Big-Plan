"use client";

import LoadingPage from "@/src/components/layout/LoadingPage";
import { useNotify } from "@/src/components/notifications/NotificationProvider";
import { authClient } from "@/src/lib/auth/auth-client";
import { Button } from "antd";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogoutOutlined } from "@ant-design/icons";
import { getErrorMessage } from "@/src/lib/utils/error-utils";

export default function SignOutEverywhereButton() {
  const notification = useNotify();

  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogoutEverywhere() {
    setLoading(true);
    try {
      const { error } = await authClient.revokeSessions();

      if (error) {
        notification.error({
          title: "Wylogowanie ze wszystkich urządzeń nie powiodło się",
          description:
            "Wystąpił nieoczekiwany błąd. Skontaktuj się z administratorem, jeśli problem będzie się powtarzał.",
        });
      } else {
        router.push("/sign-in");
        notification.success({
          title: "Poprawnie wylogowano ze wszystkich urządzeń.",
        });
      }
    } catch (error) {
      notification.error({
        title: "Wylogowanie ze wszystkich urządzeń nie powiodło się",
        description: getErrorMessage(
          error,
          "Wystąpił nieoczekiwany błąd. Skontaktuj się z administratorem, jeśli problem będzie się powtarzał.",
        ),
      });
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <LoadingPage />;

  return (
    <section className="w-full sm:w-auto">
      <Button
        type="default"
        onClick={handleLogoutEverywhere}
        loading={loading}
        icon={
          <LogoutOutlined
            style={{ color: "var(--danger-text)", fontSize: 15 }}
          />
        }
        className="btn-rounded-custom !h-auto !min-h-14 w-full whitespace-normal text-center sm:w-auto"
        style={{
          borderRadius: 9,
          color: "var(--danger-text)",
          border: "1px solid var(--danger-border)",
          background: "var(--danger-bg)",
          height: "auto",
          minHeight: 56,
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          lineHeight: 1.35,
          minWidth: 0,
          whiteSpace: "normal",
          overflow: "visible",
        }}
      >
        <span className="block min-w-0 whitespace-normal break-words text-center">
          Wyloguj się ze wszystkich urządzeń
        </span>
      </Button>
    </section>
  );
}
