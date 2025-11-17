'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Stampiamo solo testo "pulito"
  const msg = error?.message || 'Qualcosa è andato storto.';
  return (
    <html>
      <body style={{ padding: 24, color: '#fff', background: '#0f1216' }}>
        <h2 style={{ fontWeight: 900, marginBottom: 8 }}>Si è verificato un errore</h2>
        <p style={{ opacity: .8, marginBottom: 16 }}>{msg}</p>
        <button
          onClick={() => reset()}
          style={{
            padding: '10px 14px',
            borderRadius: 12,
            border: '1px solid #ffffff55',
            background: 'linear-gradient(90deg, #7A20FF, #20D27A)',
            color: '#0c0e11',
            fontWeight: 800,
            cursor: 'pointer'
          }}
        >
          Riprova
        </button>
      </body>
    </html>
  );
}