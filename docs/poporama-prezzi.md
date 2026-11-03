# Prezzi POPORAMA, Listino e stampa

Il progetto usa Next.js 14 e metaobject Shopify: `poporama_lotto` e
`poporama_articolo`. Non esiste un database SQL locale. Importazione, ricerca,
numerazione PP, test e cassa continuano a usare gli stessi oggetti.

## Dati e compatibilità

- `retail`: Retail originale del manifest, usato esclusivamente come prezzo
  uscita Amazon e come eventuale base Retail. Non viene sostituito dal COGS.
- `costo_manifest`: COGS/COST unitario. Il costo effettivo del carico resta nei
  campi del lotto `costo_merce`, `costo_trasporto`, `altri_costi`, `costo_totale`.
- `condizione_originale`: condizione Amazon interna, conservata e mai stampata.
- `grado`: classificazione Poporama. N significa non testato.
- `prezzo_poporama`: prezzo finale salvato, condiviso con Listino, PDF e cassa.
- `risultati_test._poporamaPricing`: metadati versionati `{ version: 1, manual,
  rule: { base: "COGS" | "RETAIL", percentage } | null, valid }`.

Non serve una migrazione dello schema Shopify: i metadati usano il campo JSON
esistente, senza cancellare test o altri dati. Un JSON storico non costituito
da un oggetto viene preservato sotto `legacy`. Nessuna scrittura parte al solo
caricamento di una pagina. Non sono state eseguite modifiche sullo store reale
durante i test automatici.

I prezzi storici non riportano se fossero manuali o calcolati. Vengono quindi
protetti come manuali fino a cancellazione esplicita nel Test o sovrascrittura
esplicita nel Listino. Per applicare il nuovo criterio agli N già presenti,
selezionarli, scegliere COGS e 50%, verificare l’anteprima e abilitare la
sovrascrittura dei prezzi storici se desiderata.

## Calcolo

Ordine: prezzo manuale; regola specifica salvata sull’articolo (anche applicata a
un carico intero); percentuale del grado nel lotto; per N, fallback 50% del COGS.
I default A/B/C già esistenti sono conservati. La percentuale N è modificabile
nel listino del lotto; l’importazione ne carica il valore iniziale e permette
una percentuale specifica per i prodotti importati. Cambiare un default non
riscrive retroattivamente i prezzi già salvati: usare il pannello massivo.

Euro e percentuali ammettono virgola o punto e massimo due decimali; percentuali
0–100. Il calcolo percentuale usa interi/BigInt e arrotondamento half-up al
centesimo. Il CSV accetta anche importi come `1.234,56` e `1,234.56` per il COGS.
COGS vuoto o non valido resta assente; uno zero esplicito è un dato distinto.

Senza una base valida si salva la regola con `valid: false`, senza scrivere un
prezzo inventato. Se esisteva un importo precedente, resta conservato nel campo
Shopify ma viene escluso dal prezzo corrente. Listino e PDF indicano **Da
verificare**; la cassa richiede prima un prezzo valido. Un prezzo manuale può
risolvere il caso anche senza COGS.

## Listino e simulazione

Aprire `/{lang}/poporama-test/listino` dal nuovo pulsante della dashboard o dal
listino del lotto. Il pannello lavora sullo stock non venduto. Filtrare per
carico e/o N, selezionare tutti o singoli PP, scegliere base e percentuale,
generare l’anteprima e confermare il salvataggio. I prezzi manuali e storici
restano protetti salvo l’apposita scelta di sovrascrittura.

La conferma aggiorna solo prezzo, percentuale e metadati: non modifica test,
grado, condizioni, seriale o dati manifest. Gli ASIN non identificano una riga:
la selezione usa il GID Shopify e il salvataggio il PP univoco. La ricerca per
PP usa l’handle diretto con fallback agli handle storici.

La stampa rilegge i prezzi salvati e genera un PDF unico, una pagina A6 per PP,
con QR, grafica e identificativi esistenti. L’anteprima deve essere confermata
prima della stampa. Le sole intestazioni prezzo sono **Prezzo uscita Amazon**
e **Prezzo Poporama**. Per N compaiono N e **Non testato**.

La simulazione considera la selezione corrente (o la relativa anteprima):
quantità, totale IVA inclusa, imponibile, margine e articoli senza prezzo.
L’IVA stimata è modificabile, inizialmente 22%; imponibile = totale / (1 + IVA).
Il margine è l’imponibile stimato meno il costo acquisto inserito e gli eventuali
trasporto/altri costi salvati nel lotto. Se la selezione è parziale viene comunque
sottratto il costo intero del lotto. Per tutti i carichi il costo inserito è una
simulazione; selezionando un carico si può salvarne il costo merce tramite l’API
esistente, che ricalcola anche il costo totale.

Le scritture massive sono sequenziali e non sono una transazione: un errore
interrompe le righe successive e mostra quante sono state salvate. Il controllo
`updatedAt` rifiuta un’anteprima già superata al momento della rilettura. Shopify
non offre qui compare-and-set: resta una finestra di concorrenza tra lettura e
scrittura. Dopo un errore ricaricare e verificare una nuova anteprima.

## Verifica

```sh
npm test
npx tsc --noEmit --incremental false
npm run lint
npm run build
npm run dev
```

I test sono offline: simulano Shopify e coprono precedenze, cancellazione del
manuale, sovrascrittura esplicita, regole persistenti, protezione storici,
COGS assente/zero, arrotondamenti, IVA, ASIN duplicati, conservazione test,
autenticazione, venduti, anteprime superate, import e PDF A6 multipagina.
Non sostituiscono una verifica interattiva su uno store di prova.

