"use client";

import { useEffect, useState } from "react";
import { PaystackIcon } from "@/components/brand/ProviderIcons";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { PhoneField } from "@/components/ui/PhoneField";
import { SelectField } from "@/components/ui/SelectField";
import { useFieldErrors } from "@/lib/use-field-errors";
import { formatPhone, shippingSchema } from "@/lib/validation";
import type { SavedAddress } from "@/lib/addresses";
import { deliveryWindowLabel, deliversTo, shippingFeeKobo, type ShippingRates } from "@/lib/shipping";
import { normalizeState } from "@/lib/states";
import { cn, formatNaira } from "@/lib/utils";
import { cartCount, cartSubtotal, useCart } from "@/store/cart";

const empty = { phone: "", address: "", city: "", state: "", postalCode: "" };

export function CheckoutForm({
  email,
  name,
  saved = [],
  rates,
}: {
  email: string;
  name: string;
  saved?: SavedAddress[];
  rates: ShippingRates;
}) {
  const initial = saved.find((a) => a.isDefault) ?? null;
  const items = useCart((s) => s.items);
  const count = useCart(cartCount);
  const subtotal = useCart(cartSubtotal);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [picked, setPicked] = useState<string | null>(initial?.id ?? null);
  const [values, setValues] = useState({
    fullName: initial?.fullName ?? name,
    ...(initial
      ? { phone: formatPhone(initial.phone), address: initial.address, city: initial.city, state: normalizeState(initial.state) ?? "", postalCode: initial.postalCode }
      : empty),
  });
  const [saveDefault, setSaveDefault] = useState(saved.length === 0);
  const v = useFieldErrors(shippingSchema);
  const state = values.state;
  const bind = (k: keyof typeof values) => {
    const p = v.props(k);
    return {
      ...p,
      value: values[k],
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        p.onChange(e);
        setPicked(null);
        setValues((cur) => ({ ...cur, [k]: e.target.value }));
      },
    };
  };
  const pick = (a: SavedAddress) => {
    setPicked(a.id);
    v.setErrors({});
    setValues({ fullName: a.fullName, phone: formatPhone(a.phone), address: a.address, city: a.city, state: normalizeState(a.state) ?? "", postalCode: a.postalCode });
  };

  useEffect(() => setMounted(true), []);
  const fee = shippingFeeKobo(rates, state);
  const arrives = deliveryWindowLabel(rates, state);
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
    setError(null);
    const shipping = { ...values };
    if (!v.checkAll(shipping)) return;
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.productId, size: i.size, color: i.color, qty: i.qty })),
          shipping,
          saveDefault: picked === null && saveDefault,
        }),
      });
      const data = (await res.json()) as { authorizationUrl?: string; error?: string; errors?: Record<string, string> };
      if (data.errors && Object.keys(data.errors).length) v.setErrors(data.errors);
      if (!res.ok || !data.authorizationUrl) throw new Error(data.error ?? "Checkout failed.");
      window.location.href = data.authorizationUrl; // hand off to Paystack
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed.");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-[1100px] gap-12 px-4 pt-10 lg:grid-cols-[1fr_340px] lg:px-12">
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <h1 className="text-fs-32 font-medium">Checkout</h1>
        <p className="text-fs-16 text-mute">Paying as {email}</p>
        <h2 className="pt-4 text-fs-24 font-medium">Delivery</h2>
        {saved.length > 0 && (
          <ul className="grid gap-3 sm:grid-cols-2" aria-label="Saved addresses">
            {saved.map((a) => (
              <li key={a.id}>
                <button
                  type="button"
                  onClick={() => pick(a)}
                  aria-pressed={picked === a.id}
                  className={cn(
                    "w-full rounded-field border p-4 text-left text-fs-14 transition",
                    picked === a.id ? "border-ink" : "border-hairline hover:border-ink",
                  )}
                >
                  <span className="block font-medium">{a.fullName}</span>
                  <span className="block text-mute">{a.address}, {a.city}, {a.state}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
        <Field label="Full name" {...bind("fullName")} name="fullName" placeholder="Full name" autoComplete="name" />
        <PhoneField
          value={values.phone}
          error={v.errors.phone}
          onValueChange={(full) => {
            setPicked(null);
            setValues((cur) => ({ ...cur, phone: full }));
            if (v.errors.phone) v.check("phone", full);
          }}
          onBlur={() => values.phone && v.check("phone", values.phone)}
        />
        <Field label="Street address" {...bind("address")} name="address" placeholder="Street address" autoComplete="street-address" />
        <div className="grid grid-cols-2 gap-4">
          <Field label="City" {...bind("city")} name="city" placeholder="City" autoComplete="address-level2" />
          <SelectField
            label="State"
            name="state"
            placeholder="State"
            autoComplete="address-level1"
            value={values.state}
            error={v.errors.state ?? (state && !deliversTo(rates, state) ? "We don't currently deliver to this state." : undefined)}
            options={rates.filter((r) => r.active).map((r) => ({ value: r.state, label: r.state }))}
            onChange={(e) => {
              setPicked(null);
              setValues((cur) => ({ ...cur, state: e.target.value }));
              if (v.errors.state || e.target.value) v.check("state", e.target.value);
            }}
          />
        </div>
        <Field label="Postal code" {...bind("postalCode")} name="postalCode" inputMode="numeric" maxLength={6} placeholder="Postal code (optional)" autoComplete="postal-code" />
        {picked === null && (
          <label className="flex cursor-pointer items-center gap-3 text-fs-14">
            <input
              type="checkbox"
              checked={saveDefault}
              onChange={(e) => setSaveDefault(e.target.checked)}
              className="size-4 shrink-0 accent-ink"
            />
            Save this address as my default
          </label>
        )}
        {error && <p role="alert" className="text-fs-14 font-medium text-sale">{error}</p>}
        <Button type="submit" size="lg" disabled={loading} className="w-full">
          <PaystackIcon />
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
            <span>{state ? formatNaira(fee) : "Choose your state"}</span>
          </div>
          {arrives && <p className="text-mute">Arrives in {arrives}</p>}
        </div>
        <div className="flex justify-between border-t border-hairline-soft pt-4 text-fs-16 font-medium">
          <span>Total</span>
          <span>{formatNaira(subtotal + (state ? fee : 0))}</span>
        </div>
      </aside>
    </div>
  );
}
