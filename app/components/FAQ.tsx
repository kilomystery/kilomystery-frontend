export default function FAQ() {
  return (
    <section id="faq" className="container py-14">
      <h2 className="text-3xl md:text-4xl font-extrabold mb-4">FAQ</h2>

      <div className="space-y-3">
        <details className="card">
          <summary className="cursor-pointer text-lg font-bold">
            Cosa c’è nelle mystery box?
          </summary>
          <div className="mt-3 text-white/80 leading-relaxed">
            Mix di prodotti provenienti da stock e resi, selezionati e sigillati in lotti.
            Ogni box è una sorpresa: elettronica, accessori, piccoli gadget, ecc.
          </div>
        </details>

        <details className="card">
          <summary className="cursor-pointer text-lg font-bold">
            Posso scegliere la categoria?
          </summary>
          <div className="mt-3 text-white/80">
            No, per mantenere il prezzo basso e l’effetto sorpresa la selezione è casuale.
            La versione Premium ha qualità media superiore.
          </div>
        </details>

        <details className="card">
          <summary className="cursor-pointer text-lg font-bold">
            Tempi di spedizione?
          </summary>
          <div className="mt-3 text-white/80">
            Generalmente 72h (UE). Ti invieremo email con tracking appena pronto.
          </div>
        </details>

        <details className="card">
          <summary className="cursor-pointer text-lg font-bold">
            Resi/garanzia?
          </summary>
          <div className="mt-3 text-white/80">
            Le box sono a sorpresa. Se il collo arriva danneggiato, contattaci entro 48h
            con foto del pacco per l’apertura di una pratica.
          </div>
        </details>
      </div>
    </section>
  );
}