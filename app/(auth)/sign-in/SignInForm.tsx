"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/src/lib/auth/auth-client";
import { useNotify } from "@/src/components/notifications/NotificationProvider";
import {
  Form,
  Input,
  Button,
  Typography,
  Divider,
  Space,
  Checkbox,
} from "antd";
import { GoogleOutlined } from "@ant-design/icons";
import { getErrorMessage } from "@/src/lib/utils/error-utils";
import { handlePostAuth } from "@/src/lib/auth/post-auth-actions";

const { Title } = Typography;

export default function SignInPage() {
  const router = useRouter();
  const notification = useNotify();

  const [loading, setLoading] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  async function handleSubmit(values: {
    email: string;
    password: string;
    rememberMe: boolean;
  }) {
    setLoading(true);

    try {
      const { error } = await authClient.signIn.email({
        email: values.email,
        password: values.password,
        rememberMe: values.rememberMe,
      });

      if (error) {
        if (error.code === "INVALID_EMAIL_OR_PASSWORD") {
          notification.error({
            title: "Logowanie nie powiodło się",
            description: "Nieprawidłowy email lub hasło.\n Spróbuj ponownie.",
          });
        } else if (error.code === "EMAIL_NOT_VERIFIED") {
          notification.error({
            title: "Logowanie nie powiodło się",
            description:
              "Twój email nie został zweryfikowany.\n Sprawdź pocztę lub wyślij e-mail ponownie.",
            duration: 8,
          });

          const emailResponse = await fetch("/api/user/email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: values.email }),
            signal: AbortSignal.timeout(10000),
          });

          if (!emailResponse.ok) {
            throw new Error(
              "Nie udało się przygotować ponownej weryfikacji e-maila.",
            );
          }

          router.push("/verify-email");
        } else {
          notification.error({
            title: "Logowanie nie powiodło się",
            description:
              "Wystąpił nieoczekiwany błąd. Skontaktuj się z administratorem, jeśli problem będzie się powtarzał.",
          });
        }
      } else {
        // Sukces — sprawdź czy jest pending simulation
        const result = await handlePostAuth(notification, "/dashboard");

        if (!result.handled) {
          notification.success({
            title: "Zalogowano pomyślnie",
          });
        }

        router.push(result.redirectTo);
      }
    } catch (error) {
      notification.error({
        title: "Logowanie nie powiodło się",
        description: getErrorMessage(
          error,
          "Wystąpił nieoczekiwany błąd. Skontaktuj się z administratorem, jeśli problem będzie się powtarzał.",
        ),
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setLoadingGoogle(true);
    try {
      const { error } = await authClient.signIn.social({
        provider: "google",
        callbackURL: `${process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? window.location.origin}/dashboard`,
      });

      if (error) {
        notification.error({
          title: "Logowanie nie powiodło się",
          description:
            "Wystąpił nieoczekiwany błąd. Skontaktuj się z administratorem, jeśli problem będzie się powtarzał.",
        });
      }
    } catch (error) {
      notification.error({
        title: "Logowanie nie powiodło się",
        description: getErrorMessage(
          error,
          "Wystąpił nieoczekiwany błąd. Skontaktuj się z administratorem, jeśli problem będzie się powtarzał.",
        ),
      });
    } finally {
      setLoadingGoogle(false);
    }
  }

  return (
    <section
      className="max-w-full h-full flex items-center justify-center mx-auto p-4 sm:p-6"
      style={{
        color: "var(--text)",
        background: "transparent",
      }}
    >
      <div
        className="w-full rounded-lg p-6 sm:p-8 shadow-lg"
        style={{
          width: "clamp(280px, 90vw, 500px)",
          background: "var(--bg)",
          boxShadow:
            "0 6px 18px rgba(16,24,40,0.08), 0 2px 6px rgba(16,24,40,0.04)",
        }}
      >
        <header className="mb-8 text-center">
          <Title level={1} style={{ margin: 0, color: "var(--text)" }}>
            Logowanie
          </Title>
        </header>

        <Form layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Podaj email" },
              { type: "email", message: "Nieprawidłowy format email" },
            ]}
          >
            <Input
              placeholder="E-mail"
              size="large"
              aria-label="Email"
              style={{ background: "transparent", color: "var(--text)" }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Podaj hasło" }]}
            style={{ marginBottom: 6 }}
          >
            <Input.Password
              placeholder="Hasło"
              size="large"
              aria-label="Hasło"
              style={{ background: "transparent", color: "var(--text)" }}
            />
          </Form.Item>

          <Form.Item
            name="rememberMe"
            valuePropName="checked"
            style={{ marginBottom: 18 }}
          >
            <Checkbox style={{ color: "var(--text)" }}>
              Zapamiętaj mnie
            </Checkbox>
          </Form.Item>

          <Form.Item>
            <Space orientation="vertical" style={{ width: "100%" }}>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={loading}
                style={{
                  borderRadius: 9,
                  background:
                    "linear-gradient(90deg, var(--cta-from) 0%, var(--cta-to) 100%)",
                  border: 0,
                }}
              >
                Zaloguj
              </Button>
              <Button
                icon={<GoogleOutlined />}
                size="large"
                block
                onClick={handleGoogleSignIn}
                loading={loadingGoogle}
                style={{
                  background: "transparent",
                  borderColor: "var(--btn-border)",
                  color: "var(--btn-text)",
                  marginTop: 13,
                }}
              >
                Zaloguj przez Google
              </Button>
            </Space>
          </Form.Item>
        </Form>

        <Divider style={{ marginTop: 8, marginBottom: 8 }} />

        <div
          className="flex justify-between text-sm"
          style={{ color: "var(--text)" }}
        >
          <button
            type="button"
            onClick={() => router.push("/forgot-password")}
            className="text-sm"
            style={{
              color: "var(--text)",
              background: "transparent",
              border: 0,
              cursor: "pointer",
            }}
          >
            Zapomniałeś hasła?
          </button>

          <button
            type="button"
            onClick={() => router.push("/sign-up")}
            className="text-sm"
            style={{
              color: "var(--cta-from)",
              background: "transparent",
              border: 0,
              cursor: "pointer",
            }}
          >
            Utwórz konto
          </button>
        </div>
      </div>
    </section>
  );
}
