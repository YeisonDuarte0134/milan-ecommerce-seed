"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { readLocalCart } from "@/lib/cart";
import type { CartEntry } from "@/lib/cart";
import { getCartAction } from "@/app/actions/cart";
import { getSessionAction } from "@/app/actions/auth";
import { formatPrice } from "@/lib/products";

interface CartDisplayItem {
  productId: string;
  quantity: number;
  name: string;
  price: number;
  formattedPrice: string;
}

export function CartContent() {
  const [items, setItems] = useState<CartDisplayItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCart() {
      const session = await getSessionAction();

      let entries: CartEntry[];
      if (session) {
        entries = await getCartAction();
      } else {
        entries = readLocalCart();
      }

      // Fetch product details for each entry
      const detailed = await Promise.all(
        entries.map(async (entry) => {
          try {
            const res = await fetch(`/api/product/${entry.productId}`);
            if (res.ok) {
              const product = await res.json();
              return {
                productId: entry.productId,
                quantity: entry.quantity,
                name: product.name,
                price: product.price,
                formattedPrice: product.formattedPrice,
              };
            }
          } catch {
            // ignore fetch errors
          }
          return {
            productId: entry.productId,
            quantity: entry.quantity,
            name: `Producto #${entry.productId}`,
            price: 0,
            formattedPrice: formatPrice(0),
          };
        }),
      );

      setItems(detailed);
      setLoading(false);
    }
    loadCart();
  }, []);

  if (loading) return <p>Cargando carrito...</p>;
  if (items.length === 0) return <p>El carrito esta vacio.</p>;

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #ccc", textAlign: "left" }}>
            <th style={{ padding: "8px" }}>Producto</th>
            <th style={{ padding: "8px" }}>Precio</th>
            <th style={{ padding: "8px" }}>Cantidad</th>
            <th style={{ padding: "8px" }}>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr
              key={item.productId}
              style={{ borderBottom: "1px solid #eee" }}
            >
              <td style={{ padding: "8px" }}>
                <Link href={`/product/${item.productId}`}>{item.name}</Link>
              </td>
              <td style={{ padding: "8px" }}>{item.formattedPrice}</td>
              <td style={{ padding: "8px" }}>{item.quantity}</td>
              <td style={{ padding: "8px" }}>
                {formatPrice(item.price * item.quantity)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={{ marginTop: "15px", fontWeight: "bold" }}>
        Total: {formatPrice(total)}
      </p>
      <div style={{ marginTop: "15px" }}>
        <Link
          href="/"
          style={{
            padding: "10px 20px",
            border: "1px solid #333",
            textDecoration: "none",
            color: "#333",
          }}
        >
          Seguir comprando
        </Link>
      </div>
    </div>
  );
}
