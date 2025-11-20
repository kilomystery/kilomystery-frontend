import { NextResponse } from "next/server";
import { Resend } from "resend";

// Client Resend (usa la tua API key da ENV)
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const data = await req.json();

    const name = (data.name || "").trim();
    const email = (data.email || "").trim();
    const subject = (data.subject || "").trim();
    const message = (data.message || "").trim();

    // Validazione base
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 },
      );
    }

    // INVIO EMAIL CON RESEND
    await resend.emails.send({
      // mittente: quello che vedrà il cliente quando ricevi la risposta
      from: "KiloMystery Support <support@kilomystery.com>",

      // destinatario interno: la casella dove vuoi ricevere i messaggi dal form
      to: ["gestionekilomystery@gmail.com"],

      // così quando clicchi "Rispondi" vai al cliente, non a te stesso
      replyTo: [email],

      subject: subject || "Nuovo messaggio dal sito KiloMystery",
      text: `
Nuovo messaggio dal sito KiloMystery:

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
      { status: 500 },
    );
  }
}
