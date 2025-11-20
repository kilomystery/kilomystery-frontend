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

    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY mancante su server");
      return NextResponse.json(
        { error: "Mail service misconfigured" },
        { status: 500 }
      );
    }

    const result = await resend.emails.send({
      from: "Support KiloMystery <support@kilomystery.com>",
      to: ["gestionekilomystery@gmail.com"], // casella dove vuoi leggere i messaggi
      replyTo: [email],                      // così puoi fare “rispondi” al cliente
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

    // Se Resend risponde con errore lo logghiamo
    if ((result as any).error) {
      console.error("Resend error:", (result as any).error);
      return NextResponse.json(
        { error: "Mail provider error" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Contact API error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
