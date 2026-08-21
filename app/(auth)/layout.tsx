import Footer from "@/src/components/layout/Footer";
import Header from "@/src/components/layout/Header";
import { getSession } from "@/src/lib/auth/get-session";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default async function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getSession();
  const user = session?.user;

  if (user && !user.emailVerified) redirect("/verify-email");

  if (user) redirect("/dashboard");

  return (
    <div className="flex h-[100vh] flex-col justify-between text-[var(--text)]">
      <Header user={null} />
      <div className="flex-1 flex items-center justify-center">{children}</div>
      <Footer />
    </div>
  );
}
