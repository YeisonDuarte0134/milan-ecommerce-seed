"use server";

import { login, logout, getSession } from "@/lib/auth";
import {
  getServerCartEntries,
  mergeEntries,
  saveServerCart,
} from "@/lib/cart";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const localCartRaw = formData.get("localCart") as string;

  const result = await login(email);
  if (!result.success || !result.userId) {
    return { error: result.error };
  }

  // Merge local cart into server cart
  if (localCartRaw) {
    try {
      const localItems = JSON.parse(localCartRaw);
      if (Array.isArray(localItems) && localItems.length > 0) {
        const serverItems = await getServerCartEntries(result.userId);
        const merged = mergeEntries(serverItems, localItems);
        await saveServerCart(result.userId, merged);
      }
    } catch {
      // Ignore malformed local cart
    }
  }

  redirect("/");
}

export async function logoutAction() {
  await logout();
  redirect("/");
}

export async function getSessionAction() {
  return getSession();
}
