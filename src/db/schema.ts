import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import type { Gender } from "@/lib/types";

/* ───────────── Better Auth tables ───────────── */

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  role: text("role").notNull().default("customer"), // "customer" | "admin"
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const session = pgTable("session", {
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
});

export const account = pgTable("account", {
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
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

/* ───────────── Commerce tables (all money in kobo) ───────────── */

export const products = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    subtitle: text("subtitle").notNull(),
    category: text("category").notNull(),
    gender: text("gender").$type<Gender>().notNull(),
    priceKobo: integer("price_kobo").notNull(),
    salePriceKobo: integer("sale_price_kobo"),
    colors: jsonb("colors").$type<{ name: string; hex: string }[]>().notNull().default([]),
    sizes: jsonb("sizes").$type<string[]>().notNull().default([]),
    badge: text("badge"),
    description: text("description").notNull().default(""),
    images: jsonb("images").$type<string[]>().notNull().default([]),
    stock: integer("stock").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("products_category_idx").on(t.category), index("products_gender_idx").on(t.gender)],
);

export const orderStatus = pgEnum("order_status", ["pending", "paid", "failed", "shipped"]);

export type ShippingAddress = {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
};

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
    email: text("email").notNull(),
    status: orderStatus("status").notNull().default("pending"),
    totalKobo: integer("total_kobo").notNull(),
    reference: text("reference").notNull().unique(), // Paystack reference
    shipping: jsonb("shipping").$type<ShippingAddress>().notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    paidAt: timestamp("paid_at"),
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
