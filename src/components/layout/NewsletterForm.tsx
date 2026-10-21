"use client";

import { useEffect, useState } from "react";
import { getNewsletterStatus, subscribeNewsletter } from "@/app/actions/newsletter";
import { ErrorBubble } from "@/components/ui/Field";
import { cn } from "@/lib/utils";
import { email as emailRule } from "@/lib/validation";

/** Footer newsletter signup: validates, then stores the address and sends the welcome email. */
export function NewsletterForm({ className }: { className?: string }) {
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [known, setKnown] = useState(false); // false until the server says whether this person is subscribed

  useEffect(() => {
    getNewsletterStatus().then((s) => {
      setDone(s.subscribed);
      setKnown(true);
    });
  }, []);

  return (
    <div className={cn("w-full max-w-md", className, !known && "invisible")}>
      {done ? (
        <p role="status" className="text-fs-14 font-medium text-mute">You&apos;re subscribed to the XBK newsletter.</p>
      ) : (
        <>
          <p className="mb-3 text-fs-14 font-medium lg:text-fs-16">Subscribe to the XBK newsletter</p>
          <form
            noValidate
            className="flex items-center gap-2"
            onSubmit={async (e) => {
              e.preventDefault();
              const r = emailRule.safeParse(new FormData(e.currentTarget).get("email") ?? "");
              if (!r.success) return setError(r.error.issues[0]?.message);
              const res = await subscribeNewsletter(r.data);
              if (!res.ok) return setError(res.error);
              setDone(true);
            }}
          >
            <div className="relative h-11 min-w-0 flex-1 rounded-pill border border-hairline px-4 focus-within:border-ink">
              <input
                type="email"
                name="email"
                aria-invalid={error ? true : undefined}
                onChange={() => setError(undefined)}
                autoComplete="email"
                placeholder="Your email"
                aria-label="Email address"
                className="h-full w-full min-w-0 bg-transparent text-fs-16 text-ink outline-none placeholder:text-mute"
              />
              <ErrorBubble message={error} />
            </div>
            <button type="submit" className="h-11 shrink-0 raised-dark raised-noglow rounded-pill bg-ink px-4 text-fs-14 font-medium text-white transition hover:bg-charcoal active:scale-[0.97]">
              Subscribe
            </button>
          </form>
          <p className="mt-3 text-fs-12 text-mute">By subscribing you agree to receive XBK emails. Unsubscribe any time.</p>
        </>
      )}
    </div>
  );
}
