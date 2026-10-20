# XBK

E-commerce storefront (footwear, clothing, accessories) for the XBK brand. The visual system is defined in `DESIGN.md` (a Nike-style analysis) — read it before touching UI. Brand name and logo are XBK; never use third-party brand names, logos or imagery.

## Stack
Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · Neon Postgres via Drizzle ORM · Better Auth (email/password) · Zustand · Motion (`motion/react`) · Paystack · Zod

## Commands
- `npm run dev` — dev server
- `npm run typecheck` — `tsc --noEmit` (run before committing)
- `npm run build` — production build
- `npm run db:push` — push schema to Neon · `db:generate` — migration files · `db:seed` — load demo products
- Env: copy `.env.example` → `.env.local`. Never create or commit real env files.

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
- Money is integer **kobo** everywhere; format only at the edge with `formatNaira`.
- Never trust client prices: `api/checkout` re-reads products from the DB. Payment is only marked paid after server-side Paystack verification (`lib/orders.ts`), shared by webhook and success page.
- Middleware is optimistic only. Real auth lives in `lib/session.ts`; every admin page/action must go through `requireAdmin()`.
- Admin role is granted at sign-up when the email is in `ADMIN_EMAILS`.
- Without `DATABASE_URL` the storefront serves `db/mock-products.ts` so UI work needs no database.
- Design: black/white/`#f5f5f5` only; pill (30px) buttons; flat cards, no shadows; 8px spacing grid; 96px uppercase campaign headline used only for hero lockups; sale red only on prices. Shared easing: `lib/motion.ts` `EASE`.
- Logo mark: `components/brand/Logo.tsx` (top 30% fades 20%→100% opacity). `public/logo.svg` and `app/icon.svg` must match it.
