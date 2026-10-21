import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

/** Centred logo, a compact heading (optionally screen-reader only) and a one-line subtitle, shared by the standalone auth pages. */
export function AuthHeader({ title, subtitle, hideTitle }: { title: string; subtitle: string; hideTitle?: boolean }) {
  return (
    <header className="mb-6 text-center">
      <Link href="/" aria-label="XBK home" className="mx-auto mb-5 block w-10">
        <Logo className="w-full" />
      </Link>
      <h1 className={hideTitle ? "sr-only" : "mb-1 text-fs-20 font-medium leading-tight"}>{title}</h1>
      <p className="text-fs-14 text-mute">{subtitle}</p>
    </header>
  );
}
