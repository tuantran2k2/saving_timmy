import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  const correct = process.env.APP_PASSWORD;

  if (!correct || password !== correct) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set("app_unlocked", "1", {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 2, // 2 giờ
    path: "/",
  });
  return res;
}
