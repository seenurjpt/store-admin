import { describe, expect, it } from "vitest";
import { formatDate, formatDateTime } from "@/lib/format";
import { isValidTimeZone } from "@/lib/time-zone";

describe("date formatting in the viewer's time zone", () => {
  // 29 Sept 2026, 23:30 UTC is already 30 Sept in India and still 29 Sept in New York.
  const instant = new Date("2026-09-29T23:30:00Z");

  it("formats the same instant in different time zones", () => {
    expect(formatDateTime(instant, "UTC")).toBe("29 Sept 2026, 23:30");
    expect(formatDateTime(instant, "Asia/Kolkata")).toBe("30 Sept 2026, 05:00");
    expect(formatDate(instant, "Asia/Kolkata")).toBe("30 Sept 2026");
    expect(formatDate(instant, "America/New_York")).toBe("29 Sept 2026");
  });
});

describe("isValidTimeZone", () => {
  it("accepts IANA time zones", () => {
    expect(isValidTimeZone("Asia/Kolkata")).toBe(true);
    expect(isValidTimeZone("UTC")).toBe(true);
  });

  it("rejects missing or made-up values from the cookie", () => {
    expect(isValidTimeZone(undefined)).toBe(false);
    expect(isValidTimeZone("")).toBe(false);
    expect(isValidTimeZone("Mars/Olympus_Mons")).toBe(false);
    expect(isValidTimeZone("<script>")).toBe(false);
  });
});
