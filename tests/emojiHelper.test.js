import { describe, test, expect } from "vitest";
import { getEmojiBasedOnPriceChange } from "../src/helpers/emojiHelper.js";

describe("getEmojiBasedOnPriceChange", () => {
  test("should return ↗ when the change is positive", () => {
    const result = getEmojiBasedOnPriceChange(10);
    expect(result).toBe("↗");
  });

  test("should return ↘ when the change is negative", () => {
    const result = getEmojiBasedOnPriceChange(-10);
    expect(result).toBe("↘");
  });

  test("should return → when the change is 0", () => {
    const result = getEmojiBasedOnPriceChange(0);
    expect(result).toBe("→");
  });
});
