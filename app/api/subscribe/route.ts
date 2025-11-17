// app/api/subscribe/route.ts
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json(
        { ok: false, error: "invalid-email" },
        { status: 400 }
      );
    }

    const to = process.env.NEWSLETTER_TO || "kilomystery2025@gmail.com";
    const from = process.env.NEWSLETTER_FROM || "newsletter@kilomystery.com";

    // Invia una mail a te con il nuovo iscritto
    await resend.emails.send({
      from,
      to,
      subject: "Nuova iscrizione newsletter Kilomystery",
      text: `Nuovo iscritto: ${email}`,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Newsletter subscribe error", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
