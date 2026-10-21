"use client";

import { useState } from "react";
import { Button, Modal, Typography } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { authClient } from "@/src/lib/auth/auth-client";
import { useNotify } from "@/src/components/notifications/NotificationProvider";
import { getErrorMessage } from "@/src/lib/utils/error-utils";

const { Text } = Typography;

export default function DeleteAccountButton() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const notification = useNotify();
  const router = useRouter();

  async function handleDelete() {
    setLoading(true);

    try {
      const { error } = await authClient.deleteUser({});

      if (error) {
        notification.error({
          title: "Nie udało się usunąć konta",
          description:
            error.message ||
            "Sesja wygasła. Zaloguj się ponownie i spróbuj jeszcze raz.",
        });
        return;
      }

      router.replace("/sign-in");
      router.refresh();
    } catch (error) {
      notification.error({
        title: "Nie udało się usunąć konta",
        description: getErrorMessage(
          error,
          "Wystąpił nieoczekiwany błąd. Spróbuj ponownie.",
        ),
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button
        danger
        size="large"
        icon={<DeleteOutlined />}
        onClick={() => setOpen(true)}
        className="w-full sm:w-auto"
      >
        <span className="whitespace-normal">Usuń konto</span>
      </Button>

      <Modal
        title="Trwale usunąć konto?"
        open={open}
        onCancel={() => setOpen(false)}
        destroyOnHidden
        footer={
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              size="large"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Anuluj
            </Button>
            <Button
              danger
              type="primary"
              size="large"
              loading={loading}
              onClick={handleDelete}
            >
              Usuń konto
            </Button>
          </div>
        }
        width="min(480px, calc(100vw - 32px))"
      >
        <Text>
          Ta operacja jest nieodwracalna. Zostaną usunięte Twoje zapisane
          symulacje, portfele wirtualne i wszystkie aktywa.
        </Text>
      </Modal>
    </>
  );
}
