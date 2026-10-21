"use client";

import { CaretLeft, CaretRight, Envelope, LinkSimple, Package, SignOut, User, UserCheck } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ComponentType } from "react";
import { AddressesSection } from "@/components/account/AddressesSection";
import { SecuritySection } from "@/components/account/SecuritySection";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import type { SavedAddress } from "@/lib/addresses";
import { authClient } from "@/lib/auth-client";
import { useFieldErrors } from "@/lib/use-field-errors";
import { cn } from "@/lib/utils";
import { fullName as fullNameRule, newPassword } from "@/lib/validation";

const nameSchema = z.object({ name: fullNameRule });
const passwordSchema = z.object({ current: z.string().min(1, "Enter your current password."), next: newPassword });

type Account = { name: string; email: string };

const ITEMS: { id: string; label: string; Icon: ComponentType<{ size?: number; "aria-hidden"?: boolean }> }[] = [
  { id: "account", label: "Account Details", Icon: User },
  { id: "addresses", label: "Delivery Addresses", Icon: Package },
  { id: "communication", label: "Communication Preferences", Icon: Envelope },
  { id: "linked", label: "Linked Accounts", Icon: LinkSimple },
  { id: "privacy", label: "Privacy & Security", Icon: UserCheck },
];

export function SettingsPanel({
  user,
  addresses,
  initialSection,
}: {
  user: Account;
  addresses: SavedAddress[];
  initialSection?: string;
}) {
  const router = useRouter();
  const start = ITEMS.some((i) => i.id === initialSection) ? initialSection! : "account";
  const [active, setActive] = useState(start);
  const [mobileOpen, setMobileOpen] = useState(start !== "account");
  const current = ITEMS.find((i) => i.id === active)!;

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] lg:gap-16">
      <nav aria-label="Settings" className={cn(mobileOpen && "hidden lg:block")}>
        <ul className="border-t border-hairline-soft lg:border-0">
          {ITEMS.map(({ id, label, Icon }) => (
            <li key={id} className="border-b border-hairline-soft lg:border-0">
              <button
                type="button"
                aria-current={active === id}
                onClick={() => {
                  setActive(id);
                  setMobileOpen(true);
                }}
                className={cn(
                  "flex w-full items-center gap-4 py-4 text-left text-fs-16 transition-colors hover:text-ink lg:py-3",
                  active === id ? "font-medium text-ink" : "text-ink lg:text-charcoal",
                )}
              >
                <Icon size={24} aria-hidden />
                <span className="flex-1">{label}</span>
                <CaretRight size={16} className="lg:hidden" aria-hidden />
              </button>
            </li>
          ))}
          <li className="border-b border-hairline-soft lg:border-0">
            <button
              type="button"
              onClick={async () => {
                await authClient.signOut();
                router.push("/");
                router.refresh();
              }}
              className="flex w-full items-center gap-4 py-4 text-left text-fs-16 text-ink transition-colors lg:py-3 lg:text-charcoal lg:hover:text-ink"
            >
              <SignOut size={24} aria-hidden />
              <span className="flex-1">Sign Out</span>
            </button>
          </li>
        </ul>
      </nav>

      <section aria-label={current.label} className={cn("min-w-0 lg:pt-1", !mobileOpen && "hidden lg:block")}>
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="mb-6 inline-flex items-center gap-1 text-fs-14 text-mute transition hover:text-ink lg:hidden"
        >
          <CaretLeft size={16} aria-hidden /> Settings
        </button>
        <h3 className="mb-6 text-fs-24 font-medium">{current.label}</h3>
        <div className="max-w-[480px]">
          {active === "account" ? (
            <AccountDetails user={user} />
          ) : active === "addresses" ? (
            <AddressesSection addresses={addresses} />
          ) : active === "linked" ? (
            <LinkedAccounts />
          ) : active === "privacy" ? (
            <SecuritySection />
          ) : (
            <p className="text-fs-16 text-mute">
              We email you about your orders at {user.email}: confirmation when payment succeeds and an update when it ships.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

function AccountDetails({ user }: { user: Account }) {
  const router = useRouter();
  const [name, setName] = useState(user.name);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [hasPassword, setHasPassword] = useState(false);
  const [accountsLoaded, setAccountsLoaded] = useState(false);
  const [editingPassword, setEditingPassword] = useState(false);
  const nameV = useFieldErrors(nameSchema);
  const passV = useFieldErrors(passwordSchema);

  useEffect(() => {
    authClient.listAccounts().then(({ data }) => {
      setHasPassword(!!data?.some((a) => a.providerId === "credential"));
      setAccountsLoaded(true);
    });
  }, []);

  /** Google-only accounts have no password; the reset link lets them choose one. */
  async function sendSetPasswordLink() {
    setBusy(true);
    setMsg(null);
    const { error } = await authClient.requestPasswordReset({ email: user.email, redirectTo: "/reset-password" });
    setBusy(false);
    setMsg(error ? { ok: false, text: error.message ?? "Couldn't send the email." } : { ok: true, text: `We emailed a link to ${user.email} to set your password.` });
  }

  async function saveName(e: React.FormEvent) {
    e.preventDefault();
    if (!nameV.checkAll({ name })) return;
    setBusy(true);
    setMsg(null);
    const { error } = await authClient.updateUser({ name: name.trim() });
    setBusy(false);
    setMsg(error ? { ok: false, text: error.message ?? "Couldn't save." } : { ok: true, text: "Saved." });
    if (!error) router.refresh();
  }

  async function savePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    if (!passV.checkAll({ current: String(f.get("current")), next: String(f.get("next")) })) return;
    setBusy(true);
    setMsg(null);
    const { error } = await authClient.changePassword({
      currentPassword: String(f.get("current")),
      newPassword: String(f.get("next")),
      revokeOtherSessions: true,
    });
    setBusy(false);
    setMsg(error ? { ok: false, text: error.message ?? "Couldn't change password." } : { ok: true, text: "Password updated." });
    if (!error) setEditingPassword(false);
  }

  return (
    <div className="space-y-8">
      <form onSubmit={saveName} noValidate className="space-y-4">
        <Field
          label="Full name"
          labelVisible
          {...nameV.props("name")}
          name="name"
          value={name}
          onChange={(e) => {
            nameV.props("name").onChange(e);
            setName(e.target.value);
          }}
          autoComplete="name"
        />
        <Field label="Email" labelVisible type="email" value={user.email} disabled readOnly />
        <Button type="submit" disabled={busy || name.trim() === user.name || !name.trim()}>
          Save
        </Button>
      </form>

      {accountsLoaded && !hasPassword && (
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-fs-16 font-medium">Password</p>
            <p className="text-fs-16 text-mute">You sign in with Google. Add a password to also sign in with your email.</p>
          </div>
          <button type="button" disabled={busy} onClick={sendSetPasswordLink} className="shrink-0 text-fs-14 font-medium underline underline-offset-4">
            Set password
          </button>
        </div>
      )}

      {hasPassword && (
        <div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-fs-16 font-medium">Password</p>
              <p className="text-fs-16 text-mute">••••••••••••</p>
            </div>
            <button
              type="button"
              onClick={() => setEditingPassword((v) => !v)}
              className="text-fs-14 font-medium underline underline-offset-4"
            >
              {editingPassword ? "Cancel" : "Edit"}
            </button>
          </div>
          {editingPassword && (
            <form onSubmit={savePassword} noValidate className="mt-4 space-y-4">
              <Field label="Current password" {...passV.props("current")} name="current" type="password" placeholder="Current password" autoComplete="current-password" />
              <Field label="New password" {...passV.props("next")} name="next" type="password" placeholder="New password (8+ characters)" autoComplete="new-password" />
              <Button type="submit" disabled={busy}>
                Update Password
              </Button>
            </form>
          )}
        </div>
      )}

      {msg && (
        <p role="status" className={cn("text-fs-14 font-medium", msg.ok ? "text-success" : "text-sale")}>
          {msg.text}
        </p>
      )}
    </div>
  );
}

const PROVIDERS: Record<string, string> = { credential: "Email & password", google: "Google" };

function LinkedAccounts() {
  const [list, setList] = useState<{ id: string; providerId: string }[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = () => authClient.listAccounts().then(({ data }) => setList((data ?? []).map((a) => ({ id: a.id, providerId: a.providerId }))));
  useEffect(() => {
    load();
  }, []);

  async function connect() {
    setBusy(true);
    setError(null);
    const { error } = await authClient.linkSocial({ provider: "google", callbackURL: "/account?tab=settings&section=linked" });
    if (error) {
      setError(error.message ?? "Google isn't available right now.");
      setBusy(false);
    }
  }

  async function unlink(accountId: string) {
    setBusy(true);
    setError(null);
    const { error } = await authClient.unlinkAccount({ accountId });
    if (error) setError(error.message ?? "Couldn't unlink.");
    await load();
    setBusy(false);
  }

  if (!list) return <p className="text-fs-16 text-mute">Loading…</p>;
  return (
    <div className="space-y-4">
      <ul className="divide-y divide-hairline-soft border-y border-hairline-soft">
        {list.map(({ id, providerId }) => (
          <li key={id} className="flex items-center justify-between py-4 text-fs-16">
            {PROVIDERS[providerId] ?? providerId}
            {providerId !== "credential" && list.length > 1 ? (
              <button type="button" disabled={busy} onClick={() => unlink(id)} className="text-fs-14 font-medium underline underline-offset-4">
                Unlink
              </button>
            ) : (
              <span className="text-fs-14 text-mute">Connected</span>
            )}
          </li>
        ))}
      </ul>
      {!list.some((a) => a.providerId === "google") && (
        <Button variant="outline" disabled={busy} onClick={connect}>
          Connect Google
        </Button>
      )}
      {error && <p role="alert" className="text-fs-14 font-medium text-sale">{error}</p>}
    </div>
  );
}
