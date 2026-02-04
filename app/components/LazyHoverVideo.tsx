"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  VideoHTMLAttributes,
} from "react";

type LazyHoverVideoProps = VideoHTMLAttributes<HTMLVideoElement> & {
  src: string;
  poster: string;
};

export default function LazyHoverVideo({
  src,
  poster,
  preload = "none",
  className,
  onMouseEnter,
  onMouseLeave,
  muted = true,
  loop = true,
  playsInline = true,
  ...rest
}: LazyHoverVideoProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const reduceQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pointerQuery = window.matchMedia("(pointer: fine)");

    const handleReduce = (event: MediaQueryListEvent | MediaQueryList) => {
      setPrefersReducedMotion(event.matches);
    };
    const handlePointer = (event: MediaQueryListEvent | MediaQueryList) => {
      setIsDesktop(event.matches);
    };

    handleReduce(reduceQuery);
    handlePointer(pointerQuery);

    reduceQuery.addEventListener("change", handleReduce);
    pointerQuery.addEventListener("change", handlePointer);

    return () => {
      reduceQuery.removeEventListener("change", handleReduce);
      pointerQuery.removeEventListener("change", handlePointer);
    };
  }, []);

  useEffect(() => {
    if (isDesktop) return;
    const el = videoRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldLoad(true);
            if (!prefersReducedMotion) {
              requestAnimationFrame(() => {
                el.play().catch(() => {});
              });
            }
          } else {
            el.pause();
          }
        });
      },
      { root: null, rootMargin: "200px 0px", threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [isDesktop, prefersReducedMotion]);

  const handleDesktopEnter = useCallback(() => {
    if (!isDesktop) return;
    const el = videoRef.current;
    if (!el) return;

    setShouldLoad(true);
    if (!prefersReducedMotion) {
      el.play().catch(() => {});
    }
  }, [isDesktop, prefersReducedMotion]);

  const handleDesktopLeave = useCallback(() => {
    if (!isDesktop) return;
    videoRef.current?.pause();
  }, [isDesktop]);

  return (
    <video
      {...rest}
      ref={videoRef}
      className={className}
      poster={poster}
      preload={preload}
      playsInline={playsInline}
      muted={muted}
      loop={loop}
      autoPlay={false}
      src={shouldLoad ? src : undefined}
      onMouseEnter={(event) => {
        handleDesktopEnter();
        onMouseEnter?.(event);
      }}
      onMouseLeave={(event) => {
        handleDesktopLeave();
        onMouseLeave?.(event);
      }}
    />
  );
}
