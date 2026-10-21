# XBK

Black-and-white commerce storefront with Paystack payments and an admin dashboard. Design system: [`DESIGN.md`](./DESIGN.md).

## Quick start

```bash
npm install
cp .env.example .env.local     # fill in values
npm run db:push                # create tables in Neon
npm run db:seed                # optional demo products
npm run dev
```

Without `DATABASE_URL` the site still runs on demo products (checkout, accounts and admin need the database).

## Environment

See `.env.example`. Set `ADMIN_EMAILS` to your email, then **sign up** with it — that account gets the `admin` role and can open `/admin`.

## Paystack

1. Add `PAYSTACK_SECRET_KEY` / `PAYSTACK_PUBLIC_KEY` (test keys first).
2. In the Paystack dashboard set the webhook URL to `https://YOUR_DOMAIN/api/paystack/webhook`.
3. Checkout flow: `/checkout` → `POST /api/checkout` (order + Paystack init) → Paystack → `/checkout/success` (server verifies) — the webhook settles the same order idempotently.

## Routes

| Route | Access |
| --- | --- |
| `/`, `/shop`, `/product/[slug]`, `/cart` | public |
| `/sign-in`, `/sign-up` | public (redirect to `/account` if signed in) |
| `/account`, `/checkout`, `/checkout/success` | signed-in |
| `/admin`, `/admin/products`, `/admin/orders` | admin role |

## Replacing placeholders
Product and hero imagery are placeholders (the XBK mark on gray). Add photos to `products.images` (admin form/DB) and campaign photography to `components/home/Hero.tsx`; whitelist remote hosts in `next.config.ts` if hosted externally.
