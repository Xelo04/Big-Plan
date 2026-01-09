import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import prisma from "@/src/lib/prisma";

/* Maksymalny rozmiar uploadu */
const MAX_BYTES = 20 * 1024 * 1024; // 20MB

/* Dozwolone MIME types obrazów */
const ALLOWED_MIMES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
]);

/* Mapowanie MIME -> rozszerzenie pliku */
const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/svg+xml": "svg",
};

/* Bezpieczne oczyszczenie nazwy pliku (usuwa niewłaściwe znaki) */
function safeBasename(name?: string) {
  if (!name) return "";
  return path
    .basename(name)
    .replace(/\s+/g, "_")
    .replace(/[^A-Za-z0-9._-]/g, ""); // usuń podejrzane znaki
}

/* Krótki losowy hash używany w nazwie pliku */
function shortHash(len = 8) {
  return crypto
    .randomBytes(Math.ceil(len / 2))
    .toString("hex")
    .slice(0, len);
}

/*
  Próba uzyskania ID użytkownika ze stosowanego w projekcie helpera sesji.
  Szuka kolejno: src/lib/get-session, następnie src/lib/auth.
  Funkcja powinna zwracać null jeśli nie uda się ustalić użytkownika.
*/
async function resolveServerUserId() {
  try {
    const mod = await import("@/src/lib/get-session");
    if (typeof mod.getSession === "function") {
      const session = await mod.getSession();
      return session?.user?.id ?? null;
    }
  } catch {
    // ignoruj jeśli moduł nie istnieje
  }
  return null;
}

/*
  Endpoint POST /api/user/avatar
  - oczekuje multipart/form-data z polem "file"
  - wymaga aktywnej sesji (resolveServerUserId)
  - waliduje typ i rozmiar pliku
  - zapisuje plik atomowo do public/uploads/avatars/<userId>/
  - aktualizuje pole image w tabeli użytkownika (prisma)
  - zwraca URL do pliku lub komunikat o błędzie (PL)
*/
export async function POST(req: Request) {
  try {
    // ustal użytkownika z sesji (bez akceptowania userId z klienta)
    const sessionUserId = await resolveServerUserId();
    if (!sessionUserId) {
      return NextResponse.json(
        { error: "Brak aktywnej sesji. Zaloguj się ponownie." },
        { status: 401 }
      );
    }
    const userId = String(sessionUserId);

    // sprawdź Content-Type
    const ct = (req.headers.get("content-type") || "").toLowerCase();
    if (!ct.startsWith("multipart/form-data")) {
      return NextResponse.json(
        { error: "Wystąpił błąd z przesyłaniem danych. Spróbuj ponownie." },
        { status: 415 }
      );
    }

    // pobierz dane formularza i plik
    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file)
      return NextResponse.json(
        { error: "Brak pliku do przesłania." },
        { status: 400 }
      );

    // walidacja MIME
    const mime = (file.type || "").toLowerCase();
    if (!ALLOWED_MIMES.has(mime)) {
      return NextResponse.json(
        {
          error:
            "Nieobsługiwany typ pliku. Dozwolone: jpg, png, webp, gif, svg, avif.",
        },
        { status: 400 }
      );
    }

    // walidacja rozmiaru
    const size =
      typeof file.size === "number"
        ? Number(file.size)
        : Number((await file.arrayBuffer()).byteLength);
    if (size > MAX_BYTES) {
      return NextResponse.json(
        { error: "Plik jest za duży. Maksymalny rozmiar to 20 MB." },
        { status: 413 }
      );
    }

    // przygotuj bufor i nazwę pliku
    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = MIME_TO_EXT[mime] ?? "png";
    const namePart = safeBasename(file.name).slice(0, 80); // limit długości
    const filename = `${Date.now()}-${shortHash(8)}${
      namePart ? "-" + namePart : ""
    }.${ext}`;

    // katalog docelowy: public/uploads/avatars/<userId>/
    const uploadsDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      "avatars",
      userId
    );
    await fs.mkdir(uploadsDir, { recursive: true, mode: 0o755 });
    const filePath = path.join(uploadsDir, filename);

    // atomiczny zapis (tmp -> rename)
    const tmpPath = filePath + ".tmp";
    await fs.writeFile(tmpPath, buffer, { flag: "w" });
    await fs.rename(tmpPath, filePath);

    // publiczny URL do pliku
    const publicUrl = `/uploads/avatars/${encodeURIComponent(
      userId
    )}/${encodeURIComponent(filename)}`;

    // aktualizacja rekordu użytkownika w DB (prisma)
    await prisma.user.update({
      where: { id: String(userId) },
      data: { image: publicUrl },
    });

    return NextResponse.json({ ok: true, url: publicUrl }, { status: 201 });
  } catch (err) {
    const error = err as Error;
    console.error("avatar upload error:", err);
    const message = error?.message ?? "Wystąpił błąd serwera.";
    const status = /unauthor/i.test(message) ? 401 : 500;
    // zwróć surową wiadomość (można tu dodatkowo mapować na PL jeśli potrzebne)
    return NextResponse.json({ error: message }, { status });
  }
}
