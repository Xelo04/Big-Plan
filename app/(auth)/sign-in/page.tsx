import type { Metadata } from "next";
import SignInForm from "./SignInForm";

export const metadata: Metadata = {
  title: "Logowanie",
};

export default function SignIn() {
  return (
    <main className="flex h-full w-full items-center justify-center px-4">
      <SignInForm />
    </main>
  );
}
