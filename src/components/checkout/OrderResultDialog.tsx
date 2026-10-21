"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { ClearCart } from "@/components/checkout/ClearCart";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Disclosure } from "@/components/ui/Disclosure";
import { EASE } from "@/lib/motion";
import { formatNaira } from "@/lib/utils";
import { CheckCircle, Clock, X, XCircle } from "@phosphor-icons/react";

export type OrderSummary = {
  reference: string;
  email: string;
  status: "pending" | "paid" | "failed" | "shipped" | "delivered";
  subtotalKobo: number;
  shippingFeeKobo: number;
  totalKobo: number;
  address: { fullName: string; phone: string; address: string; city: string; state: string };
  items: { id: string; name: string; size: string; color: string; qty: number; unitPriceKobo: number }[];
  /** ISO dates, already computed on the server. */
  delivery: { earliest: string; latest: string };
};

type State = "success" | "pending" | "failed";

/** Which result screen an order's stored status maps to. */
export const resultState = (status: OrderSummary["status"]) =>
  status === "paid" || status === "shipped" || status === "delivered" ? "success" : status === "pending" ? "pending" : "failed";


const COPY: Record<State, { title: string; body: string }> = {
  success: { title: "Order confirmed", body: "Thanks, your payment went through. We've emailed your receipt." },
  pending: { title: "Payment pending", body: "We haven't received confirmation from your bank yet. Refresh in a moment." },
  failed: { title: "Payment not completed", body: "Your bag is still saved, so you can try again." },
};

const day = (iso: string) => new Date(iso).toLocaleDateString("en-NG", { weekday: "short", day: "numeric", month: "short" });

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-cloud p-6">
      <h3 className="mb-3 text-fs-14 text-mute">{title}</h3>
      {children}
    </section>
  );
}

type Shared = { state: State; order: OrderSummary | null; onClose?: () => void };

function ResultBody({ state, order, id }: Shared & { id: string }) {
  const copy = COPY[state];
  const Icon = state === "success" ? CheckCircle : state === "pending" ? Clock : XCircle;
  const ok = state === "success";
  return (
    <>
  <Icon size={48} weight="fill" aria-hidden />
      <h2 id={id} className="mt-4 text-fs-32 font-medium leading-tight">{copy.title}</h2>
      <p className="mt-2 text-fs-16 text-mute">{copy.body}</p>
      {order && (
        <p className="mt-1 text-fs-14 text-mute">
          Order {order.reference.slice(-8).toUpperCase()}
          {ok && ` · ${order.email}`}
        </p>
      )}
    
      {order && (
        <div className="mt-8 grid gap-2 lg:grid-cols-2">
          <Block title={ok ? "Total paid" : "Amount"}>
            <dl className="space-y-1 text-fs-16">
              <div className="flex justify-between"><dt className="text-mute">Subtotal</dt><dd>{formatNaira(order.subtotalKobo)}</dd></div>
              <div className="flex justify-between"><dt className="text-mute">Delivery</dt><dd>{formatNaira(order.shippingFeeKobo)}</dd></div>
              <div className="flex justify-between border-t border-hairline pt-2 font-medium"><dt>Total</dt><dd>{formatNaira(order.totalKobo)}</dd></div>
            </dl>
          </Block>
          <Block title="Delivering to">
            <address className="text-fs-16 not-italic leading-snug">
              <span className="font-medium">{order.address.fullName}</span>
              <br />
              {order.address.address}
              <br />
              {order.address.city}, {order.address.state}
              <br />
              <span className="text-mute">{order.address.phone}</span>
            </address>
          </Block>
          {ok && (
            <div className="lg:col-span-2">
              <Block title="Estimated delivery">
                <p className="text-fs-24 font-medium leading-tight">
                  {day(order.delivery.earliest)} – {day(order.delivery.latest)}
                </p>
              </Block>
            </div>
          )}
        </div>
      )}
    
      {order && order.items.length > 0 && (
        <Disclosure title={`Items (${order.items.reduce((n, i) => n + i.qty, 0)})`} className="mt-6 border-t" bodyClassName="pb-6">
          <ul className="divide-y divide-hairline-soft">
            {order.items.map((i) => (
              <li key={i.id} className="flex justify-between gap-4 py-3 text-fs-14">
                <div className="min-w-0">
                  <p className="truncate text-fs-16 font-medium">{i.name}</p>
                  <p className="text-mute">{[i.size, i.color].filter(Boolean).join(" · ")} · Qty {i.qty}</p>
                </div>
                <p className="shrink-0 font-medium">{formatNaira(i.unitPriceKobo * i.qty)}</p>
              </li>
            ))}
          </ul>
        </Disclosure>
      )}
    </>
  );
}

