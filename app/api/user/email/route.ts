import { NextResponse } from "next/server";
import { z } from "zod";
import { hasValidOrigin } from "@/src/lib/utils/request";

const emailSchema = z.object({
  email: z.string().trim().email().max(254),
});

export async function POST(req: Request) {
  try {
    if (!hasValidOrigin(req)) {
      return NextResponse.json({ ok: false }, { status: 403 });
    }

    const contentLength = Number(req.headers.get("content-length"));
    if (Number.isFinite(contentLength) && contentLength > 4096) {
      return NextResponse.json({ ok: false }, { status: 413 });
    }

    const parsed = emailSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const res = NextResponse.json({ ok: true });
    const maxAge = 60 * 5; // 5 minutes
    res.cookies.set("temp_email", parsed.data.email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge,
    });
    return res;
  } catch (error) {
    console.error("Temporary email cookie error:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
