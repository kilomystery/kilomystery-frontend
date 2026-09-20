import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { POPORAMA_COOKIE, verifyPoporamaSession } from "@/app/lib/poporama-session";
import PoporamaSessionBoundary from "@/app/components/PoporamaSessionBoundary";

export const dynamic = "force-dynamic";

export default async function PoporamaLayout({ children, params }: {
  children: React.ReactNode; params: { lang: string };
}) {
  const expiresAt = await verifyPoporamaSession(cookies().get(POPORAMA_COOKIE)?.value);
  if (!expiresAt) redirect(`/${params.lang}/poporama-accesso`);
  return <PoporamaSessionBoundary lang={params.lang} expiresAt={expiresAt}>{children}</PoporamaSessionBoundary>;
}
