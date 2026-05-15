"use server";

import { getSession } from "@/lib/auth";
import { addToServerCart, getServerCartEntries } from "@/lib/cart";
import type { CartEntry } from "@/lib/cart";

export async function addToCartAction(productId: string) {
  const session = await getSession();
  if (session) {
    await addToServerCart(session.userId, productId);
  }
  // If not logged in, client handles localStorage
}

export async function getCartAction(): Promise<CartEntry[]> {
  const session = await getSession();
  if (!session) return [];
  return getServerCartEntries(session.userId);
}
