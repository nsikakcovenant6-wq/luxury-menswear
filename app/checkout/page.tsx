"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  ShieldCheck,
} from "lucide-react";

type CartProduct = {
  id: string;
  name: string;
  image: string;
  price: number;
  stock: number;
};

type CartItem = {
  id: string;
  quantity: number;
  product: CartProduct;
};

type CartResponse = {
  success: boolean;
  cart?: {
    id: string;
    items: CartItem[];
  };
  message?: string;
};

type User = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
};

type MeResponse = {
  success: boolean;
  user?: User;
  message?: string;
};

type OrderResponse = {
  success: boolean;
  message?: string;
  order?: {
    id: string;
    total: number;
    status: string;
    paymentMethod: string;
  };
};

type StoreSettings = {
  storeName: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
};

type SettingsResponse = {
  success: boolean;
  settings?: StoreSettings;
  message?: string;
};

const DEFAULT_SETTINGS: StoreSettings = {
  storeName: "Benkaso Collection",
  bankName: "",
  accountName: "",
  accountNumber: "",
};

const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(price);

export default function CheckoutPage() {
  const router = useRouter();

  const [items, setItems] = useState<CartItem[]>([]);
  const [user, setUser] = useState<User | null>(null);

  const [settings, setSettings] =
    useState<StoreSettings>(DEFAULT_SETTINGS);

  const [loading, setLoading] = useState(true);
  const [loadingSettings, setLoadingSettings] =
    useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState("");

  const total = useMemo(() => {
    return items.reduce(
      (sum, item) =>
        sum + item.product.price * item.quantity,
      0
    );
  }, [items]);

  const formattedTotal = formatPrice(total);

  /*
   * Load store settings.
   *
   * These values come from the database and are controlled
   * from the admin dashboard.
   */
  useEffect(() => {
    async function loadSettings() {
      try {
        setLoadingSettings(true);

        const response = await fetch("/api/settings", {
          method: "GET",
          cache: "no-store",
        });

        const data =
          (await response.json()) as SettingsResponse;

        if (!response.ok || !data.success || !data.settings) {
          throw new Error(
            data.message ||
              "Unable to load store payment details."
          );
        }

        setSettings(data.settings);
      } catch (err) {
        console.error(
          "Checkout settings loading error:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load store payment details."
        );
      } finally {
        setLoadingSettings(false);
      }
    }

    loadSettings();
  }, []);

  /*
   * Load cart and logged-in customer.
   */
  useEffect(() => {
    async function loadCheckout() {
      try {
        setLoading(true);
        setError("");

        const [cartResponse, userResponse] =
          await Promise.all([
            fetch("/api/cart", {
              credentials: "include",
              cache: "no-store",
            }),

            fetch("/api/auth/me", {
              credentials: "include",
              cache: "no-store",
            }),
          ]);

        if (userResponse.status === 401) {
          router.push(
            `/login?redirect=${encodeURIComponent(
              "/checkout"
            )}`
          );

          return;
        }

        const cartData =
          (await cartResponse.json()) as CartResponse;

        const userData =
          (await userResponse.json()) as MeResponse;

        if (!cartResponse.ok || !cartData.success) {
          throw new Error(
            cartData.message ||
              "Unable to load your cart."
          );
        }

        if (!userData.success || !userData.user) {
          throw new Error(
            userData.message ||
              "Unable to load your account."
          );
        }

        const cartItems =
          cartData.cart?.items ?? [];

        if (cartItems.length === 0) {
          router.push("/cart");
          return;
        }

        setItems(cartItems);
        setUser(userData.user);
      } catch (err) {
        console.error(
          "Checkout loading error:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load checkout."
        );
      } finally {
        setLoading(false);
      }
    }

    loadCheckout();
  }, [router]);

  /*
   * Create bank-transfer order.
   */
  async function placeOrder() {
    if (
      placingOrder ||
      items.length === 0
    ) {
      return;
    }

    try {
      setPlacingOrder(true);
      setError("");

      const response = await fetch(
        "/api/orders",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            paymentMethod: "BANK_TRANSFER",
          }),
        }
      );

      const data =
        (await response.json()) as OrderResponse;

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Unable to create your order."
        );
      }

      setOrderId(
        data.order?.id ?? ""
      );

      setSuccess(true);
    } catch (err) {
      console.error(
        "Place order error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to place your order."
      );
    } finally {
      setPlacingOrder(false);
    }
  }

  /*
   * Initial loading screen.
   */
  if (loading || loadingSettings) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0B0B0B] text-white">
        <div className="flex items-center gap-3 text-white/60">
          <Loader2
            size={20}
            className="animate-spin text-[#D4AF37]"
          />

          Loading checkout...
        </div>
      </main>
    );
  }

  /*
   * Success page.
   */
  if (success) {
    return (
      <main className="min-h-screen bg-[#0B0B0B] px-6 py-24 text-white">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center backdrop-blur-xl sm:p-12">
            <CheckCircle2
              size={64}
              className="mx-auto text-green-400"
            />

            <p className="mt-6 text-xs font-medium uppercase tracking-[0.3em] text-[#D4AF37]">
              Order Received
            </p>

            <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
              Thank you for your order
            </h1>

            {orderId && (
              <p className="mt-4 text-sm text-white/50">
                Order ID:{" "}
                <span className="text-white/80">
                  {orderId}
                </span>
              </p>
            )}

            <div className="mt-8 rounded-2xl border border-[#D4AF37]/20 bg-[#D4AF37]/5 p-6 text-left">
              <h2 className="text-lg font-semibold">
                Complete your bank transfer
              </h2>

              <div className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-white/50">
                    Bank
                  </span>

                  <span className="font-medium text-right">
                    {settings.bankName ||
                      "Not configured"}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-white/50">
                    Account Name
                  </span>

                  <span className="font-medium text-right">
                    {settings.accountName ||
                      "Not configured"}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-white/50">
                    Account Number
                  </span>

                  <span className="font-semibold text-right text-[#D4AF37]">
                    {settings.accountNumber ||
                      "Not configured"}
                  </span>
                </div>

                <div className="my-4 h-px bg-white/10" />

                <div className="flex justify-between gap-4">
                  <span className="text-white/50">
                    Amount
                  </span>

                  <span className="text-lg font-bold text-[#D4AF37]">
                    {formattedTotal}
                  </span>
                </div>
              </div>
            </div>

            <p className="mt-6 text-sm leading-6 text-white/50">
              Your order is currently{" "}
              <span className="text-yellow-400">
                pending payment
              </span>
              . Make the transfer using the details
              above. Our team will confirm your payment
              and process your order.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/dashboard?tab=orders"
                className="flex-1 rounded-xl bg-[#D4AF37] px-6 py-3 text-sm font-semibold text-black transition hover:opacity-90"
              >
                View My Order
              </Link>

              <Link
                href="/collections"
                className="flex-1 rounded-xl border border-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/5"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  /*
   * Checkout page.
   */
  return (
    <main className="min-h-screen bg-[#0B0B0B] px-6 py-24 text-white">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/cart"
          className="mb-8 flex w-fit items-center gap-2 text-sm text-white/50 transition hover:text-white"
        >
          <ArrowLeft size={16} />

          Back to Cart
        </Link>

        <div>
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-[#D4AF37]">
            Secure Checkout
          </p>

          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
            Complete Your Order
          </h1>

          <p className="mt-2 text-white/50">
            Review your order and complete payment
            by bank transfer.
          </p>
        </div>

        {error && (
          <div className="mt-8 rounded-xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="mt-10 grid gap-8 lg:grid-cols-3">
          {/* CUSTOMER */}
          <div className="space-y-6 lg:col-span-2">
            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <h2 className="text-lg font-semibold">
                Customer Information
              </h2>

              {user && (
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-white/40">
                      Name
                    </p>

                    <p className="mt-1 text-sm">
                      {user.name}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wider text-white/40">
                      Email
                    </p>

                    <p className="mt-1 text-sm">
                      {user.email}
                    </p>
                  </div>

                  {user.phone && (
                    <div>
                      <p className="text-xs uppercase tracking-wider text-white/40">
                        Phone
                      </p>

                      <p className="mt-1 text-sm">
                        {user.phone}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* ORDER ITEMS */}
            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <h2 className="text-lg font-semibold">
                Your Order
              </h2>

              <div className="mt-5 space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 border-b border-white/10 pb-4 last:border-0 last:pb-0"
                  >
                    <div className="h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-white/5">
                      {item.product.image ? (
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : null}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-medium">
                        {item.product.name}
                      </h3>

                      <p className="mt-1 text-xs text-white/40">
                        Quantity: {item.quantity}
                      </p>

                      <p className="mt-2 text-sm text-[#D4AF37]">
                        {formatPrice(
                          item.product.price *
                            item.quantity
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* BANK TRANSFER */}
            <section className="rounded-2xl border border-[#D4AF37]/20 bg-[#D4AF37]/5 p-6">
              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-[#D4AF37]/10 p-3">
                  <ShieldCheck
                    size={22}
                    className="text-[#D4AF37]"
                  />
                </div>

                <div>
                  <h2 className="text-lg font-semibold">
                    Bank Transfer
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-white/50">
                    Transfer the exact order amount to
                    the account below after placing
                    your order.
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-wider text-white/40">
                    Bank Name
                  </p>

                  <p className="mt-1 font-medium">
                    {settings.bankName ||
                      "Not configured"}
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-wider text-white/40">
                    Account Name
                  </p>

                  <p className="mt-1 font-medium">
                    {settings.accountName ||
                      "Not configured"}
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-wider text-white/40">
                    Account Number
                  </p>

                  <p className="mt-1 text-xl font-bold tracking-wider text-[#D4AF37]">
                    {settings.accountNumber ||
                      "Not configured"}
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-wider text-white/40">
                    Amount to Transfer
                  </p>

                  <p className="mt-1 text-2xl font-bold text-[#D4AF37]">
                    {formattedTotal}
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* SUMMARY */}
          <aside className="h-fit rounded-2xl border border-white/10 bg-white/[0.03] p-6 lg:sticky lg:top-24">
            <h2 className="text-lg font-semibold">
              Order Summary
            </h2>

            <div className="mt-6 space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-white/50">
                  Items
                </span>

                <span>
                  {items.reduce(
                    (sum, item) =>
                      sum + item.quantity,
                    0
                  )}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-white/50">
                  Subtotal
                </span>

                <span>
                  {formattedTotal}
                </span>
              </div>

              <div className="h-px bg-white/10" />

              <div className="flex justify-between">
                <span className="font-semibold">
                  Total
                </span>

                <span className="text-xl font-bold text-[#D4AF37]">
                  {formattedTotal}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={placeOrder}
              disabled={
                placingOrder ||
                items.length === 0
              }
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#D4AF37] px-6 py-4 text-sm font-bold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {placingOrder ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />

                  Creating Order...
                </>
              ) : (
                "Place Bank Transfer Order"
              )}
            </button>

            <p className="mt-4 text-center text-xs leading-5 text-white/35">
              Your order will remain pending until
              the bank transfer is confirmed by the
              store.
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}