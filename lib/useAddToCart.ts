"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartContext";

/* =========================================================================
   TYPES
========================================================================= */

interface AddToCartResponse {
  success?: boolean;
  message?: string;
  cartCount?: number;
}

interface UseAddToCartOptions {
  /** How long the button stays in the "Added to Cart" / disabled state, in ms */
  addedStateDurationMs?: number;
}

/**
 * Reusable Add to Cart hook.
 *
 * Supports being called for MULTIPLE products at once (e.g. a product grid)
 * by keying loading/added state per productId, so each button animates
 * independently.
 */
export function useAddToCart(options: UseAddToCartOptions = {}) {
  const { addedStateDurationMs = 2000 } = options;
  const router = useRouter();
  const { incrementCartCount, setCartCount, showToast } = useCart();

  const [loadingIds, setLoadingIds] = useState<Record<string, boolean>>({});
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const isLoading = useCallback(
    (productId: string) => Boolean(loadingIds[productId]),
    [loadingIds]
  );

  const isAdded = useCallback(
    (productId: string) => Boolean(addedIds[productId]),
    [addedIds]
  );

  const addToCart = useCallback(
    async (productId: string, quantity: number = 1) => {
      if (!productId) {
        showToast("error", "This product is unavailable right now");
        return;
      }

      // Prevent duplicate submissions while already loading or in the
      // "Added to Cart" cooldown window.
      if (loadingIds[productId] || addedIds[productId]) return;

      setLoadingIds((prev) => ({ ...prev, [productId]: true }));

      try {
        const res = await fetch("/api/cart/add", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productId,
            quantity,
          }),
        });

        // Unauthenticated — send the shopper to log in, preserving where
        // they came from so they can be returned after login.
        if (res.status === 401) {
          showToast("info", "Please log in to add items to your cart");
          const redirectTo =
            typeof window !== "undefined"
              ? encodeURIComponent(window.location.pathname)
              : "";
          router.push(`/login?redirect=${redirectTo}`);
          return;
        }

        if (!res.ok) {
          const body: AddToCartResponse = await res.json().catch(() => ({}));
          throw new Error(body.message || `Request failed (${res.status})`);
        }

        const data: AddToCartResponse = await res.json().catch(() => ({}));

        // Prefer the server's authoritative cart count if it sends one,
        // otherwise optimistically increment.
        if (typeof data.cartCount === "number") {
          setCartCount(data.cartCount);
        } else {
          incrementCartCount(quantity);
        }

        showToast("success", "Added to cart");

        setAddedIds((prev) => ({ ...prev, [productId]: true }));

        if (timers.current[productId]) {
          clearTimeout(timers.current[productId]);
        }
        timers.current[productId] = setTimeout(() => {
          setAddedIds((prev) => {
            const next = { ...prev };
            delete next[productId];
            return next;
          });
        }, addedStateDurationMs);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Couldn't add this item to your cart. Please try again.";
        showToast("error", message);
      } finally {
        setLoadingIds((prev) => {
          const next = { ...prev };
          delete next[productId];
          return next;
        });
      }
    },
    [
      addedIds,
      addedStateDurationMs,
      incrementCartCount,
      loadingIds,
      router,
      setCartCount,
      showToast,
    ]
  );

  return { addToCart, isLoading, isAdded };
}