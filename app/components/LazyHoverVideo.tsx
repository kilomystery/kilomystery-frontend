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
 * Modalità "sempre in loop":
 * - prova autoplay aggressivo (muted + playsInline + attributi hard iOS)
 * - riprova su visibilitychange/pageshow
 * - sblocca con tap (touch/pointer) se iOS blocca autoplay
 *
 * NOTA iOS: non esiste garanzia che TUTTI i video in pagina riproducano insieme.
 * Questo però massimizza le probabilità.
 */
export default function LazyHoverVideo({
  src,
  poster,
  className = "",
  preload = "auto",
}: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isReady, setIsReady] = useState(false);

  const key = useMemo(() => src, [src]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    let cancelled = false;

    const applyIOSHardAttrs = (el: HTMLVideoElement) => {
      // props/runtime
      el.muted = true;
      el.defaultMuted = true;
      el.volume = 0;
      el.playsInline = true;
      el.loop = true;
      el.autoplay = true;
      el.preload = preload;

      // attributi "hard" (Safari iOS li gradisce)
      el.setAttribute("muted", "");
      el.setAttribute("playsinline", "");
      el.setAttribute("webkit-playsinline", "");
      el.setAttribute("autoplay", "");
      el.setAttribute("loop", "");
    };

    applyIOSHardAttrs(v);

    const playSafe = async () => {
      const vv = videoRef.current;
      if (!vv || cancelled) return;
      try {
        applyIOSHardAttrs(vv);

        const p = vv.play();
        if (p && typeof (p as any).then === "function") await p;

        if (!cancelled) setIsReady(true);
      } catch {
        // autoplay bloccato: si sblocca con gesture (touch/pointer)
      }
    };

    const onCanPlay = () => void playSafe();
    const onVisibility = () => {
      if (document.visibilityState === "visible") void playSafe();
    };
    const onPageShow = () => void playSafe();

    v.addEventListener("canplay", onCanPlay);
    v.addEventListener("loadeddata", onCanPlay);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pageshow", onPageShow);

    // tentativo iniziale
    void playSafe();

    return () => {
      cancelled = true;
      v.removeEventListener("canplay", onCanPlay);
      v.removeEventListener("loadeddata", onCanPlay);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, [src, preload]);

  // gesture fallback per iOS
  const onUserGesture = async () => {
    const v = videoRef.current;
    if (!v) return;
    try {
      v.muted = true;
      v.defaultMuted = true;
      v.volume = 0;
      await v.play();
      setIsReady(true);
    } catch {}
  };

  return (
    <div
      className={`relative ${className}`}
      onTouchStart={onUserGesture}
      onPointerDown={onUserGesture}
      aria-hidden="true"
    >
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
        controls={false}
        disablePictureInPicture
      />
    </div>
  );
}
