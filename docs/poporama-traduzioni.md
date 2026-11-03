# Importazione automatica e titoli italiani

## Uso

Aprire il carico e scegliere **Importa manifest**. Selezionare CSV, XLS o XLSX:
la lettura, l’invio a blocchi, l’importazione e la traduzione partono da soli.
Non ci sono anteprime di traduzione, revisioni di righe o conferme per articolo.
La pagina mostra l’avanzamento e, alla fine, importati / tradotti / non tradotti.

Per gli articoli già presenti usare **Traduci nomi mancanti**, disponibile nel
Listino e nella pagina d’importazione. Nel Listino la selezione del carico limita
anche questo comando; senza un carico selezionato considera tutti i carichi.
I titoli già tradotti e quelli corretti manualmente vengono conservati.

Per correggere un titolo aprire la **scheda articolo**,
`/{lang}/poporama-test/articoli/{PP}`: subito dopo l’identificazione è presente
**Nome italiano del prodotto**, con il nome originale Amazon e il pulsante
**Salva nome italiano**. Questa è una modifica facoltativa successiva
all’importazione, non un passaggio obbligatorio del flusso.

Il nome italiano viene letto automaticamente da Listino, Test, dashboard, cassa
e PDF. Se non è disponibile viene usato l’originale. Il Retail resta separato da
COGS e prezzo manuale. Le etichette A6 mantengono **Prezzo Poporama** principale,
**Prezzo uscita Amazon** con caratteri più evidenti e l’**LPN completo**, senza
troncarlo e senza stampare la condizione Amazon.

## Configurazione server

Il progetto non conteneva un servizio di traduzione né supporto Excel. Ora usa
DeepL per la traduzione e SheetJS per leggere XLS/XLSX. Configurare nel server
(o in `.env.local` in sviluppo), mai come `NEXT_PUBLIC_*`:

```dotenv
DEEPL_API_KEY=chiave-del-proprio-account
DEEPL_API_FREE=false
POPORAMA_WORKER_SECRET=segreto-casuale-di-almeno-32-caratteri
POPORAMA_WORKER_URL=http://localhost:3000
```

Il secret del worker deve essere lo stesso nel sito e nel processo worker;
l’URL deve essere l’indirizzo del sito raggiungibile dal worker. Il codice
sceglie l’endpoint Free anche quando la chiave termina in `:fx`.
Le chiavi non vengono inviate al browser, salvate nei lavori o stampate nei log.
Se DeepL non è configurato, gli articoli vengono importati comunque con il nome
originale e lo stato interno `failed`; il riepilogo li conta come non tradotti.
Dopo la configurazione usare **Traduci nomi mancanti**.

Al primo avvio di un lavoro vengono create, se assenti, tre definizioni Shopify
private, tutte con il campo JSON `data`:

- `poporama_import_job`: avanzamento, range PP e contatori;
- `poporama_import_chunk`: righe manifest o identificativi da tradurre;
- `poporama_translation_cache`: traduzioni ed errori con data di ritentativo.

Servono gli scope Shopify `read_metaobjects`, `write_metaobjects`,
`read_metaobject_definitions` e `write_metaobject_definitions`. Le definizioni
sono create in modo idempotente e con Storefront `NONE`. Se un tipo omonimo è
incompatibile o pubblico, la configurazione si ferma senza modificarlo. Nessuna
migrazione cancella prodotti, prezzi, note o test già presenti. Non è stato
modificato lo store reale durante i test di sviluppo.

## Elaborazione anche a pagina chiusa

Con la pagina aperta il browser fa avanzare automaticamente lo stesso lavoro
persistente con richieste brevi. Per proseguire **anche a pagina chiusa**,
avviare un singolo processo server supervisionato:

```sh
npm run build
npm start
# In un secondo processo, con le stesse variabili server:
npm run worker:poporama
```

Lo script carica `.env.local` se esiste e richiama
`POST /api/poporama/jobs/run` con il secret nell’header Bearer. In hosting si può
usare un processo persistente o uno scheduler esterno che richiami lo stesso
endpoint (anche GET), con autenticazione Bearer. La frequenza dipende dal volume:
il worker incluso effettua una chiamata alla volta e attende tra le richieste.
Non vengono avviati processi nascosti dal browser. Senza worker/scheduler,
chiudere la pagina sospende l’elaborazione; riaprirla recupera automaticamente
il checkpoint. Non è necessario riapprovare gli articoli.

