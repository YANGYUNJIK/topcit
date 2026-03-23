import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const password = body.password;

  if (password !== process.env.TEACHER_PASSWORD) {
    return NextResponse.json(
      { message: "비밀번호가 올바르지 않습니다." },
      { status: 401 },
    );
  }

  const response = NextResponse.json({ success: true });

  response.cookies.set("teacher-auth", "ok", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  return response;
}
