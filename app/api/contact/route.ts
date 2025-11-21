import { NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs"; // assicuriamoci runtime Node

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    // 1. Controllo chiave
    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY non impostata su Vercel");
      return NextResponse.json(
        { error: "Mail service not configured" },
        { status: 500 }
      );
    }

    // 2. Parse body
    const data = await req.json();
    const name = (data.name ?? "").trim();
    const email = (data.email ?? "").trim();
    const subject = (data.subject ?? "").trim();
    const message = (data.message ?? "").trim();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      );
    }

    // 3. INVIO MAIL – versione che sappiamo funzionare
    const result = await resend.emails.send({
      // mittente "sicuro" di Resend (quello che funzionava prima)
      from: "KiloMystery <onboarding@resend.dev>",

      // casella dove vuoi leggere i messaggi
      to: ["gestionekilomystery@gmail.com"],

      // così quando fai “Rispondi” rispondi al cliente
      replyTo: [email],

      subject:
        subject || "Nuovo messaggio dal sito KiloMystery",

      text: `
Nuovo messaggio dal sito KiloMystery:

Nome: ${name}
Email: ${email}

Oggetto: ${subject || "(nessuno)"}

Messaggio:
${message}
      `,
    });

    console.log("Resend result:", result);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Contact API error:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
