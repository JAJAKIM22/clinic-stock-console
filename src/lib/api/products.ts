import { apiFetch } from "./client";
import type { Category, Product, ProductListResponse } from "./types";
import type { ProductListParams } from "@/lib/queryKeys";

const PAGE_SIZE = 10;

export function getProducts({
  q,
  category,
  sortBy,
  order,
  page,
}: ProductListParams): Promise<ProductListResponse> {
  const skip = (page - 1) * PAGE_SIZE;
  const params = new URLSearchParams({
    limit: String(PAGE_SIZE),
    skip: String(skip),
  });
  if (sortBy) params.set("sortBy", sortBy);
  if (order) params.set("order", order);

  // DummyJSON has separate endpoints for plain listing, search, and
  // category filtering rather than one endpoint accepting all three at
  // once — noted in the README as an API limitation. Search takes
  // precedence over category in this implementation; see README.
  if (q) {
    params.set("q", q);
    return apiFetch<ProductListResponse>(`/products/search?${params}`);
  }
  if (category) {
    return apiFetch<ProductListResponse>(
      `/products/category/${category}?${params}`,
    );
  }
  return apiFetch<ProductListResponse>(`/products?${params}`);
}

export function getProduct(id: string): Promise<Product> {
  return apiFetch<Product>(`/products/${id}`);
}

// Returns {slug, name, url} objects, not plain strings — verified against
// the live API rather than assumed from docs, since some docs show an
// older string-array shape. Use category.slug for the /products/category/
// filter endpoint and category.name for display.
export function getCategories(): Promise<Category[]> {
  return apiFetch<Category[]>(`/products/categories`);
}

export function updateProductStock(
  id: string,
  stock: number,
): Promise<Product> {
  return apiFetch<Product>(`/products/${id}`, {
    method: "PUT",
    body: JSON.stringify({ stock }),
  });
}
