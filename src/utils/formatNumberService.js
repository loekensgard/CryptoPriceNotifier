export function formatNumber(number, format) {
  return new Intl.NumberFormat(format, {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(number);
}
