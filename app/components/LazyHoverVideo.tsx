"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  src: string;
  poster?: string;
  className?: string;

  /** default: "metadata" */
  preload?: "none" | "metadata" | "auto";

  /** se vuoi farlo partire sempre anche fuori viewport (sconsigliato). default false */
  alwaysPlay?: boolean;
};

export default function LazyHoverVideo({
  src,
  poster,
  className = "",
  preload = "metadata",
  alwaysPlay = false,
}: Props) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [isInView, setIsInView] = useState(false);
  const [isReady, setIsReady] = useState(false); // quando il video ha abbastanza dati
  const [hasTriedPlay, setHasTriedPlay] = useState(false);

  // key per ricaricare bene se cambia src
  const key = useMemo(() => src, [src]);

  useEffect(() => {
    setIsReady(false);
    setHasTriedPlay(false);
  }, [key]);

  // IntersectionObserver per autoplay quando entra in viewport (mobile + desktop)
  useEffect(() => {
    if (alwaysPlay) {
      setIsInView(true);
      return;
    }
    const el = wrapRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setIsInView(!!entry?.isIntersecting);
      },
      {
        root: null,
        // parte un pelo prima (effetto premium: già “pronto” quando arrivi)
        rootMargin: "200px 0px",
        threshold: 0.15,
      }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [alwaysPlay]);

  // tenta play/pause in base a viewport
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    // set “hard” per mobile Safari
    v.muted = true;
    v.playsInline = true;
    v.loop = true;
    v.preload = preload;

    async function safePlay() {
      try {
        // evita ripetizioni inutili
        if (v.readyState >= 2) setIsReady(true);
        await v.play();
      } catch {
        // iOS a volte blocca finché non ha abbastanza buffer o finché non c’è gesture
      }
    }

    function safePause() {
      try {
        v.pause();
      } catch {}
    }

    if (isInView) {
      // tenta play solo una volta per ingresso viewport (riduce spam)
      if (!hasTriedPlay) {
        setHasTriedPlay(true);
        // piccolo delay per evitare “jank” in scroll
        requestAnimationFrame(() => {
          safePlay();
        });
      } else {
        safePlay();
      }
    } else {
      safePause();
    }
  }, [isInView, preload, hasTriedPlay]);

  // Quando il video è pronto, togliamo poster con fade (effetto premium)
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const onCanPlay = () => setIsReady(true);
    const onLoadedData = () => setIsReady(true);

    v.addEventListener("canplay", onCanPlay);
    v.addEventListener("loadeddata", onLoadedData);

    return () => {
      v.removeEventListener("canplay", onCanPlay);
      v.removeEventListener("loadeddata", onLoadedData);
    };
  }, [key]);

  return (
    <div
      ref={wrapRef}
      className={`km-video ${isReady ? "km-video--ready" : ""}`}
      style={{ position: "relative", width: "100%", height: "100%" }}
    >
      {/* Poster (sempre) — fade out quando video ready */}
      {poster ? (
        <img
          src={poster}
          alt=""
          aria-hidden="true"
          className="km-video__poster"
          loading="lazy"
          decoding="async"
        />
      ) : null}

      {/* Video */}
      <video
        key={key}
        ref={videoRef}
        className={`km-video__el ${className}`}
        src={src}
        muted
        playsInline
        loop
        preload={preload}
        // niente controls
        controls={false}
      />
    </div>
  );
}
