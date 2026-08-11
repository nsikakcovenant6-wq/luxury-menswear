"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";

import CartItem, {
  CartLineItem,
} from "@/components/CartItem";

import CheckoutSummary from "@/components/CheckoutSummary";
import EmptyState from "@/components/EmptyState";

type ApiCartItem = {
  id: string;
  productId: string;
  quantity: number;
  product: {
    id: string;
    slug: string;
    name: string;
    category: string;
    image: string;
    images: string[];
    price: number;
    stock: number;
    inStock: boolean;
  };
};

type CartResponse = {
  success: boolean;
  message?: string;
  cart?: {
    id: string | null;
    userId: string;
    items: ApiCartItem[];
  };
};

export default function CartPage() {
  const [items, setItems] = useState<CartLineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] =
    useState<string | null>(null);
  const [error, setError] = useState("");

  const loadCart = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/cart",
        {
          method: "GET",
          cache: "no-store",
          credentials: "include",
        }
      );

      const data: CartResponse =
        await response.json();

      if (response.status === 401) {
        window.location.href =
          "/login?redirect=%2Fcart";
        return;
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Unable to load your cart."
        );
      }

      const cartItems =
        data.cart?.items ?? [];

      const normalizedItems =
        cartItems.map((item) => ({
          id: item.id,
          productId: item.productId,

          name: item.product.name,
          category: item.product.category,

          price: item.product.price,
          quantity: item.quantity,

          image:
            item.product.image ||
            item.product.images?.[0] ||
            "",

          stock: item.product.stock,
        }));

      setItems(normalizedItems);
    } catch (err) {
      console.error(
        "Cart loading error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load your cart."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  async function updateQuantity(
    id: string,
    quantity: number
  ) {
    const currentItem = items.find(
      (item) => item.id === id
    );

    if (!currentItem) return;

    if (
      quantity < 1 ||
      quantity > currentItem.stock
    ) {
      return;
    }

    try {
      setUpdatingId(id);

      const response = await fetch(
        "/api/cart/update",
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            cartItemId: id,
            quantity,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Unable to update cart."
        );
      }

      setItems((current) =>
        current.map((item) =>
          item.id === id
            ? {
                ...item,
                quantity,
              }
            : item
        )
      );
    } catch (err) {
      console.error(
        "Cart quantity update error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to update cart."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  async function removeItem(id: string) {
    try {
      setUpdatingId(id);

      const response = await fetch(
        "/api/cart/remove",
        {
          method: "DELETE",
          headers: {
            "Content-Type":
              "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            cartItemId: id,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Unable to remove item."
        );
      }

      setItems((current) =>
        current.filter(
          (item) => item.id !== id
        )
      );
    } catch (err) {
      console.error(
        "Cart remove error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to remove item."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  function handleIncrease(id: string) {
    const item = items.find(
      (current) => current.id === id
    );

    if (!item) return;

    updateQuantity(
      id,
      Math.min(
        item.stock,
        item.quantity + 1
      )
    );
  }

  function handleDecrease(id: string) {
    const item = items.find(
      (current) => current.id === id
    );

    if (!item) return;

    updateQuantity(
      id,
      Math.max(
        1,
        item.quantity - 1
      )
    );
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0B0B0B] text-white">
        <div className="flex items-center gap-3 text-sm text-white/50">
          <Loader2
            size={18}
            className="animate-spin text-[#D4AF37]"
          />
          Loading your cart...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0B0B0B] px-6 py-24 text-white">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/collections"
          className="mb-8 flex w-fit items-center gap-1 text-sm text-white/50 transition hover:text-white"
        >
          <ArrowLeft size={16} />
          Continue Shopping
        </Link>

        <h1 className="text-3xl font-bold sm:text-4xl">
          Your Cart
        </h1>

        <p className="mt-2 text-white/50">
          {items.length}{" "}
          {items.length === 1
            ? "item"
            : "items"}{" "}
          in your bag
        </p>

        {error && (
          <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {items.length === 0 ? (
          <div className="mt-12">
            <EmptyState
              title="Your cart is empty"
              description="Explore our Senator wear, Agbada, and Suit collections to get started."
              actionLabel="Shop Now"
              actionHref="/collections"
            />
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              {items.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onIncrease={
                    handleIncrease
                  }
                  onDecrease={
                    handleDecrease
                  }
                  onRemove={
                    removeItem
                  }
                  updating={
                    updatingId === item.id
                  }
                />
              ))}
            </div>

            <div>
              <CheckoutSummary
                items={items}
              />

              <Link
                href="/checkout"
                className="mt-4 block w-full rounded-xl bg-[#D4AF37] py-4 text-center text-sm font-semibold text-[#0B0B0B] transition hover:opacity-90"
              >
                Proceed to Checkout
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}