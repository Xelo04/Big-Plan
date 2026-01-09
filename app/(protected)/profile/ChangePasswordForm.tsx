"use client";

import { useNotify } from "@/src/components/NotificationProvider";
import { authClient } from "@/src/lib/auth-client";
import { useState } from "react";
import { Form, Input, Button, Typography, Card } from "antd";
import { LockOutlined } from "@ant-design/icons";
import SignOutEverywhereButton from "./SignOutEverywhereButton";

const { Title } = Typography;

export default function ChangePasswordForm() {
  const notification = useNotify();

  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  async function handleSubmit(values: {
    currentPassword: string;
    newPassword: string;
  }) {
    setLoading(true);

    const { error } = await authClient.changePassword({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
      revokeOtherSessions: true,
    });

    setLoading(false);

    if (error) {
      notification.error({
        title: "Zmiana hasła nie powiodła się",
        description:
          "Wystąpił nieoczekiwany błąd. Skontaktuj się z administratorem, jeśli problem będzie się powtarzał.",
      });
    } else {
      notification.success({
        title: "Poprawnie zmieniono hasło.",
      });
    }
  }

  return (
    <section style={{ width: "min(900px, 96vw)" }}>
      <Card
        style={{
          borderRadius: 12,
          padding: 20,
          background: "var(--card-background, var(--bg))",
          boxShadow: "var(--card-shadow, 0 10px 30px rgba(2,6,23,0.06))",
          border: "var(--card-border, 1px solid rgba(0,0,0,0.06))",
          WebkitBackdropFilter: "var(--card-backdrop-filter, none)",
          backdropFilter: "var(--card-backdrop-filter, none)",
        }}
      >
        <header className="mb-8 text-center flex items-center justify-between px-4">
          <Title level={2} style={{ margin: 0, color: "var(--text)" }}>
            Zmiana Hasła
          </Title>
          <SignOutEverywhereButton />
        </header>

        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="currentPassword">
            <Input.Password
              placeholder="Aktualne hasło"
              size="large"
              aria-label="Aktualne hasło"
              prefix={
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    marginRight: 10,
                  }}
                >
                  <LockOutlined style={{ color: "var(--icon-muted)" }} />
                </span>
              }
              style={{ background: "transparent", color: "var(--text)" }}
            />
          </Form.Item>

          <Form.Item
            name="newPassword"
            rules={[
              { required: true, message: "Podaj nowe hasło" },
              {
                min: 8,
                message: "Nowe hasło musi mieć co najmniej 8 znaków",
              },
              {
                max: 20,
                message: "Nowe hasło nie może przekraczać 20 znaków",
              },
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
              prefix={
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    marginRight: 10,
                  }}
                >
                  <LockOutlined style={{ color: "var(--icon-muted)" }} />
                </span>
              }
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
              Zmień Hasło
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </section>
  );
}
