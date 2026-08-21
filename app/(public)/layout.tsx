import Footer from "@/src/components/layout/Footer";
import Header from "@/src/components/layout/Header";
import { getSession } from "@/src/lib/auth/get-session";
import { ReactNode } from "react";

export default async function PublicLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getSession();
  const user = session?.user ?? null;

  return (
    <div className="flex min-h-screen flex-col justify-between text-(--text)">
      <Header user={user} />
      <main className="flex-1 flex flex-col">{children}</main>
      <Footer />
    </div>
  );
}
