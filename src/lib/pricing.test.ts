import { describe, expect, it } from "vitest";
import { scaleKobo } from "./pricing";

describe("scaleKobo", () => {
  it("applies percentages to kobo exactly", () => {
    expect(scaleKobo(2_500_000, -10)).toBe(2_250_000);
    expect(scaleKobo(2_500_000, 5.5)).toBe(2_637_500);
    expect(scaleKobo(999, 0)).toBe(999);
  });
  it("rejects results outside the valid range", () => {
    expect(scaleKobo(1, -90)).toBeNull();
    expect(scaleKobo(1_900_000_000, 10)).toBeNull();
  });
});
