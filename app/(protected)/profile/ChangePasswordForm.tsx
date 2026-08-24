"use client";

import { useNotify } from "@/src/components/notifications/NotificationProvider";
import { authClient } from "@/src/lib/auth/auth-client";
import { useState } from "react";
import { Form, Input, Button, Modal } from "antd";
import { LockOutlined } from "@ant-design/icons";
import { getErrorMessage } from "@/src/lib/utils/error-utils";

type ChangePasswordModalProps = {
  open: boolean;
  onCancel: () => void;
};

export default function ChangePasswordForm({
  open,
  onCancel,
}: ChangePasswordModalProps) {
  const notification = useNotify();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  async function handleSubmit(values: {
    currentPassword: string;
    newPassword: string;
  }) {
    setLoading(true);

    try {
      const { error } = await authClient.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        revokeOtherSessions: true,
      });

      if (error) {
        notification.error({
          title: "Zmiana hasła nie powiodła się",
          description:
            "Nieprawidłowe aktualne hasło lub wystąpił inny błąd. Spróbuj ponownie.",
        });
      } else {
        notification.success({
          title: "Poprawnie zmieniono hasło.",
        });
        form.resetFields();
        onCancel();
      }
    } catch (error) {
      notification.error({
        title: "Zmiana hasła nie powiodła się",
        description: getErrorMessage(
          error,
          "Wystąpił nieoczekiwany błąd. Skontaktuj się z administratorem.",
        ),
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      title="Zmiana Hasła"
      open={open}
      onCancel={onCancel}
      footer={null}
      destroyOnHidden
      width={480}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="mt-4"
      >
        <Form.Item
          name="currentPassword"
          rules={[{ required: true, message: "Podaj aktualne hasło" }]}
        >
          <Input.Password
            placeholder="Aktualne hasło"
            size="large"
            aria-label="Aktualne hasło"
            prefix={
              <LockOutlined
                style={{ color: "var(--icon-muted)", marginRight: 8 }}
              />
            }
          />
        </Form.Item>

        <Form.Item
          name="newPassword"
          rules={[
            { required: true, message: "Podaj nowe hasło" },
            { min: 8, message: "Nowe hasło musi mieć co najmniej 8 znaków" },
            { max: 20, message: "Nowe hasło nie może przekraczać 20 znaków" },
            { pattern: /[A-Z]/, message: "Co najmniej 1 wielka litera" },
            {
              pattern: /[^A-Za-z0-9]/,
              message: "Co najmniej 1 znak specjalny",
            },
          ]}
        >
          <Input.Password
            placeholder="Nowe hasło"
            size="large"
            aria-label="Nowe hasło"
            prefix={
              <LockOutlined
                style={{ color: "var(--icon-muted)", marginRight: 8 }}
              />
            }
          />
        </Form.Item>

        <div className="flex justify-end gap-2 mt-6">
          <Button onClick={onCancel} size="large">
            Anuluj
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
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
        </div>
      </Form>
    </Modal>
  );
}
