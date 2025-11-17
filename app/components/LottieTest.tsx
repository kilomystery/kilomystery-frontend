"use client";

import { useEffect, useRef } from "react";
import lottie, { AnimationItem } from "lottie-web";

export default function LottieTest() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let anim: AnimationItem | null = null;

    // JSON MINIMALE (pallino che pulsa) — SOLO PER TEST
    const data = {
      v: "5.7.4",
      fr: 60,
      ip: 0,
      op: 120,
      w: 300,
      h: 300,
      nm: "pulse",
      ddd: 0,
      assets: [],
      layers: [
        {
          ddd: 0,
          ind: 1,
          ty: 4,
          nm: "circle",
          sr: 1,
          ks: {
            o: { a: 0, k: 100 },
            r: { a: 0, k: 0 },
            p: { a: 0, k: [150, 150, 0] },
            a: { a: 0, k: [0, 0, 0] },
            s: {
              a: 1,
              k: [
                { t: 0, s: [80, 80, 100], e: [100, 100, 100] },
                { t: 60, s: [100, 100, 100], e: [80, 80, 100] },
                { t: 120 }
              ]
            }
          },
          shapes: [
            {
              ty: "el",
              p: { a: 0, k: [0, 0] },
              s: { a: 0, k: [160, 160] },
              nm: "Ellipse Path 1"
            },
            {
              ty: "fl",
              c: { a: 0, k: [0.48, 0.13, 1, 1] },
              o: { a: 0, k: 100 },
              nm: "Fill 1"
            }
          ],
          ip: 0,
          op: 120,
          st: 0,
          b: 0
        }
      ]
    };

    if (ref.current) {
      anim = lottie.loadAnimation({
        container: ref.current,
        renderer: "svg",
        loop: true,
        autoplay: true,
        animationData: data,
      });
    }
    return () => { try { anim?.destroy(); } catch {} };
  }, []);

  // Contenitore con dimensioni esplicite
  return <div ref={ref} style={{ width: 300, height: 300, margin: "0 auto" }} />;
}