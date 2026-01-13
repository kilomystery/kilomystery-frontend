"use client";

import Link from "next/link";
import clsx from "clsx";

type Props = {
  href: string;
  children: React.ReactNode;
  variant?: "brand" | "ghost";
};

export default function ButtonLink({
  href,
  children,
  variant = "brand",
}: Props) {
  const base =
    "inline-flex items-center justify-center rounded-full px-5 py-2.5 font-extrabold transition";
  const v =
    variant === "brand"
      ? "bg-gradient-to-r from-[#7A20FF] via-[#4c1d95] to-[#20D27A] hover:brightness-110"
      : "border border-white/12 bg-white/[0.03] hover:bg-white/[0.06]";

  return (
    <Link href={href} prefetch={false} className={clsx(base, v)}>
      {children}
    </Link>
  );
}
