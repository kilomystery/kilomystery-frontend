"use client";

import React, { useEffect, useRef } from "react";

type Props = React.VideoHTMLAttributes<HTMLVideoElement> & {
  src: string;
  poster?: string;
  className?: string;
  /** soglia viewport (0-1) */
  threshold?: number;
};

export default function LazyHoverVideo({
  src,
  poster,
  className,
  threshold = 0.35,
  ...rest
}: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

  async function safePlay() {
    const v = videoRef.current;
    if (!v) return;
    try {
      v.muted = true;
      v.playsInline = true;
      v.loop = true;
      await v.play();
    } catch {
      // alcuni browser bloccano: ma con muted di solito parte
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

  useEffect(() => {
    if (prefersReduced) return;

    const v = videoRef.current;
    if (!v) return;

    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        if (!e) return;

        if (e.isIntersecting && e.intersectionRatio >= threshold) {
          safePlay();
        } else {
          safePause();
        }
      },
      { threshold: [0, threshold, 1] }
    );

    io.observe(v);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threshold, prefersReduced]);

  return (
    <video
      ref={videoRef}
      className={className}
      src={src}
      poster={poster}
      preload="metadata"
      muted
      playsInline
      loop
      controls={false}
      // utile su alcuni Safari
      {...({ "webkit-playsinline": "true" } as any)}
      {...rest}
    />
  );
}
