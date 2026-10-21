-- Splits the free-text products.category / products.subcategory into real tables and keeps existing products.
-- Hand-edited from the drizzle-kit output: the generated version added category_id NOT NULL to a table that
-- already has rows and dropped the old columns without carrying their values over.
--
-- Order matters: build the new tables, backfill, validate, enforce, and only then drop the old columns.

CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "subcategories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category_id" uuid NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "subcategories_category_slug_unique" UNIQUE("category_id","slug"),
	CONSTRAINT "subcategories_id_category_unique" UNIQUE("id","category_id")
);
--> statement-breakpoint
ALTER TABLE "subcategories" ADD CONSTRAINT "subcategories_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint

-- 1. Standard taxonomy (kept in step with src/db/catalog-data.ts), then anything extra already used by products.
INSERT INTO "categories" ("slug", "name", "sort_order") VALUES
	('footwear', 'Shoes', 1),
	('clothing', 'Clothing', 2),
	('accessories', 'Accessories', 3);--> statement-breakpoint
INSERT INTO "categories" ("slug", "name", "sort_order")
SELECT DISTINCT p."category", initcap(replace(p."category", '-', ' ')), 100
FROM "products" p
ON CONFLICT ("slug") DO NOTHING;--> statement-breakpoint
INSERT INTO "subcategories" ("category_id", "slug", "name", "sort_order")
SELECT c."id", v.slug, v.name, v.sort_order
FROM (VALUES
	('footwear', 'running', 'Running', 1),
	('footwear', 'training', 'Training & Gym', 2),
	('footwear', 'lifestyle', 'Lifestyle', 3),
	('clothing', 'tops', 'Tops & T-Shirts', 1),
	('clothing', 'hoodies', 'Hoodies & Sweatshirts', 2),
	('clothing', 'shorts', 'Shorts', 3),
	('clothing', 'leggings', 'Leggings & Tights', 4),
	('clothing', 'jackets', 'Jackets & Outerwear', 5),
	('accessories', 'bags', 'Bags & Backpacks', 1),
	('accessories', 'socks', 'Socks', 2)
) AS v(category_slug, slug, name, sort_order)
JOIN "categories" c ON c."slug" = v.category_slug;--> statement-breakpoint
INSERT INTO "subcategories" ("category_id", "slug", "name", "sort_order")
SELECT DISTINCT c."id", p."subcategory", initcap(replace(p."subcategory", '-', ' ')), 100
FROM "products" p
JOIN "categories" c ON c."slug" = p."category"
WHERE p."subcategory" IS NOT NULL
ON CONFLICT ("category_id", "slug") DO NOTHING;--> statement-breakpoint

-- 2. New columns (nullable until backfilled). The old indexes go first because their names are reused.
DROP INDEX "products_category_idx";--> statement-breakpoint
DROP INDEX "products_subcategory_idx";--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "category_id" uuid;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "subcategory_id" uuid;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint

-- 3. Backfill from the old text columns.
UPDATE "products" p SET "category_id" = c."id" FROM "categories" c WHERE c."slug" = p."category";--> statement-breakpoint
UPDATE "products" p SET "subcategory_id" = s."id"
FROM "subcategories" s
WHERE p."subcategory" IS NOT NULL AND s."category_id" = p."category_id" AND s."slug" = p."subcategory";--> statement-breakpoint

-- 4. Products added through the admin form never had a subcategory: the storefront used to guess the type from
--    the name. Apply those same guesses once (first match wins) so they don't vanish from the type filters.
--    Every assignment is reported as a NOTICE so it can be reviewed.
DO $$
DECLARE
	r record;
BEGIN
	FOR r IN
		WITH guess(category_slug, sub_slug, pattern, rank) AS (VALUES
			('footwear', 'running', 'running', 1),
			('footwear', 'training', 'training', 2),
			('footwear', 'lifestyle', 'lifestyle', 3),
			('clothing', 'tops', 't-shirt|tee|tank|top', 1),
			('clothing', 'hoodies', 'hoodie|sweatshirt', 2),
			('clothing', 'shorts', 'short', 3),
			('clothing', 'leggings', 'legging|tight', 4),
			('clothing', 'jackets', 'jacket|windbreaker', 5),
			('accessories', 'bags', 'bag|backpack', 1),
			('accessories', 'socks', 'sock', 2)
		), picked AS (
			SELECT DISTINCT ON (p."id") p."id", p."slug", s."id" AS sub_id, g.sub_slug
			FROM "products" p
			JOIN "categories" c ON c."id" = p."category_id"
			JOIN guess g ON g.category_slug = c."slug" AND (p."name" || ' ' || p."subtitle") ~* g.pattern
			JOIN "subcategories" s ON s."category_id" = c."id" AND s."slug" = g.sub_slug
			WHERE p."subcategory_id" IS NULL
			ORDER BY p."id", g.rank
		)
		SELECT * FROM picked
	LOOP
		UPDATE "products" SET "subcategory_id" = r.sub_id WHERE "id" = r."id";
		RAISE NOTICE 'subcategory guessed for %: %', r."slug", r.sub_slug;
	END LOOP;
END $$;--> statement-breakpoint

-- 5. Validate before enforcing, so a bad row produces a readable error instead of a bare constraint failure.
DO $$
DECLARE
	bad text;
BEGIN
	SELECT string_agg("slug", ', ') INTO bad FROM "products" WHERE "category_id" IS NULL;
	IF bad IS NOT NULL THEN RAISE EXCEPTION 'products without a category: %', bad; END IF;

	SELECT string_agg("slug", ', ') INTO bad FROM "products" WHERE "price_kobo" <= 0;
	IF bad IS NOT NULL THEN RAISE EXCEPTION 'products with price_kobo <= 0: %', bad; END IF;

	SELECT string_agg("slug", ', ') INTO bad FROM "products"
	WHERE "sale_price_kobo" IS NOT NULL AND "sale_price_kobo" >= "price_kobo";
	IF bad IS NOT NULL THEN RAISE EXCEPTION 'products whose sale price is not below the price: %', bad; END IF;

	SELECT string_agg("slug", ', ') INTO bad FROM "products" WHERE "stock" < 0;
	IF bad IS NOT NULL THEN RAISE EXCEPTION 'products with negative stock: %', bad; END IF;
END $$;--> statement-breakpoint

-- 6. Enforce.
ALTER TABLE "products" ALTER COLUMN "category_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_subcategory_category_fk" FOREIGN KEY ("subcategory_id","category_id") REFERENCES "public"."subcategories"("id","category_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_price_positive" CHECK ("products"."price_kobo" > 0);--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_sale_below_price" CHECK ("products"."sale_price_kobo" is null or "products"."sale_price_kobo" < "products"."price_kobo");--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_stock_non_negative" CHECK ("products"."stock" >= 0);--> statement-breakpoint
CREATE INDEX "products_category_idx" ON "products" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "products_subcategory_idx" ON "products" USING btree ("subcategory_id");--> statement-breakpoint

-- 7. Only now drop the old text columns.
ALTER TABLE "products" DROP COLUMN "category";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "subcategory";
