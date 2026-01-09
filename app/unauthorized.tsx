"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button, Typography } from "antd";

const { Title, Text } = Typography;

export default function UnauthorizedPage() {
  const pathname = usePathname();

  return (
    <main className="flex grow items-center justify-center px-4 text-center flex flex-col">
      <header className="mb-3 text-center">
        <Title level={1} style={{ margin: 0, color: "var(--text)" }}>
          401 - Brak dostępu
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
        Zaloguj się, aby kontynuować
      </Text>
      <Link href={`/sign-in?redirect=${encodeURIComponent(pathname)}`}>
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
          Zaloguj się
        </Button>
      </Link>
    </main>
  );
}
