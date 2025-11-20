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

    await resend.emails.send({
      // mittente: dominio gestito da Resend (subdominio "send")
      from: "KiloMystery Support <support@send.kilomystery.com>",

      // destinatario interno: la casella che vuoi leggere tu
      to: ["support@kilomystery.com"],

      // così quando clicchi "Rispondi" va al cliente
      replyTo: email,

      subject: subject || "Nuovo messaggio dal sito KiloMystery",
      text: `
Nuovo messaggio dal sito:

Nome: ${name}
Email: ${email}

Oggetto: ${subject || "(nessuno)"}

Messaggio:
${message}
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Contact API error:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
