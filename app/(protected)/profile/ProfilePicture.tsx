"use client";

import Image from "next/image";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Avatar, Button } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { User } from "@/src/lib/auth/auth";
import { useNotify } from "@/src/components/notifications/NotificationProvider";

export default function ProfilePicture({ user }: { user: User }) {
  const notification = useNotify();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      notification.error({ title: "Proszę wybrać plik graficzny." });
      input.value = "";
      return;
    }

    setLoading(true);

    const data = new FormData();
    data.append("file", file);

    const response = await fetch("/api/user/avatar", {
      method: "POST",
      body: data,
    });

    if (!response.ok) {
      setLoading(false);

      notification.error({
        title: "Przesyłanie zdjęcia nie powiodło się",
        description:
          "Wystąpił nieoczekiwany błąd. Skontaktuj się z administratorem, jeśli problem będzie się powtarzał.",
      });
    } else {
      router.refresh();
      setLoading(false);
      notification.success({
        title: "Zdjęcie zostało przesłane pomyślnie",
      });
    }

    input.value = "";
  }

  function openFilePicker() {
    fileRef.current?.click();
  }

  return (
    <>
      <div
        style={{
          width: 260,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          alignSelf: "center",
          gap: 30,
        }}
      >
        <div
          style={{
            width: 100,
            height: 100,
            borderRadius: "50%",
            overflow: "hidden",
            background: "transparent",
            border: "2px solid var(--btn-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {user?.image ? (
            <Image
              src={user.image}
              alt={user.name}
              width={100}
              height={100}
              style={{ objectFit: "cover" }}
            />
          ) : (
            <Avatar
              size={100}
              icon={<UserOutlined />}
              style={{
                background: "transparent",
                color: "var(--btn-text)",
                fontSize: 40,
              }}
            />
          )}
          <input
            ref={fileRef}
            type="file"
            accept=".png, .jpg, .jpeg, .webp, .svg"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
        </div>

        <div
          style={{ width: "100%", display: "flex", justifyContent: "center" }}
        >
          <Button
            type="primary"
            onClick={openFilePicker}
            block
            loading={loading}
            style={{
              borderRadius: 9,
              background:
                "linear-gradient(90deg, var(--cta-from) 0%, var(--cta-to) 100%)",
              border: 0,
              maxWidth: 150,
            }}
          >
            {user?.image ? "Zmień zdjęcie" : "Dodaj zdjęcie"}
          </Button>
        </div>
      </div>
    </>
  );
}
