"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { CartLines } from "@/components/cart/CartLines";
import { ButtonLink } from "@/components/ui/Button";
import { EASE } from "@/lib/motion";
import { formatNaira } from "@/lib/utils";
import { cartCount, cartSubtotal, useCart } from "@/store/cart";
import { useUI } from "@/store/ui";
import { X } from "@phosphor-icons/react";

export function CartDrawer() {
  const open = useUI((s) => s.cartOpen);
  const close = useUI((s) => s.closeCart);
  const count = useCart(cartCount);
  const subtotal = useCart(cartSubtotal);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="cart-backdrop"
            className="fixed inset-0 z-[80] bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          />
          <motion.aside
            key="cart-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Your bag"
            className="fixed inset-y-0 right-0 z-[90] flex w-full max-w-[440px] flex-col bg-white"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            <div className="flex items-center justify-between border-b border-hairline-soft px-6 py-4">
              <h2 className="text-fs-24 font-medium leading-tight">Bag{mounted && count > 0 ? ` (${count})` : ""}</h2>
              <button type="button" aria-label="Close bag" onClick={close} className="flex size-10 items-center justify-center rounded-full bg-cloud transition active:scale-90">
                <X size={20} aria-hidden />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6">
              {mounted && count > 0 ? (
                <CartLines compact onNavigate={close} />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                  <p className="text-fs-24 font-medium">Your bag is empty</p>
                  <p className="text-fs-16 text-mute">Add something to get moving.</p>
                  <ButtonLink href="/shop" onClick={close}>Shop All</ButtonLink>
                </div>
              )}
            </div>

            {mounted && count > 0 && (
              <div className="space-y-4 border-t border-hairline-soft px-6 py-5">
                <div className="flex justify-between text-fs-16 font-medium">
                  <span>Subtotal</span>
                  <span>{formatNaira(subtotal)}</span>
                </div>
                <ButtonLink href="/checkout" onClick={close} size="lg" className="w-full">Checkout</ButtonLink>
                <ButtonLink href="/cart" onClick={close} variant="secondary" size="lg" className="w-full">View Bag</ButtonLink>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
