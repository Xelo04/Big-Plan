import Header from "../../src/components/Header";
import Footer from "../../src/components/Footer";
import { getSession } from "@/src/lib/get-session";
import WelcomePage from "./WelcomePage";

export default async function HomePage() {
  const session = await getSession();
  const user = session?.user;

  return (
    <main className="flex h-[100vh] flex-col justify-between text-[var(--text)]">
      <Header user={user ?? null} />
      <WelcomePage />
      <Footer />
    </main>
  );
}
