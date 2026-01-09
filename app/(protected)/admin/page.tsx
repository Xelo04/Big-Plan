// TODO Dodać panel admina z dokumentacji: https://www.better-auth.com/docs/plugins/admin
import { getSession } from "@/src/lib/get-session";
import { forbidden, unauthorized } from "next/navigation";

export default async function AdminPage() {
  const session = await getSession();
  const user = session?.user;
  if (!user) unauthorized();

  if (user.role !== "ADMIN") forbidden();
  return (
    <main className="flex h-full w-full items-center justify-center px-4">
      <h1 className="text-2xl font-bold">Admin Page</h1>
      <p>Welcome, {user.name || "Admin"}!</p>
      <p>
        This page is only accessible to users with the admin subscription plan.
      </p>
    </main>
  );
}
