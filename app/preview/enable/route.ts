// app/preview/enable/route.ts
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const res = NextResponse.redirect(new URL("/", req.url));

  res.cookies.set("km_preview", "1", {
    httpOnly: true,
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 24, // 1 giorno
  });

  return res;
}
