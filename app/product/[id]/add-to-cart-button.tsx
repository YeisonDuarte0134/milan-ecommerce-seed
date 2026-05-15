"use client";

import { useState } from "react";
import { addToLocalCart } from "@/lib/cart";
import { addToCartAction } from "@/app/actions/cart";

export function AddToCartButton({ productId }: { productId: string }) {
  const [added, setAdded] = useState(false);

  async function handleClick() {
    // Always add to localStorage (for anonymous users)
    addToLocalCart(productId);
    // Also try server-side (for logged-in users)
    await addToCartAction(productId);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <button
      onClick={handleClick}
      style={{
        padding: "10px 20px",
        border: "1px solid #333",
        cursor: "pointer",
      }}
    >
      {added ? "Agregado!" : "Agregar al carrito"}
    </button>
  );
}
