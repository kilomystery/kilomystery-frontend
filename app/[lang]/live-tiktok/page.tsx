/* eslint-disable react/no-unescaped-entities */
"use client";

import { useCallback, useMemo, useState } from "react";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { Lang, normalizeLang } from "@/i18n/lang";

type CopyKey =
  | "kickerLive"
  | "title"
  | "subtitle"
  | "pillDeposit"
  | "pillDeadline"
  | "pillUnder5"
  | "pillFrom5"
  | "howTitle"
  | "how1"
  | "how2"
  | "how3"
  | "how4"
  | "pricingTitle"
  | "pricingA"
  | "pricingB"
  | "pricingC"
  | "shippingTitle"
  | "shippingA"
  | "shippingB"
  | "shippingNote"
  | "rulesTitle"
  | "rulesA"
  | "rulesB"
  | "rulesC"
  | "rulesD"
  | "rulesE"
  | "rulesF"
  | "formKicker"
  | "formTitle"
  | "formIntro"
  | "tiktokLabel"
  | "tiktokPlaceholder"
  | "phoneLabel"
  | "phonePlaceholder"
  | "nameLabel"
  | "namePlaceholder"
  | "surnameLabel"
  | "surnamePlaceholder"
  | "emailLabel"
  | "emailPlaceholder"
  | "address1Label"
  | "address1Placeholder"
  | "address2Label"
  | "address2Placeholder"
  | "zipLabel"
  | "zipPlaceholder"
  | "cityLabel"
  | "cityPlaceholder"
  | "provLabel"
  | "provPlaceholder"
  | "countryLabel"
  | "countryPlaceholder"
  | "accept"
  | "buttonIdle"
  | "buttonLoading"
  | "privacy"
  | "faqTitle"
  | "faq1q"
  | "faq1a"
  | "faq2q"
  | "faq2a"
  | "faq3q"
  | "faq3a"
  | "faq4q"
  | "faq4a"
  | "linksTitle"
  | "linksReturns"
  | "linksShipping"
  | "linksTerms";

type CopyPerLang = Record<CopyKey, string>;

const LIVE_TICKET_VARIANT_ID = 52681102393682;

// Regole
const DEPOSIT_EUR = 20;
const BALANCE_DEADLINE_HOURS = 24;

// Prezzi al kg (Premium scaglioni)
const PRICE_PER_KG_UNDER_5 = 26.9;
const PRICE_PER_KG_FROM_5 = 23.7;

// Spedizione
const SHIPPING_UP_TO_5KG_EUR = 6;
const SHIPPING_FREE_FROM_KG = 5;

const euro = (n: number) =>
  n.toLocaleString("it-IT", { style: "currency", currency: "EUR" });

