"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/** Footer newsletter signup. Not connected to a mailing list yet: it only validates and confirms. */
export function NewsletterForm({ className }: { className?: string }) {
  const [done, setDone] = useState(false);

  return (
    <div className={cn("w-full max-w-md", className)}>
      <p className="mb-3 text-fs-14 font-medium lg:text-fs-16">Subscribe to the XBK newsletter</p>
      {done ? (
        <p role="status" className="text-fs-14 font-medium text-mute">You&apos;re on the list. Watch your inbox.</p>
      ) : (
        <form
          className="flex h-11 items-center rounded-pill border border-hairline pl-4 pr-1 focus-within:border-ink"
          onSubmit={(e) => {
            e.preventDefault();
            setDone(true);
          }}
        >
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            placeholder="Your email"
            aria-label="Email address"
            className="min-w-0 flex-1 bg-transparent text-fs-16 text-ink outline-none placeholder:text-mute"
          />
          <button type="submit" className="h-9 shrink-0 raised-dark raised-noglow rounded-pill bg-ink px-4 text-fs-14 font-medium text-white transition hover:bg-charcoal active:scale-[0.97]">
            Subscribe
          </button>
        </form>
      )}
      <p className="mt-3 text-fs-12 text-mute">By subscribing you agree to receive XBK emails. Unsubscribe any time.</p>
    </div>
  );
}
