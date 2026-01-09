"use client";

import { Button, Typography } from "antd";
import Link from "next/link";

const { Title } = Typography;

export default function EmailVerified() {
  return (
    <section className="max-w-full h-full flex flex-col items-center justify-center mx-auto p-4 sm:p-6">
      <header className="mb-8 text-center">
        <Title level={1} style={{ margin: 0, color: "var(--text)" }}>
          Twój e-mail został poprawnie zweryfikowany
        </Title>
      </header>
      <Link href="/dashboard">
        <Button
          type="primary"
          size="large"
          block
          style={{
            borderRadius: 9,
            background:
              "linear-gradient(90deg, var(--cta-from) 0%, var(--cta-to) 100%)",
            border: 0,
            marginTop: 20,
          }}
        >
          Przejdź do strony głównej
        </Button>
      </Link>
    </section>
  );
}
