import { formatNumber } from "../src/helpers/formatNumberHelper.js";
import { describe, test, expect } from "vitest";

describe("formatNumber", () => {
  test("should format number according to nb-NO locale", () => {
    const result = formatNumber(222000, "nb-NO");
    expect(result.replace(/\s/g, ' ')).toBe("222 000");
  });

  test("should format number according to de-DE locale", () => {
    const result = formatNumber(22000, "de-DE");
    expect(result).toBe("22.000");
  });
});
