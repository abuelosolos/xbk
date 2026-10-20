"use client";

import { useEffect, useState } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { formatNaira } from "@/lib/utils";
import { cartCount, cartSubtotal, useCart } from "@/store/cart";

const field =
  "h-12 w-full rounded-field border border-hairline bg-white px-4 text-[16px] outline-none transition focus:border-ink focus:ring-2 focus:ring-ink";

export function CheckoutForm({ email, name }: { email: string; name: string }) {
  const items = useCart((s) => s.items);
  const count = useCart(cartCount);
  const subtotal = useCart(cartSubtotal);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="min-h-[60vh]" />;

  if (count === 0) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-[1100px] flex-col items-start justify-center gap-5 px-4 lg:px-12">
        <h1 className="text-[32px] font-medium">Checkout</h1>
        <p className="text-[16px] text-mute">Your bag is empty.</p>
        <ButtonLink href="/shop">Shop All</ButtonLink>
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const shipping = Object.fromEntries(
      ["fullName", "phone", "address", "city", "state"].map((k) => [k, String(form.get(k) ?? "")]),
    );
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.productId, size: i.size, color: i.color, qty: i.qty })),
          shipping,
        }),
      });
      const data = (await res.json()) as { authorizationUrl?: string; error?: string };
      if (!res.ok || !data.authorizationUrl) throw new Error(data.error ?? "Checkout failed.");
      window.location.href = data.authorizationUrl; // hand off to Paystack
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed.");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-[1100px] gap-12 px-4 pt-10 lg:grid-cols-[1fr_340px] lg:px-12">
      <form onSubmit={onSubmit} className="space-y-4">
        <h1 className="text-[32px] font-medium">Checkout</h1>
        <p className="text-[16px] text-mute">Paying as {email}</p>
        <h2 className="pt-4 text-[24px] font-medium">Delivery</h2>
        <input name="fullName" required defaultValue={name} placeholder="Full name" autoComplete="name" className={field} />
        <input name="phone" required type="tel" placeholder="Phone number" autoComplete="tel" className={field} />
        <input name="address" required placeholder="Street address" autoComplete="street-address" className={field} />
        <div className="grid grid-cols-2 gap-4">
          <input name="city" required placeholder="City" autoComplete="address-level2" className={field} />
          <input name="state" required placeholder="State" autoComplete="address-level1" className={field} />
        </div>
        {error && <p role="alert" className="text-[14px] font-medium text-sale">{error}</p>}
        <Button type="submit" size="lg" disabled={loading} className="w-full">
          {loading ? "Redirecting to Paystack…" : "Pay with Paystack"}
        </Button>
      </form>

      <aside className="h-fit space-y-4 lg:sticky lg:top-24">
        <h2 className="text-[24px] font-medium">Order Summary</h2>
        <ul className="space-y-3 text-[14px]">
          {items.map((i) => (
            <li key={i.key} className="flex justify-between gap-3">
              <span>{i.qty} × {i.name} <span className="text-mute">({i.size})</span></span>
              <span className="font-medium">{formatNaira(i.unitPriceKobo * i.qty)}</span>
            </li>
          ))}
        </ul>
        <div className="flex justify-between border-t border-hairline-soft pt-4 text-[16px] font-medium">
          <span>Total</span>
          <span>{formatNaira(subtotal)}</span>
        </div>
      </aside>
    </div>
  );
}
