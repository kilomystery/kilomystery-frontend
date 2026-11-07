# Restyling esteso e showroom a scorrimento

Branch di lavoro: `feat/homepage-premium-showroom`. Il restyling resta locale, senza pubblicazione.

## Interazione delle box

La scena parte da Standard. Con la rotella del mouse o il trackpad sopra le box si passa tra:

1. Standard chiusa.
2. Standard aperta.
3. Premium chiusa.
4. Premium aperta.

Scorrendo verso l'alto si percorre la sequenza inversa. Ai due estremi lo scroll torna alla pagina. Il listener è limitato alla scena: non intercetta lo scroll dei dettagli, del peso o delle altre sezioni. Una soglia di movimento e una pausa tra i passaggi assorbono l'inerzia del trackpad.

Su mobile lo swipe orizzontale cambia box e apre quella selezionata. Il movimento verticale mantiene lo scorrimento della pagina. Restano disponibili tocco, schede Standard/Premium, frecce e pulsante di apertura. Nella scena, le frecce sinistra/destra cambiano e aprono box; su/giù seguono i quattro passaggi. È rispettata la preferenza di riduzione del movimento.

## Design condiviso

`app/storefront.css` definisce palette antracite, superfici viola scuro, accenti lavanda e verde chiaro, tipografia, pulsanti, campi, FAQ, footer e animazioni di comparsa. Gli stili si applicano alle route pubbliche tramite `StorefrontTheme`, mantenendo le schermate operative Poporama e la stampa etichette fuori da questo tema.

- Header unico per homepage, catalogo, carrello e pagine informative: menu desktop/mobile, link social, lingue che conservano la pagina, carrello, chiusura con Escape o click esterno.
- Catalogo con nuova introduzione visiva e showroom prima delle sezioni informative.
- Le guide che incorporavano `ProductsTabs` condividono lo showroom, con prezzi/disponibilità reali, senza duplicare il precedente listino statico.
- Gli anchor esistenti, ad esempio `/it/products#buy-premium-10`, selezionano la tipologia e il peso corretti.
- Carrello, form contatto, newsletter, FAQ, eventi, blog, articoli, press e documenti legali condividono le stesse superfici e componenti visivi.
- Footer, newsletter e collegamenti legali conservati. Corretti i collegamenti alle policy presenti nella pagina contatti e nel form newsletter.
- La verifica delle FAQ ha rilevato un errore preesistente: `React.use(params)` riceveva un oggetto con Next.js 14. La pagina ora legge i parametri nel server component come le altre pagine del progetto.

Nessun cambiamento alle API di checkout, pagamenti, gestione ordini, webhook, prezzi degli extra o bundle Explorer. Questi ultimi conservano le integrazioni già esistenti; la modifica riguarda il loro aspetto. Le illustrazioni delle scatole sono dichiarate come rappresentazioni del packaging.

## Anteprima

```sh
npm run dev
```

Aprire `http://localhost:3000/it`. Provare anche `/it/products`, `/it/cart`, `/it/about`, `/it/contact`, `/it/faq`, `/it/events`, `/it/blog` e `/it/policy/shipping`.

Per confrontare la versione precedente della homepage con questa estensione:

```sh
git diff 7ca1bef
```

## Anteprime della build verificata

- [Catalogo desktop](previews/storefront/desktop-products.png)
- [Carrello desktop](previews/storefront/desktop-cart.png)
- [Catalogo mobile](previews/storefront/mobile-products.png)
- [FAQ mobile](previews/storefront/mobile-faq.png)
- [Chi siamo](previews/storefront/desktop-about.png)
- [Contatti](previews/storefront/desktop-contact.png)
- [Spedizioni](previews/storefront/desktop-policy-shipping.png)

## Verifiche

Esito finale: build, lint e typecheck riusciti; 44 test automatici superati. Superati anche i test browser esistenti (`test:ui`, `test:ui:translation`) e la prova estesa `showroom-ui.cjs`, su 19 route pubbliche, navigazione mobile e desktop, articoli e anchor preesistenti. Rimangono soltanto avvisi di lint preesistenti in altre pagine.


`tests/showroom-ui.cjs` usa un profilo Chrome isolato e il catalogo Shopify reale. Verifica selezione e apertura con scroll in entrambe le direzioni, protezione dall'inerzia, ripresa dello scroll di pagina, swipe, tastiera, varianti esaurite, carrello, cambio prezzo, errore catalogo e riduzione movimento. Intercetta la richiesta di checkout per controllarne il contenuto senza creare ordini o pagamenti.

La stessa prova verifica il tema, l'assenza di overflow e la navigazione su 19 route pubbliche, le FAQ, il form di contatto, il menu mobile, le lingue, gli anchor dei prodotti e il layout degli articoli. Le schermate sono salvate nella cartella temporanea indicata dal test.

```sh
npm run build
npm run start -- --hostname 127.0.0.1 --port 3100
# In un secondo terminale:
node tests/showroom-ui.cjs
```

Rimangono da controllare Safari/iPhone e Android fisici prima della pubblicazione. I pagamenti non sono stati eseguiti.
