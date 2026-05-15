"use client";

import { useRef } from "react";
import { loginAction } from "@/app/actions/auth";
import { readLocalCart, clearLocalCart } from "@/lib/cart";

export function LoginForm() {
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    // Attach local cart items to the form data for merge
    const localCart = readLocalCart();
    formData.set("localCart", JSON.stringify(localCart));

    await loginAction(formData);

    // Clear local cart after successful login (server now has it)
    clearLocalCart();
  }

  return (
    <form ref={formRef} action={handleSubmit} style={{ marginTop: "15px" }}>
      <div style={{ marginBottom: "10px" }}>
        <label htmlFor="email">Correo electronico: </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="abc@cdf.com"
          pattern="[^\s@]+@[^\s@]+\.[^\s@]+"
          style={{ padding: "5px", border: "1px solid #ccc" }}
        />
      </div>
      <button
        type="submit"
        style={{ padding: "8px 16px", border: "1px solid #333", cursor: "pointer" }}
      >
        Iniciar sesion
      </button>
    </form>
  );
}
