CREATE TABLE "stock_movements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"delta" integer NOT NULL,
	"shortfall" integer DEFAULT 0 NOT NULL,
	"stock_after" integer NOT NULL,
	"reason" text NOT NULL,
	"order_id" uuid,
	"actor_user_id" text,
	"note" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "stock_movements_reason_check" CHECK ("stock_movements"."reason" in ('initial','sale','restock','correction','damaged','return')),
	CONSTRAINT "stock_movements_stock_after_check" CHECK ("stock_movements"."stock_after" >= 0),
	CONSTRAINT "stock_movements_shortfall_check" CHECK ("stock_movements"."shortfall" >= 0),
	CONSTRAINT "stock_movements_note_len" CHECK ("stock_movements"."note" is null or char_length("stock_movements"."note") <= 200)
);
--> statement-breakpoint
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_actor_user_id_user_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "stock_movements_product_idx" ON "stock_movements" USING btree ("product_id","created_at" DESC NULLS LAST);