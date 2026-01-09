import type { Metadata } from "next";
import SignUpForm from "./SignUpForm";

export const metadata: Metadata = {
  title: "Rejestracja",
};

export default function SignUp() {
  return (
    <main className="flex h-full w-full items-center justify-center px-4">
      <SignUpForm />
    </main>
  );
}
