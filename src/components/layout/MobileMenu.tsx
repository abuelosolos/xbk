"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, type Variants } from "motion/react";
import { List, ShoppingBag, SignIn, SignOut, User, type Icon } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { authClient } from "@/lib/auth-client";
import { unsplash } from "@/lib/images";
import { EASE } from "@/lib/motion";
import { NAV } from "@/lib/nav";

// once the panel has dropped, rows fade in from the right one after another;
// `start` lets the bottom group carry on where the top group left off
const STEP = 0.05;
const list = (start: number): Variants => ({ show: { transition: { staggerChildren: STEP, delayChildren: 0.22 + start * STEP } } });
const row: Variants = {
  hidden: { opacity: 0, x: 20 },
  show: { opacity: 1, x: 0, transition: { duration: 0.32, ease: EASE } },
};

const rowClass = "flex w-full items-center gap-2.5 rounded-xl px-2 py-1.5 text-left font-medium transition hover:bg-cloud active:scale-[0.98]";

// account group: same full-width rows as the main links, just quieter
const utilClass = `${rowClass} text-fs-13 text-ink/60 hover:text-ink`;

/** Plain icon + label row for the account group at the bottom. */
function UtilityRow({ icon: Icon, children, ...props }: { icon: Icon; children: ReactNode } & ({ href: string; onClick: () => void } | { href?: undefined; onClick: () => void })) {
  const body = (
    <>
      <Icon size={20} className="shrink-0" aria-hidden />
      {children}
    </>
  );
  return (
    <motion.li variants={row}>
      {props.href ? (
        <Link href={props.href} onClick={props.onClick} className={utilClass}>{body}</Link>
      ) : (
        <button type="button" onClick={props.onClick} className={utilClass}>{body}</button>
      )}
    </motion.li>
  );
}

/**
 * Mobile/tablet menu: a white half-width sheet, 70% of the screen tall, that pops up from the
 * top-right corner over the hamburger and bag buttons, with a small gap to the right
 * edge. Rendered inside the sticky header so it stays anchored there; tapping the
 * dimmed page closes it.
 */
export function MobileMenu({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const role = (session?.user as { role?: string } | undefined)?.role;

  return (
    <motion.div
      id="mobile-menu"
      role="dialog"
      aria-label="Menu"
      className="absolute right-3 top-2 z-[70] flex h-[70dvh] w-1/2 min-w-[200px] max-w-sm origin-top-right flex-col overflow-y-auto rounded-[24px] bg-white p-3 text-ink lg:hidden"
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.18, ease: EASE } }}
      transition={{ duration: 0.3, ease: EASE }}
    >
      <motion.ul variants={list(0)} initial="hidden" animate="show" className="mt-2 space-y-1">
        {NAV.map((item) => (
          <motion.li key={item.key} variants={row}>
            <Link href={item.href} onClick={onClose} className={`${rowClass} text-fs-14`}>
              <span className="relative size-8 shrink-0 overflow-hidden rounded-lg bg-cloud">
                <Image src={unsplash(item.photo, 120)} alt="" fill sizes="32px" className="object-cover" />
              </span>
              <span className="min-w-0 truncate">{item.label}</span>
            </Link>
          </motion.li>
        ))}
      </motion.ul>

      {/* account group sits at the bottom of the sheet */}
      <motion.ul variants={list(NAV.length)} initial="hidden" animate="show" className="mt-auto space-y-1 pt-6">
        <UtilityRow href="/account" onClick={onClose} icon={User}>
          {session ? `Hi, ${session.user.name.split(" ")[0]}` : "Account"}
        </UtilityRow>
        <UtilityRow href="/cart" onClick={onClose} icon={ShoppingBag}>
          Bag
        </UtilityRow>
        {role === "admin" && (
          <UtilityRow href="/admin" onClick={onClose} icon={List}>
            Admin
          </UtilityRow>
        )}
        {session ? (
          <UtilityRow
            icon={SignOut}
            onClick={async () => {
              onClose();
              await authClient.signOut();
              router.push("/");
              router.refresh();
            }}
          >
            Log Out
          </UtilityRow>
        ) : (
          <UtilityRow href="/sign-in" onClick={onClose} icon={SignIn}>
            Sign In
          </UtilityRow>
        )}
      </motion.ul>
    </motion.div>
  );
}
