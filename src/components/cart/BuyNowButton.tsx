"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart/CartProvider";
import { useGlobalCopy } from "@/components/GlobalCopyProvider";

function parsePriceLabel(label: string) {
  const parts = label.trim().split(/\s+/);
  const currency = parts[0] || "PKR";
  const amount = Number(label.replace(/[^\d.]/g, ""));
  return {
    currency,
    amount: Number.isFinite(amount) ? amount : 0,
  };
}

export default function BuyNowButton({
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
  label,
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
  label?: string;
}) {
  const { addItem } = useCart();
  const globalCopy = useGlobalCopy();
  const router = useRouter();
  const price = useMemo(() => parsePriceLabel(priceLabel), [priceLabel]);
  const compareAt = compareAtLabel ? parsePriceLabel(compareAtLabel).amount : undefined;

  const onBuyNow = () => {
    addItem(
      {
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
      },
      { showToast: false, openCart: false },
    );
    router.push("/checkout");
  };

  return (
    <button type="button" className={className} onClick={onBuyNow}>
      {label || globalCopy.product.buyNow}
    </button>
  );
}
