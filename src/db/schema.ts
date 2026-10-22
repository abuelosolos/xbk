import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  foreignKey,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import type { Gender, ProductColor } from "@/lib/types";

/* ───────────── Better Auth tables ───────────── */

export const user = pgTable(
  "user",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified").notNull().default(false),
    image: text("image"),
    role: text("role").notNull().default("customer"), // "customer" | "admin"
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [check("user_role_check", sql`${t.role} in ('customer', 'admin')`)],
);

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (t) => [index("session_user_idx").on(t.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [index("account_user_idx").on(t.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (t) => [index("verification_identifier_idx").on(t.identifier)],
);

/* ───────────── Commerce tables (all money in kobo) ───────────── */

/** Top-level shelves: Shoes, Clothing, Accessories. */
export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/** Running, Lifestyle, Tops, Bags… always inside exactly one category. */
export const subcategories = pgTable(
  "subcategories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    // the same slug may exist under different categories ("lifestyle" in Shoes and Clothing)
    unique("subcategories_category_slug_unique").on(t.categoryId, t.slug),
    // lets products reference (id, category_id) so a product can't sit in another category's subcategory
    unique("subcategories_id_category_unique").on(t.id, t.categoryId),
  ],
);

export const products = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    subtitle: text("subtitle").notNull(),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    subcategoryId: uuid("subcategory_id"),
    gender: text("gender").$type<Gender>().notNull(),
    priceKobo: integer("price_kobo").notNull(),
    salePriceKobo: integer("sale_price_kobo"),
    colors: jsonb("colors")
      .$type<ProductColor[]>()
      .notNull()
      .default([]),
    sizes: jsonb("sizes").$type<string[]>().notNull().default([]),
    badge: text("badge"),
    description: text("description").notNull().default(""),
    images: jsonb("images").$type<string[]>().notNull().default([]),
    stock: integer("stock").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    /** Set = hidden from the storefront and checkout; order history keeps working. */
    archivedAt: timestamp("archived_at"),
  },
  (t) => [
    // (subcategory, category) must be a real pair; a null subcategory skips the check
    foreignKey({
      name: "products_subcategory_category_fk",
      columns: [t.subcategoryId, t.categoryId],
      foreignColumns: [subcategories.id, subcategories.categoryId],
    }).onDelete("restrict"),
    check("products_price_positive", sql`${t.priceKobo} > 0`),
    check(
      "products_sale_below_price",
      sql`${t.salePriceKobo} is null or ${t.salePriceKobo} < ${t.priceKobo}`,
    ),
    check("products_stock_non_negative", sql`${t.stock} >= 0`),
    index("products_category_idx").on(t.categoryId),
    index("products_subcategory_idx").on(t.subcategoryId),
    index("products_gender_idx").on(t.gender),
  ],
);

export const orderStatus = pgEnum("order_status", [
  "pending",
  "paid",
  "failed",
  "shipped",
  "delivered",
  "cancelled",
]);

export type ShippingAddress = {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode?: string;
};

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
    email: text("email").notNull(),
    status: orderStatus("status").notNull().default("pending"),
    totalKobo: integer("total_kobo").notNull(), // goods + shipping fee
    shippingFeeKobo: integer("shipping_fee_kobo").notNull().default(0),
    reference: text("reference").notNull().unique(), // Paystack reference
    shipping: jsonb("shipping").$type<ShippingAddress>().notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    paidAt: timestamp("paid_at"),
    shippedAt: timestamp("shipped_at"),
    deliveredAt: timestamp("delivered_at"),
    cancelledAt: timestamp("cancelled_at"),
    /** Admin note on a cancellation, e.g. the Paystack refund reference. */
    cancelNote: text("cancel_note"),
    /** True when stock could not fully cover this order at payment time (oversold). */
    stockShortfall: boolean("stock_shortfall").notNull().default(false),
  },
  (t) => [index("orders_user_idx").on(t.userId)],
);

export const orderItems = pgTable("order_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "restrict" }),
  name: text("name").notNull(),
  size: text("size").notNull(),
  color: text("color").notNull().default(""),
  qty: integer("qty").notNull(),
  unitPriceKobo: integer("unit_price_kobo").notNull(),
});

/** Saved delivery addresses; at most one default per user (partial unique index). */
export const addresses = pgTable(
  "addresses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    fullName: text("full_name").notNull(),
    phone: text("phone").notNull(),
    address: text("address").notNull(),
    city: text("city").notNull(),
    state: text("state").notNull(),
    postalCode: text("postal_code").notNull().default(""),
    isDefault: boolean("is_default").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("addresses_user_idx").on(t.userId),
    uniqueIndex("addresses_one_default_idx")
      .on(t.userId)
      .where(sql`${t.isDefault}`),
  ],
);

/** Delivery fee and window per state; edited by admins at /admin/shipping. Days are business days. */
export const shippingRates = pgTable(
  "shipping_rates",
  {
    state: text("state").primaryKey(),
    feeKobo: integer("fee_kobo").notNull(),
    minDays: integer("min_days").notNull(),
    maxDays: integer("max_days").notNull(),
    active: boolean("active").notNull().default(true),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    check("shipping_rates_fee_positive", sql`${t.feeKobo} > 0`),
    check(
      "shipping_rates_days_valid",
      sql`${t.minDays} >= 0 and ${t.minDays} <= ${t.maxDays}`,
    ),
  ],
);

/** Footer newsletter signups. `unsubscribedAt` is set instead of deleting the row. */
export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  unsubscribedAt: timestamp("unsubscribed_at"),
});

/** Admin-edited customer emails; built-in defaults (lib/email-templates.ts) apply when a row is missing. */
export const emailTemplates = pgTable("email_templates", {
  key: text("key").primaryKey(), // "order_shipped" | "order_delivered" | "newsletter_welcome"
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/** Append-only record of every stock change; `products.stock` stays the source of truth. */
export const stockMovements = pgTable(
  "stock_movements",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    delta: integer("delta").notNull(),
    /** Units a sale could not fill because stock ran out. */
    shortfall: integer("shortfall").notNull().default(0),
    stockAfter: integer("stock_after").notNull(),
    reason: text("reason").notNull(),
    orderId: uuid("order_id").references(() => orders.id, { onDelete: "set null" }),
    actorUserId: text("actor_user_id").references(() => user.id, { onDelete: "set null" }),
    note: text("note"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("stock_movements_product_idx").on(t.productId, t.createdAt.desc()),
    check("stock_movements_reason_check", sql`${t.reason} in ('initial','sale','restock','correction','damaged','return')`),
    check("stock_movements_stock_after_check", sql`${t.stockAfter} >= 0`),
    check("stock_movements_shortfall_check", sql`${t.shortfall} >= 0`),
    check("stock_movements_note_len", sql`${t.note} is null or char_length(${t.note}) <= 200`),
  ],
);
