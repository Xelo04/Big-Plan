"use client";

import { authClient } from "@/src/lib/auth/auth-client";
import { useState } from "react";
import { Button, Typography } from "antd";
import { useNotify } from "@/src/components/notifications/NotificationProvider";
import { getErrorMessage } from "@/src/lib/utils/error-utils";

const { Title, Text } = Typography;

interface VerifyEmailProps {
  email: string;
}

export default function VerifyEmail({ email }: VerifyEmailProps) {
  const notification = useNotify();

  const [loading, setLoading] = useState(false);

  async function resendVerificationEmail() {
    setLoading(true);
    try {
      const { error } = await authClient.sendVerificationEmail({
        email,
        callbackURL: `${process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? window.location.origin}/email-verified`,
      });

      if (error) {
        notification.error({
          title: "Wysłanie e-maila weryfikacyjnego nie powiodło się",
          description:
            "Wystąpił nieoczekiwany błąd. Skontaktuj się z administratorem, jeśli problem będzie się powtarzał.",
        });
      } else {
        notification.success({
          title: "Wysłanie e-maila weryfikacyjnego powiodło się",
          description:
            "E-mail weryfikacyjny został wysłany ponownie. Sprawdź swoją skrzynkę odbiorczą.",
          duration: 7,
        });
      }
    } catch (error) {
      notification.error({
        title: "Wysłanie e-maila weryfikacyjnego nie powiodło się",
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
    <section className="max-w-full h-full flex flex-col items-center justify-center mx-auto p-4 sm:p-6">
      <header className="mb-8 text-center">
        <Title level={1} style={{ margin: 0, color: "var(--text)" }}>
          Zweryfikuj swój adres e-mail
        </Title>
      </header>
      <Text>
        Po zarejestrowaniu na Twój adres: {email} został wysłany e-mail
        weryfikacyjny.
      </Text>
      <Text>
        Aby korzystać z konta, musisz najpierw zweryfikować swój adres e-mail.
      </Text>
      <Text>
        Jeśli e-mail nie dotarł, możesz wysłać go ponownie, klikając poniższy
        przycisk.
      </Text>
      <Button
        type="primary"
        onClick={resendVerificationEmail}
        size="large"
        block
        loading={loading}
        style={{
          borderRadius: 9,
          background:
            "linear-gradient(90deg, var(--cta-from) 0%, var(--cta-to) 100%)",
          border: 0,
          marginTop: 20,
        }}
      >
        Wyślij ponownie e-mail weryfikacyjny
      </Button>
    </section>
  );
}
