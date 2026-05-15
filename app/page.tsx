import Link from "next/link";
import { getLatestProducts, searchProducts } from "@/lib/products";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const products = q ? await searchProducts(q) : await getLatestProducts(50);

  return (
    <div>
      <h1>{q ? `Resultados para "${q}"` : "Ultimos 50 productos"}</h1>
      {products.length === 0 ? (
        <p>No se encontraron productos.</p>
      ) : (
        <ul>
          {products.map((p) => (
            <li key={p.id} style={{ marginBottom: "10px" }}>
              <Link href={`/product/${p.id}`}>
                {p.name} — {p.formattedPrice}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
