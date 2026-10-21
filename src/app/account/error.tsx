"use client";

import { Button, ButtonLink } from "@/components/ui/Button";

export default function AccountError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-[900px] px-4 py-16 lg:px-12">
      <h1 className="mb-2 text-fs-32 font-medium leading-tight">We couldn&apos;t load your account</h1>
      <p className="mb-8 text-fs-16 text-mute">Something went wrong on our side. Try again, or head back to the shop.</p>
      <div className="flex gap-3">
        <Button onClick={reset}>Try Again</Button>
        <ButtonLink href="/shop" variant="secondary">Shop</ButtonLink>
      </div>
    </div>
  );
}
