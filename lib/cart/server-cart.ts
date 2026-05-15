import { prisma } from "../prisma";
import type { CartEntry } from "./types";

export async function getServerCartEntries(
  userId: string,
): Promise<CartEntry[]> {
  const items = await prisma.cartItem.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });
  return items.map((i) => ({
    productId: i.productId,
    quantity: i.quantity,
  }));
}

export async function addToServerCart(
  userId: string,
  productId: string,
): Promise<void> {
  const existing = await prisma.cartItem.findUnique({
    where: { userId_productId: { userId, productId } },
  });

  if (existing) {
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + 1 },
    });
  } else {
    await prisma.cartItem.create({
      data: { userId, productId, quantity: 1 },
    });
  }
}

export async function saveServerCart(
  userId: string,
  entries: CartEntry[],
): Promise<void> {
  for (const entry of entries) {
    await prisma.cartItem.upsert({
      where: { userId_productId: { userId, productId: entry.productId } },
      update: { quantity: entry.quantity },
      create: {
        userId,
        productId: entry.productId,
        quantity: entry.quantity,
      },
    });
  }
}
