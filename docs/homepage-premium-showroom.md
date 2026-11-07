# Homepage premium e showroom

Branch: `feat/homepage-premium-showroom`. Nessuna pubblicazione o modifica alla configurazione di Vercel o Shopify.

## Anteprima e confronto

Dalla branch del restyling:

```sh
npm run dev
```

Aprire `http://localhost:3000/it` e provare la selezione delle scatole, i pesi, “Scopri la box” e il carrello. Sono mantenute anche `/en`, `/es`, `/fr`, `/de`.

Per confrontare con la versione precedente, fermare il server, passare a `main` e riavviare `npm run dev`. Tornare alla branch del restyling per continuare le modifiche. Il diff è consultabile con:

```sh
git diff main...feat/homepage-premium-showroom
```

Anteprime della build verificata (i prezzi fotografati possono cambiare nel catalogo):

- [Hero desktop](previews/homepage/desktop-hero.png)
- [Showroom desktop](previews/homepage/desktop-showroom.png)
- [Hero mobile](previews/homepage/mobile-hero.png)
- [Dettagli e acquisto mobile](previews/homepage/mobile-details.png)

## Ambito

- Nuova hero cinematografica, menu essenziale, lingue e carrello esistente.
- Showroom Standard/Premium con prospettiva CSS 3D, ombre, risposta al puntatore, transizioni Framer Motion, apertura del coperchio e luce. Su mobile: tocco, swipe e dettagli sotto la scena. Tutti i controlli usano pulsanti nativi; supporto `prefers-reduced-motion`.
- Packaging illustrativo con il logo esistente, esplicitamente indicato come tale. Nessun oggetto mostrato come contenuto garantito.
- Selezione 1/2/3/5/10 kg, prezzi reali, varianti esaurite disabilitate, controllo della disponibilità e del prezzo anche immediatamente prima dell'aggiunta. Se il prezzo cambia viene richiesta una nuova aggiunta dopo la revisione della selezione; se il catalogo è indisponibile l'acquisto viene disabilitato con possibilità di riprovare.
- Le sezioni già presenti nella homepage (come funziona, unboxing, live, sostenibilità, FAQ, eventi, contatto, newsletter e footer) sono conservate. Le immagini degli unboxing usano `next/image`.
- CSS isolato sulla homepage; nessun restyling delle altre route o dei componenti condivisi. Metadati e URL esistenti conservati.

## File principali

| File | Funzione |
| --- | --- |
| `app/[lang]/page.tsx` | Montaggio della nuova homepage e mantenimento delle sezioni esistenti |
| `app/components/home/PremiumHomeIntro.tsx` | Header e hero |
| `app/components/home/MysteryShowroom.tsx` | Packaging, scena, selezione e aggiunta al carrello |
| `app/components/home/home.module.css` | Stili locali, prospettiva, responsive, riduzione movimento |
| `app/components/home/copy.ts`, `types.ts` | Testi nelle cinque lingue e tipi condivisi |
| `app/lib/showroom-catalog.ts` | Query di sola lettura al catalogo Storefront |
| `app/api/showroom/catalog/route.ts` | Endpoint pubblico che espone soltanto dati commerciali |
| `tests/showroom-catalog.test.cjs`, `tests/showroom-ui.cjs` | Protezione del catalogo e verifiche browser |

## Shopify

Le dieci varianti Standard/Premium sono identificate dalla configurazione esistente `app/config/shopifyProducts.ts`. La query recupera i dati reali di queste varianti, comprese quelle esaurite. Nuove tipologie o nuovi pesi richiedono l'aggiornamento di questa configurazione e della presentazione; lo showroom non presenta prodotti inventati.

L'adapter usa esclusivamente le variabili server già utilizzate dal checkout: `SHOPIFY_STORE_DOMAIN`, `SHOPIFY_STOREFRONT_TOKEN` e l'eventuale `SHOPIFY_API_VERSION`. Non espone credenziali al browser e non effettua mutation. Il carrello esistente tratta gli importi in EUR: varianti in altra valuta vengono escluse per evitare totali errati. Il catalogo non usa cache e viene aggiornato anche quando la finestra torna attiva.

Titoli e descrizioni arrivano dal catalogo, attualmente in italiano; i testi dell'interfaccia sono tradotti nelle cinque lingue. Le fotografie/video esistenti dei pack sono stati esaminati: sono ambientati, con testo sovrapposto, e non adatti a ritagli puliti nella scena. Per questa prima versione si usa il packaging illustrativo; potrà essere sostituito da fotografie scontornate o render ufficiali.

Il checkout, i pagamenti, le note ordine, gli upsell e i webhook non sono modificati. Il checkout continua a determinare i prezzi finali in Shopify. La vecchia pagina `/products` conserva il proprio listino statico: l'allineamento del resto del sito è fuori da questa prima fase.

Riferimento API: [Shopify ProductVariant](https://shopify.dev/docs/api/storefront/latest/objects/ProductVariant).

## Verifica

- `npm run lint`: riuscito; rimangono soltanto avvisi preesistenti in altre pagine.
- `npx tsc --noEmit --incremental false`: riuscito.
- `npm run build`: riuscito. Il font Inter esistente richiede accesso a Google Fonts durante la build.
- `npm test`: 44 test superati, inclusi errori HTTP/GraphQL/rete, valuta, varianti mancanti/esaurite e mancata esposizione delle credenziali.
- `npm run test:ui` e `npm run test:ui:translation`: riusciti su fixture isolate, comprese persistenza prezzi, PDF e traduzioni esistenti.
- `node tests/showroom-ui.cjs`: riuscito; controllo di prezzi reali, varianti esaurite, carrello, richiesta checkout, swipe, tastiera, riduzione movimento, retry, cambio prezzo e route tradotte. Richiede Chrome locale e server della build su porta 3100. Usa il catalogo reale per prezzi, varianti e carrello; intercetta soltanto la richiesta di checkout e gli scenari di errore/cambio prezzo. Non crea ordini né pagamenti.

```sh
npm run build
npm run start -- --hostname 127.0.0.1 --port 3100
# In un altro terminale:
node tests/showroom-ui.cjs
```

La verifica mobile usa l'emulazione touch di Chrome a 390 px e controlli di overflow a 360/430/768/1024 px. È consigliato un controllo visivo finale su Safari/iPhone e Android fisici prima di pubblicare. I metodi di pagamento configurati non sono stati sottoposti a transazioni reali.
