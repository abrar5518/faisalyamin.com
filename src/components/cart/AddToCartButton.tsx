"use client";

import { useMemo } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { trackAddToCart } from "@/lib/metaPixel";

function parsePriceLabel(label: string) {
  const parts = label.trim().split(/\s+/);
  const currency = parts[0] || "PKR";
  const amount = Number(label.replace(/[^\d.]/g, ""));
  return {
    currency,
    amount: Number.isFinite(amount) ? amount : 0,
  };
}

export default function AddToCartButton({
  id,
  productId,
  slug,
  name,
  priceLabel,
  compareAtLabel,
  image,
  href,
  badge,
  subtitle,
  variantLabel,
  sizeLabel,
  qty = 1,
  className,
}: {
  id: string;
  productId?: number;
  slug?: string;
  name: string;
  priceLabel: string;
  compareAtLabel?: string;
  image: string;
  href?: string;
  badge?: string;
  subtitle?: string;
  variantLabel?: string;
  sizeLabel?: string;
  qty?: number;
  className?: string;
}) {
  const { addItem } = useCart();
  const price = useMemo(() => parsePriceLabel(priceLabel), [priceLabel]);
  const compareAt = compareAtLabel ? parsePriceLabel(compareAtLabel).amount : undefined;

  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        addItem({
          id,
          productId,
          slug,
          name,
          price: price.amount,
          compareAt,
          qty,
          image,
          href,
          badge,
          subtitle,
          variantLabel,
          sizeLabel,
          currency: price.currency,
        });
        trackAddToCart({
          id: productId ?? id,
          slug,
          name,
          price: price.amount,
        });
      }}
    >
      Add to Cart
    </button>
  );
}