I blocchi devono prima essere ricevuti interamente dal server. Durante l’upload
le righe sono conservate anche in IndexedDB: riaprire la pagina sullo stesso
browser riprende l’invio. Se i dati del browser vengono cancellati prima della
fine dell’upload, selezionare nuovamente lo stesso file: il digest riprende lo
stesso lavoro senza duplicare i prodotti. Un file identico nello stesso carico
non viene reimportato dopo il completamento; per un nuovo carico usare un lotto
distinto.

## Dati e priorità

`nome_prodotto` conserva sempre il titolo originale usato dall’importazione e
anche dal confronto per recuperare righe già create. Nel campo JSON esistente
`risultati_test._poporamaTitle` si salvano:

```json
{
  "version": 1,
  "original": "Titolo Amazon",
  "italian": "Titolo italiano",
  "status": "translated | manual | failed",
  "error": "Solo in caso di errore",
  "updatedAt": "Data ISO"
}
```

Le normalizzazioni delle API espongono `nomeProdotto` come italiano, se presente,
oltre a `nomeOriginale`, `nomeItaliano`, `statoTraduzione`, `erroreTraduzione`.
La cache usa SHA-256 del titolo originale normalizzato per spazi e Unicode,
non ASIN: prodotti diversi con lo stesso ASIN mantengono PP e LPN distinti.
Un titolo identico riusa la traduzione anche fra carichi diversi. Le correzioni
manuali sono per singolo articolo e non modificano automaticamente gli altri.
I prezzi e i risultati dei test sono preservati quando viene aggiornato il nome;
il salvataggio del Test conserva a sua volta i metadati del titolo.

DeepL traduce frasi intere. Marchi iniziali, sigle, modelli, numeri e unità tecniche
riconosciuti sono protetti con tag XML ignorati dal traduttore. La risposta viene
controllata per la presenza dei frammenti protetti e per i dati numerici: se non
coincidono, si conserva l’originale con errore interno. Non vengono aggiunte
caratteristiche da cataloghi esterni. Il codice non usa un dizionario di
sostituzioni parola per parola. Come per ogni servizio linguistico, la qualità
semantica dipende dal titolo sorgente e dal servizio: le correzioni successive
restano sempre disponibili, senza imporre una revisione durante l’importazione.

## Volumi, retry e recupero

- File fino a 25 MB e 100.000 righe; CSV conserva il parser precedente, XLS/XLSX
  leggono tutti i fogli che contengono una colonna titolo riconosciuta.
- Upload in blocchi da 100 righe, immutabili dopo la registrazione.
- Allocazione PP e ricerca dei titoli mancanti paginate, con cursori persistenti.
- Import in gruppi fino a 10 articoli per richiesta, con checkpoint dopo ogni PP.
- Traduzioni deduplicate, al massimo 20 titoli per richiesta DeepL e gruppi
  ulteriormente divisi secondo i byte effettivi, inclusi i tag XML.
- DeepL: massimo tre tentativi brevi per chiamata su 429/5xx; rispetto di
  `Retry-After`. Gli errori vengono memorizzati con backoff e non bloccano l’import.
- Shopify: gestione 429 e `THROTTLED`, backoff e budget complessivo della singola
  fase. Una richiesta interrotta riprende dal checkpoint: non è un unico
  processo HTTP che deve durare per tutto il manifest.
- La traduzione di un titolo fallito viene ritentata una volta per lavoro
  “Traduci nomi mancanti”; i duplicati dello stesso lavoro riusano anche l’esito
  negativo, evitando tempeste di richieste.

L’allocazione e l’esecuzione vengono serializzate con un lease Shopify a handle
unico. Il massimo PP prenotato viene scritto prima del lavoro: un’interruzione
può lasciare un buco nella numerazione, ma non riutilizzare un PP già riservato.
Gli articoli usano esclusivamente `metaobjectCreate`, mai upsert. Se una
creazione è riuscita ma il checkpoint non è arrivato, il recupero considera la
riga già creata solo quando coincidono lotto e dati originali del manifest;
non sovrascrive prezzi o test. Anche i precedenti piani firmati presenti nel
browser vengono adottati con il loro range originale. Piani incompatibili o
non firmati vengono segnalati senza avviare un secondo import duplicato.

