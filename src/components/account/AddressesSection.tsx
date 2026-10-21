"use client";

import { useState, useTransition } from "react";
import { addAddress, deleteAddress, setDefaultAddress, updateAddress } from "@/app/account/address-actions";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { PhoneField } from "@/components/ui/PhoneField";
import { SelectField } from "@/components/ui/SelectField";
import { normalizeState, STATES } from "@/lib/states";
import type { SavedAddress } from "@/lib/addresses";
import { useFieldErrors } from "@/lib/use-field-errors";
import { cn } from "@/lib/utils";
import { formatPhone, shippingSchema } from "@/lib/validation";

/** Saved delivery addresses: add, edit, delete, and pick the default with a radio. */
export function AddressesSection({ addresses }: { addresses: SavedAddress[] }) {
  const [editing, setEditing] = useState<SavedAddress | "new" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const run = (fn: () => Promise<{ error?: string }>) =>
    start(async () => {
      setError(null);
      const r = await fn();
      if (r.error) setError(r.error);
    });

  if (editing) {
    return (
      <AddressForm
        address={editing === "new" ? null : editing}
        onDone={() => setEditing(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {addresses.length === 0 ? (
        <p className="text-fs-16 text-mute">You haven&apos;t saved a delivery address yet.</p>
      ) : (
        <ul role="radiogroup" aria-label="Default delivery address" className="space-y-3">
          {addresses.map((a) => (
            <li
              key={a.id}
              className={cn(
                "flex items-start gap-4 rounded-field border p-4 transition-colors",
                a.isDefault ? "border-ink" : "border-hairline",
              )}
            >
              <input
                type="radio"
                name="default-address"
                checked={a.isDefault}
                disabled={pending}
                onChange={() => run(() => setDefaultAddress(a.id))}
                aria-label={`Make ${a.fullName}, ${a.address} the default`}
                className="mt-1 size-5 shrink-0 cursor-pointer accent-ink"
              />
              <div className="min-w-0 flex-1 text-fs-14">
                <p className="text-fs-16 font-medium">
                  {a.fullName}
                  {a.isDefault && <span className="ml-2 text-fs-12 font-normal text-mute">Default</span>}
                </p>
                <p className="text-mute">
                  {a.address}, {a.city}, {a.state}
                  {a.postalCode && ` ${a.postalCode}`}
                </p>
                <p className="text-mute">{formatPhone(a.phone)}</p>
                <div className="mt-3 flex gap-4">
                  <button type="button" onClick={() => setEditing(a)} className="font-medium underline underline-offset-4">
                    Edit
                  </button>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => run(() => deleteAddress(a.id))}
                    className="font-medium text-mute underline underline-offset-4 hover:text-ink"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      {error && <p role="alert" className="text-fs-14 font-medium text-sale">{error}</p>}
      <Button variant={addresses.length === 0 ? "primary" : "outline"} onClick={() => setEditing("new")}>
        Add Address
      </Button>
    </div>
  );
}

function AddressForm({ address, onDone }: { address: SavedAddress | null; onDone: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const [phone, setPhone] = useState(address ? formatPhone(address.phone) : "");
  const [pending, start] = useTransition();
  const v = useFieldErrors(shippingSchema);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const data = Object.fromEntries(["fullName", "phone", "address", "city", "state", "postalCode"].map((k) => [k, String(f.get(k) ?? "")]));
    if (!v.checkAll(data)) return;
    start(async () => {
      const r = address ? await updateAddress(address.id, data) : await addAddress(data);
      if (r.errors) v.setErrors(r.errors);
      else if (r.error) setError(r.error);
      else onDone();
    });
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <Field label="Full name" {...v.props("fullName")} name="fullName" defaultValue={address?.fullName} placeholder="Full name" autoComplete="name" />
      <PhoneField
        value={phone}
        error={v.errors.phone}
        onValueChange={(full) => {
          setPhone(full);
          if (v.errors.phone) v.check("phone", full);
        }}
        onBlur={() => phone && v.check("phone", phone)}
      />
      <Field label="Street address" {...v.props("address")} name="address" defaultValue={address?.address} placeholder="Street address" autoComplete="street-address" />
      <div className="grid grid-cols-2 gap-4">
        <Field label="City" {...v.props("city")} name="city" defaultValue={address?.city} placeholder="City" autoComplete="address-level2" />
        <SelectField
          label="State"
          name="state"
          placeholder="State"
          autoComplete="address-level1"
          defaultValue={address ? (normalizeState(address.state) ?? "") : ""}
          error={v.errors.state}
          options={STATES.map((s) => ({ value: s, label: s }))}
          onChange={(e) => v.check("state", e.target.value)}
        />
      </div>
      <Field label="Postal code" {...v.props("postalCode")} name="postalCode" defaultValue={address?.postalCode} inputMode="numeric" maxLength={6} placeholder="Postal code (optional)" autoComplete="postal-code" />
      {error && <p role="alert" className="text-fs-14 font-medium text-sale">{error}</p>}
      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save"}</Button>
        <Button type="button" variant="secondary" onClick={onDone}>Cancel</Button>
      </div>
    </form>
  );
}
