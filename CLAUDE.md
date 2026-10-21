# XBK

E-commerce storefront (footwear, clothing, accessories) for the XBK brand. The visual system is defined in `DESIGN.md` (a Nike-style analysis) — read it before touching UI. Brand name and logo are XBK; never use third-party brand names, logos or imagery, except the Google and Paystack marks on the "Continue with Google" and "Pay with Paystack" buttons (`components/brand/ProviderIcons.tsx`).

## Stack
Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · Neon Postgres via Drizzle ORM · Better Auth (email/password) · Zustand · Motion (`motion/react`) · Paystack · Zod

## Commands
- `npm run dev` — dev server
- `npm run typecheck` — `tsc --noEmit` · `npm run verify` — typecheck + admin guards + unit tests (run before committing) · `npm run test:stock` — concurrency checks, needs `TEST_DATABASE_URL` (a disposable Neon branch)
- `npm run build` — production build
- `npm run db:generate` — migration files · `db:migrate` — apply them · `db:seed` — load categories + demo products
- Env: copy `.env.example` → `.env.local`. Never create or commit real env files.
- Setup checklist: fill every var in `.env.example`; `db:migrate`; sign up with an email in `ADMIN_EMAILS` to get the admin role (set only at sign-up); use Paystack **test** keys until launch (the success page settles orders locally, the webhook `{APP_URL}/api/paystack/webhook` only matters once deployed); `BLOB_READ_WRITE_TOKEN` enables admin photo uploads and `RESEND_API_KEY` + `EMAIL_FROM` enable order emails (both are skipped with a warning when unset).

## Layout
```
src/
  middleware.ts          cookie-only gate for /account /checkout /admin (+ redirects auth pages)
  app/                   routes: / shop product/[slug] cart checkout(/success) sign-in sign-up account admin/*
    api/auth/[...all]    Better Auth handler
    api/checkout         creates order from DB prices, starts Paystack transaction
    api/paystack/webhook HMAC-verified charge.success → settles order
  components/            brand, layout (Navbar/Footer), home, shop, product, cart, checkout, auth, admin, ui, motion
  db/                    schema.ts, index.ts (lazy Neon client), seed.ts, mock-products.ts
  lib/                   auth, auth-client, session (requireUser/requireAdmin), paystack, orders, products, filters, nav, utils
  store/                 cart (persisted), ui
```

## Rules
- Money is integer **kobo** everywhere; format only at the edge with `formatNaira`, and turn typed naira into kobo with `nairaToKobo`, never `Math.round(n * 100)`.
- Database: change the schema only via migrations (`schema.ts` → `db:generate` → read and hand-edit the SQL if existing rows must be carried over → `db:migrate`). Never `db:push` a real database; try risky migrations on a Neon branch first.
- Only `lib/products.ts` queries the catalogue; it joins categories so `Product.category`/`.subcategory` stay plain slugs. The standard categories live in `db/catalog-data.ts` and in migration `0001`; keep them in step.
- Delivery fee: `lib/shipping.ts` is the one source for fee and delivery-window logic; rates per state live in `shipping_rates` (edited at /admin/shipping, read via `lib/shipping-rates.ts`; defaults in `DEFAULT_RATES` and migration `0004`). The form shows it, `api/checkout` charges it, stored in `orders.shipping_fee_kobo`; `total_kobo` includes it.
- Admin: every `app/admin` page, layout and exported server action must call `requireAdmin()` first; `npm run check:guards` enforces it. Order status moves forward only (`paid → shipped → delivered`) through guarded updates in `admin/orders/actions.ts`. Customer emails (shipped, delivered, newsletter welcome) use `lib/email-templates.ts` (defaults in code, edited at /admin/emails). Shipping states can be switched off (`shipping_rates.active`); `api/checkout` rejects inactive states. Categories added at /admin/categories exist only in the database; `db/catalog-data.ts` and migration `0001` hold the standard ones.
- Stock: `products.stock` is the source of truth; change it only through `adjustStockBy` (admin, logged to `stock_movements`) and `markPaidAndDecrement` (sales) in single SQL statements, never an absolute overwrite. Thresholds and reasons live in `lib/stock.ts`. Pending orders hold no stock and expire to `failed` after 24h, but a verified payment still settles them.
- Keep the catalogue simple: stock is one integer per product. No variants, warehouses, wishlists or reviews yet.
- Never trust client prices: `api/checkout` re-reads products from the DB. Payment is only marked paid after server-side Paystack verification (`lib/orders.ts`), shared by webhook and success page.
- Middleware is optimistic only. Real auth lives in `lib/session.ts`; every admin page/action must go through `requireAdmin()`.
- Admin role is granted when the email is in `ADMIN_EMAILS` and verified (Google sign-in, or after the email link); never from client input.
- Without `DATABASE_URL` the storefront serves `db/mock-products.ts` so UI work needs no database.
- Design: black/white/`#f5f5f5` only; pill (30px) buttons; flat cards (no shadows); filled buttons use the `raised-dark` / `raised-light` utilities in `globals.css`; 8px spacing grid; 96px uppercase campaign headline used only for hero lockups; sale red only on prices, failed-status pills and field validation messages; success green only on paid/shipped-status pills (`StatusPill`). Shared easing: `lib/motion.ts` `EASE`.
- Inputs: build forms with `components/ui/Field` / `PhoneField` (Nigerian `+234` phone) and the shared Zod rules in `lib/validation.ts`; per-field errors show as small bubbles via `lib/use-field-errors`. Phones are stored as `+234XXXXXXXXXX`.
- Logo mark: `components/brand/Logo.tsx` (solid rounded triangle). `public/logo.svg` must match it; the favicon is `app/icon.png` (cropped from `public/XBKLogo.svg`).
