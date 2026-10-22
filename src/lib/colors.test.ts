import { describe, expect, it } from "vitest";
import { galleryFor, withColorPhotos } from "./colors";

const black = { name: "Black", hex: "#111111", images: ["/b1.jpg", "/b2.jpg"] };
const white = { name: "White", hex: "#ffffff" };
const product = { images: ["/b1.jpg", "/b2.jpg", "/w1.jpg"], colors: [black, white] };

describe("galleryFor", () => {
  it("uses the colour's own photos", () => expect(galleryFor(product, 0)).toEqual(["/b1.jpg", "/b2.jpg"]));
  it("falls back to every photo when the colour has none", () => expect(galleryFor(product, 1)).toEqual(product.images));
  it("falls back for an unknown colour index", () => expect(galleryFor(product, 5)).toEqual(product.images));
  it("is empty for a product without photos", () => expect(galleryFor({ images: [], colors: [white] }, 0)).toEqual([]));
});

describe("withColorPhotos", () => {
  const tags = new Map([["/b1.jpg", "Black"], ["/w1.jpg", "White"], ["/x.jpg", "Red"]]);
  it("groups photos by colour name in photo order", () => {
    expect(withColorPhotos([{ name: "Black", hex: "#111111" }, { name: "White", hex: "#ffffff" }], ["/b1.jpg", "/w1.jpg"], tags)).toEqual([
      { name: "Black", hex: "#111111", images: ["/b1.jpg"] },
      { name: "White", hex: "#ffffff", images: ["/w1.jpg"] },
    ]);
  });
  it("leaves colours without tagged photos alone and ignores unknown colours", () => {
    expect(withColorPhotos([{ name: "Blue", hex: "#0000ff" }], ["/x.jpg"], tags)).toEqual([{ name: "Blue", hex: "#0000ff" }]);
  });
});
