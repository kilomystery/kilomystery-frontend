"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type Props = {
  images: string[];
  alt: string;
  priority?: boolean;
  intervalMs?: number;
  sizes?: string;
};

export default function AutoImageCarousel({
  images,
  alt,
  priority = false,
  intervalMs = 3200,
  sizes = "(min-width: 1024px) 520px, (min-width: 768px) 50vw, 92vw",
}: Props) {
  const safeImages = images.filter(Boolean);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (safeImages.length <= 1) return;

    const timer = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % safeImages.length);
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [safeImages.length, intervalMs]);

  if (!safeImages.length) return null;

  return (
    <div className="relative h-full w-full overflow-hidden rounded-[12px]">
      {safeImages.map((src, i) => (
        <div
          key={`${src}-${i}`}
          className={`absolute inset-0 transition-opacity duration-700 ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={src}
            alt={alt}
            fill
            className="media rounded-[12px] object-cover"
            sizes={sizes}
            priority={priority && i === 0}
          />
        </div>
      ))}

      {safeImages.length > 1 ? (
        <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/35 px-2 py-1 backdrop-blur-sm">
          {safeImages.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 w-1.5 rounded-full transition-all ${
                i === index ? "bg-white" : "bg-white/35"
              }`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}