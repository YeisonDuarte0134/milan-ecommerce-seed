import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductById, getRecommendations } from "@/lib/products";
import { AddToCartButton } from "./add-to-cart-button";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const productId = parseInt(id, 10);
  if (isNaN(productId)) notFound();

  const product = await getProductById(productId);
  if (!product) notFound();

  const recommendations = await getRecommendations(productId, 5);

  return (
    <div>
      <h1>{product.name}</h1>
      <p style={{ fontSize: "1.5em", margin: "10px 0" }}>
        {product.formattedPrice}
      </p>
      <AddToCartButton productId={String(product.id)} />

      {recommendations.length > 0 && (
        <div style={{ marginTop: "30px" }}>
          <h2>Productos recomendados</h2>
          <ul>
            {recommendations.map((r) => (
              <li key={r.id} style={{ marginBottom: "8px" }}>
                <Link href={`/product/${r.id}`}>
                  {r.name} — {r.formattedPrice}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ marginTop: "20px" }}>
        <Link href="/">Volver al catalogo</Link>
      </div>
    </div>
  );
}
