"use client";
import { useEffect, startTransition } from "react";
import { useRouter } from "next/navigation";
import { useNotify } from "@/src/components/NotificationProvider";

export default function Notify({
  title,
  description,
  type,
  redirectURL,
  duration,
}: {
  title: string;
  description: string;
  type: "success" | "info" | "warning" | "error";
  redirectURL: string;
  duration: number;
}) {
  const api = useNotify();
  const router = useRouter();

  useEffect(() => {
    api[type]({ title, description, duration });
    startTransition(() => {
      router.push(redirectURL);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api, title, description, type, redirectURL, duration]);

  return null;
}
