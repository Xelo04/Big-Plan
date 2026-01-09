import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cookies } from "next/headers";
import { ThemeProvider } from "@/src/components/ThemeProvider";
import { NotificationProvider } from "@/src/components/NotificationProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Big Plan",
  description: "Twój partner w inwestowaniu",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const initial =
    (cookieStore.get("theme")?.value as "dark" | "light") ?? undefined;

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider initialTheme={initial}>
          <NotificationProvider>{children}</NotificationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
