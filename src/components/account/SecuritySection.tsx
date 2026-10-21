"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { authClient } from "@/lib/auth-client";

type Sess = { token: string; userAgent?: string | null; createdAt: Date | string };

function device(ua?: string | null) {
  if (!ua) return "Unknown device";
  const os = /iPhone|iPad/.test(ua) ? "iOS" : /Android/.test(ua) ? "Android" : /Windows/.test(ua) ? "Windows" : /Mac OS/.test(ua) ? "macOS" : /Linux/.test(ua) ? "Linux" : "Unknown OS";
  const browser = /Edg\//.test(ua) ? "Edge" : /Chrome\//.test(ua) ? "Chrome" : /Firefox\//.test(ua) ? "Firefox" : /Safari\//.test(ua) ? "Safari" : "Browser";
  return `${browser} on ${os}`;
}

/** Active sessions and account deletion. */
export function SecuritySection() {
  const router = useRouter();
  const [sessions, setSessions] = useState<Sess[] | null>(null);
  const [current, setCurrent] = useState<string | null>(null);
  const [hasPassword, setHasPassword] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [passwordError, setPasswordError] = useState<string | undefined>();

  const load = async () => {
    const [list, me, accounts] = await Promise.all([
      authClient.listSessions(),
      authClient.getSession(),
      authClient.listAccounts(),
    ]);
    setSessions((list.data ?? []) as Sess[]);
    setCurrent(me.data?.session.token ?? null);
    setHasPassword(!!accounts.data?.some((a) => a.providerId === "credential"));
  };
  useEffect(() => {
    load();
  }, []);

  async function revoke(token: string) {
    setBusy(true);
    await authClient.revokeSession({ token });
    await load();
    setBusy(false);
  }

  async function revokeOthers() {
    setBusy(true);
    await authClient.revokeOtherSessions();
    await load();
    setBusy(false);
  }

  async function onDelete(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const password = String(new FormData(e.currentTarget).get("password") ?? "");
    if (hasPassword && !password) {
      setPasswordError("Enter your password to confirm.");
      return;
    }
    setBusy(true);
    setError(null);
    const { error } = await authClient.deleteUser(hasPassword ? { password } : {});
    if (error) {
      setError(error.message ?? "Couldn't delete your account.");
      setBusy(false);
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="space-y-12">
      <div>
        <h4 className="mb-4 text-fs-16 font-medium">Active sessions</h4>
        {!sessions ? (
          <p className="text-fs-16 text-mute">Loading…</p>
        ) : (
          <>
            <ul className="divide-y divide-hairline-soft border-y border-hairline-soft">
              {sessions.map((s) => (
                <li key={s.token} className="flex items-center justify-between gap-4 py-4">
                  <div className="min-w-0 text-fs-14">
                    <p className="text-fs-16">{device(s.userAgent)}</p>
                    <p className="text-mute">
                      {s.token === current ? "This device · " : ""}Signed in{" "}
                      {new Date(s.createdAt).toLocaleDateString("en-NG", { dateStyle: "medium" })}
                    </p>
                  </div>
                  {s.token !== current && (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => revoke(s.token)}
                      className="shrink-0 text-fs-14 font-medium underline underline-offset-4"
                    >
                      Sign out
                    </button>
                  )}
                </li>
              ))}
            </ul>
            {sessions.length > 1 && (
              <Button variant="outline" size="sm" disabled={busy} onClick={revokeOthers} className="mt-4">
                Sign Out Of All Other Devices
              </Button>
            )}
          </>
        )}
      </div>

      <div>
        <h4 className="mb-2 text-fs-16 font-medium">Delete account</h4>
        <p className="mb-4 text-fs-16 text-mute">
          This removes your profile, saved addresses and sign-in. Past orders are kept for our records.
        </p>
        {!confirming ? (
          <Button variant="outline" onClick={() => setConfirming(true)}>
            Delete Account
          </Button>
        ) : (
          <form onSubmit={onDelete} noValidate className="space-y-4">
            {hasPassword && (
              <Field
                label="Password"
                name="password"
                type="password"
                error={passwordError}
                onChange={() => setPasswordError(undefined)}
                placeholder="Confirm your password"
                autoComplete="current-password"
              />
            )}
            {error && <p role="alert" className="text-fs-14 font-medium text-sale">{error}</p>}
            <div className="flex gap-3">
              <Button type="submit" disabled={busy}>{busy ? "Deleting…" : "Permanently Delete"}</Button>
              <Button type="button" variant="secondary" onClick={() => setConfirming(false)}>Cancel</Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
