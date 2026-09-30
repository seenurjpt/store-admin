import { describe, expect, it } from "vitest";
import { can } from "@/lib/permissions";

describe("can", () => {
  it("lets admins do everything with products", () => {
    for (const permission of ["product:view", "product:create", "product:update", "product:change-status", "product:delete"] as const) {
      expect(can("ADMIN", permission)).toBe(true);
    }
  });

  it("lets managers manage products but not delete them", () => {
    expect(can("MANAGER", "product:view")).toBe(true);
    expect(can("MANAGER", "product:create")).toBe(true);
    expect(can("MANAGER", "product:update")).toBe(true);
    expect(can("MANAGER", "product:change-status")).toBe(true);
    expect(can("MANAGER", "product:delete")).toBe(false);
  });
});
