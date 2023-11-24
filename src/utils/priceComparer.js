export function OldPriceHigherThanNewPrice(oldPrice, medianFiri) {
    const oldPriceNum = Number(oldPrice);
    if (isNaN(oldPriceNum)) {
        return false;
    }
    return oldPriceNum > medianFiri;
}