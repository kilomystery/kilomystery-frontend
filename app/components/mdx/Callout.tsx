"use client";

import { ReactNode } from "react";
import clsx from "clsx";

type Props = {
  title?: string;
  children: ReactNode;
  variant?: "info" | "success" | "warning" | "danger";
};

const styles: Record<NonNullable<Props["variant"]>, string> = {
  info: "border-white/10 bg-white/[0.04]",
  success: "border-emerald-300/30 bg-emerald-500/10",
  warning: "border-amber-300/30 bg-amber-500/10",
  danger: "border-rose-300/30 bg-rose-500/10",
};

const dots: Record<NonNullable<Props["variant"]>, string> = {
  info: "bg-white/50",
  success: "bg-emerald-300",
  warning: "bg-amber-300",
  danger: "bg-rose-300",
};

export default function Callout({
  title,
  children,
  variant = "info",
}: Props) {
  return (
    <div className={clsx("card border p-4 rounded-2xl", styles[variant])}>
      {title && (
        <div className="flex items-center gap-2 mb-2">
          <span className={clsx("h-2 w-2 rounded-full", dots[variant])} />
          <div className="text-sm font-extrabold">{title}</div>
        </div>
      )}
      <div className="text-sm md:text-base text-white/80 leading-relaxed">
        {children}
      </div>
    </div>
  );
}
