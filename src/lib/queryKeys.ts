export type ProductListParams = {
  q?: string;
  category?: string;
  sortBy?: string;
  order?: "asc" | "desc";
  page: number;
};

export const queryKeys = {
  products: {
    all: ["products"] as const,
    list: (params: ProductListParams) => ["products", "list", params] as const,
    detail: (id: string) => ["products", "detail", id] as const,
  },
  categories: {
    all: ["categories"] as const,
  },
  auth: {
    currentUser: ["auth", "currentUser"] as const,
  },
};
