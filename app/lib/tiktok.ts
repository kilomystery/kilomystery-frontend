// app/lib/tiktok.ts
type TTQ = {
  track?: (event: string, payload?: any) => void;
  page?: () => void;
};

function getConsent(): boolean {
  // stesso cookie che già usi
  if (typeof document === "undefined") return false;
  const m = document.cookie.match(/(?:^|;\s*)km_cookie_consent=([^;]+)/);
  const consent = m ? decodeURIComponent(m[1]) : "";
  return consent === "accept";
}

async function waitForTTQ(timeoutMs = 4000): Promise<TTQ | null> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const ttq = (window as any).ttq as TTQ | undefined;
    if (ttq?.track) return ttq;
    await new Promise((r) => setTimeout(r, 50));
  }
  return null;
}

export async function ttqTrack(event: string, payload?: any) {
  if (typeof window === "undefined") return;
  if (!getConsent()) return; // blocca TUTTO se non accettano

  const ttq = (window as any).ttq as TTQ | undefined;
  if (ttq?.track) {
    ttq.track(event, payload);
    return;
  }

  const late = await waitForTTQ();
  late?.track?.(event, payload);
}
