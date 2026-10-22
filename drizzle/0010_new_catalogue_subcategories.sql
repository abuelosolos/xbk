-- New sub-categories for the refreshed catalogue (mirrors src/db/catalog-data.ts). Data only, safe to re-run.
INSERT INTO "subcategories" ("category_id", "slug", "name", "sort_order")
SELECT c."id", v."slug", v."name", v."sort_order"
FROM (VALUES
	('footwear', 'boots', 'Boots', 4),
	('clothing', 'knitwear', 'Knitwear', 6),
	('accessories', 'caps', 'Caps & Hats', 3),
	('accessories', 'belts', 'Belts', 4)
) AS v("category_slug", "slug", "name", "sort_order")
JOIN "categories" c ON c."slug" = v."category_slug"
ON CONFLICT ("category_id", "slug") DO NOTHING;
