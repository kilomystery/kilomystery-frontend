"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";

type Props = {
  src: string;
  poster?: string;
  className?: string;
  preload?: "none" | "metadata" | "auto";
};

export default function LazyHoverVideo({
  src,
  poster,
  className = "",
  preload = "metadata",
}: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [needsTap, setNeedsTap] = useState(false);

  const key = useMemo(() => src, [src]);

  useEffect(() => {
    const v = videoRef.current;
    const wrap = wrapRef.current;
    if (!v || !wrap) return;

    let cancelled = false;

    // iOS/Safari: set attributi + proprietà (più affidabile)
    v.muted = true;
    v.defaultMuted = true;
    v.volume = 0;
    v.playsInline = true;
    v.loop = true;
    v.preload = preload;
    v.autoplay = true;

    // attributi "hard" (iOS li gradisce)
    v.setAttribute("muted", "");
    v.setAttribute("playsinline", "");
    v.setAttribute("webkit-playsinline", "");
    v.setAttribute("autoplay", "");
    v.setAttribute("loop", "");

    const markReady = () => {
      if (cancelled) return;
      setIsReady(true);
    };

    const playSafe = async () => {
      const vv = videoRef.current;
      if (!vv) return;
      try {
        // su iOS aiuta forzare muted prima del play
        vv.muted = true;
        vv.defaultMuted = true;
        vv.volume = 0;

        const p = vv.play();
        if (p && typeof (p as any).then === "function") {
          await p;
        }
        setNeedsTap(false);
        if (vv.readyState >= 2) markReady();
      } catch {
        // autoplay bloccato -> mostriamo "tap to play"
        setNeedsTap(true);
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

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        if (entry.isIntersecting) void playSafe();
        else pauseSafe();
      },
      { threshold: 0.25 }
    );

    io.observe(wrap);

    // tentativo iniziale
    void playSafe();

    return () => {
      cancelled = true;
      v.removeEventListener("canplay", onCanPlay);
      v.removeEventListener("loadeddata", onCanPlay);
      io.disconnect();
    };
  }, [src, preload]);

  // TAP fallback: sblocca autoplay su iOS
  const onUserGesture = async () => {
    const v = videoRef.current;
    if (!v) return;
    try {
      v.muted = true;
      v.defaultMuted = true;
      v.volume = 0;
      await v.play();
      setNeedsTap(false);
      setIsReady(true);
    } catch {}
  };

  return (
    <div
      ref={wrapRef}
      className={`relative ${className}`}
      onTouchStart={onUserGesture}
      onPointerDown={onUserGesture}
      role="button"
      aria-label="Play preview"
    >
      {/* poster finché non è pronto */}
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
        // evita UI native
        controls={false}
        disablePictureInPicture
      />

      {/* overlay solo se iOS blocca autoplay */}
      {needsTap ? (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <div className="rounded-full bg-black/60 px-4 py-2 text-white text-sm">
            Tocca per avviare
          </div>
        </div>
      ) : null}
    </div>
  );
}
