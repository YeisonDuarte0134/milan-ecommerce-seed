export function formatPrice(price: number): string {
  if (price === 0) return "$0";
  const rounded = Math.round(price);
  const formatted = rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `$${formatted}`;
}
