import { cookies } from "next/headers";
import { prisma } from "./prisma";

const SESSION_COOKIE = "session_email";

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function getSession(): Promise<{
  email: string;
  userId: string;
} | null> {
  const store = await cookies();
  const email = store.get(SESSION_COOKIE)?.value;
  if (!email) return null;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;

  return { email: user.email, userId: user.id };
}

export async function login(
  email: string,
): Promise<{ success: boolean; userId?: string; error?: string }> {
  if (!isValidEmail(email)) {
    return { success: false, error: "Email inválido" };
  }

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email },
  });

  const store = await cookies();
  store.set(SESSION_COOKIE, email, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return { success: true, userId: user.id };
}

export async function logout(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
