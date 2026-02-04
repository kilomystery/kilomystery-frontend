"use client";

import React, { useEffect, useMemo, useRef } from "react";

type Props = React.VideoHTMLAttributes<HTMLVideoElement> & {
  src: string;
  poster?: string;
  className?: string; // qui passa "media rounded-[12px] object-cover"
};

export default function LazyHoverVideo({ src, poster, className, ...rest }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

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
      v.muted = true;
      v.playsInline = true;
      await v.play();
    } catch {
      // su mobile spesso serve interazione: ok
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
  const onEnter = () => {
    if (prefersReduced) return;
    safePlay();
  };
  const onLeave = () => {
    if (prefersReduced) return;
    safePause();
  };

  // ✅ Mobile tap (hover non esiste)
  const onPointerDown = () => {
    if (prefersReduced) return;
    if (!canHover) safePlay();
  };

  // ✅ Mobile: autoplay quando entra in viewport (solo mobile)
  useEffect(() => {
    if (canHover) return;
    if (prefersReduced) return;

    const v = videoRef.current;
    if (!v) return;

    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        if (!e) return;
        if (e.isIntersecting && e.intersectionRatio >= 0.5) safePlay();
        else safePause();
      },
      { threshold: [0, 0.5, 1] }
    );

    io.observe(v);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canHover, prefersReduced]);

  return (
    <video
      ref={videoRef}
      className={className}
      src={src}
      poster={poster}
      preload="none"
      muted
      playsInline
      loop
      controls={false}
      // attributo utile per alcuni Safari
      {...({ "webkit-playsinline": "true" } as any)}
      onMouseEnter={canHover ? onEnter : undefined}
      onMouseLeave={canHover ? onLeave : undefined}
      onPointerDown={onPointerDown}
      {...rest}
    />
  );
}
