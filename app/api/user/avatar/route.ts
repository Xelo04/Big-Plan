import { NextResponse } from "next/server";
import crypto from "crypto";
import { getSession } from "@/src/lib/auth/get-session";
import { getSupabaseAdmin } from "@/src/lib/db/supabase";

const MAX_BYTES = 20 * 1024 * 1024; // 20MB

const ALLOWED_MIMES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
]);

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/svg+xml": "svg",
};

function safeBasename(name?: string) {
  if (!name) return "";
  return name.replace(/\s+/g, "_").replace(/[^A-Za-z0-9._-]/g, "");
}

function shortHash(len = 8) {
  return crypto
    .randomBytes(Math.ceil(len / 2))
    .toString("hex")
    .slice(0, len);
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Brak aktywnej sesji. Zaloguj się ponownie." },
        { status: 401 },
      );
    }
    const userId = session.user.id;

    const ct = (req.headers.get("content-type") || "").toLowerCase();
    if (!ct.startsWith("multipart/form-data")) {
      return NextResponse.json(
        { error: "Wystąpił błąd z przesyłaniem danych. Spróbuj ponownie." },
        { status: 415 },
      );
    }

    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) {
      return NextResponse.json(
        { error: "Brak pliku do przesłania." },
        { status: 400 },
      );
    }

    const mime = (file.type || "").toLowerCase();
    if (!ALLOWED_MIMES.has(mime)) {
      return NextResponse.json(
        {
          error: "Nieobsługiwany typ pliku. Dozwolone: jpg, png, webp, svg.",
        },
        { status: 400 },
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (buffer.byteLength > MAX_BYTES) {
      return NextResponse.json(
        { error: "Plik jest za duży. Maksymalny rozmiar to 20 MB." },
        { status: 413 },
      );
    }

    const ext = MIME_TO_EXT[mime] ?? "png";
    const namePart = safeBasename(file.name).slice(0, 80);
    const filename = `${Date.now()}-${shortHash(8)}${
      namePart ? "-" + namePart : ""
    }.${ext}`;
    const filePath = `${userId}/${filename}`;

    const supabase = getSupabaseAdmin();

    // 1. CZYSZCZENIE: Usunięcie starych avatarów z folderu użytkownika w Storage
    const { data: existingFiles } = await supabase.storage
      .from("avatars")
      .list(userId);

    if (existingFiles && existingFiles.length > 0) {
      const filesToRemove = existingFiles.map((f) => `${userId}/${f.name}`);
      await supabase.storage.from("avatars").remove(filesToRemove);
    }

    // 2. UPLOAD: Wgranie nowego pliku
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, buffer, {
        contentType: mime,
        upsert: true,
      });

    if (uploadError) {
      console.error("Supabase storage upload error:", uploadError);
      return NextResponse.json(
        { error: "Nie udało się zapisać pliku w chmurze." },
        { status: 500 },
      );
    }

    const { data: publicUrlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    const publicUrl = publicUrlData.publicUrl;

    const { error: dbError } = await supabase
      .from("user")
      .update({ image: publicUrl, updatedAt: new Date().toISOString() })
      .eq("id", userId);

    if (dbError) {
      console.error("DB update image error:", dbError);
      return NextResponse.json(
        { error: "Nie udało się zaktualizować profilu w bazie." },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true, url: publicUrl }, { status: 201 });
  } catch (err) {
    console.error("Avatar upload endpoint error:", err);
    return NextResponse.json(
      { error: "Wystąpił błąd serwera." },
      { status: 500 },
    );
  }
}
