import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const base =
  "inline-flex items-center justify-center gap-2 rounded-pill font-medium whitespace-nowrap transition duration-200 active:scale-[0.97] active:opacity-80 disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink";

const variants = {
  primary: "raised-dark bg-ink text-white hover:bg-charcoal",
  secondary: "bg-cloud text-ink hover:bg-hairline-soft",
  outline: "raised-light bg-white text-ink hover:bg-cloud",
  ghost: "border border-hairline bg-white text-ink hover:border-ink",
} as const;

const sizes = {
  sm: "h-9 px-4 text-fs-14",
  md: "h-12 px-8 text-fs-16",
  lg: "h-14 px-10 text-fs-16",
} as const;

type Shared = { variant?: keyof typeof variants; size?: keyof typeof sizes };

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: Shared & ComponentProps<"button">) {
  return <button className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  ...props
}: Shared & ComponentProps<typeof Link>) {
  return <Link className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}
