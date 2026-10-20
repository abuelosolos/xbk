"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { LogoMark } from "@/components/brand/Logo";
import { authClient } from "@/lib/auth-client";
import { EASE } from "@/lib/motion";
import { NAV } from "@/lib/nav";
import { cartCount, useCart } from "@/store/cart";
import { useUI } from "@/store/ui";

function UtilityBar() {
  const { data: session } = authClient.useSession();
  const role = (session?.user as { role?: string } | undefined)?.role;

  return (
    <div className="hidden h-9 items-center justify-end gap-4 bg-cloud px-12 text-[12px] font-medium md:flex">
      <Link href="/shop" className="hover:text-mute">Help</Link>
      <span aria-hidden className="h-3 w-px bg-hairline" />
      {session ? (
        <>
          {role === "admin" && (
            <>
              <Link href="/admin" className="hover:text-mute">Admin</Link>
              <span aria-hidden className="h-3 w-px bg-hairline" />
            </>
          )}
          <Link href="/account" className="hover:text-mute">Hi, {session.user.name.split(" ")[0]}</Link>
        </>
      ) : (
        <>
          <Link href="/sign-up" className="hover:text-mute">Join Us</Link>
          <span aria-hidden className="h-3 w-px bg-hairline" />
          <Link href="/sign-in" className="hover:text-mute">Sign In</Link>
        </>
      )}
    </div>
  );
}

export function Navbar() {
  const router = useRouter();
  const [active, setActive] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const count = useCart(cartCount);
  const openCart = useUI((s) => s.openCart);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const open = (key: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setActive(key);
  };
  const scheduleClose = () => {
    closeTimer.current = setTimeout(() => setActive(null), 120);
  };

  const activeItem = NAV.find((n) => n.key === active);

  return (
    <>
      <UtilityBar />

      {/* dim the page while a mega-menu is open */}
      <AnimatePresence>
        {active && (
          <motion.div
            key="backdrop"
            className="pointer-events-none fixed inset-0 z-40 bg-black/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </AnimatePresence>

      <header
        className="sticky top-0 z-50 border-b border-hairline-soft bg-white"
        onMouseLeave={scheduleClose}
      >
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 lg:px-12">
          <Link href="/" aria-label="XBK home" className="w-10 text-ink">
            <LogoMark className="w-full" />
          </Link>

          <nav className="absolute left-1/2 hidden -translate-x-1/2 lg:block" aria-label="Primary">
            <ul className="flex items-center">
              {NAV.map((item) => (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    onMouseEnter={() => open(item.key)}
                    onFocus={() => open(item.key)}
                    className="relative block px-3 py-5 text-[16px] font-medium"
                  >
                    {item.label}
                    {active === item.key && (
                      <motion.span
                        layoutId="nav-underline"
                        className="absolute inset-x-3 bottom-3 h-[2px] bg-ink"
                        transition={{ duration: 0.25, ease: EASE }}
                      />
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <form
              role="search"
              className="hidden h-10 items-center gap-2 rounded-field bg-cloud px-4 transition focus-within:bg-white focus-within:ring-2 focus-within:ring-ink focus-within:shadow-[0_0_0_12px_#f5f5f5] md:flex"
              onSubmit={(e) => {
                e.preventDefault();
                const q = new FormData(e.currentTarget).get("q")?.toString().trim();
                if (q) router.push(`/shop?q=${encodeURIComponent(q)}`);
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              <input
                name="q"
                placeholder="Search"
                aria-label="Search products"
                className="w-28 bg-transparent text-[16px] outline-none placeholder:text-mute"
              />
            </form>

            <button
              type="button"
              onClick={openCart}
              aria-label={`Open bag, ${mounted ? count : 0} items`}
              className="relative flex size-10 items-center justify-center rounded-full transition hover:bg-cloud active:scale-90"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                <path d="M5 8h14l-1 12H6L5 8Z" />
                <path d="M9 8V6a3 3 0 0 1 6 0v2" />
              </svg>
              <AnimatePresence>
                {mounted && count > 0 && (
                  <motion.span
                    key={count}
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute right-0 top-0 flex size-4 items-center justify-center rounded-full bg-ink text-[10px] font-medium text-white"
                  >
                    {count}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            <button
              type="button"
              className="flex size-10 items-center justify-center rounded-full transition hover:bg-cloud lg:hidden"
              aria-label="Open menu"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen(true)}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                <path d="M3 7h18M3 12h18M3 17h18" />
              </svg>
            </button>
          </div>
        </div>

        {/* desktop mega-menu */}
        <AnimatePresence>
          {activeItem && (
            <motion.div
              key="panel"
              className="absolute inset-x-0 top-full hidden border-t border-hairline-soft bg-white lg:block"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: EASE }}
              onMouseEnter={() => open(activeItem.key)}
            >
              <motion.div
                key={activeItem.key}
                className="mx-auto flex max-w-[1440px] gap-24 px-12 py-10"
                initial="hidden"
                animate="show"
                variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
              >
                {activeItem.columns.map((col) => (
                  <motion.div
                    key={col.title}
                    variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: EASE } } }}
                  >
                    <h3 className="mb-3 text-[16px] font-medium">{col.title}</h3>
                    <ul className="space-y-1.5">
                      {col.links.map((l) => (
                        <li key={l.label}>
                          <Link
                            href={l.href}
                            onClick={() => setActive(null)}
                            className="text-[14px] font-medium text-mute transition hover:text-ink"
                          >
                            {l.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="m-backdrop"
              className="fixed inset-0 z-[60] bg-black/40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              key="m-drawer"
              className="fixed inset-y-0 left-0 z-[70] w-[88%] max-w-sm overflow-y-auto bg-white px-6 py-5 lg:hidden"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.35, ease: EASE }}
            >
              <div className="mb-8 flex items-center justify-between">
                <LogoMark className="w-10" />
                <button type="button" aria-label="Close menu" className="flex size-10 items-center justify-center rounded-full bg-cloud" onClick={() => setMobileOpen(false)}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M6 6l12 12M18 6 6 18" /></svg>
                </button>
              </div>
              <ul>
                {NAV.map((item, i) => (
                  <motion.li
                    key={item.key}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.08 + i * 0.05, duration: 0.3, ease: EASE }}
                  >
                    <Link href={item.href} onClick={() => setMobileOpen(false)} className="block border-b border-hairline-soft py-5 text-[24px] font-medium leading-tight">
                      {item.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>
              <div className="mt-8 flex flex-col gap-3 text-[16px] font-medium">
                <Link href="/account" onClick={() => setMobileOpen(false)}>Account</Link>
                <Link href="/sign-in" onClick={() => setMobileOpen(false)}>Sign In</Link>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
