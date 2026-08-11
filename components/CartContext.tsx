"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CartLine } from "@/types";

type ToastType = "success" | "error" | "info";

interface ToastState {
  type: ToastType;
  message: string;
}

interface CartContextValue {
  items: CartLine[];

  addItem: (item: CartLine) => void;
  removeItem: (
    productId: string,
    size: string,
    color: string
  ) => void;
  updateQuantity: (
    productId: string,
    size: string,
    color: string,
    quantity: number
  ) => void;
  clearCart: () => void;

  subtotal: number;
  itemCount: number;

  /*
   * Server-cart count helpers.
   *
   * These are used by useAddToCart when the backend
   * returns an authoritative cart count.
   */
  cartCount: number;
  setCartCount: (count: number) => void;
  incrementCartCount: (amount?: number) => void;

  /*
   * Global toast notification.
   */
  showToast: (type: ToastType, message: string) => void;
  toast: ToastState | null;
  dismissToast: () => void;

  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(
  undefined
);

const STORAGE_KEY = "benkaso-cart";

function lineKey(
  productId: string,
  size: string,
  color: string
) {
  return `${productId}__${size}__${color}`;
}

export function CartProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [items, setItems] = useState<CartLine[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);

  /*
   * Server cart count.
   *
   * This is intentionally separate from itemCount because
   * useAddToCart can receive the authoritative count from
   * /api/cart/add even when the local cart has not yet been
   * synchronized.
   */
  const [cartCount, setCartCountState] = useState(0);

  const [toast, setToast] = useState<ToastState | null>(null);

  /*
   * Load local cart.
   */
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);

      if (stored) {
        const parsed = JSON.parse(stored);

        if (Array.isArray(parsed)) {
          setItems(parsed as CartLine[]);
        }
      }
    } catch {
      // Corrupted local storage should not crash the application.
      setItems([]);
    } finally {
      setHasHydrated(true);
    }
  }, []);

  /*
   * Keep local cart persisted.
   */
  useEffect(() => {
    if (!hasHydrated) return;

    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(items)
      );
    } catch {
      // Ignore storage failures.
    }
  }, [items, hasHydrated]);

  /*
   * Keep server cart count initialized from the local cart.
   *
   * The API can later replace this with the authoritative
   * server count through setCartCount().
   */
  useEffect(() => {
    if (!hasHydrated) return;

    setCartCountState(
      items.reduce((sum, line) => sum + line.quantity, 0)
    );
  }, [items, hasHydrated]);

  /*
   * Add an item to the local cart.
   */
  const addItem = useCallback((item: CartLine) => {
    setItems((prev) => {
      const key = lineKey(
        item.productId,
        item.size,
        item.color
      );

      const existing = prev.find(
        (line) =>
          lineKey(
            line.productId,
            line.size,
            line.color
          ) === key
      );

      if (existing) {
        return prev.map((line) =>
          lineKey(
            line.productId,
            line.size,
            line.color
          ) === key
            ? {
                ...line,
                quantity:
                  line.quantity + item.quantity,
              }
            : line
        );
      }

      return [...prev, item];
    });

    setIsDrawerOpen(true);
  }, []);

  /*
   * Remove an item.
   */
  const removeItem = useCallback(
    (
      productId: string,
      size: string,
      color: string
    ) => {
      const key = lineKey(
        productId,
        size,
        color
      );

      setItems((prev) =>
        prev.filter(
          (line) =>
            lineKey(
              line.productId,
              line.size,
              line.color
            ) !== key
        )
      );
    },
    []
  );

  /*
   * Update item quantity.
   */
  const updateQuantity = useCallback(
    (
      productId: string,
      size: string,
      color: string,
      quantity: number
    ) => {
      const key = lineKey(
        productId,
        size,
        color
      );

      setItems((prev) =>
        prev.map((line) =>
          lineKey(
            line.productId,
            line.size,
            line.color
          ) === key
            ? {
                ...line,
                quantity: Math.max(1, quantity),
              }
            : line
        )
      );
    },
    []
  );

  /*
   * Clear local cart.
   */
  const clearCart = useCallback(() => {
    setItems([]);
    setCartCountState(0);
  }, []);

  /*
   * Cart drawer controls.
   */
  const openDrawer = useCallback(() => {
    setIsDrawerOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  /*
   * Set the authoritative cart count returned by the API.
   */
  const setCartCount = useCallback((count: number) => {
    setCartCountState(Math.max(0, count));
  }, []);

  /*
   * Optimistically increase the cart count.
   */
  const incrementCartCount = useCallback(
    (amount: number = 1) => {
      if (!Number.isFinite(amount) || amount <= 0) {
        return;
      }

      setCartCountState((current) => current + amount);
    },
    []
  );

  /*
   * Show a toast notification.
   */
  const showToast = useCallback(
    (type: ToastType, message: string) => {
      setToast({
        type,
        message,
      });
    },
    []
  );

  /*
   * Dismiss toast.
   */
  const dismissToast = useCallback(() => {
    setToast(null);
  }, []);

  /*
   * Automatically remove toast after 3 seconds.
   */
  useEffect(() => {
    if (!toast) return;

    const timer = window.setTimeout(() => {
      setToast(null);
    }, 3000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [toast]);

  /*
   * Local cart subtotal.
   */
  const subtotal = useMemo(
    () =>
      items.reduce(
        (sum, line) =>
          sum + line.price * line.quantity,
        0
      ),
    [items]
  );

  /*
   * Local cart item count.
   */
  const itemCount = useMemo(
    () =>
      items.reduce(
        (sum, line) => sum + line.quantity,
        0
      ),
    [items]
  );

  const value: CartContextValue = {
    items,

    addItem,
    removeItem,
    updateQuantity,
    clearCart,

    subtotal,
    itemCount,

    cartCount,
    setCartCount,
    incrementCartCount,

    showToast,
    toast,
    dismissToast,

    isDrawerOpen,
    openDrawer,
    closeDrawer,
  };

  return (
    <CartContext.Provider value={value}>
      {children}

      {toast && (
        <div
          className="fixed right-4 top-4 z-[9999] max-w-sm"
          role="status"
          aria-live="polite"
        >
          <div
            className={`rounded-xl border px-4 py-3 shadow-2xl backdrop-blur-md ${
              toast.type === "success"
                ? "border-green-500/30 bg-green-500/10 text-green-300"
                : toast.type === "error"
                ? "border-red-500/30 bg-red-500/10 text-red-300"
                : "border-blue-500/30 bg-blue-500/10 text-blue-300"
            }`}
          >
            <div className="flex items-start gap-3">
              <p className="flex-1 text-sm">
                {toast.message}
              </p>

              <button
                type="button"
                onClick={dismissToast}
                className="text-current opacity-60 transition hover:opacity-100"
                aria-label="Dismiss notification"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used within a CartProvider"
    );
  }

  return context;
}