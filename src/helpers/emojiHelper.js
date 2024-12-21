export function getEmojiBasedOnPriceChange(change) {
  let emoji = "↗";
  if (change < 0) {
    emoji = "↘";
  } else if (change === 0) {
    emoji = "→";
  }
  return emoji;
}
