"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { LogoMark } from "@/components/brand/Logo";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { authClient } from "@/lib/auth-client";
import { EASE } from "@/lib/motion";
import { NAV } from "@/lib/nav";
import { cartCount, useCart } from "@/store/cart";
import { useUI } from "@/store/ui";

/** Account entry for md+ (the mobile menu carries its own account rows). */
function AccountLink() {
  const { data: session } = authClient.useSession();
  const role = (session?.user as { role?: string } | undefined)?.role;
  const label = session ? `Account, ${session.user.name.split(" ")[0]}` : "Sign in";

  return (
    <>
      {role === "admin" && (
        <Link href="/admin" className="hidden h-10 items-center rounded-pill px-3 text-fs-14 font-medium transition hover:bg-cloud md:flex">
          Admin
        </Link>
      )}
      <Link
        href={session ? "/account" : "/sign-in"}
        aria-label={label}
        title={label}
        className="hidden size-10 items-center justify-center rounded-full transition hover:bg-cloud active:scale-90 md:flex"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
          <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0" />
        </svg>
      </Link>
    </>
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

  const pathname = usePathname();

  useEffect(() => setMounted(true), []);
  // close the mobile menu on navigation and on Escape
  useEffect(() => setMobileOpen(false), [pathname]);
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMobileOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);
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

      {/* dims the page (not the bar) while the mobile menu is open */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="m-backdrop"
            className="fixed inset-0 z-40 bg-black/30 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
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
                    className="relative block px-3 py-5 text-fs-16 font-medium"
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
                className="w-28 bg-transparent text-fs-16 outline-none placeholder:text-mute"
              />
            </form>

            <AccountLink />

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
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              onClick={() => setMobileOpen((o) => !o)}
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
                    <h3 className="mb-3 text-fs-16 font-medium">{col.title}</h3>
                    <ul className="space-y-1.5">
                      {col.links.map((l) => (
                        <li key={l.label}>
                          <Link
                            href={l.href}
                            onClick={() => setActive(null)}
                            className="text-fs-14 font-medium text-mute transition hover:text-ink"
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
        <AnimatePresence>{mobileOpen && <MobileMenu onClose={() => setMobileOpen(false)} />}</AnimatePresence>
      </header>

    </>
  );
}
