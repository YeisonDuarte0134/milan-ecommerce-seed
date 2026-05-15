import { describe, it, expect } from "vitest";
import { formatPrice, extractKeywords } from "@/lib/products";

describe("formatPrice", () => {
  it("formats a standard COP price with dot separator", () => {
    expect(formatPrice(310820)).toBe("$310.820");
  });

  it("formats zero as $0", () => {
    expect(formatPrice(0)).toBe("$0");
  });

  it("formats small prices without separator", () => {
    expect(formatPrice(500)).toBe("$500");
  });

  it("formats millions with multiple separators", () => {
    expect(formatPrice(1290000)).toBe("$1.290.000");
  });

  it("rounds decimal prices", () => {
    expect(formatPrice(310820.5)).toBe("$310.821");
  });
});

describe("extractKeywords", () => {
  it("extracts meaningful words from product name", () => {
    const keywords = extractKeywords(
      "BICICLETA PROFIT BMX RACING KINGMAN EXPERT",
    );
    expect(keywords).toContain("BICICLETA");
    expect(keywords).toContain("PROFIT");
    expect(keywords).toContain("BMX");
  });

  it("excludes stop words", () => {
    const keywords = extractKeywords("MARCO PARA BICICLETA DE MONTAÑA");
    expect(keywords).not.toContain("PARA");
    expect(keywords).not.toContain("DE");
    expect(keywords).toContain("MARCO");
    expect(keywords).toContain("BICICLETA");
  });

  it("limits to maxWords", () => {
    const keywords = extractKeywords(
      "BICICLETA PROFIT BMX RACING KINGMAN",
      2,
    );
    expect(keywords).toHaveLength(2);
  });

  it("excludes single-character words", () => {
    const keywords = extractKeywords("A B BICICLETA");
    expect(keywords).not.toContain("A");
    expect(keywords).not.toContain("B");
  });
});

// Integration tests — require PostgreSQL running
// Run with: POSTGRES_URL=... pnpm test
describe("getLatestProducts (integration)", () => {
  it.todo("returns up to N products ordered by create_date DESC");
  it.todo("returns products with id, name, price, formattedPrice");
});

describe("searchProducts (integration)", () => {
  it.todo("finds products matching all search words with ILIKE");
  it.todo("returns empty array for no matches");
});

describe("getProductById (integration)", () => {
  it.todo("returns a product when found");
  it.todo("returns null when not found");
});

describe("getRecommendations (integration)", () => {
  it.todo("returns products with similar name keywords");
  it.todo("excludes the source product from results");
  it.todo("limits results to specified count");
});