Verifica manuale consigliata su dati di prova:

1. Creare un lotto e impostare N a 50 nelle sue percentuali. Importare un CSV
   con Retail `399,99`, COGS `100,01`, condizione `Customer Damage`: N deve avere
   prezzo `50,01`. Provare anche una riga senza COGS e due PP con ASIN uguale.
2. Nel Test salvare `149,90` come prezzo manuale. Riaprire la scheda e il Listino:
   entrambi devono conservare `149,90`. Il PDF deve avere uscita Amazon `399,99`.
3. Cancellare il manuale, salvare: deve tornare alla regola automatica (`50,01`
   nel caso iniziale), mantenendo Retail e condizione originale nel database.
4. Nel Listino selezionare il carico o solo N, scegliere Retail 40% e controllare
   `160,00` in anteprima. Confermare, ricaricare e verificare che resti salvato.
5. Ripetere con manuali: senza sovrascrittura restano protetti; con la scelta
   esplicita vengono sostituiti. La riga senza COGS deve restare da verificare
   quando la base scelta è COGS e non esiste un manuale.
6. Stampare la selezione in un PDF unico: una pagina A6 per PP, nessuna condizione
   Amazon, QR/seriale presenti, diciture prezzo corrette, N con Non testato.
7. Inserire il costo reale del carico, salvarlo e controllare la simulazione;
   con prezzi lordi `122 + 122`, IVA 22% e costo totale `100`, l’imponibile è
   `200` e il margine `100`. Il COGS non entra nel costo acquisto della simulazione.

## File interessati

- `app/lib/poporama-pricing.ts`: nuove funzioni `moneyOrNull`, `parseManifestMoney`,
  `resolvePrice`, `pricingInfo`, `readPricing`, `testDocument`, `simulateRevenue`.
- `app/[lang]/poporama-test/listino/page.tsx`: nuovo pannello, anteprima,
  salvataggio, simulazione e PDF unico.
- `app/api/poporama/articoli/[code]/test/route.ts`: prezzo manuale, reset,
  aggiornamento dei soli prezzi, controllo anteprima e conservazione test.
- `app/api/poporama/articoli/route.ts`: import COGS, metadati, prezzi validi,
  lettura completa per il Listino e recupero import.
- `app/api/poporama/lotti/route.ts`: nuovo default N 50 e fallback in lettura.
- `app/api/poporama/lotti/[handle]/articoli/route.ts`: provenienza e validità prezzi.
- `app/components/PoporamaLabelPdf.ts`: diciture, privacy delle condizioni,
  simbolo euro e spaziatura dei seriali nelle etichette con difetti.
- `app/[lang]/poporama-test/articoli/[code]/test/page.tsx`: input manuale/reset,
  anteprima coerente con il server, COGS e segnalazione prezzo mancante.
- `app/[lang]/poporama-test/lotti/[handle]/importa/page.tsx`: COGS/COST,
  anteprime corrette e percentuale N dalle impostazioni.
- `app/[lang]/poporama-test/lotti/[handle]/page.tsx`: link al pannello e PDF.
- `app/[lang]/poporama-test/etichette-test/page.tsx`: validità prezzi nei PDF.
- `app/[lang]/poporama-test/page.tsx`: accesso al Listino dalla dashboard.
- `app/api/poporama/cassa/route.ts` e
  `app/[lang]/poporama-test/cassa/page.tsx`: gestione articoli senza prezzo valido.
- `app/lib/poporama-dashboard.ts`: esclusione importi non validi dallo stock stimato.
- `tests/poporama-pricing.test.cjs`, `package.json`: test ripetibili con `npm test`.
- `docs/poporama-prezzi.md`: questa guida.

## Campo prezzo nella schermata Test

Componente effettivo: `app/[lang]/poporama-test/articoli/[code]/test/page.tsx`.
Dal lotto aprire il pulsante Test del PP oppure visitare
`/it/poporama-test/articoli/PP-000001/test` (con un PP esistente).
Nella sezione 05, **Prezzo POPORAMA**, il campo **Prezzo Poporama (€)** è
accanto alla percentuale, evidenziato con un bordo giallo. È editabile anche
per i prodotti storici: non è più l’anteprima in sola lettura. Digitare, per
esempio, `149,90` e premere **SALVA TEST** o **SALVA CLASSIFICAZIONE**.
Il pulsante **Ripristina prezzo automatico** elimina l’override nel modulo e
mostra il prezzo ricalcolato; premere Salva per rendere persistente il ripristino.
Il Retail originale non cambia.

La verifica nel browser è ripetibile con:

```sh
npm run build
npm run test:ui
```

Richiede Google Chrome locale (o `CHROME_PATH` impostato al suo eseguibile) e
la possibilità di aprire porte localhost. Usa il pacchetto WebSocket incluso
in Next, senza nuove dipendenze. Il test avvia il sito reale su una porta
locale libera con un profilo Chrome temporaneo e credenziali di prova; le API
reali leggono e scrivono una fixture Shopify in memoria, senza collegamenti
allo store reale. Verifica rendering desktop/mobile, prezzo con virgola,
salvataggio/riapertura/modifica su prodotto storico, Listino, PDF scaricato e
ripristino automatico persistente. Screenshot, PDF e log sono salvati nella
cartella temporanea indicata dal test. I due file sono
`tests/poporama-test-ui.cjs` e `tests/helpers/poporama-shopify-fixture.cjs`.
