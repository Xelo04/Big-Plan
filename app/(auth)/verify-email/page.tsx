import type { Metadata } from "next";
import { cookies } from "next/headers";
import VerifyEmail from "./VerifyEmail";

export const metadata: Metadata = {
  title: "Verify Email",
};

export default async function VerifyEmailPage() {
  const cookieStore = await cookies();
  const email = cookieStore.get("temp_email")?.value ?? "";
  return (
    <main className="flex h-full w-full items-center justify-center px-4">
      <VerifyEmail email={email} />
    </main>
  );
}
