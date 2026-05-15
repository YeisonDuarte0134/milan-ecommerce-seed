import type { CartEntry } from "./types";

const STORAGE_KEY = "milan_cart";

export function readLocalCart(): CartEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as CartEntry[];
  } catch {
    return [];
  }
}

export function writeLocalCart(items: CartEntry[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function addToLocalCart(productId: string): CartEntry[] {
  const items = readLocalCart();
  const existing = items.find((i) => i.productId === productId);
  if (existing) {
    existing.quantity += 1;
  } else {
    items.push({ productId, quantity: 1 });
  }
  writeLocalCart(items);
  return items;
}

export function clearLocalCart(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
