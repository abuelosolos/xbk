import { createHmac, timingSafeEqual } from "node:crypto";

const BASE = "https://api.paystack.co";

function secret() {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new Error("PAYSTACK_SECRET_KEY is not set");
  return key;
}

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${secret()}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
    cache: "no-store",
  });
  const json = (await res.json()) as { status: boolean; message: string; data: T };
  if (!res.ok || !json.status) throw new Error(json.message || "Paystack request failed");
  return json.data;
}

export function initializeTransaction(input: {
  email: string;
  amountKobo: number;
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
}) {
  return call<{ authorization_url: string; access_code: string; reference: string }>(
    "/transaction/initialize",
    {
      method: "POST",
      body: JSON.stringify({
        email: input.email,
        amount: input.amountKobo,
        currency: "NGN",
        reference: input.reference,
        callback_url: input.callbackUrl,
        metadata: input.metadata,
      }),
    },
  );
}

export function verifyTransaction(reference: string) {
  return call<{ status: string; amount: number; currency: string; reference: string }>(
    `/transaction/verify/${encodeURIComponent(reference)}`,
  );
}

/** Verifies the `x-paystack-signature` header (HMAC-SHA512 of the raw body). */
export function isValidSignature(rawBody: string, signature: string | null) {
  if (!signature) return false;
  const expected = Buffer.from(createHmac("sha512", secret()).update(rawBody).digest("hex"));
  const received = Buffer.from(signature);
  return expected.length === received.length && timingSafeEqual(expected, received);
}
