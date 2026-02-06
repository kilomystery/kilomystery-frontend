"use client";

import { useEffect } from "react";
import { trackViewContent } from "@/app/lib/tracking";

export default function ProductClient({ product }: { product: any }) {
  useEffect(() => {
    if (!product) return;
    trackViewContent({
      id: product.id,
      shopifyId: product.shopifyId,
      title: product.title,
      tier: product.tier,
      price: Number(product.price ?? 0),
      qty: 1,
    });
  }, [product]);

  return (
    // ... UI
    <div>...</div>
  );
}
