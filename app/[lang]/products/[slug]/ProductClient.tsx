"use client";

import { useEffect } from "react";
import { ttqTrack } from "@/app/lib/tiktok";

export default function ProductClient({ product }: { product: any }) {
  useEffect(() => {
    ttqTrack("ViewContent", {
      content_id: product.shopifyId || product.id,
      content_type: "product",
      content_name: product.title,
      value: Number(product.price ?? 0),
      currency: "EUR",
    });
  }, [product]);

  return (
    // ... UI
    <div>...</div>
  );
}
