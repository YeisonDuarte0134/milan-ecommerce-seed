"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function SearchBar() {
  const router = useRouter();
  const params = useSearchParams();
  const [query, setQuery] = useState(params.get("q") ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      router.push(`/?q=${encodeURIComponent(trimmed)}`);
    } else {
      router.push("/");
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: "5px" }}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar productos..."
        style={{ padding: "5px", border: "1px solid #ccc" }}
      />
      <button type="submit" style={{ padding: "5px 10px" }}>
        Buscar
      </button>
    </form>
  );
}
