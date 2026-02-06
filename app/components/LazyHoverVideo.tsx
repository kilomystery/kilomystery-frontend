"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";

type Props = {
  src: string;
  poster?: string;
  className?: string;
  preload?: "none" | "metadata" | "auto";
};

/**
 * Autoplay + loop (muted) su desktop e mobile.
 * Avvia solo quando è visibile (viewport), pausa quando esce.
 * iOS-safe: muted + playsInline + play() in try/catch.
 */
export default function LazyHoverVideo({
  src,
  poster,
  className = "",
  preload = "metadata",
}: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [isReady, setIsReady] = useState(false);

  const key = useMemo(() => src, [src]);

  useEffect(() => {
    const v = videoRef.current;
    const wrap = wrapRef.current;
    if (!v || !wrap) return;

    let cancelled = false;

    // iOS / mobile autoplay-safe settings
    v.muted = true;
    v.playsInline = true;
    v.loop = true;
    v.preload = preload;
    v.autoplay = true;

    const markReady = () => {
      if (cancelled) return;
      setIsReady(true);
    };

    const playSafe = async () => {
      const vv = videoRef.current;
      if (!vv) return;
      try {
        if (vv.readyState >= 2) markReady();
        await vv.play();
      } catch {
        // iOS può bloccare in alcuni casi: ci riproverà al prossimo intersect/canplay
      }
    };

    const pauseSafe = () => {
      const vv = videoRef.current;
      if (!vv) return;
      try {
        vv.pause();
      } catch {}
    };

    const onCanPlay = () => {
      markReady();
      void playSafe();
    };

    v.addEventListener("canplay", onCanPlay);
    v.addEventListener("loadeddata", onCanPlay);

    // Avvia/pausa in base alla visibilità
    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;

        if (entry.isIntersecting) {
          void playSafe();
        } else {
          pauseSafe();
        }
      },
      {
        root: null,
        threshold: 0.25, // parte quando almeno 25% è visibile
      }
    );

    io.observe(wrap);

    // fallback: se già visibile subito
    void playSafe();

    return () => {
      cancelled = true;
      v.removeEventListener("canplay", onCanPlay);
      v.removeEventListener("loadeddata", onCanPlay);
      io.disconnect();
    };
  }, [src, preload]);

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      {/* Poster solo finché non è pronto */}
      {poster && !isReady ? (
        <Image
          src={poster}
          alt=""
          aria-hidden="true"
          fill
          className="object-cover"
          loading="lazy"
          decoding="async"
          sizes="100vw"
        />
      ) : null}

      <video
        key={key}
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        src={src}
        poster={poster}
        muted
        playsInline
        loop
        autoPlay
        preload={preload}
      />
    </div>
  );
}
