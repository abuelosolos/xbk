import { NextResponse } from "next/server";
import { settleOrderByReference } from "@/lib/orders";
import { isValidSignature } from "@/lib/paystack";

export const runtime = "nodejs";

/** Set this URL in the Paystack dashboard: {APP_URL}/api/paystack/webhook */
export async function POST(request: Request) {
  const raw = await request.text();
  if (!isValidSignature(raw, request.headers.get("x-paystack-signature"))) {
    return new NextResponse("Invalid signature", { status: 401 });
  }

  const event = JSON.parse(raw) as { event: string; data?: { reference?: string } };
  if (event.event === "charge.success" && event.data?.reference) {
    await settleOrderByReference(event.data.reference);
  }
  return NextResponse.json({ received: true });
}
