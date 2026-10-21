ALTER TABLE "orders" ADD COLUMN "stock_shortfall" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "archived_at" timestamp;