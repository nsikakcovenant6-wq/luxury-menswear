import type { Product } from "@/types";

export interface ProductInput {
  name: string;
  category: string;
  price: number;
  stock: number;
  images: string[];
  featured: boolean;
  newArrival: boolean;
  description: string;
}

async function request<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
    cache: "no-store",
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.error ||
        data?.message ||
        `Request failed (${response.status})`
    );
  }

  return data;
}

export async function apiListProducts(params?: {
  search?: string;
  category?: string;
}): Promise<Product[]> {
  const query = new URLSearchParams();

  if (params?.search) {
    query.set("search", params.search);
  }

  if (params?.category && params.category !== "All") {
    query.set("category", params.category);
  }

  const url = `/api/products${
    query.toString() ? `?${query.toString()}` : ""
  }`;

  const data = await request<{ products: Product[] }>(url);

  return data.products;
}

const buildProductPayload = (product: ProductInput) => ({
  name: product.name,
  category: product.category,
  description: product.description,
  images: product.images,
  price: product.price,
  stock: product.stock,
  featured: product.featured,
  newArrival: product.newArrival,
});

export async function apiCreateProduct(
  product: ProductInput
): Promise<Product> {
  const data = await request<{ product: Product }>(
    "/api/products",
    {
      method: "POST",
      body: JSON.stringify(
        buildProductPayload(product)
      ),
    }
  );

  return data.product;
}

export async function apiUpdateProduct(
  id: string,
  product: ProductInput
): Promise<Product> {
  const data = await request<{ product: Product }>(
    `/api/products/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      body: JSON.stringify(
        buildProductPayload(product)
      ),
    }
  );

  return data.product;
}

export async function apiDeleteProduct(
  id: string
): Promise<void> {
  await request<{ success: boolean }>(
    `/api/products/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
    }
  );
}
export async function apiUploadImage(
  file: File
): Promise<string> {
  const formData = new FormData();

  formData.append("file", file);

  const response = await fetch(
    "/api/upload",
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message ||
        "Image upload failed."
    );
  }

  return data.url;
}