const COPY: Record<Lang, CopyPerLang> = {
  it: {
    kickerLive: "🎥 LIVE",
    title: "LIVE TikTok · Mystery Box al peso",
    subtitle:
      "Registrati con un acconto per entrare nella lista LIVE. In diretta pesiamo ogni pacco e comunichiamo il prezzo. Dopo la live ricevi il link per il saldo.",

    pillDeposit: `Acconto ${euro(DEPOSIT_EUR)}`,
    pillDeadline: `Saldo entro ${BALANCE_DEADLINE_HOURS}h`,
    pillUnder5: `${PRICE_PER_KG_UNDER_5.toFixed(2)} €/kg <5kg`,
    pillFrom5: `${PRICE_PER_KG_FROM_5.toFixed(2)} €/kg ≥5kg`,

    howTitle: "Come funziona",
    how1: `Registrazione + acconto: versi ${euro(DEPOSIT_EUR)} per essere inserito in lista.`,
    how2: `In live scrivi: “IO + @tuousername”. Assegniamo solo se sei registrato.`,
    how3: "Pesiamo la mystery in diretta e comunichiamo il totale in base al peso (Premium €/kg).",
    how4: `Dopo la live ti inviamo il link per il saldo (totale − acconto). Saldo entro ${BALANCE_DEADLINE_HOURS} ore.`,

    pricingTitle: "Prezzo Premium al kg",
    pricingA: `Sotto ${SHIPPING_FREE_FROM_KG} kg: ${PRICE_PER_KG_UNDER_5.toFixed(2)} €/kg`,
    pricingB: `Da ${SHIPPING_FREE_FROM_KG} kg in su: ${PRICE_PER_KG_FROM_5.toFixed(2)} €/kg`,
    pricingC: "Soglia: a 5,00 kg scatta la tariffa ridotta (e la spedizione gratuita).",

    shippingTitle: "Spedizione",
    shippingA: `Fino a ${SHIPPING_FREE_FROM_KG} kg: ${euro(SHIPPING_UP_TO_5KG_EUR)}`,
    shippingB: `Da ${SHIPPING_FREE_FROM_KG} kg in su: Gratis`,
    shippingNote: "Nota: la spedizione viene calcolata sul totale kg assegnati.",

    rulesTitle: "Regolamento (chiaro e semplice)",
    rulesA: "La partecipazione è riservata agli utenti registrati con acconto (ticket).",
    rulesB: "Fa fede l’ordine della chat in diretta. Lo username in chat deve combaciare con quello registrato.",
    rulesC: "L’acconto è un anticipo per partecipare e viene scalato dal primo pagamento saldo che ti inviamo dopo la live.",
    rulesD: `Il saldo deve essere pagato entro ${BALANCE_DEADLINE_HOURS} ore dall’invio del link. In caso contrario il pacco può essere riassegnato.`,
    rulesE: "Puoi aggiudicarti più pacchi nella stessa live (assegnazioni multiple).",
    rulesF: "I prezzi sono calcolati in base al peso e alle soglie indicate sopra.",

    formKicker: "Registrazione",
    formTitle: "Registrazione",
    formIntro:
      "Inserisci i tuoi dati: serviranno per verificare lo username in live e per la spedizione.",

    tiktokLabel: "Username TikTok",
    tiktokPlaceholder: "es. @nomeutente",
    phoneLabel: "Telefono",
    phonePlaceholder: "+39 …",
    nameLabel: "Nome",
    namePlaceholder: "Mario",
    surnameLabel: "Cognome",
    surnamePlaceholder: "Rossi",
    emailLabel: "Email",
    emailPlaceholder: "mario@email.com",
    address1Label: "Indirizzo (via e civico)",
    address1Placeholder: "Via Roma 10",
    address2Label: "Interno / scala / note (opzionale)",
    address2Placeholder: "Scala B, interno 4…",
    zipLabel: "CAP",
    zipPlaceholder: "00000",
    cityLabel: "Città",
    cityPlaceholder: "Milano",
    provLabel: "Provincia",
    provPlaceholder: "MI",
    countryLabel: "Paese",
    countryPlaceholder: "IT",

    accept: `Confermo: acconto ${euro(DEPOSIT_EUR)}, saldo entro ${BALANCE_DEADLINE_HOURS}h, prezzi al kg e spedizione come indicato.`,
    buttonIdle: `Registrati e versa ${euro(DEPOSIT_EUR)}`,
    buttonLoading: "Apro il checkout…",
    privacy: "I dati inseriti vengono usati solo per la gestione della LIVE e della spedizione. Niente spam.",

    faqTitle: "FAQ",
    faq1q: "Il ticket vale per una sola live?",
    faq1a:
      "Il ticket è l’acconto per entrare in lista LIVE. Le regole operative e le tempistiche vengono comunicate nella pagina e in diretta.",
    faq2q: "Come viene calcolato il prezzo?",
    faq2a:
      "In base ai kg pesati in live e alle soglie: sotto 5kg 26,90 €/kg, da 5kg in su 23,70 €/kg. Spedizione 6€ fino a 5kg, gratis da 5kg in su.",
    faq3q: "Posso prendere più pacchi in live?",
    faq3a:
      "Sì. Ogni pacco viene registrato e riceverai i link di saldo dopo la live.",
    faq4q: "Quando ricevo il link di pagamento del saldo?",
    faq4a:
      "Dopo la live ti inviamo un link Shopify per pagare il saldo. Il saldo va pagato entro 24 ore dall’invio del link.",

    linksTitle: "Link utili",
    linksReturns: "Politica Resi",
    linksShipping: "Spedizioni",
    linksTerms: "Termini e condizioni",
  },

  en: {
    kickerLive: "🎥 LIVE",
    title: "TikTok LIVE · Mystery Boxes by weight",
    subtitle:
      "Register with a deposit to join the LIVE list. During the live we weigh each box and announce the price. After the live you’ll receive the payment link for the balance.",

    pillDeposit: `Deposit ${euro(DEPOSIT_EUR)}`,
    pillDeadline: `Balance within ${BALANCE_DEADLINE_HOURS}h`,
    pillUnder5: `${PRICE_PER_KG_UNDER_5.toFixed(2)} €/kg <5kg`,
    pillFrom5: `${PRICE_PER_KG_FROM_5.toFixed(2)} €/kg ≥5kg`,

    howTitle: "How it works",
    how1: `Registration + deposit: pay ${euro(DEPOSIT_EUR)} to be added to the LIVE list.`,
    how2: `During the live type: “ME + @yourusername”. We assign only if you’re registered.`,
    how3: "We weigh the box live and announce the total based on weight (Premium €/kg).",
    how4: `After the live we send the payment link for the balance (total − deposit). Balance within ${BALANCE_DEADLINE_HOURS} hours.`,

    pricingTitle: "Premium price per kg",
    pricingA: `Under ${SHIPPING_FREE_FROM_KG} kg: ${PRICE_PER_KG_UNDER_5.toFixed(2)} €/kg`,
    pricingB: `From ${SHIPPING_FREE_FROM_KG} kg: ${PRICE_PER_KG_FROM_5.toFixed(2)} €/kg`,
    pricingC: "Threshold: at 5.00 kg the reduced rate applies (and shipping becomes free).",

    shippingTitle: "Shipping",
    shippingA: `Up to ${SHIPPING_FREE_FROM_KG} kg: ${euro(SHIPPING_UP_TO_5KG_EUR)}`,
    shippingB: `From ${SHIPPING_FREE_FROM_KG} kg: Free`,
    shippingNote: "Note: shipping is calculated on the total kg assigned.",

    rulesTitle: "Rules (simple & clear)",
    rulesA: "Participation is reserved for registered users with a deposit (ticket).",
    rulesB: "Chat order during the live counts. Your chat username must match the registered one.",
    rulesC: "The deposit is an advance to participate and is deducted from the first balance payment we send after the live.",
    rulesD: `The balance must be paid within ${BALANCE_DEADLINE_HOURS} hours after we send the link. Otherwise the box may be reassigned.`,
    rulesE: "You can win multiple boxes during the same live (multiple assignments).",
    rulesF: "Prices are calculated by weight and the tiers shown above.",

    formKicker: "Registration",
    formTitle: "Registration",
    formIntro:
      "Enter your details: we use them to verify your username during the live and for shipping.",

    tiktokLabel: "TikTok username",
    tiktokPlaceholder: "e.g. @yourusername",
    phoneLabel: "Phone",
    phonePlaceholder: "+39 …",
    nameLabel: "First name",
    namePlaceholder: "John",
    surnameLabel: "Last name",
    surnamePlaceholder: "Smith",
    emailLabel: "Email",
    emailPlaceholder: "john@email.com",
    address1Label: "Address (street + number)",
    address1Placeholder: "Street 10",
    address2Label: "Apt / notes (optional)",
    address2Placeholder: "Apt 4…",
    zipLabel: "ZIP",
    zipPlaceholder: "00000",
    cityLabel: "City",
    cityPlaceholder: "Rome",
    provLabel: "Province/State",
    provPlaceholder: "RM",
    countryLabel: "Country",
    countryPlaceholder: "IT",

    accept: `I confirm: deposit ${euro(DEPOSIT_EUR)}, balance within ${BALANCE_DEADLINE_HOURS}h, pricing & shipping as shown.`,
    buttonIdle: `Register and pay ${euro(DEPOSIT_EUR)}`,
    buttonLoading: "Opening checkout…",
    privacy: "Your data is used only to manage the LIVE and shipping. No spam.",

    faqTitle: "FAQ",
    faq1q: "Is the ticket valid for one live only?",
    faq1a:
      "The ticket is the deposit to join the LIVE list. Operational rules are communicated on this page and during the live.",
    faq2q: "How is the price calculated?",
    faq2a:
      "Based on the weight measured live and the tiers: under 5kg 26.90 €/kg, from 5kg 23.70 €/kg. Shipping: 6€ up to 5kg, free from 5kg.",
    faq3q: "Can I get multiple boxes in one live?",
    faq3a:
      "Yes. Each box is recorded and you’ll receive the balance payment links after the live.",
    faq4q: "When do I receive the balance payment link?",
    faq4a:
      "After the live we send a Shopify payment link for the balance. Balance must be paid within 24 hours after we send the link.",

    linksTitle: "Useful links",
    linksReturns: "Return Policy",
    linksShipping: "Shipping",
    linksTerms: "Terms & Conditions",
  },

  es: {
    kickerLive: "🎥 LIVE",
    title: "TikTok LIVE · Mystery Boxes por peso",
    subtitle:
      "Regístrate con un anticipo para entrar en la lista LIVE. Durante el directo pesamos cada caja y anunciamos el precio. Después del live recibirás el enlace para pagar el saldo.",

    pillDeposit: `Anticipo ${euro(DEPOSIT_EUR)}`,
    pillDeadline: `Saldo en ${BALANCE_DEADLINE_HOURS}h`,
    pillUnder5: `${PRICE_PER_KG_UNDER_5.toFixed(2)} €/kg <5kg`,
    pillFrom5: `${PRICE_PER_KG_FROM_5.toFixed(2)} €/kg ≥5kg`,

    howTitle: "Cómo funciona",
    how1: `Registro + anticipo: pagas ${euro(DEPOSIT_EUR)} para entrar en la lista LIVE.`,
    how2: `En el live escribe: “YO + @tuusuario”. Asignamos solo si estás registrado.`,
    how3: "Pesamos la caja en directo y anunciamos el total según el peso (Premium €/kg).",
    how4: `Después del live enviamos el enlace para pagar el saldo (total − anticipo). Saldo en ${BALANCE_DEADLINE_HOURS} horas.`,

    pricingTitle: "Precio Premium por kg",
    pricingA: `Menos de ${SHIPPING_FREE_FROM_KG} kg: ${PRICE_PER_KG_UNDER_5.toFixed(2)} €/kg`,
    pricingB: `Desde ${SHIPPING_FREE_FROM_KG} kg: ${PRICE_PER_KG_FROM_5.toFixed(2)} €/kg`,
    pricingC: "Umbral: a 5,00 kg se aplica la tarifa reducida (y el envío es gratis).",

    shippingTitle: "Envío",
    shippingA: `Hasta ${SHIPPING_FREE_FROM_KG} kg: ${euro(SHIPPING_UP_TO_5KG_EUR)}`,
    shippingB: `Desde ${SHIPPING_FREE_FROM_KG} kg: Gratis`,
    shippingNote: "Nota: el envío se calcula sobre el total de kg asignados.",

    rulesTitle: "Reglas (claras y simples)",
    rulesA: "La participación es solo para usuarios registrados con anticipo (ticket).",
    rulesB: "Cuenta el orden del chat en directo. El usuario del chat debe coincidir con el registrado.",
    rulesC: "El anticipo es un adelanto para participar y se descuenta del primer pago de saldo que enviamos después del live.",
    rulesD: `El saldo debe pagarse dentro de ${BALANCE_DEADLINE_HOURS} horas desde el envío del enlace. Si no, la caja puede reasignarse.`,
    rulesE: "Puedes ganar varias cajas en el mismo live (asignaciones múltiples).",
    rulesF: "Los precios se calculan por peso y por las franjas indicadas arriba.",

    formKicker: "Registro",
    formTitle: "Registro",
    formIntro:
      "Introduce tus datos: los usaremos para verificar tu usuario en el live y para el envío.",

    tiktokLabel: "Usuario de TikTok",
    tiktokPlaceholder: "ej. @tuusuario",
    phoneLabel: "Teléfono",
    phonePlaceholder: "+39 …",
    nameLabel: "Nombre",
    namePlaceholder: "Juan",
    surnameLabel: "Apellido",
    surnamePlaceholder: "Pérez",
    emailLabel: "Email",
    emailPlaceholder: "juan@email.com",
    address1Label: "Dirección (calle + número)",
    address1Placeholder: "Calle 10",
    address2Label: "Piso / notas (opcional)",
    address2Placeholder: "Piso 4…",
    zipLabel: "Código postal",
    zipPlaceholder: "00000",
    cityLabel: "Ciudad",
    cityPlaceholder: "Roma",
    provLabel: "Provincia/Estado",
    provPlaceholder: "BR",
    countryLabel: "País",
    countryPlaceholder: "IT",

    accept: `Confirmo: anticipo ${euro(DEPOSIT_EUR)}, saldo en ${BALANCE_DEADLINE_HOURS}h, precios y envío como se indica.`,
    buttonIdle: `Registrarme y pagar ${euro(DEPOSIT_EUR)}`,
    buttonLoading: "Abriendo checkout…",
    privacy: "Tus datos se usan solo para gestionar el LIVE y el envío. Sin spam.",

    faqTitle: "FAQ",
    faq1q: "¿El ticket vale solo para un live?",
    faq1a:
      "El ticket es el anticipo para entrar en la lista LIVE. Las reglas operativas se comunican en esta página y durante el live.",
    faq2q: "¿Cómo se calcula el precio?",
    faq2a:
      "Según el peso medido en directo y las franjas: <5kg 26,90 €/kg, ≥5kg 23,70 €/kg. Envío: 6€ hasta 5kg y gratis desde 5kg.",
    faq3q: "¿Puedo obtener varias cajas en un live?",
    faq3a:
      "Sí. Cada caja se registra y recibirás los enlaces de pago del saldo después del live.",
    faq4q: "¿Cuándo recibo el enlace para pagar el saldo?",
    faq4a:
      "Después del live enviamos un enlace de Shopify para pagar el saldo. Debe pagarse dentro de 24 horas desde el envío.",

    linksTitle: "Enlaces útiles",
    linksReturns: "Política de devoluciones",
    linksShipping: "Envíos",
    linksTerms: "Términos y condiciones",
  },

  fr: {
    kickerLive: "🎥 LIVE",
    title: "TikTok LIVE · Mystery Boxes au poids",
    subtitle:
      "Inscris-toi avec un acompte pour rejoindre la liste LIVE. Pendant le live, on pèse chaque box et on annonce le prix. Après le live, tu reçois le lien pour payer le solde.",

    pillDeposit: `Acompte ${euro(DEPOSIT_EUR)}`,
    pillDeadline: `Solde sous ${BALANCE_DEADLINE_HOURS}h`,
    pillUnder5: `${PRICE_PER_KG_UNDER_5.toFixed(2)} €/kg <5kg`,
    pillFrom5: `${PRICE_PER_KG_FROM_5.toFixed(2)} €/kg ≥5kg`,

    howTitle: "Comment ça marche",
    how1: `Inscription + acompte : paie ${euro(DEPOSIT_EUR)} pour être ajouté à la liste LIVE.`,
    how2: `Pendant le live, écris : “MOI + @tonpseudo”. Attribution uniquement si tu es inscrit.`,
    how3: "On pèse la box en direct et on annonce le total selon le poids (Premium €/kg).",
    how4: `Après le live, on t’envoie le lien pour payer le solde (total − acompte). Solde sous ${BALANCE_DEADLINE_HOURS} heures.`,

    pricingTitle: "Prix Premium au kg",
    pricingA: `Sous ${SHIPPING_FREE_FROM_KG} kg : ${PRICE_PER_KG_UNDER_5.toFixed(2)} €/kg`,
    pricingB: `À partir de ${SHIPPING_FREE_FROM_KG} kg : ${PRICE_PER_KG_FROM_5.toFixed(2)} €/kg`,
    pricingC: "Seuil : à 5,00 kg, le tarif réduit s’applique (et la livraison devient gratuite).",

    shippingTitle: "Livraison",
    shippingA: `Jusqu’à ${SHIPPING_FREE_FROM_KG} kg : ${euro(SHIPPING_UP_TO_5KG_EUR)}`,
    shippingB: `À partir de ${SHIPPING_FREE_FROM_KG} kg : Gratuite`,
    shippingNote: "Note : la livraison est calculée sur le total de kg attribués.",

    rulesTitle: "Règles (simples et claires)",
    rulesA: "La participation est réservée aux utilisateurs inscrits avec acompte (ticket).",
    rulesB: "L’ordre du chat en direct fait foi. Le pseudo du chat doit correspondre au pseudo enregistré.",
    rulesC: "L’acompte est une avance pour participer et est déduit du premier paiement de solde envoyé après le live.",
    rulesD: `Le solde doit être payé dans les ${BALANCE_DEADLINE_HOURS} heures après l’envoi du lien. Sinon, la box peut être réattribuée.`,
    rulesE: "Tu peux remporter plusieurs boxes pendant le même live (attributions multiples).",
    rulesF: "Les prix sont calculés selon le poids et les paliers ci-dessus.",

    formKicker: "Inscription",
    formTitle: "Inscription",
    formIntro:
      "Renseigne tes informations : elles servent à vérifier ton pseudo pendant le live et pour la livraison.",

    tiktokLabel: "Pseudo TikTok",
    tiktokPlaceholder: "ex. @tonpseudo",
    phoneLabel: "Téléphone",
    phonePlaceholder: "+39 …",
    nameLabel: "Prénom",
    namePlaceholder: "Jean",
    surnameLabel: "Nom",
    surnamePlaceholder: "Dupont",
    emailLabel: "Email",
    emailPlaceholder: "jean@email.com",
    address1Label: "Adresse (rue + numéro)",
    address1Placeholder: "Rue 10",
    address2Label: "Appartement / notes (optionnel)",
    address2Placeholder: "Appt 4…",
    zipLabel: "Code postal",
    zipPlaceholder: "00000",
    cityLabel: "Ville",
    cityPlaceholder: "Rome",
    provLabel: "Région/Province",
    provPlaceholder: "BR",
    countryLabel: "Pays",
    countryPlaceholder: "IT",

    accept: `Je confirme : acompte ${euro(DEPOSIT_EUR)}, solde sous ${BALANCE_DEADLINE_HOURS}h, prix et livraison comme indiqué.`,
    buttonIdle: `S’inscrire et payer ${euro(DEPOSIT_EUR)}`,
    buttonLoading: "Ouverture du checkout…",
    privacy: "Tes données sont utilisées uniquement pour gérer le LIVE et la livraison. Pas de spam.",

    faqTitle: "FAQ",
    faq1q: "Le ticket est-il valable pour un seul live ?",
    faq1a:
      "Le ticket est l’acompte pour rejoindre la liste LIVE. Les règles opérationnelles sont indiquées sur cette page et rappelées en live.",
    faq2q: "Comment le prix est-il calculé ?",
    faq2a:
      "Selon le poids mesuré en direct et les paliers : <5kg 26,90 €/kg, ≥5kg 23,70 €/kg. Livraison : 6€ jusqu’à 5kg et gratuite à partir de 5kg.",
    faq3q: "Puis-je prendre plusieurs boxes pendant un live ?",
    faq3a:
      "Oui. Chaque box est enregistrée et tu recevras les liens de paiement du solde après le live.",
    faq4q: "Quand vais-je recevoir le lien de paiement du solde ?",
    faq4a:
      "Après le live, nous envoyons un lien Shopify pour payer le solde. Il doit être payé dans les 24 heures après l’envoi.",

    linksTitle: "Liens utiles",
    linksReturns: "Politique de retour",
    linksShipping: "Livraison",
    linksTerms: "Conditions générales",
  },

  de: {
    kickerLive: "🎥 LIVE",
    title: "TikTok LIVE · Mystery Boxes nach Gewicht",
    subtitle:
      "Registriere dich mit einer Anzahlung, um auf die LIVE-Liste zu kommen. Im Live wiegen wir jede Box und nennen den Preis. Nach dem Live erhältst du den Zahlungslink für den Restbetrag.",

    pillDeposit: `Anzahlung ${euro(DEPOSIT_EUR)}`,
    pillDeadline: `Restbetrag in ${BALANCE_DEADLINE_HOURS}h`,
    pillUnder5: `${PRICE_PER_KG_UNDER_5.toFixed(2)} €/kg <5kg`,
    pillFrom5: `${PRICE_PER_KG_FROM_5.toFixed(2)} €/kg ≥5kg`,

    howTitle: "So funktioniert es",
    how1: `Registrierung + Anzahlung: zahle ${euro(DEPOSIT_EUR)}, um auf die LIVE-Liste zu kommen.`,
    how2: `Im Live schreibe: „ICH + @deinusername“. Zuteilung nur, wenn du registriert bist.`,
    how3: "Wir wiegen die Box live und nennen den Gesamtpreis nach Gewicht (Premium €/kg).",
    how4: `Nach dem Live senden wir den Zahlungslink für den Restbetrag (Gesamt − Anzahlung). Zahlung innerhalb von ${BALANCE_DEADLINE_HOURS} Stunden.`,

    pricingTitle: "Premium-Preis pro kg",
    pricingA: `Unter ${SHIPPING_FREE_FROM_KG} kg: ${PRICE_PER_KG_UNDER_5.toFixed(2)} €/kg`,
    pricingB: `Ab ${SHIPPING_FREE_FROM_KG} kg: ${PRICE_PER_KG_FROM_5.toFixed(2)} €/kg`,
    pricingC: "Schwelle: bei 5,00 kg gilt der reduzierte Tarif (und Versand wird gratis).",

    shippingTitle: "Versand",
    shippingA: `Bis ${SHIPPING_FREE_FROM_KG} kg: ${euro(SHIPPING_UP_TO_5KG_EUR)}`,
    shippingB: `Ab ${SHIPPING_FREE_FROM_KG} kg: Kostenlos`,
    shippingNote: "Hinweis: Versand wird anhand der insgesamt zugeteilten kg berechnet.",

    rulesTitle: "Regeln (klar & einfach)",
    rulesA: "Teilnahme nur für registrierte Nutzer mit Anzahlung (Ticket).",
    rulesB: "Die Reihenfolge im Live-Chat zählt. Der Chat-Username muss mit der Registrierung übereinstimmen.",
    rulesC: "Die Anzahlung ist ein Vorschuss und wird beim ersten Restbetrag-Link nach dem Live abgezogen.",
    rulesD: `Der Restbetrag muss innerhalb von ${BALANCE_DEADLINE_HOURS} Stunden nach Link-Versand bezahlt werden. Andernfalls kann die Box neu vergeben werden.`,
    rulesE: "Du kannst mehrere Boxen im selben Live gewinnen (mehrere Zuteilungen).",
    rulesF: "Preise werden nach Gewicht und den oben genannten Stufen berechnet.",

    formKicker: "Registrierung",
    formTitle: "Registrierung",
    formIntro:
      "Gib deine Daten ein: zur Username-Prüfung im Live und für den Versand.",

    tiktokLabel: "TikTok Username",
    tiktokPlaceholder: "z.B. @deinusername",
    phoneLabel: "Telefon",
    phonePlaceholder: "+39 …",
    nameLabel: "Vorname",
    namePlaceholder: "Max",
    surnameLabel: "Nachname",
    surnamePlaceholder: "Mustermann",
    emailLabel: "E-Mail",
    emailPlaceholder: "max@email.com",
    address1Label: "Adresse (Straße + Nr.)",
    address1Placeholder: "Straße 10",
    address2Label: "Wohnung / Hinweise (optional)",
    address2Placeholder: "Whg. 4…",
    zipLabel: "PLZ",
    zipPlaceholder: "00000",
    cityLabel: "Stadt",
    cityPlaceholder: "Rom",
    provLabel: "Bundesland/Provinz",
    provPlaceholder: "BR",
    countryLabel: "Land",
    countryPlaceholder: "IT",

    accept: `Ich bestätige: Anzahlung ${euro(DEPOSIT_EUR)}, Restbetrag in ${BALANCE_DEADLINE_HOURS}h, Preise & Versand wie angegeben.`,
    buttonIdle: `Registrieren und ${euro(DEPOSIT_EUR)} zahlen`,
    buttonLoading: "Checkout wird geöffnet…",
    privacy: "Deine Daten werden nur für LIVE-Abwicklung und Versand genutzt. Kein Spam.",

    faqTitle: "FAQ",
    faq1q: "Gilt das Ticket nur für ein Live?",
    faq1a:
      "Das Ticket ist die Anzahlung für die LIVE-Liste. Die Abläufe werden auf dieser Seite und im Live erklärt.",
    faq2q: "Wie wird der Preis berechnet?",
    faq2a:
      "Nach live gemessenem Gewicht und Stufen: <5kg 26,90 €/kg, ≥5kg 23,70 €/kg. Versand: 6€ bis 5kg, kostenlos ab 5kg.",
    faq3q: "Kann ich mehrere Boxen im Live bekommen?",
    faq3a:
      "Ja. Jede Box wird erfasst und du erhältst nach dem Live die Zahlungslinks für den Restbetrag.",
    faq4q: "Wann erhalte ich den Zahlungslink für den Restbetrag?",
    faq4a:
      "Nach dem Live senden wir einen Shopify-Link. Zahlung innerhalb von 24 Stunden nach Versand.",

    linksTitle: "Nützliche Links",
    linksReturns: "Rückgabe",
    linksShipping: "Versand",
    linksTerms: "AGB",
  },
};

