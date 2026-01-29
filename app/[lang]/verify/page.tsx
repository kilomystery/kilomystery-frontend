import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import VerifyForm from "./VerifyForm";

export default function VerifyPage({ params }: { params: { lang: string } }) {
  const lang = (params?.lang || "it") as any;
  return (
    <>
      <Header lang={lang} />
      <main className="container py-10">
        <div className="card border-white/15 bg-[#0b0f14]/60 p-6">
          <h1 className="text-2xl font-bold">Verifica</h1>
          <p className="mt-2 text-white/70">
            Inserisci il codice lotto presente sull’etichetta.
          </p>
          <div className="mt-6">
            <VerifyForm lang={lang} />
          </div>
        </div>
      </main>
      <Footer lang={lang} />
    </>
  );
}
