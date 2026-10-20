"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, type Variants } from "motion/react";
import type { ReactNode } from "react";
import { LogoMark } from "@/components/brand/Logo";
import { authClient } from "@/lib/auth-client";
import { unsplash } from "@/lib/images";
import { EASE } from "@/lib/motion";
import { NAV } from "@/lib/nav";

// rows slide in from the right, one after another, once the panel opens;
// `start` lets the second group carry on where the first left off
const STEP = 0.05;
const list = (start: number): Variants => ({ show: { transition: { staggerChildren: STEP, delayChildren: 0.08 + start * STEP } } });
const row: Variants = {
  hidden: { opacity: 0, x: 24 },
  show: { opacity: 1, x: 0, transition: { duration: 0.35, ease: EASE } },
};

function Row({ href, onClick, thumb, children }: { href: string; onClick: () => void; thumb: ReactNode; children: ReactNode }) {
  return (
    <motion.li variants={row}>
      <Link
        href={href}
        onClick={onClick}
        className="flex items-center gap-4 rounded-2xl px-2 py-1.5 text-[18px] font-medium transition hover:bg-white/10 active:scale-[0.98]"
      >
        <span className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/10">{thumb}</span>
        {children}
      </Link>
    </motion.li>
  );
}

const Icon = ({ d }: { d: string }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
    <path d={d} />
  </svg>
);

/**
 * Mobile/tablet menu: a dark rounded dropdown under the nav bar (Chrome-menu style).
 * Rendered inside the sticky header, so it stays anchored to the bar.
 */
export function MobileMenu({ onClose }: { onClose: () => void }) {
  const { data: session } = authClient.useSession();
  const role = (session?.user as { role?: string } | undefined)?.role;

  return (
    <motion.div
      id="mobile-menu"
      role="dialog"
      aria-label="Menu"
      className="absolute right-3 top-[calc(100%+8px)] z-[70] max-h-[calc(100dvh-88px)] w-[min(360px,calc(100vw-24px))] origin-top-right overflow-y-auto rounded-[28px] bg-ink p-3 text-white lg:hidden"
      initial={{ opacity: 0, scale: 0.94, y: -8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: -6, transition: { duration: 0.18 } }}
      transition={{ duration: 0.28, ease: EASE }}
    >
      <div className="flex items-center justify-between px-2 pb-2 pt-1">
        <LogoMark className="w-7" />
        <button
          type="button"
          aria-label="Close menu"
          onClick={onClose}
          className="flex size-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20 active:scale-90"
        >
          <Icon d="M6 6l12 12M18 6 6 18" />
        </button>
      </div>

      <motion.ul variants={list(0)} initial="hidden" animate="show" className="space-y-1">
        {NAV.map((item) => (
          <Row
            key={item.key}
            href={item.href}
            onClick={onClose}
            thumb={<Image src={unsplash(item.photo, 160)} alt="" fill sizes="48px" className="object-cover" />}
          >
            {item.label}
          </Row>
        ))}
      </motion.ul>

      <motion.ul variants={list(NAV.length)} initial="hidden" animate="show" className="mt-4 space-y-1">
        <Row href="/account" onClick={onClose} thumb={<Icon d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0" />}>
          {session ? `Hi, ${session.user.name.split(" ")[0]}` : "Account"}
        </Row>
        {!session && (
          <Row href="/sign-in" onClick={onClose} thumb={<Icon d="M10 17l5-5-5-5M15 12H3M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" />}>
            Sign In
          </Row>
        )}
        {role === "admin" && (
          <Row href="/admin" onClick={onClose} thumb={<Icon d="M4 6h16M4 12h16M4 18h10" />}>
            Admin
          </Row>
        )}
        <Row href="/cart" onClick={onClose} thumb={<Icon d="M5 8h14l-1 12H6L5 8Zm4 0V6a3 3 0 0 1 6 0v2" />}>
          Bag
        </Row>
      </motion.ul>
    </motion.div>
  );
}