Un errore transitorio riparte automaticamente. Un conflitto reale o dati non
validi interrompono il lavoro con l’indicazione dell’errore e dei conteggi
parziali; dopo aver risolto la causa è disponibile **Riprendi elaborazione dal
checkpoint**. Non vengono saltate silenziosamente righe. Il worker va eseguito
come processo singolo; Shopify non fornisce compare-and-set sul JSON degli
articoli. Le traduzioni rileggono il record prima di scrivere per rispettare le
correzioni manuali. Rimane il limite di concorrenza della piattaforma per
modifiche simultanee dello stesso record tra lettura e scrittura.

## Verifiche ripetibili

```sh
npm test
npx tsc --noEmit --incremental false
npm run lint
npm run build
npm run test:ui
npm run test:ui:translation
```

I test non contattano store o traduttori reali. Comprendono:

- parsing CSV e Excel con 5.000 righe, zeri iniziali e LPN distinti;
- import completo di 5.000 prodotti, anche con ASIN ripetuti;
- 100 titoli distinti ripetuti nel manifest: soltanto 100 testi inviati al provider;
- interruzione dopo la creazione e prima del checkpoint, senza duplicati;
- recupero di un vecchio piano firmato conservando il prezzo già salvato;
- limite dei byte con titoli ricchi di tag XML, retry 429 e quota esaurita;
- servizio non configurato, conservazione dell’originale e retry successivo;
- correzioni manuali e comando per i nomi mancanti;
- PDF A6 con nome italiano, prezzi corretti, LPN completo e condizioni interne assenti;
- browser reale: selezione file senza conferme, import, Test, PDF, scheda e Listino.

I test browser richiedono Chrome (`CHROME_PATH` per un percorso diverso) e porte
localhost disponibili. I dati dei servizi sono simulati, ma il sito, le API,
la compilazione e il PDF scaricato sono quelli reali del progetto. Per la
verifica linguistica con il proprio account configurare la chiave DeepL su uno
store di prova; nessuna chiave è stata richiesta o inserita nel frontend.

## File principali

- `app/[lang]/poporama-test/lotti/[handle]/importa/page.tsx`: nuovo flusso automatico.
- `app/lib/poporama-manifest-csv.ts`, `poporama-manifest.ts`: parser riusato e Excel.
- `app/lib/poporama-import-jobs.ts`, `poporama-job-store.ts`, `poporama-shopify.ts`:
  coda persistente, schema privato, checkpoint, lease e accesso Shopify.
- `app/lib/poporama-import-context.ts`: riuso della creazione articoli senza
  riscaricare tutto lo stock per ogni riga.
- `app/lib/poporama-translation.ts`, `poporama-titles.ts`, `poporama-retry.ts`:
  servizio, cache, protezione tecnica, proiezione dei nomi e backoff.
- `app/lib/poporama-job-client.ts`, `poporama-job-http.ts`: upload riprendibile e API.
- `middleware.ts`, `app/lib/poporama-worker-auth.ts`: autenticazione server/Edge
  del solo endpoint worker, senza esporre il secret ai componenti client.
- `app/api/poporama/manifest/parse/route.ts`, `jobs/**/route.ts`: parsing e lavori.
- `app/api/poporama/articoli/[code]/titolo/route.ts`: correzione manuale.
- `app/components/PoporamaJobProgress.tsx`, `PoporamaTranslateMissing.tsx`: avanzamento
  e comando automatico per gli articoli esistenti.
- API articoli, Test, articoli del lotto e cassa; `poporama-dashboard.ts`:
  lettura coerente del nome italiano.
- Scheda articolo, Test, Listino, lotto, etichette-test e `PoporamaLabelPdf.ts`:
  modifica del nome, comando traduzione, LPN e prezzi nelle etichette.
- `scripts/poporama-worker.cjs`, `.env.example`, `package.json`, `package-lock.json`:
  processo worker, configurazione e dipendenza SheetJS.
- `tests/poporama-translation.test.cjs`, `tests/helpers/poporama-translation-fixture.cjs`,
  `tests/poporama-test-ui.cjs`, `tests/poporama-pricing.test.cjs`: regressioni e volumi.

Riferimenti ufficiali usati per l’integrazione:
[DeepL traduzione](https://developers.deepl.com/api-reference/translate/request-translation),
[DeepL XML](https://developers.deepl.com/docs/translate/translating-xml),
[Shopify definizioni](https://shopify.dev/docs/api/admin-graphql/2026-07/mutations/metaobjectDefinitionCreate),
[Shopify paginazione](https://shopify.dev/docs/api/admin-graphql/2026-07/queries/metaobjects),
[SheetJS](https://docs.sheetjs.com/docs/getting-started/installation/nodejs/).
