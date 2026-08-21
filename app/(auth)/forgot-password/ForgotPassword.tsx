"use client";

import { useNotify } from "@/src/components/notifications/NotificationProvider";
import { authClient } from "@/src/lib/auth/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Form, Input, Button, Typography } from "antd";
import { getErrorMessage } from "@/src/lib/utils/error-utils";

const { Title } = Typography;

export default function ForgotPasswordForm() {
  const notification = useNotify();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  async function handleSubmit({ email }: { email: string }) {
    setLoading(true);

    try {
      const { error } = await authClient.requestPasswordReset({
        email,
        redirectTo: "/reset-password",
      });

      if (error) {
        notification.error({
          title: "Nie udało się wysłać e-maila do resetowania hasła",
          description:
            "Wystąpił nieoczekiwany błąd. Skontaktuj się z administratorem, jeśli problem będzie się powtarzał.",
        });
      } else {
        notification.success({
          title:
            "E-mail do resetowania hasła został wysłany. Sprawdź swoją skrzynkę odbiorczą.",
        });
        setTimeout(() => router.push("/sign-in"), 3500);
      }
    } catch (error) {
      notification.error({
        title: "Nie udało się wysłać e-maila do resetowania hasła",
        description: getErrorMessage(
          error,
          "Wystąpił nieoczekiwany błąd. Skontaktuj się z administratorem, jeśli problem będzie się powtarzał.",
        ),
      });
    } finally {
      setLoading(false);
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
            Resetowanie hasła
          </Title>
        </header>

        <Form form={form} layout="vertical" onFinish={handleSubmit}>
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

          <Form.Item>
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
              Wyślij prośbę o resetowanie hasła
            </Button>
          </Form.Item>
        </Form>
      </div>
    </section>
  );
}
