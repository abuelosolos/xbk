ALTER TYPE "public"."order_status" ADD VALUE 'cancelled';--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "cancelled_at" timestamp;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "cancel_note" text;