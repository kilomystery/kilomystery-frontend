"use client";

/* eslint-disable @next/next/no-img-element */

import React, { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  src: string;
  poster?: string;
  className?: string;
  preload?: "none" | "metadata" | "auto";
  /** se vuoi disattivare autoplay/loop su qualche uso specifico */
  autoPlay?: boolean;
};

export default function LazyHoverVideo({
  src,
  poster,
  className = "",
  preload = "metadata",
  autoPlay = true,
}: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isReady, setIsReady] = useState(false);

  // chiave stabile per rimontare quando cambia src
  const key = useMemo(() => src, [src]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    let cancelled = false;

    // Impostazioni “safe” per iOS + autoplay
    v.muted = true;
    v.playsInline = true;
    v.loop = true;
    v.preload = preload;

    const markReady = () => {
      if (cancelled) return;
      setIsReady(true);
    };

    const tryPlay = async () => {
      const vv = videoRef.current; // riprendi ref in modo sicuro
      if (!vv) return;

      try {
        // se già buffered abbastanza, segna ready
        if (vv.readyState >= 2) markReady();
        // prova a partire (su iOS può fallire senza gesture, ma con muted+playsInline spesso va)
        await vv.play();
      } catch {
        // fallback: appena può, riprova con eventi (non throw)
      }
    };

    const onCanPlay = () => {
      markReady();
      if (autoPlay) void tryPlay();
    };

    const onLoadedData = () => {
      markReady();
      if (autoPlay) void tryPlay();
    };

    v.addEventListener("canplay", onCanPlay);
    v.addEventListener("loadeddata", onLoadedData);

    // Avvio iniziale (loop continuo)
    if (autoPlay) {
      void tryPlay();
    }

    return () => {
      cancelled = true;
      v.removeEventListener("canplay", onCanPlay);
      v.removeEventListener("loadeddata", onLoadedData);
    };
  }, [src, preload, autoPlay]);

  return (
    <div className={className}>
      {/* poster overlay finché il video non è “ready” */}
      {poster && !isReady ? (
        <img
          src={poster}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
          decoding="async"
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
        preload={preload}
      />
    </div>
  );
}
