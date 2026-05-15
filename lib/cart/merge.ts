import type { CartEntry } from "./types";

export function mergeEntries(
  serverItems: CartEntry[],
  localItems: CartEntry[],
): CartEntry[] {
  const map = new Map<string, number>();

  for (const item of serverItems) {
    map.set(item.productId, (map.get(item.productId) ?? 0) + item.quantity);
  }

  for (const item of localItems) {
    map.set(item.productId, (map.get(item.productId) ?? 0) + item.quantity);
  }

  return Array.from(map.entries()).map(([productId, quantity]) => ({
    productId,
    quantity,
  }));
}
