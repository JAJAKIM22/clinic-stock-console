import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  getCategories,
  getProduct,
  getProducts,
  updateProductStock,
} from "@/lib/api/products";
import { getCurrentUser } from "@/lib/api/auth";
import type { Product, ProductListResponse } from "@/lib/api/types";
import { queryKeys, type ProductListParams } from "@/lib/queryKeys";

export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.auth.currentUser,
    queryFn: getCurrentUser,
    // The user's own identity doesn't change during a session; avoid
    // refetching it every time the profile modal is reopened.
    staleTime: Infinity,
  });
}

export function useProducts(params: ProductListParams) {
  return useQuery({
    queryKey: queryKeys.products.list(params),
    queryFn: () => getProducts(params),
    // Keeps the previous page's data on screen while the next request is
    // in flight, so changing filter/sort/page never flashes an empty grid
    // (requirement #2) and search-as-you-type never shows a jarring blank
    // state between debounced updates.
    placeholderData: keepPreviousData,
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: queryKeys.products.detail(id),
    queryFn: () => getProduct(id),
    enabled: Boolean(id),
  });
}

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories.all,
    queryFn: getCategories,
    // Categories change rarely; cache them longer than the product list.
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateStock(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (stock: number) => updateProductStock(id, stock),
    // IMPORTANT: DummyJSON does not persist writes server-side — PUT
    // returns 200 with a merged response body, but a subsequent GET
    // returns the original, untouched data. Originally this used
    // invalidateQueries (see README decision log), which refetches from
    // the server and silently overwrites the "successful" update with
    // stale data, making a working mutation look broken in the UI.
    // Patching the cache directly from the mutation's own response is the
    // only way to reflect the correction at all, given this API
    // limitation — so the earlier invalidate-and-refetch decision is
    // reversed here, deliberately, with the reason on record.
    onSuccess: (updatedProduct) => {
      queryClient.setQueryData(
        queryKeys.products.detail(id),
        (old: Product | undefined) =>
          old ? { ...old, stock: updatedProduct.stock } : old,
      );

      queryClient.setQueriesData(
        { queryKey: ["products", "list"] },
        (old: ProductListResponse | undefined) => {
          if (!old) return old;
          return {
            ...old,
            products: old.products.map((p) =>
              p.id === Number(id) ? { ...p, stock: updatedProduct.stock } : p,
            ),
          };
        },
      );
    },
  });
}
