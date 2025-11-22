import { NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY non impostata su Vercel");
      return NextResponse.json(
        { error: "Mail service not configured" },
        { status: 500 }
      );
    }

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

    const { data: sent, error } = await resend.emails.send({
      // Mittente consentito da Resend finché il dominio non è verificato
      from: `KiloMystery Form <onboarding@resend.dev>`,

      // Tutte le mail del form arrivano qui
      to: ["gestionekilomystery@gmail.com"],

      // Quando fai "Rispondi" vai direttamente al cliente
      replyTo: [email],

      subject: subject || `Nuovo messaggio dal sito KiloMystery`,
      text: `
Nuovo messaggio dal sito KiloMystery:

Nome: ${name}
Email: ${email}

Oggetto: ${subject || "(nessuno)"}

Messaggio:
${message}
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: error.message ?? "Email not sent" },
        { status: 500 }
      );
    }

    console.log("Resend email sent:", sent);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Contact API error:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
