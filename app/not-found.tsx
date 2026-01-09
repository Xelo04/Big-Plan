"use client";

import Link from "next/link";
import { Button, Typography } from "antd";

const { Title, Text } = Typography;

export default function NotFoundPage() {
  return (
    <main className="min-h-[90vh] flex items-center justify-center px-4 text-center flex flex-col">
      <header className="mb-3 text-center">
        <Title level={1} style={{ margin: 0, color: "var(--text)" }}>
          404 - Strona nie znaleziona
        </Title>
      </header>
      <Text
        style={{
          fontSize: "1.25rem",
          lineHeight: 1.4,
          color: "var(--text)",
          marginBottom: "1.5rem",
        }}
      >
        Strona, której szukasz, nie została znaleziona
      </Text>
      <Link href={`/`}>
        <Button
          type="primary"
          size="large"
          block
          style={{
            borderRadius: 9,
            background:
              "linear-gradient(90deg, var(--cta-from) 0%, var(--cta-to) 100%)",
            border: 0,
          }}
        >
          Powrót do strony głównej
        </Button>
      </Link>
    </main>
  );
}
