import type { Metadata } from "next";
import ForgotPassword from "./ForgotPassword";

export const metadata: Metadata = {
  title: "Zapomniane hasło",
};

export default function ForgotPasswordPage() {
  return (
    <main className="flex h-full w-full items-center justify-center px-4">
      <ForgotPassword />
    </main>
  );
}
