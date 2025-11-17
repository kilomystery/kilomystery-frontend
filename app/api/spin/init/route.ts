import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function GET() {
  const secret = process.env.SPIN_SECRET || "dev-secret";
  const token = jwt.sign(
    { createdAt: Date.now() },
    secret,
    { expiresIn: "10m" }
  );
  return NextResponse.json({ token });
}