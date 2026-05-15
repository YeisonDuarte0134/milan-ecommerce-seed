import type { Metadata } from "next";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { SearchBar } from "./search-bar";
import { logoutAction } from "./actions/auth";
import "./globals.css";

export const metadata: Metadata = {
  title: "Milan Bicicletas",
  description: "Ecommerce de bicicletas Milan",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <html lang="es">
      <body>
        <header
          style={{
            borderBottom: "1px solid #ccc",
            padding: "10px 20px",
            display: "flex",
            alignItems: "center",
            gap: "20px",
          }}
        >
          <Link href="/">
            <strong>Milan Bicicletas</strong>
          </Link>
          <SearchBar />
          <div style={{ marginLeft: "auto", display: "flex", gap: "10px" }}>
            <Link href="/cart">Carrito</Link>
            {session ? (
              <form action={logoutAction}>
                <span>{session.email}</span>{" "}
                <button type="submit">Salir</button>
              </form>
            ) : (
              <Link href="/login">Login</Link>
            )}
          </div>
        </header>
        <main style={{ padding: "20px" }}>{children}</main>
      </body>
    </html>
  );
}
