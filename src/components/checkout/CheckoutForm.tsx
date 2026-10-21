"use client";

import { useEffect, useState } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { shippingFeeKobo } from "@/lib/shipping";
import { formatNaira } from "@/lib/utils";
import { cartCount, cartSubtotal, useCart } from "@/store/cart";

const field =
  "h-12 w-full rounded-field border border-hairline bg-white px-4 text-fs-16 outline-none transition focus:border-ink focus:ring-2 focus:ring-ink";

export function CheckoutForm({ email, name }: { email: string; name: string }) {
  const items = useCart((s) => s.items);
  const count = useCart(cartCount);
  const subtotal = useCart(cartSubtotal);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState("");

  useEffect(() => setMounted(true), []);
  const fee = shippingFeeKobo(state);
  if (!mounted) return <div className="min-h-[60vh]" />;

  if (count === 0) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-[1100px] flex-col items-start justify-center gap-5 px-4 lg:px-12">
        <h1 className="text-fs-32 font-medium">Checkout</h1>
        <p className="text-fs-16 text-mute">Your bag is empty.</p>
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
        <h1 className="text-fs-32 font-medium">Checkout</h1>
        <p className="text-fs-16 text-mute">Paying as {email}</p>
        <h2 className="pt-4 text-fs-24 font-medium">Delivery</h2>
        <input name="fullName" required defaultValue={name} placeholder="Full name" autoComplete="name" className={field} />
        <input name="phone" required type="tel" placeholder="Phone number" autoComplete="tel" className={field} />
        <input name="address" required placeholder="Street address" autoComplete="street-address" className={field} />
        <div className="grid grid-cols-2 gap-4">
          <input name="city" required placeholder="City" autoComplete="address-level2" className={field} />
          <input name="state" required value={state} onChange={(e) => setState(e.target.value)} placeholder="State" autoComplete="address-level1" className={field} />
        </div>
        {error && <p role="alert" className="text-fs-14 font-medium text-sale">{error}</p>}
        <Button type="submit" size="lg" disabled={loading} className="w-full">
          {loading ? "Redirecting to Paystack…" : "Pay with Paystack"}
        </Button>
      </form>

      <aside className="h-fit space-y-4 lg:sticky lg:top-24">
        <h2 className="text-fs-24 font-medium">Order Summary</h2>
        <ul className="space-y-3 text-fs-14">
          {items.map((i) => (
            <li key={i.key} className="flex justify-between gap-3">
              <span>{i.qty} × {i.name} <span className="text-mute">({i.size})</span></span>
              <span className="font-medium">{formatNaira(i.unitPriceKobo * i.qty)}</span>
            </li>
          ))}
        </ul>
        <div className="space-y-2 border-t border-hairline-soft pt-4 text-fs-14">
          <div className="flex justify-between"><span>Subtotal</span><span>{formatNaira(subtotal)}</span></div>
          <div className="flex justify-between">
            <span>Delivery</span>
            <span>{state.trim() ? formatNaira(fee) : "Enter your state"}</span>
          </div>
        </div>
        <div className="flex justify-between border-t border-hairline-soft pt-4 text-fs-16 font-medium">
          <span>Total</span>
          <span>{formatNaira(subtotal + (state.trim() ? fee : 0))}</span>
        </div>
      </aside>
    </div>
  );
}
