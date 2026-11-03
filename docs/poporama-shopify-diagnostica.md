# Diagnosi del blocco di inizializzazione Shopify

## Risultato della verifica reale in sola lettura

Verifica eseguita con le variabili del backend locale (`.env.local` e ambiente
del processo), usando il medesimo client dell’importazione:

- Grant: `client_credentials`, con token ottenuto via OAuth, non il token statico
  `SHOPIFY_ADMIN_ACCESS_TOKEN` usato da altre parti del sito.
- Configurazione negozio: `SHOPIFY_SHOP=kilomystery`.
- Negozio restituito da GraphQL: **KILO MYSTERY**, dominio canonico
  **rthhit-9h.myshopify.com**. L’alias configurato risponde correttamente;
  questa differenza di nome non prova un errore di negozio.
- App restituita: **POPORAMA Test Center**.
- Il `apiKey` dell’app coincide con il Client ID configurato; il successo OAuth
  conferma che la coppia Client ID/Client Secret è valida per questa app.
- Impronta SHA-256 abbreviata del solo Client ID: `3c1ec440add2`.
- `currentAppInstallation.accessScopes` restituisce tutti e quattro gli scope:
  `read_metaobjects`, `write_metaobjects`, `read_metaobject_definitions`,
  `write_metaobject_definitions`.
- Il campo OAuth `scope` restituisce i due `write_*`, che comprendono i rispettivi
  `read_*`; il diagnostico li interpreta correttamente.
- Scopes effettivi uguali prima e dopo il rinnovo del token; nessuno scope della
  coda risulta ancora da approvare per questa installazione.
- Le tre definizioni della coda non esistono ancora. Non sono state create
  durante la diagnosi.

Non è stato verificato direttamente l’ambiente Vercel: non era disponibile una
connessione autenticata a quell’account né una configurazione CLI locale.
Il controllo eseguito sul PC **non dimostra** che Vercel abbia gli stessi valori.
L’endpoint descritto sotto permette di verificarlo nel deployment effettivo.

## Difetto nel codice

Le definizioni `poporama_import_job`, `poporama_import_chunk` e
`poporama_translation_cache` sono merchant-owned: non usano il prefisso `$app:`.
Il payload precedente impostava `access.admin = MERCHANT_READ_WRITE`.
Shopify limita quel parametro ai tipi app-reserved, come confermato anche dalla
lettura dell’enum API `ADMIN_ACCESS_INPUT_NOT_ALLOWED`:

> Admin access can only be specified on metaobject definitions that have an app-reserved type.

Il codice precedente scartava tutti i `userErrors` della creazione e mostrava
lo stesso messaggio sui permessi per qualsiasi errore. Questo nascondeva il
vincolo violato dal payload e poteva far richiedere inutilmente altri scope.

Correzione: si mantiene il tipo merchant-owned e `access.storefront = NONE`,
**senza inviare `access.admin`**. Non si rinominano tipi e non si migrano o
cancellano prodotti. Gli errori adesso conservano `code`, `field`, `message`;
solo un conflitto `TAKEN` può essere verificato come creazione concorrente,
ricontrollando struttura e riservatezza della definizione esistente.

Non è stata inviata una mutazione di prova allo store reale per riprodurre il
rifiuto o creare definizioni: la diagnosi reale è rimasta in sola lettura.
Il vincolo del payload è verificato dai metadati/documentazione Shopify e da
fixture che ora rifiutano effettivamente il parametro non consentito.

## Intervento per sbloccare il sito

1. Pubblicare **questa versione del progetto** con un nuovo deployment Vercel
   nell’ambiente che serve il sito usato per l’importazione. Una nuova versione
   della sola app Shopify non corregge il codice Next.js già pubblicato.
2. Accedere normalmente a PoporamaTest e aprire, sullo stesso dominio:
   `/api/poporama/test-shopify?refresh=1`.
3. Verificare nel JSON:
   - `diagnosticVersion: 2` e `environment.target: "production"` per il sito live;
   - `app.title: "POPORAMA Test Center"`, `clientIdMatchesTokenApp: true` e
     `expectedAppMatches: true`;
   - `token.clientIdFingerprint: "3c1ec440add2"` per confrontare il Client ID
     con quello verificato localmente, senza esporlo;
   - dominio canonico `rthhit-9h.myshopify.com`;
   - `missingScopes: []` e `installationApprovalNeededForQueue: false`;
   - `schemaCreation.accessAdminSent: false` e
     `readyForSchemaInitialization: true`.
