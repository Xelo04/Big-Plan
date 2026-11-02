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
import { loadPendingSimulation } from "@/src/lib/simulation/pending-simulation";

const { Title } = Typography;

export default function SignUpPage() {
  const router = useRouter();
  const notification = useNotify();

  const [loading, setLoading] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [form] = Form.useForm();

  async function handleSubmit(values: {
    name: string;
    email: string;
    password: string;
    wants_newsletter: boolean;
  }) {
    setLoading(true);

    try {
      const { error } = await authClient.signUp.email({
        name: values.name,
        email: values.email,
        password: values.password,
        wants_newsletter: values.wants_newsletter,
        callbackURL: `${process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? window.location.origin}/dashboard`,
      });

      if (error) {
        if (error.code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL") {
          notification.error({
            title: "Rejestracja nie powiodła się",
            description:
              "Użytkownik o podanym emailu już istnieje.\n Spróbuj ponownie.",
            duration: 5,
          });
        } else {
          notification.error({
            title: "Rejestracja nie powiodła się",
            description:
              "Wystąpił nieoczekiwany błąd. Skontaktuj się z administratorem, jeśli problem będzie się powtarzał.",
          });
        }
      } else {
        // Sprawdź czy jest pending simulation (dane zostają w sessionStorage do weryfikacji)
        const hasPending = loadPendingSimulation() !== null;

        if (hasPending) {
          notification.success({
            title: "Zarejestrowano pomyślnie",
            description:
              "Zweryfikuj adres e-mail, aby zapisać swoją symulację. Dane symulacji zostaną zachowane przez 30 minut.",
            duration: 10,
          });
        } else {
          notification.success({
            title: "Zarejestrowano pomyślnie",
          });
        }

        // Wyślij email weryfikacyjny
        const emailResponse = await fetch("/api/user/email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: values.email }),
          signal: AbortSignal.timeout(10000),
        });

        if (!emailResponse.ok) {
          throw new Error("Nie udało się przygotować weryfikacji e-maila.");
        }

        router.push("/verify-email");
      }
    } catch (error) {
      notification.error({
        title: "Rejestracja nie powiodła się",
        description: getErrorMessage(
          error,
          "Wystąpił nieoczekiwany błąd. Skontaktuj się z administratorem, jeśli problem będzie się powtarzał.",
        ),
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignUp() {
    setLoadingGoogle(true);
    try {
      const { error } = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
      });

      if (error) {
        notification.error({
          title: "Rejestracja nie powiodła się",
          description:
            "Wystąpił nieoczekiwany błąd. Skontaktuj się z administratorem, jeśli problem będzie się powtarzał.",
        });
      }
    } catch (error) {
      notification.error({
        title: "Rejestracja nie powiodła się",
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
            Rejestracja
          </Title>
        </header>

        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            rules={[{ required: true, message: "Podaj nazwę" }]}
          >
            <Input
              placeholder="Nazwa"
              size="large"
              aria-label="Nazwa"
              style={{ background: "transparent", color: "var(--text)" }}
            />
          </Form.Item>

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
            rules={[
              { required: true, message: "Podaj hasło" },
              { min: 8, message: "Hasło musi mieć co najmniej 8 znaków" },
              { max: 20, message: "Hasło nie może przekraczać 20 znaków" },
              {
                pattern: /[A-Z]/,
                message: "Hasło musi zawierać co najmniej 1 wielką literę",
              },
              {
                pattern: /[^A-Za-z0-9]/,
                message: "Hasło musi zawierać co najmniej 1 znak specjalny",
              },
            ]}
          >
            <Input.Password
              placeholder="Hasło"
              size="large"
              aria-label="Hasło"
              style={{ background: "transparent", color: "var(--text)" }}
            />
          </Form.Item>

          <Form.Item
            name="confirm"
            dependencies={["password"]}
            hasFeedback
            rules={[
              { required: true, message: "Powtórz hasło" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("Hasła, które wpisałeś, nie są takie same"),
                  );
                },
              }),
            ]}
          >
            <Input.Password
              placeholder="Powtórz Hasło"
              size="large"
              aria-label="Powtórz Hasło"
              style={{ background: "transparent", color: "var(--text)" }}
            />
          </Form.Item>

          <Form.Item name="wants_newsletter" valuePropName="checked">
            <Checkbox>
              Wyrażam zgodę na otrzymywanie wiadomości e-mail z aktualnościami i
              ofertami.
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
                Zarejestruj
              </Button>
              <Button
                icon={<GoogleOutlined />}
                size="large"
                block
                onClick={handleGoogleSignUp}
                loading={loadingGoogle}
                style={{
                  background: "transparent",
                  borderColor: "var(--btn-border)",
                  color: "var(--btn-text)",
                  marginTop: 13,
                }}
              >
                Zarejestruj przez Google
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
            onClick={() => router.push("/sign-in")}
            className="text-sm"
            style={{
              color: "var(--cta-from)",
              background: "transparent",
              border: 0,
              cursor: "pointer",
            }}
          >
            Masz już konto? Zaloguj się
          </button>
        </div>
      </div>
    </section>
  );
}
