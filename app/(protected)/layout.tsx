import Footer from "@/src/components/Footer";
import Header from "@/src/components/Header";
import { getSession } from "@/src/lib/get-session";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default async function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getSession();
  const user = session?.user;

  if (!user) redirect("/");

  return (
    <div className="flex h-screen flex-col justify-between text-(--text)">
      <Header user={user} />
      <div className="flex-1 flex items-center justify-center">{children}</div>
      <Footer />
    </div>
  );
}
