import { getSession } from "@/src/lib/auth/get-session";
import { unauthorized } from "next/navigation";
import Profile from "./Profile";

export default async function ProfilePage() {
  const session = await getSession();
  const user = session?.user;
  if (!user) unauthorized();

  // TODO Dodanie resetowania hasła (1:53:24 filmu) + sprawdzenie czy validation.ts działa poprawnie
  return (
    <main className="flex h-full w-full items-center justify-center px-4">
      {/* <p>Welcome, {user.name || "User"}!</p>
      <p>Email: {user.email}</p>
      <p>Subscription Plan: {user.subscriptionPlan}</p>
      <p>Role: {user.role}</p>
      <p>Verification: {user.emailVerified ? "Verified" : "Not Verified"}</p>
      {user.emailVerified === false && (
        <>
          <p className="text-red-500">
            Please verify your email address to access all features.
          </p>
          <button>
            <Link href="/verify-email">Verify Email</Link>
          </button>
        </>
      )}
      <SignOutEverywhereButton /> */}
      <Profile user={user} />
    </main>
  );
}
