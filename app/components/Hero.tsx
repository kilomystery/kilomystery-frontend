'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export default function Hero({ lang = 'it' }: { lang?: string }) {
  return (
    <section className="container pt-10 md:pt-14 pb-10">
      {/* LOGO */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="mx-auto mb-6 md:mb-8 w-[220px] md:w-[320px]"
      >
        <img
          src="/hero/hero.svg"
          alt="KiloMistery"
          className="w-full h-auto drop-shadow-[0_0_30px_rgba(124,58,237,0.35)]"
        />
      </motion.div>

      {/* TITOLO */}
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.05 }}
        className="text-center text-4xl md:text-5xl font-extrabold leading-tight"
      >
        <span className="bg-gradient-to-r from-[#7A20FF] via-white to-[#20D27A] bg-clip-text text-transparent">
          Mystery box al Kg
        </span>
      </motion.h1>

      {/* SOTTOTITOLO */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.12 }}
        className="text-center text-white/70 max-w-2xl mx-auto mt-3 md:mt-4"
      >
        Scegli Standard o Premium, seleziona il peso e aggiungi al carrello.
        Trasparenza, tracciabilità, sorpresa vera.
      </motion.p>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.18 }}
        className="mt-7 md:mt-9 flex items-center justify-center gap-3 flex-wrap"
      >
        {/* Pulsante brand (viola→verde), pill, ombre, hover */}
        <Link
          href={`/${lang}/products`}
          className="inline-flex items-center justify-center rounded-full px-5 py-3 font-extrabold text-[#0c0f10]
                     bg-gradient-to-r from-[#7A20FF] to-[#20D27A]
                     shadow-[0_14px_36px_rgba(122,32,255,.25),0_8px_24px_rgba(32,210,122,.25)]
                     border border-white/70 transition-transform duration-150 hover:-translate-y-0.5"
        >
          Vedi prezzi
        </Link>

        {/* Pulsante ghost elegante */}
        <a
          href="#come-funziona"
          className="inline-flex items-center justify-center rounded-full px-5 py-3 font-bold
                     text-white bg-white/10 border border-white/25
                     shadow-[0_8px_22px_rgba(0,0,0,.25)]
                     transition-transform duration-150 hover:bg-white/15 hover:-translate-y-0.5"
        >
          Come funziona
        </a>
      </motion.div>
    </section>
  )
}