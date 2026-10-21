import { describe, expect, it } from "vitest";
import { LOW_STOCK_THRESHOLD, MAX_STOCK, stockAdjustSchema, stockStatus, sumQtyByProduct } from "./stock";

describe("stockStatus", () => {
  it("classifies stock levels", () => {
    expect(stockStatus(0)).toBe("out");
    expect(stockStatus(-1)).toBe("out");
    expect(stockStatus(1)).toBe("low");
    expect(stockStatus(LOW_STOCK_THRESHOLD)).toBe("low");
    expect(stockStatus(LOW_STOCK_THRESHOLD + 1)).toBe("in");
  });
});

describe("stockAdjustSchema", () => {
  const ok = { sign: "+", amount: "5", reason: "restock" };
  it("accepts a valid adjustment and coerces the amount", () => {
    expect(stockAdjustSchema.parse(ok)).toMatchObject({ sign: "+", amount: 5, reason: "restock" });
  });
  it("requires an explicit sign", () => {
    expect(stockAdjustSchema.safeParse({ ...ok, sign: null }).success).toBe(false);
    expect(stockAdjustSchema.safeParse({ ...ok, sign: "" }).success).toBe(false);
  });
  it("rejects zero, negative, fractional and oversized amounts", () => {
    for (const amount of ["0", "-3", "1.5", "abc", String(MAX_STOCK + 1)]) {
      expect(stockAdjustSchema.safeParse({ ...ok, amount }).success).toBe(false);
    }
  });
  it("only allows admin reasons", () => {
    expect(stockAdjustSchema.safeParse({ ...ok, reason: "sale" }).success).toBe(false);
    expect(stockAdjustSchema.safeParse({ ...ok, reason: "initial" }).success).toBe(false);
  });
  it("limits the note to 200 characters", () => {
    expect(stockAdjustSchema.safeParse({ ...ok, note: "x".repeat(201) }).success).toBe(false);
    expect(stockAdjustSchema.safeParse({ ...ok, note: "x".repeat(200) }).success).toBe(true);
  });
});

describe("sumQtyByProduct", () => {
  it("adds quantities for the same product across lines", () => {
    const totals = sumQtyByProduct([
      { productId: "a", qty: 2 },
      { productId: "b", qty: 1 },
      { productId: "a", qty: 3 },
    ]);
    expect(totals.get("a")).toBe(5);
    expect(totals.get("b")).toBe(1);
  });
});