4. Riprovare il caricamento del manifest. Il normale flusso inizializzerà le
   definizioni mancanti con il payload corretto. Se c’è un lavoro interrotto,
   riprenderlo dal checkpoint, senza cancellare prodotti.

Se l’app o il negozio restituiti su Vercel sono differenti, correggere le tre
variabili Shopify nell’ambiente Vercel appropriato usando le credenziali già
esistenti di POPORAMA Test Center, quindi fare un nuovo deployment. Verificare
che eventuali override Preview/Production e il progetto/domino siano quelli
corretti. Non cambiare credenziali che risultano già coerenti.

Solo se il diagnostico del deployment, **dopo il rinnovo**, mostra davvero
scope mancanti, approvarli nell’installazione dell’app identificata dal report.
Con i dati effettivamente verificati in locale, non serve un’altra approvazione,
una disinstallazione o una rigenerazione di Client ID/Client Secret.

## Endpoint diagnostico

`GET /api/poporama/test-shopify` è autenticato dalla sessione Poporama esistente,
non crea definizioni, non legge prodotti e non avvia l’importazione. Usa il
client e la cache token della coda. `?refresh=1` rinnova il solo access token
OAuth e confronta gli scope prima e dopo; non modifica credenziali o dati store.

La risposta è `private, no-store` e contiene ambiente/deployment, app, negozio,
scopes, scadenza, impronta del Client ID, compatibilità delle definizioni e
regola Shopify sul parametro admin. Non contiene token, Client ID, Client Secret,
chiavi API o risposte OAuth grezze. Non scrive questi dati nei log.
È stato rimosso anche un vecchio log newsletter che stampava il prefisso del
token statico durante la build.

Per ripetere la verifica sul backend locale:

```sh
npm run diagnose:shopify
npm run diagnose:shopify -- --refresh
```

Richiede le dipendenze di sviluppo già presenti (TypeScript), le variabili
backend e l’accesso di rete al negozio. Non eseguire con fixture attive quando
si vuole verificare lo store reale.

## Rinnovo e cache

La cache è legata all’intera configurazione shop/Client ID/Client Secret;
un cambio della coppia non può riutilizzare il token precedente. Si conserva
la scadenza `expires_in` e il campo `scope` OAuth senza esporre il valore token.
Richieste simultanee condividono un solo rinnovo.

Quando un token noto precede gli scope necessari, il backend lo rinnova una
volta e verifica gli scope reali tramite `currentAppInstallation`. Su 401/403 o
`ACCESS_DENIED`, GraphQL può rinnovare e riprovare una sola volta, esclusivamente
quando non è presente una risposta parzialmente eseguita. Gli errori di
validazione o quota delle definizioni non sono trasformati in errori scope e
non provocano ripetizioni delle mutazioni.

## File e verifica

- `app/lib/poporama-job-store.ts`: payload corretto e motivi esatti dei fallimenti.
- `app/lib/poporama-shopify.ts`: cache per credenziali, rinnovo e controllo scope.
- `app/lib/poporama-shopify-scopes.ts`: scope impliciti, errori e redazione segreti.
- `app/lib/poporama-shopify-diagnostics.ts`: diagnosi in sola lettura sul client reale.
- `app/api/poporama/test-shopify/route.ts`: endpoint autenticato e non memorizzabile.
- `app/lib/poporama-job-http.ts`: dettagli sicuri degli errori restituiti alla UI.
- `scripts/poporama-shopify-diagnose.cjs`, `package.json`: comando locale di lettura.
- `app/api/subscribe/route.ts`: rimozione del log del prefisso token, nessun cambio
  al comportamento della newsletter.
- `tests/poporama-shopify-auth.test.cjs`: rinnovo, credenziali, accessi negati,
  scope effettivi, validazione metaobject, diagnostica e segreti assenti.
- Fixture di importazione: simulano anche `ADMIN_ACCESS_INPUT_NOT_ALLOWED`.

```sh
npm test
npx tsc --noEmit --incremental false
npm run lint
npm run build
npm run test:ui:translation
```

Riferimenti:
[errore Shopify ADMIN_ACCESS_INPUT_NOT_ALLOWED](https://shopify.dev/docs/api/admin-graphql/2026-07/enums/MetaobjectUserErrorCode),
[tipi merchant-owned e app-owned](https://shopify.dev/docs/apps/build/metaobjects/manage-metaobject-definitions),
[Client Credentials Grant e scope OAuth](https://shopify.dev/docs/apps/build/authentication-authorization/client-credentials-grant?lang=node).
