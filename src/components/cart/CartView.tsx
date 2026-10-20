"use client";

import { useEffect, useState } from "react";
import { CartLines } from "@/components/cart/CartLines";
import { ButtonLink } from "@/components/ui/Button";
import { formatNaira } from "@/lib/utils";
import { cartCount, cartSubtotal, useCart } from "@/store/cart";

export function CartView() {
  const count = useCart(cartCount);
  const subtotal = useCart(cartSubtotal);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="min-h-[60vh]" />;

  if (count === 0) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-[1440px] flex-col items-start justify-center gap-5 px-4 lg:px-12">
        <h1 className="text-fs-32 font-medium">Bag</h1>
        <p className="text-fs-16 text-mute">There are no items in your bag.</p>
        <ButtonLink href="/shop">Shop All</ButtonLink>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-[1100px] gap-12 px-4 pt-10 lg:grid-cols-[1fr_340px] lg:px-12">
      <div>
        <h1 className="mb-2 text-fs-32 font-medium">Bag</h1>
        <CartLines />
      </div>
      <aside className="h-fit space-y-4 lg:sticky lg:top-24">
        <h2 className="text-fs-24 font-medium">Summary</h2>
        <div className="flex justify-between text-fs-16">
          <span>Subtotal</span>
          <span className="font-medium">{formatNaira(subtotal)}</span>
        </div>
        <div className="flex justify-between border-t border-hairline-soft pt-4 text-fs-16 font-medium">
          <span>Total</span>
          <span>{formatNaira(subtotal)}</span>
        </div>
        <ButtonLink href="/checkout" size="lg" className="w-full">Checkout</ButtonLink>
      </aside>
    </div>
  );
}
