import { formatNumber } from "../src/utils/formatNumberService.js";
import { test, it, expect } from "vitest";

test("formatNumber", () => {
  it("should format number according to the provided locale", () => {
    const result = formatNumber(222000, "nb-NO");
    expect(result).toBe("222 000");
  });

  it("should format number according to the provided locale", () => {
    const result = formatNumber(22000, "de-DE");
    expect(result).toBe("22.000");
  });
});
