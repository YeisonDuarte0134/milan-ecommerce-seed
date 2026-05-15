import { describe, it, expect, beforeEach } from "vitest";
import { mergeEntries } from "@/lib/cart/merge";
import {
  readLocalCart,
  addToLocalCart,
  clearLocalCart,
} from "@/lib/cart/local-storage";

describe("mergeEntries", () => {
  it("merges two empty carts", () => {
    expect(mergeEntries([], [])).toEqual([]);
  });

  it("returns server items when local is empty", () => {
    const server = [{ productId: "1", quantity: 2 }];
    expect(mergeEntries(server, [])).toEqual(server);
  });

  it("returns local items when server is empty", () => {
    const local = [{ productId: "1", quantity: 3 }];
    expect(mergeEntries([], local)).toEqual(local);
  });

  it("sums quantities for duplicate products", () => {
    const server = [{ productId: "1", quantity: 2 }];
    const local = [{ productId: "1", quantity: 3 }];
    const result = mergeEntries(server, local);
    expect(result).toEqual([{ productId: "1", quantity: 5 }]);
  });

  it("keeps unique products from both sources", () => {
    const server = [{ productId: "1", quantity: 1 }];
    const local = [{ productId: "2", quantity: 1 }];
    const result = mergeEntries(server, local);
    expect(result).toHaveLength(2);
    expect(result.find((i) => i.productId === "1")?.quantity).toBe(1);
    expect(result.find((i) => i.productId === "2")?.quantity).toBe(1);
  });

  it("handles complex merge with overlapping and unique products", () => {
    const server = [
      { productId: "1", quantity: 2 },
      { productId: "3", quantity: 1 },
    ];
    const local = [
      { productId: "1", quantity: 1 },
      { productId: "2", quantity: 4 },
    ];
    const result = mergeEntries(server, local);
    expect(result).toHaveLength(3);
    expect(result.find((i) => i.productId === "1")?.quantity).toBe(3);
    expect(result.find((i) => i.productId === "2")?.quantity).toBe(4);
    expect(result.find((i) => i.productId === "3")?.quantity).toBe(1);
  });
});

describe("localStorage cart", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns empty array when no cart exists", () => {
    expect(readLocalCart()).toEqual([]);
  });

  it("adds a new product to cart", () => {
    const items = addToLocalCart("123");
    expect(items).toEqual([{ productId: "123", quantity: 1 }]);
  });

  it("increments quantity for existing product", () => {
    addToLocalCart("123");
    const items = addToLocalCart("123");
    expect(items).toEqual([{ productId: "123", quantity: 2 }]);
  });

  it("persists cart across reads", () => {
    addToLocalCart("123");
    addToLocalCart("456");
    const items = readLocalCart();
    expect(items).toHaveLength(2);
  });

  it("clears the cart", () => {
    addToLocalCart("123");
    clearLocalCart();
    expect(readLocalCart()).toEqual([]);
  });
});