function ResultActions({ state, order, onClose }: Shared) {
  const ok = state === "success";
  return (
    <>
  {ok ? (
        <>
          <ButtonLink href="/account" size="lg" className="sm:flex-1">View Orders</ButtonLink>
          <ButtonLink href="/shop" variant="secondary" size="lg" className="sm:flex-1">Keep Shopping</ButtonLink>
        </>
      ) : state === "pending" ? (
        <>
          <ButtonLink href={order ? `/checkout/success?reference=${order.reference}` : "/account"} size="lg" className="sm:flex-1">Refresh</ButtonLink>
          <ButtonLink href="/account" variant="secondary" size="lg" className="sm:flex-1">View Orders</ButtonLink>
        </>
      ) : (
        <>
          <ButtonLink href="/checkout" size="lg" className="sm:flex-1">Try Again</ButtonLink>
          {onClose ? (
            <Button variant="secondary" size="lg" onClick={onClose} className="sm:flex-1">Back to Bag</Button>
          ) : (
            <ButtonLink href="/cart" variant="secondary" size="lg" className="sm:flex-1">Back to Bag</ButtonLink>
          )}
        </>
      )}
    </>
  );
}

/** Desktop (lg+): the receipt is a regular page section instead of a popup. */
export function OrderResultPage({ state, order }: Shared) {
  return (
    <div className="hidden lg:block">
      {state === "success" && <ClearCart />}
      <div className="max-w-[720px]">
        <ResultBody state={state} order={order} id="order-result-page-title" />
        <div className="mt-8 flex gap-2 [&>*]:flex-1">
          <ResultActions state={state} order={order} />
        </div>
      </div>
    </div>
  );
}

/** Below lg: popup (bottom sheet on phones, centred dialog on tablets). */
export function OrderResultDialog({
  state,
  order,
  onClose,
  showTrigger = true,
}: Shared & { /** false when the popup is opened by navigation (the cart) and has no button of its own */ showTrigger?: boolean }) {
  const [open, setOpen] = useState(true);
  const close = () => {
    setOpen(false);
    onClose?.();
  };

  useEffect(() => {
    if (!open) return;
    const lg = window.matchMedia("(min-width: 1024px)");
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    const lock = () => (document.body.style.overflow = lg.matches ? "" : "hidden");
    lock();
    lg.addEventListener("change", lock);
    return () => {
      document.removeEventListener("keydown", onKey);
      lg.removeEventListener("change", lock);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <div className="lg:hidden">
      {state === "success" && <ClearCart />}
      {showTrigger && (
        <Button variant="secondary" onClick={() => setOpen(true)}>
          {order ? "View Receipt" : "Details"}
        </Button>
      )}
      <AnimatePresence>
        {open && (
          <motion.div
            key="result-root"
            className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center sm:p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: EASE }}
          >
            <div className="absolute inset-0 bg-black/40" onClick={close} />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="order-result-title"
              className="relative flex max-h-[90dvh] w-full flex-col rounded-t-[12px] bg-white sm:max-w-[560px] sm:rounded-[12px]"
              initial={{ y: 48 }}
              animate={{ y: 0 }}
              exit={{ y: 48 }}
              transition={{ duration: 0.4, ease: EASE }}
            >
              <button
                type="button"
                aria-label="Close"
                onClick={close}
                className="absolute right-4 top-4 flex size-10 items-center justify-center rounded-full bg-cloud transition active:scale-90 sm:right-6 sm:top-6"
              >
                <X size={20} aria-hidden />
              </button>

              <div className="flex-1 overflow-y-auto px-4 pb-6 pt-8 sm:px-8 sm:pt-12">
                <ResultBody state={state} order={order} id="order-result-title" />
              </div>

              <div className="flex flex-col gap-2 border-t border-hairline-soft px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:flex-row sm:px-8">
                <ResultActions state={state} order={order} onClose={onClose ? close : undefined} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