type FormState = {
  tiktokUsername: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address1: string;
  address2: string;
  zip: string;
  city: string;
  province: string;
  country: string;
  acceptRules: boolean;
};

const initial: FormState = {
  tiktokUsername: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address1: "",
  address2: "",
  zip: "",
  city: "",
  province: "",
  country: "IT",
  acceptRules: false,
};

function isValidUsername(u: string) {
  const s = u.trim();
  return s.startsWith("@") && s.length >= 3;
}

function canSubmit(f: FormState) {
  return (
    f.acceptRules &&
    isValidUsername(f.tiktokUsername) &&
    f.firstName.trim() &&
    f.lastName.trim() &&
    f.email.trim() &&
    f.phone.trim() &&
    f.address1.trim() &&
    f.zip.trim() &&
    f.city.trim() &&
    f.province.trim() &&
    f.country.trim()
  );
}

export default function LiveTikTokPage({ params }: { params: { lang: string } }) {
  const lang: Lang = normalizeLang(params?.lang);
  const t = COPY[lang] ?? COPY.it;

  const [form, setForm] = useState<FormState>(initial);
  const [loading, setLoading] = useState(false);
  const ok = useMemo(() => canSubmit(form), [form]);

  const shippingHref = `/${lang}/shipping`;
  const termsHref = `/${lang}/terms`;
  const returnsHref = `/${lang}/returns`;

  const onStartCheckout = useCallback(async () => {
    if (loading) return;
    if (!ok) return;

    setLoading(true);
    try {
      const originQuery =
        typeof window !== "undefined" ? window.location.search : "";

      const pricingRule = `kg<5:${PRICE_PER_KG_UNDER_5};kg>=5:${PRICE_PER_KG_FROM_5};ship<=5kg:${SHIPPING_UP_TO_5KG_EUR};ship>=${SHIPPING_FREE_FROM_KG}kg:0`;
      const rules = `deposit:${DEPOSIT_EUR};balance_deadline_hours:${BALANCE_DEADLINE_HOURS}`;

      const payload = {
        lang,
        items: [{ shopifyId: LIVE_TICKET_VARIANT_ID, qty: 1, tier: "LIVE_TICKET" }],
        originQuery,
        orderNote: `LIVE TikTok Registration - ${form.tiktokUsername} | rules(${rules}) | pricing(${pricingRule})`,
        liveRegistration: {
          tiktokUsername: form.tiktokUsername,
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          address1: form.address1,
          address2: form.address2,
          zip: form.zip,
          city: form.city,
          province: form.province,
          country: form.country,
        },
      };

      const res = await fetch("/api/checkout/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data?.url) throw new Error(data?.message || "Checkout error");

      window.location.href = data.url;
    } catch {
      alert("Errore durante l’apertura del checkout. Riprova o contattaci.");
    } finally {
      setLoading(false);
    }
  }, [lang, loading, ok, form]);

  return (
    <>
      <Header lang={lang} />

      <main className="container py-10 space-y-8">
        {/* HERO */}
        <header className="space-y-2 max-w-2xl">
          <p className="section-kicker">{t.kickerLive}</p>

          <h1 className="text-3xl md:text-4xl font-extrabold">
            <span className="bg-gradient-to-r from-[#7A20FF] via-emerald-300 to-[#20D27A] bg-clip-text text-transparent">
              {t.title}
            </span>
          </h1>

          <p className="text-white/75">{t.subtitle}</p>

          <div className="flex flex-wrap gap-2 pt-2">
            <span className="pill pill--prm">{t.pillDeposit}</span>
            <span className="pill pill--std">{t.pillDeadline}</span>
            <span className="pill pill--std">{t.pillUnder5}</span>
            <span className="pill pill--prm">{t.pillFrom5}</span>
          </div>
        </header>

        {/* HOW / PRICING / SHIPPING */}
        <section className="grid gap-5 lg:grid-cols-3">
          <article className="card space-y-3">
            <h2 className="text-xl font-extrabold">{t.howTitle}</h2>
            <ul className="bullets space-y-1 text-sm text-white/70">
              <li>{t.how1}</li>
              <li>{t.how2}</li>
              <li>{t.how3}</li>
              <li>{t.how4}</li>
            </ul>
          </article>

          <article className="card space-y-3">
            <h2 className="text-xl font-extrabold">{t.pricingTitle}</h2>
            <ul className="bullets space-y-1 text-sm text-white/70">
              <li>{t.pricingA}</li>
              <li>{t.pricingB}</li>
              <li className="text-white/55">{t.pricingC}</li>
            </ul>
          </article>

          <article className="card space-y-3">
            <h2 className="text-xl font-extrabold">{t.shippingTitle}</h2>
            <ul className="bullets space-y-1 text-sm text-white/70">
              <li>{t.shippingA}</li>
              <li>{t.shippingB}</li>
            </ul>
            <div className="pt-1 text-xs text-white/50">{t.shippingNote}</div>
          </article>
        </section>

        {/* RULES */}
        <section className="card space-y-3">
          <h2 className="text-xl font-extrabold">{t.rulesTitle}</h2>
          <ul className="bullets space-y-1 text-sm text-white/70">
            <li>{t.rulesA}</li>
            <li>{t.rulesB}</li>
            <li>{t.rulesC}</li>
            <li>{t.rulesD}</li>
            <li>{t.rulesE}</li>
            <li>{t.rulesF}</li>
          </ul>
        </section>

        {/* FORM */}
        <section className="card space-y-4">
          <div className="space-y-1">
            <p className="section-kicker">{t.formKicker}</p>
            <h2 className="text-xl font-extrabold">{t.formTitle}</h2>
            <p className="text-white/70 text-sm">{t.formIntro}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="section-kicker mb-1" htmlFor="tiktokUsername">
                {t.tiktokLabel}
              </label>
              <input
                id="tiktokUsername"
                className="input"
                placeholder={t.tiktokPlaceholder}
                value={form.tiktokUsername}
                onChange={(e) => setForm({ ...form, tiktokUsername: e.target.value })}
              />
              <p className="text-xs text-white/45 mt-1">
                {lang === "it"
                  ? "Deve essere identico a quello che userai in chat durante la LIVE."
                  : "It must match exactly the username you will use in chat during the LIVE."}
              </p>
            </div>

            <div>
              <label className="section-kicker mb-1" htmlFor="phone">
                {t.phoneLabel}
              </label>
              <input
                id="phone"
                className="input"
                placeholder={t.phonePlaceholder}
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>

            <div>
              <label className="section-kicker mb-1" htmlFor="firstName">
                {t.nameLabel}
              </label>
              <input
                id="firstName"
                className="input"
                placeholder={t.namePlaceholder}
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              />
            </div>

            <div>
              <label className="section-kicker mb-1" htmlFor="lastName">
                {t.surnameLabel}
              </label>
              <input
                id="lastName"
                className="input"
                placeholder={t.surnamePlaceholder}
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              />
            </div>

            <div className="md:col-span-2">
              <label className="section-kicker mb-1" htmlFor="email">
                {t.emailLabel}
              </label>
              <input
                id="email"
                className="input"
                type="email"
                inputMode="email"
                placeholder={t.emailPlaceholder}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div className="md:col-span-2">
              <label className="section-kicker mb-1" htmlFor="address1">
                {t.address1Label}
              </label>
              <input
                id="address1"
                className="input"
                placeholder={t.address1Placeholder}
                value={form.address1}
                onChange={(e) => setForm({ ...form, address1: e.target.value })}
              />
            </div>

            <div className="md:col-span-2">
              <label className="section-kicker mb-1" htmlFor="address2">
                {t.address2Label}
              </label>
              <input
                id="address2"
                className="input"
                placeholder={t.address2Placeholder}
                value={form.address2}
                onChange={(e) => setForm({ ...form, address2: e.target.value })}
              />
            </div>

            <div>
              <label className="section-kicker mb-1" htmlFor="zip">
                {t.zipLabel}
              </label>
              <input
                id="zip"
                className="input"
                placeholder={t.zipPlaceholder}
                value={form.zip}
                onChange={(e) => setForm({ ...form, zip: e.target.value })}
              />
            </div>

            <div>
              <label className="section-kicker mb-1" htmlFor="city">
                {t.cityLabel}
              </label>
              <input
                id="city"
                className="input"
                placeholder={t.cityPlaceholder}
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
            </div>

            <div>
              <label className="section-kicker mb-1" htmlFor="province">
                {t.provLabel}
              </label>
              <input
                id="province"
                className="input"
                placeholder={t.provPlaceholder}
                value={form.province}
                onChange={(e) => setForm({ ...form, province: e.target.value })}
              />
            </div>

            <div>
              <label className="section-kicker mb-1" htmlFor="country">
                {t.countryLabel}
              </label>
              <input
                id="country"
                className="input"
                placeholder={t.countryPlaceholder}
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
              />
            </div>
          </div>

          <label className="flex items-start gap-3 text-sm text-white/70">
            <input
              type="checkbox"
              className="mt-1"
              checked={form.acceptRules}
              onChange={(e) => setForm({ ...form, acceptRules: e.target.checked })}
            />
            <span>{t.accept}</span>
          </label>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              className={`btn btn-brand px-6 ${
                !ok || loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
              disabled={!ok || loading}
              aria-busy={loading}
              onClick={onStartCheckout}
            >
              {loading ? t.buttonLoading : t.buttonIdle}
            </button>

            <span className="text-xs text-white/45">{t.privacy}</span>
          </div>
        </section>

        {/* FAQ */}
        <section className="card space-y-3">
          <h2 className="text-xl font-extrabold">{t.faqTitle}</h2>

          <div className="space-y-2 text-sm text-white/70">
            <div>
              <p className="font-semibold text-white/85">{t.faq1q}</p>
              <p className="text-white/70">{t.faq1a}</p>
            </div>
            <div>
              <p className="font-semibold text-white/85">{t.faq2q}</p>
              <p className="text-white/70">{t.faq2a}</p>
            </div>
            <div>
              <p className="font-semibold text-white/85">{t.faq3q}</p>
              <p className="text-white/70">{t.faq3a}</p>
            </div>
            <div>
              <p className="font-semibold text-white/85">{t.faq4q}</p>
              <p className="text-white/70">{t.faq4a}</p>
            </div>
          </div>
        </section>

        {/* LINKS */}
        <section className="card space-y-3">
          <h2 className="text-xl font-extrabold flex items-center gap-2">
            <span>{t.linksTitle}</span>
            <span>🔗</span>
          </h2>
          <ul className="bullets space-y-1 text-sm text-white/70">
            <li>
              <a href={returnsHref} className="btn-link">
                {t.linksReturns}
              </a>
            </li>
            <li>
              <a href={shippingHref} className="btn-link">
                {t.linksShipping}
              </a>
            </li>
            <li>
              <a href={termsHref} className="btn-link">
                {t.linksTerms}
              </a>
            </li>
          </ul>
        </section>
      </main>

      <Footer lang={lang} />
    </>
  );
}
