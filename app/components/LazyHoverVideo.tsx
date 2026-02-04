"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Props = React.VideoHTMLAttributes<HTMLVideoElement> & {
  src: string;
  poster?: string;
  className?: string;
};

export default function LazyHoverVideo({
  src,
  poster,
  className,
  ...rest
}: Props) {
  const ref = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const isCoarsePointer = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia?.("(pointer: coarse)")?.matches ?? false;
  }, []);

  async function play() {
    const v = ref.current;
    if (!v) return;
    try {
      await v.play();
      setIsPlaying(true);
    } catch {
      // su iOS può fallire se non è muted/playsInline
      setIsPlaying(false);
    }
  }

  function pause() {
    const v = ref.current;
    if (!v) return;
    v.pause();
    setIsPlaying(false);
  }

  // Desktop: hover
  function onEnter() {
    if (isCoarsePointer) return;
    play();
  }
  function onLeave() {
    if (isCoarsePointer) return;
    pause();
  }

  // Mobile: tap
  function onTap() {
    if (!isCoarsePointer) return;
    if (isPlaying) pause();
    else play();
  }

  // sicurezza: su mobile lascia sempre muted + playsInline
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = true;
    v.playsInline = true;
    v.loop = true;
    v.preload = "none";
  }, []);

  return (
    <video
      ref={ref}
      className={className}
      poster={poster}
      muted
      playsInline
      loop
      preload="none"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onClick={onTap}
      onTouchStart={onTap}
      {...rest}
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}
