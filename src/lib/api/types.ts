export type Product = {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  minimumOrderQuantity: number;
  availabilityStatus: string;
  thumbnail: string;
  images: string[];
  brand?: string;
  sku: string;
};

export type ProductListResponse = {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
};

export type Category = {
  slug: string;
  name: string;
  url: string;
};

export type LoginResponse = {
  id: number;
  username: string;
  accessToken: string;
  refreshToken: string;
};

export type CurrentUser = {
  id: number;
  username: string;
  email: string;
};
