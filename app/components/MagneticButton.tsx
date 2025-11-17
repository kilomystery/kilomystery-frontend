"use client";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { PropsWithChildren, useRef } from "react";

export default function MagneticButton({
  children,
  className = "",
}: PropsWithChildren<{ className?: string }>) {
  const ref = useRef<HTMLButtonElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotate = useTransform(mx, [-20, 20], [-3, 3]);

  return (
    <motion.button
      ref={ref}
      className={className}
      style={{ x: mx, y: my, rotate }}
      onMouseMove={(e) => {
        const el = ref.current!;
        const rect = el.getBoundingClientRect();
        const dx = e.clientX - (rect.left + rect.width / 2);
        const dy = e.clientY - (rect.top + rect.height / 2);
        mx.set(dx * 0.2);
        my.set(dy * 0.2);
      }}
      onMouseLeave={() => {
        mx.set(0);
        my.set(0);
      }}
      whileTap={{ scale: 0.97 }}
    >
      {children}
    </motion.button>
  );
}