import type { Metadata } from "next";
import EmailVerified from "./EmailVerified";

export const metadata: Metadata = {
  title: "Email Verified",
};

export default function EmailVerifiedPage() {
  return (
    <main className="flex h-full w-full items-center justify-center px-4">
      <EmailVerified />
    </main>
  );
}
