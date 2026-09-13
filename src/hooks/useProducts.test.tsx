import { describe, expect, it, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { useUpdateStock } from "./useProducts";
import { queryKeys } from "@/lib/queryKeys";
import { updateProductStock } from "@/lib/api/products";
import type { Product, ProductListResponse } from "@/lib/api/types";

vi.mock("@/lib/api/products", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api/products")>();
  return {
    ...actual,
    updateProductStock: vi.fn(),
  };
});

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 2,
    title: "Eyeshadow Palette",
    description: "",
    category: "beauty",
    price: 19.99,
    stock: 34,
    minimumOrderQuantity: 20,
    availabilityStatus: "In Stock",
    thumbnail: "",
    images: [],
    sku: "BEA-002",
    ...overrides,
  };
}

// DummyJSON's PUT doesn't persist server-side — a refetch after a
// successful update would silently revert it. This test locks in the fix:
// the mutation must patch the cache directly from its own response,
// touching both the item's detail cache entry and any matching product
// inside cached list pages.
describe("useUpdateStock", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    vi.mocked(updateProductStock).mockReset();
  });

  function wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  }

  it("patches the item's detail cache with the corrected stock", async () => {
    const productId = "2";
    queryClient.setQueryData(
      queryKeys.products.detail(productId),
      makeProduct({ stock: 34 }),
    );
    vi.mocked(updateProductStock).mockResolvedValue(makeProduct({ stock: 40 }));

    const { result } = renderHook(() => useUpdateStock(productId), {
      wrapper,
    });

    result.current.mutate(40);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const cached = queryClient.getQueryData<Product>(
      queryKeys.products.detail(productId),
    );
    expect(cached?.stock).toBe(40);
  });

  it("patches the matching product inside a cached list page, leaving others untouched", async () => {
    const productId = "2";
    const listParams = { page: 1 } as const;
    const listResponse: ProductListResponse = {
      products: [
        makeProduct({ id: 1, stock: 99 }),
        makeProduct({ id: 2, stock: 34 }),
      ],
      total: 2,
      skip: 0,
      limit: 10,
    };
    queryClient.setQueryData(queryKeys.products.list(listParams), listResponse);
    vi.mocked(updateProductStock).mockResolvedValue(makeProduct({ stock: 40 }));

    const { result } = renderHook(() => useUpdateStock(productId), {
      wrapper,
    });

    result.current.mutate(40);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const cached = queryClient.getQueryData<ProductListResponse>(
      queryKeys.products.list(listParams),
    );
    expect(cached?.products.find((p) => p.id === 2)?.stock).toBe(40);
    expect(cached?.products.find((p) => p.id === 1)?.stock).toBe(99);
  });
});
