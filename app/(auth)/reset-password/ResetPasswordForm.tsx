"use client";

import { useNotify } from "@/src/components/NotificationProvider";
import { authClient } from "@/src/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Form, Input, Button, Typography } from "antd";

const { Title } = Typography;

interface ResetPasswordFormProps {
  token: string;
}

export default function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const notification = useNotify();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  async function handleSubmit(values: { password: string }) {
    setLoading(true);

    const { error } = await authClient.resetPassword({
      newPassword: values.password,
      token,
    });

    setLoading(false);

    if (error) {
      notification.error({
        title: "Reset hasła nie powiódł się",
        description:
          "Wystąpił nieoczekiwany błąd. Skontaktuj się z administratorem, jeśli problem będzie się powtarzał.",
      });
    } else {
      notification.success({
        title:
          "Poprawnie zresetowano hasło. Trwa przekierowanie do strony logowania...",
      });
      setTimeout(() => router.push("/sign-in"), 3000);
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
            name="password"
            rules={[
              { required: true, message: "Podaj nowe hasło" },
              { min: 8, message: "Nowe hasło musi mieć co najmniej 8 znaków" },
              { max: 20, message: "Nowe hasło nie może przekraczać 20 znaków" },
              {
                pattern: /[A-Z]/,
                message: "Nowe hasło musi zawierać co najmniej 1 wielką literę",
              },
              {
                pattern: /[^A-Za-z0-9]/,
                message:
                  "Nowe hasło musi zawierać co najmniej 1 znak specjalny",
              },
            ]}
          >
            <Input.Password
              placeholder="Nowe hasło"
              size="large"
              aria-label="Nowe hasło"
              style={{ background: "transparent", color: "var(--text)" }}
            />
          </Form.Item>

          <Form.Item
            name="confirm"
            dependencies={["password"]}
            hasFeedback
            rules={[
              {
                required: true,
                message: "Powtórz hasło",
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("Hasła, które wpisałeś, nie są takie same")
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
              Zresetuj Hasło
            </Button>
          </Form.Item>
        </Form>
      </div>
    </section>
  );
}
