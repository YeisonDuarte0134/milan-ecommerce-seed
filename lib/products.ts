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
  const { rows } = await pool.query(
    `SELECT id, name->>'es_CO' as name, list_price
     FROM product_template
     WHERE active = true AND sale_ok = true
     ORDER BY create_date DESC
     LIMIT $1`,
    [limit],
  );
  return rows.map(toProduct);
}

export async function searchProducts(query: string): Promise<Product[]> {
  const words = query.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  const conditions = words.map(
    (_, i) => `name->>'es_CO' ILIKE $${i + 1}`,
  );
  const params = words.map((w) => `%${w}%`);

  const { rows } = await pool.query(
    `SELECT id, name->>'es_CO' as name, list_price
     FROM product_template
     WHERE active = true AND sale_ok = true
       AND ${conditions.join(" AND ")}
     ORDER BY create_date DESC
     LIMIT 50`,
    params,
  );
  return rows.map(toProduct);
}

export async function getProductById(id: number): Promise<Product | null> {
  const { rows } = await pool.query(
    `SELECT id, name->>'es_CO' as name, list_price
     FROM product_template
     WHERE id = $1 AND active = true`,
    [id],
  );
  if (rows.length === 0) return null;
  return toProduct(rows[0]);
}

export async function getRecommendations(
  productId: number,
  limit = 5,
): Promise<Product[]> {
  const product = await getProductById(productId);
  if (!product) return [];

  const keywords = extractKeywords(product.name);
  if (keywords.length === 0) return [];

  const conditions = keywords.map(
    (_, i) => `name->>'es_CO' ILIKE $${i + 1}`,
  );
  const params: (string | number)[] = keywords.map((w) => `%${w}%`);
  params.push(productId, limit);

  const { rows } = await pool.query(
    `SELECT id, name->>'es_CO' as name, list_price
     FROM product_template
     WHERE active = true AND sale_ok = true
       AND (${conditions.join(" OR ")})
       AND id != $${params.length - 1}
     ORDER BY create_date DESC
     LIMIT $${params.length}`,
    params,
  );
  return rows.map(toProduct);
}
