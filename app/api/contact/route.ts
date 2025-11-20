import { NextResponse } from "next/server";
import { Resend } from "resend";

// Client Resend
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

    const { data: resendData, error } = await resend.emails.send({
      // Mittente “sicuro” che già funzionava
      from: "KiloMystery <onboarding@resend.dev>",

      // Dove vuoi ricevere ora i messaggi del form
      to: "gestionekilomystery@gmail.com",

      // niente replyTo per ora → meno possibilità di errore
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

    if (error) {
      console.error("Resend send error:", error);
      return NextResponse.json(
        { error: "Email send error" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, id: resendData?.id ?? null });
  } catch (err) {
    console.error("Contact API error:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
