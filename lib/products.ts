import { pool } from "./pg";

export interface Product {
  id: number;
  name: string;
  price: number;
  formattedPrice: string;
}

const STOP_WORDS = new Set([
  "PARA", "DE", "EN", "LA", "EL", "CON", "Y", "A",
  "LOS", "LAS", "DEL", "AL", "UN", "UNA", "POR",
]);

export function formatPrice(price: number): string {
  if (price === 0) return "$0";
  const rounded = Math.round(price);
  const formatted = rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `$${formatted}`;
}

export function extractKeywords(name: string, maxWords = 3): string[] {
  return name
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w.toUpperCase()))
    .slice(0, maxWords);
}

function toProduct(row: { id: number; name: string; list_price: string }): Product {
  const price = parseFloat(row.list_price);
  return {
    id: row.id,
    name: row.name,
    price,
    formattedPrice: formatPrice(price),
  };
}

export async function getLatestProducts(limit = 50): Promise<Product[]> {
  // TODO: implement — query PostgreSQL for latest products
  void limit;
  void pool;
  return [];
}

export async function searchProducts(query: string): Promise<Product[]> {
  // TODO: implement — search products by keywords with ILIKE AND
  void query;
  return [];
}

export async function getProductById(id: number): Promise<Product | null> {
  // TODO: implement — fetch single product by id
  void id;
  return null;
}

export async function getRecommendations(
  productId: number,
  limit = 5,
): Promise<Product[]> {
  // TODO: implement — find products with similar name keywords
  void productId;
  void limit;
  return [];
}
