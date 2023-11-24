import { it, test, expect } from "vitest";
import { getEmojiBasedOnPriceChange } from "../src/utils/emojiHelper.js";

test("getEmojiBasedOnPriceChange", () => {
  it("should return ↗ when the change is positive", () => {
    const result = getEmojiBasedOnPriceChange(10);
    expect(result).toBe("↗");
  });

  it("should return ↘ when the change is negative", () => {
    const result = getEmojiBasedOnPriceChange(-10);
    expect(result).toBe("↘");
  });

  it("should return → when the change is 0", () => {
    const result = getEmojiBasedOnPriceChange(0);
    expect(result).toBe("→");
  });
});
