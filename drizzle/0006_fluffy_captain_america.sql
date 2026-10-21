ALTER TYPE "public"."order_status" ADD VALUE 'delivered';--> statement-breakpoint
CREATE TABLE "email_templates" (
	"key" text PRIMARY KEY NOT NULL,
	"subject" text NOT NULL,
	"body" text NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "newsletter_subscribers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"unsubscribed_at" timestamp,
	CONSTRAINT "newsletter_subscribers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "shipped_at" timestamp;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "delivered_at" timestamp;--> statement-breakpoint
ALTER TABLE "shipping_rates" ADD COLUMN "active" boolean DEFAULT true NOT NULL;