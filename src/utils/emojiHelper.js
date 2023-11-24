export function OldPriceHigherThanNewPrice(oldPrice, newPrice) {
  const oldPriceNum = Number(oldPrice);
  if (isNaN(oldPriceNum)) {
    return false;
  }
  return oldPriceNum > newPrice;
}

export function getEmojiBasedOnPriceChange(oldPriceFromNickname, newPrice) {
  const removeDollars = oldPriceFromNickname.replace("$", "");

  let emoji = "↗";
  if (OldPriceHigherThanNewPrice(removeDollars, newPrice)) {
    emoji = "↘";
  }
  return emoji;
}
