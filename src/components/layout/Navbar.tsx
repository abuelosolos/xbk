"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { LogoMark } from "@/components/brand/Logo";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { SearchOverlay } from "@/components/layout/SearchOverlay";
import { authClient } from "@/lib/auth-client";
import { EASE } from "@/lib/motion";
import { NAV } from "@/lib/nav";
import { cartCount, useCart } from "@/store/cart";
import { useUI } from "@/store/ui";
import { List, MagnifyingGlass, ShoppingBag, User } from "@phosphor-icons/react";

/** Account entry for md+ (the mobile menu carries its own account rows). */
function AccountLink() {
  const { data: session } = authClient.useSession();
  const role = (session?.user as { role?: string } | undefined)?.role;
  const label = session ? `Account, ${session.user.name.split(" ")[0]}` : "Sign in";

  return (
    <>
      {role === "admin" && (
        <Link href="/admin" className="hidden h-9 items-center rounded-pill px-3 text-fs-14 font-medium transition hover:bg-cloud md:flex">
          Admin
        </Link>
      )}
      <Link
        href={session ? "/account" : "/sign-in"}
        aria-label={label}
        title={label}
        className="hidden size-9 items-center justify-center rounded-full transition hover:bg-cloud active:scale-90 md:flex"
      >
        <User size={20} aria-hidden />
      </Link>
    </>
  );
}

export function Navbar() {
  const router = useRouter();
  const [active, setActive] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const count = useCart(cartCount);
  const openCart = useUI((s) => s.openCart);

  const pathname = usePathname();

  useEffect(() => setMounted(true), []);
  // close the mobile menu on navigation and on Escape
  useEffect(() => { setMobileOpen(false); setSearchOpen(false); }, [pathname]);
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMobileOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);
  useEffect(() => {
    document.body.style.overflow = mobileOpen || searchOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen, searchOpen]);

  // slide away on scroll down, come straight back on any upward movement
  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (y <= 80) setHidden(false);
      else if (y > last + 4) setHidden(true);
      else if (y < last) setHidden(false);
      last = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  // never hide while a menu is open
  const slideUp = hidden && !active && !mobileOpen;
  // sticky page bars (e.g. shop filters) key off this to take the navbar's place
  useEffect(() => {
    document.documentElement.dataset.nav = slideUp ? "hidden" : "shown";
  }, [slideUp]);

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

      <motion.header
        className="sticky top-0 z-50 border-b border-hairline-soft bg-white"
        onMouseLeave={scheduleClose}
        animate={{ y: slideUp ? "-100%" : 0 }}
        transition={{ duration: 0.3, ease: EASE }}
      >
        <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between px-4 lg:px-12">
          <Link href="/" aria-label="XBK home" className="w-8 shrink-0 text-ink">
            <LogoMark className="w-full" />
          </Link>

          <nav className="ml-8 mr-auto hidden lg:block" aria-label="Primary">
            <ul className="flex items-center">
              {NAV.map((item) => (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    onMouseEnter={() => open(item.key)}
                    onFocus={() => open(item.key)}
                    className="relative block px-3 py-4 text-fs-14 font-medium"
                  >
                    {item.label}
                    {active === item.key && (
                      <motion.span
                        layoutId="nav-underline"
                        className="absolute inset-x-3 bottom-2.5 h-[2px] bg-ink"
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
              className="hidden h-9 items-center gap-2 rounded-field bg-cloud px-3 transition focus-within:bg-white focus-within:ring-2 focus-within:ring-ink focus-within:shadow-[0_0_0_12px_#f5f5f5] md:flex lg:hidden"
              onSubmit={(e) => {
                e.preventDefault();
                const q = new FormData(e.currentTarget).get("q")?.toString().trim();
                if (q) router.push(`/shop?q=${encodeURIComponent(q)}`);
              }}
            >
              <MagnifyingGlass size={16} aria-hidden />
              <input
                name="q"
                placeholder="Search"
                aria-label="Search products"
                className="w-24 bg-transparent text-fs-14 outline-none placeholder:text-mute"
              />
            </form>

            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              className="flex size-9 items-center justify-center rounded-full transition hover:bg-cloud active:scale-90 md:hidden lg:flex"
            >
              <MagnifyingGlass size={20} aria-hidden />
            </button>

            <AccountLink />

            <button
              type="button"
              onClick={openCart}
              aria-label={`Open bag, ${mounted ? count : 0} items`}
              className="relative flex size-9 items-center justify-center rounded-full transition hover:bg-cloud active:scale-90"
            >
              <ShoppingBag size={20} aria-hidden />
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
              className="flex size-9 items-center justify-center rounded-full transition hover:bg-cloud lg:hidden"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              onClick={() => setMobileOpen((o) => !o)}
            >
              <List size={20} aria-hidden />
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
      </motion.header>

      <AnimatePresence>{searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}</AnimatePresence>
    </>
  );
}
