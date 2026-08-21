import type { Metadata } from "next";
import ResetPasswordForm from "./ResetPasswordForm";
import Notify from "@/src/components/notifications/Notify";

export const metadata: Metadata = {
  title: "Reset hasła",
};

interface ResetPasswordPageProps {
  searchParams: Promise<{ token: string }>;
}

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const { token } = await searchParams;
  return (
    <main className="flex h-full w-full items-center justify-center px-4">
      {token ? (
        <ResetPasswordForm token={token} />
      ) : (
        <Notify
          title="Nieprawidłowy link resetowania hasła"
          description="Link resetowania hasła jest niekompletny lub wygasł. Aby ustawić nowe hasło, skorzystaj z opcji ponownego resetowania hasła."
          type="error"
          redirectURL="/sign-in"
          duration={10}
        />
      )}
    </main>
  );
}
