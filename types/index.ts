import type {
  ProductCategory,
  OrderStage,
} from "@/lib/constants";

export interface Product {
  id: string;
  slug: string;

  name: string;
  category: ProductCategory;

  price: number;
  compareAtPrice?: number;

  images: string[];

  description: string;

  colors: string[];
  sizes: string[];

  rating: number;
  reviewCount: number;

  isNew: boolean;
  isFeatured: boolean;

  stock: number;
  inStock: boolean;
}

export interface CartLine {
  productId: string;
  slug: string;
  name: string;
  category: ProductCategory;
  price: number;
  image: string;
  size: string;
  color: string;
  quantity: number;
}

export interface Order {
  id: string;
  createdAt: string;
  stage: OrderStage;
  total: number;
  items: CartLine[];
}