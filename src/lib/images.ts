/**
 * Unsplash photo id (the trailing segment of unsplash.com/photos/<slug>-<id>) -> CDN file.
 * The /photos/<id>/download endpoint answers 401 to browsers, so photos are served
 * straight from images.unsplash.com. Add new demo photos here.
 */
const CDN: Record<string, string> = {
  "8GzbKs74yq4": "photo-1676379827610-c380c52db0c6",
  "0Mfukiqo4Us": "photo-1553835584-c3eab150319e",
  "B0s90BDX9xc": "photo-1699593022913-7068606059c8",
  "044uX1R-CTs": "photo-1653868248894-fd2882c61524",
  "4rUYuwJ2vGw": "photo-1651761179569-4ba2aa054997",
  "gUPznplBsLI": "photo-1599817878414-43ef36677cf0",
  "3aXdkQz7oY4": "photo-1553051421-43dee8318d52",
  "j4nOERVgQzY": "photo-1597169428688-254b4223ba7c",
  "d6gfjQmCL7E": "photo-1585834830884-392089dfd9f6",
  "9CjMWUGBfr8": "photo-1635380240359-3b2880e488eb",
  "vspPIvHpNO4": "photo-1564735862904-d0cc7fc1bb36",
  "d-BTL93LsGg": "photo-1594299447935-e5b840f54b9b",
  "7-qdOoZ5-5s": "photo-1563722205706-e8513b7554bc",
  "_1BshZ602EM": "photo-1720462393492-046dfa56b1d1",
  "1eJ9cG97BD8": "photo-1640262653855-e47becae35ec",
  "Or4_-uT-S5c": "photo-1675609957648-5af309bf44f7",
};

export const unsplash = (id: string, width = 1200) =>
  `https://images.unsplash.com/${CDN[id] ?? `photo-${id}`}?auto=format&fit=crop&q=80&w=${width}`;

/** Unsplash photo ids already used by the demo catalogue, keyed by sub-category then category. */
const PREVIEW: Record<string, string[]> = {
  running: ["8GzbKs74yq4", "044uX1R-CTs"],
  lifestyle: ["0Mfukiqo4Us"],
  training: ["B0s90BDX9xc"],
  tops: ["4rUYuwJ2vGw", "gUPznplBsLI"],
  hoodies: ["3aXdkQz7oY4"],
  shorts: ["j4nOERVgQzY"],
  leggings: ["d6gfjQmCL7E"],
  jackets: ["9CjMWUGBfr8"],
  bags: ["d-BTL93LsGg"],
  socks: ["7-qdOoZ5-5s"],
  footwear: ["8GzbKs74yq4"],
  clothing: ["4rUYuwJ2vGw"],
  accessories: ["d-BTL93LsGg"],
};

/** Stand-in photos for a product with no uploaded images, until real ones replace them. */
export const previewImages = (category: string, subcategory?: string | null) =>
  (PREVIEW[subcategory ?? ""] ?? PREVIEW[category] ?? []).map((id) => unsplash(id));
