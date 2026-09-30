import { describe, expect, it } from "vitest";
import { LOW_STOCK_THRESHOLD, stockLevel } from "@/lib/stock";

describe("stockLevel", () => {
  it("marks zero stock as out of stock", () => {
    expect(stockLevel(0)).toBe("out");
  });

  it("marks stock up to the threshold as low", () => {
    expect(stockLevel(1)).toBe("low");
    expect(stockLevel(LOW_STOCK_THRESHOLD)).toBe("low");
  });

  it("marks stock above the threshold as ok", () => {
    expect(stockLevel(LOW_STOCK_THRESHOLD + 1)).toBe("ok");
  });
});
