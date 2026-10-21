"use client";

import { useRouter } from "next/navigation";
import { OrderResultDialog, resultState, type OrderSummary } from "@/components/checkout/OrderResultDialog";

/** The receipt popup shown over the bag after paying on a small screen; closing drops `?order=`. */
export function CartOrderDialog({ order }: { order: OrderSummary }) {
  const router = useRouter();
  return <OrderResultDialog state={resultState(order.status)} order={order} showTrigger={false} onClose={() => router.replace("/cart")} />;
}
