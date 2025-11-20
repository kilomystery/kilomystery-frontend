// app/api/contact/route.ts
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const data = await req.json();

    const name = (data.name || "").trim();
    const email = (data.email || "").trim();
    const subject = (data.subject || "").trim();
    const message = (data.message || "").trim();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      );
    }

    // oggetto “di default” se il campo subject è vuoto
    const effectiveSubject =
      subject || "Nuovo messaggio dal sito KiloMystery";

    // per evitare problemi di typing con reply_to usiamo `as any`
    await resend.emails.send({
      from: "Support KiloMystery <support@kilomystery.com>",
      to: ["gestionekilomystery@gmail.com"],
      // così quando clicchi "Rispondi" rispondi al cliente
      reply_to: email,
      subject: effectiveSubject,
      text: `
Nuovo messaggio dal sito KiloMystery

Nome: ${name}
Email: ${email}

Oggetto: ${subject || "(nessuno)"}

Messaggio:
${message}
      `,
      // se vuoi, puoi aggiungere qui anche html: "<p>…</p>"
    } as any);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Contact API error:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
