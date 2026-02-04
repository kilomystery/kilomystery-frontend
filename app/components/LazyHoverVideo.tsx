"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

type Props = React.VideoHTMLAttributes<HTMLVideoElement> & {
  src: string;
  poster?: string;
  className?: string;
};

export default function LazyHoverVideo({ src, poster, className, ...rest }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const [isReady, setIsReady] = useState(false);

  const canHover = useMemo(() => {
    if (typeof window === "undefined") return true;
    return window.matchMedia?.("(hover: hover) and (pointer: fine)")?.matches ?? true;
  }, []);

  const prefersReduced = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
  }, []);

  async function safePlay() {
    const v = videoRef.current;
    if (!v) return;
    try {
      // su iOS è importante che sia muted + playsInline
      v.muted = true;
      v.playsInline = true;
      await v.play();
    } catch {
      // se blocca, non facciamo nulla (su mobile spesso serve interazione)
    }
  }

  function safePause() {
    const v = videoRef.current;
    if (!v) return;
    try {
      v.pause();
      v.currentTime = 0;
    } catch {}
  }

  // ✅ Desktop hover
  function onEnter() {
    if (prefersReduced) return;
    safePlay();
  }
  function onLeave() {
    if (prefersReduced) return;
    safePause();
  }

  // ✅ Mobile: tap / touch (non esiste hover)
  function onPointerDown() {
    if (prefersReduced) return;
    if (!canHover) safePlay();
  }

  // ✅ Mobile: autoplay quando entra in viewport (muted+inline)
  useEffect(() => {
    if (canHover) return; // desktop già gestito con hover
    if (prefersReduced) return;

    const el = wrapRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        if (!e) return;
        if (e.isIntersecting && e.intersectionRatio >= 0.5) {
          safePlay();
        } else {
          safePause();
        }
      },
      { threshold: [0, 0.5, 1] }
    );

    io.observe(el);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canHover, prefersReduced]);

  return (
    <div
      ref={wrapRef}
      onMouseEnter={canHover ? onEnter : undefined}
      onMouseLeave={canHover ? onLeave : undefined}
      onPointerDown={onPointerDown}
      className="h-full w-full"
    >
      <video
        ref={videoRef}
        className={className}
        src={src}
        poster={poster}
        preload="none"
        muted
        playsInline
        loop
        // 👇 attributo extra utile per alcuni Safari/iOS
        {...({ "webkit-playsinline": "true" } as any)}
        // appena pronto, segna ready (facoltativo)
        onCanPlay={() => setIsReady(true)}
        // se vuoi: evita controlli
        controls={false}
        {...rest}
      />
    </div>
  );
}
