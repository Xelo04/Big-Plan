import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ ok: false }, { status: 400 });

    const res = NextResponse.json({ ok: true });
    const maxAge = 60 * 5; // 5 minutes
    res.cookies.set("temp_email", email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge,
    });
    return res;
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
