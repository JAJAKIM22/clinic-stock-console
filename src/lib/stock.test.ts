import { describe, expect, it } from "vitest";
import { isLowStock } from "./stock";
import type { Product } from "@/lib/api/types";

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 1,
    title: "Test item",
    description: "",
    category: "test",
    price: 0,
    stock: 10,
    minimumOrderQuantity: 5,
    availabilityStatus: "In Stock",
    thumbnail: "",
    images: [],
    sku: "TEST-1",
    ...overrides,
  };
}

describe("isLowStock", () => {
  it("is false when stock is above the minimum order quantity", () => {
    expect(
      isLowStock(makeProduct({ stock: 10, minimumOrderQuantity: 5 })),
    ).toBe(false);
  });

  it("is true when stock is below the minimum order quantity", () => {
    expect(isLowStock(makeProduct({ stock: 2, minimumOrderQuantity: 5 }))).toBe(
      true,
    );
  });

  it("is false when stock exactly equals the minimum order quantity", () => {
    // Boundary case worth locking in explicitly — "below" means strictly
    // less than, not less-than-or-equal.
    expect(isLowStock(makeProduct({ stock: 5, minimumOrderQuantity: 5 }))).toBe(
      false,
    );
  });
});
