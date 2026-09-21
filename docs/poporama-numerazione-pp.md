# Numerazione PP

La creazione degli articoli passa da `app/api/poporama/articoli/route.ts`.
Il nuovo lotto crea soltanto il lotto; il manifest crea poi gli articoli.
Non sono attualmente implementati flussi separati di creazione manuale o stock senza manifest.

Il server legge tutte le pagine degli articoli e cerca il massimo `codice_pp`
conforme a `PP-` seguito da almeno sei cifre. Ignora i codici test non conformi.
Non usa il conteggio degli articoli e non riempie automaticamente i buchi.
La formattazione non tronca i numeri oltre 999999.

## Importazione e recupero

La preparazione del manifest richiede al server un intervallo tramite
`POST /api/poporama/articoli`, azione `reservePP`. Un lock nel processo protegge
lettura del massimo e prenotazione; tiene conto anche dei range già prenotati
nello stesso processo. La prenotazione non scrive su Shopify.

Il piano viene firmato, associato all'ID del lotto e conservato insieme al piano
di recupero nel browser. La firma usa il secret server esistente con un prefisso
dedicato: il piano non è un cookie di sessione e non sostituisce l'autenticazione.
Ogni creazione richiede ancora una sessione POPORAMA valida.

Prima di ogni creazione il server ricontrolla codice e handle già presenti.
Usa esclusivamente `metaobjectCreate`, mai upsert o aggiornamenti di articoli
esistenti. Un duplicato restituisce 409. Il recupero considera una riga completata
solo se coincidono lotto e dati originari del manifest; prezzi/test/vendite già
modificati sull'articolo non vengono ripristinati.

Senza un piano firmato, un codice esplicito deve coincidere con il prossimo PP
disponibile; omettendolo, lo assegna il server. I vecchi piani non firmati possono
recuperare le righe già presenti e proseguire solo se la sequenza è ancora allineata.
Una collisione interrompe l'importazione: non viene saltata come se fosse una riga riuscita.

## Limiti di concorrenza

Il lock e il massimo prenotato sono in memoria, condivisi soltanto nel processo.
Non costituiscono una sequenza atomica distribuita. Più istanze, oppure un riavvio
prima che i PP prenotati siano stati creati, possono prenotare intervalli sovrapposti.
Il controllo prima della creazione e l'unicità dell'handle Shopify impediscono
di sovrascrivere un articolo, ma l'importazione concorrente può essere interrotta
da una collisione. Non è garantita una transazione per l'intero manifest.

Per garantire prenotazioni esclusive anche fra istanze occorre un contatore/range
persistente con operazioni atomiche in un archivio condiviso. Questa modifica non
introduce tale infrastruttura. La rotazione del secret invalida i piani firmati
precedenti; cancellare tutti i PP più alti può abbassare il massimo dopo un riavvio.
