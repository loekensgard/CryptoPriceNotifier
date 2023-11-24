export function getEmojiBasedOnPriceChange(change) {
  console.log(change);

  let emoji = "↗";
  if (change < 0) {
    emoji = "↘";
  }
  return emoji;
}
