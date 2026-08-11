"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";

import DashboardSidebar from "../../components/DashboardSidebar";
import UserProfile from "../../components/UserProfile";
import EmptyState from "../../components/EmptyState";

type User = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: string;
  createdAt: string;
};

type Product = {
  id: string;
  name: string;
  image?: string | null;
  images?: string[];
};

type OrderItem = {
  id: string;
  quantity: number;
  price: number;
  product?: Product | null;
};

type Order = {
  id: string;
  total: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  createdAt: string;
  items?: OrderItem[];
};

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const tab = searchParams.get("tab") ?? "overview";

  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const [error, setError] = useState("");
  const [ordersError, setOrdersError] = useState("");

  /*
   * ---------------------------------------------------------
   * LOAD AUTHENTICATED USER
   * ---------------------------------------------------------
   */

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          if (response.status === 401) {
            router.replace(
              `/login?redirect=${encodeURIComponent("/dashboard")}`
            );
            return;
          }

          throw new Error(
            data?.message || "Unable to load your account."
          );
        }

        const authenticatedUser = data?.user;

        if (!authenticatedUser) {
          throw new Error(
            "Your account information could not be found."
          );
        }

        if (mounted) {
          setUser(authenticatedUser);
        }
      } catch (error) {
        console.error(
          "Dashboard authentication error:",
          error
        );

        if (mounted) {
          setError(
            error instanceof Error
              ? error.message
              : "Unable to load your account."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadUser();

    return () => {
      mounted = false;
    };
  }, [router]);

  /*
   * ---------------------------------------------------------
   * LOAD CUSTOMER ORDERS
   * ---------------------------------------------------------
   */

  useEffect(() => {
    if (!user) {
      return;
    }

    let mounted = true;

    async function loadOrders() {
      try {
        setOrdersLoading(true);
        setOrdersError("");

        const response = await fetch("/api/orders", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          if (response.status === 401) {
            router.replace(
              `/login?redirect=${encodeURIComponent(
                "/dashboard?tab=orders"
              )}`
            );
            return;
          }

          throw new Error(
            data?.message || "Unable to load your orders."
          );
        }

        /*
         * Normalize the API response.
         *
         * This makes the dashboard tolerant of:
         *
         * product.image
         * product.images
         *
         * being returned by the API.
         */
        const normalizedOrders: Order[] = Array.isArray(
          data?.orders
        )
          ? data.orders.map((order: Order) => ({
              ...order,

              items: Array.isArray(order.items)
                ? order.items.map((item) => ({
                    ...item,

                    product: item.product
                      ? {
                          ...item.product,

                          image:
                            item.product.image ||
                            item.product.images?.[0] ||
                            null,

                          images:
                            Array.isArray(
                              item.product.images
                            )
                              ? item.product.images
                              : item.product.image
                              ? [item.product.image]
                              : [],
                        }
                      : null,
                  }))
                : [],
            }))
          : [];

        if (mounted) {
          setOrders(normalizedOrders);
        }
      } catch (error) {
        console.error(
          "Customer orders error:",
          error
        );

        if (mounted) {
          setOrdersError(
            error instanceof Error
              ? error.message
              : "Unable to load your orders."
          );
        }
      } finally {
        if (mounted) {
          setOrdersLoading(false);
        }
      }
    }

    loadOrders();

    return () => {
      mounted = false;
    };
  }, [user, router]);

  /*
   * ---------------------------------------------------------
   * ORDER STATISTICS
   * ---------------------------------------------------------
   */

  const orderStats = useMemo(() => {
    const totalOrders = orders.length;

    const pendingOrders = orders.filter((order) =>
      [
        "PENDING",
        "PENDING_PAYMENT",
        "AWAITING_PAYMENT_VERIFICATION",
        "PROCESSING",
      ].includes(String(order.status).toUpperCase())
    ).length;

    const completedOrders = orders.filter((order) =>
      ["DELIVERED", "COMPLETED"].includes(
        String(order.status).toUpperCase()
      )
    ).length;

    const totalSpent = orders
      .filter(
        (order) =>
          String(order.paymentStatus).toUpperCase() ===
          "PAID"
      )
      .reduce(
        (sum, order) =>
          sum + Number(order.total || 0),
        0
      );

    return {
      totalOrders,
      pendingOrders,
      completedOrders,
      totalSpent,
    };
  }, [orders]);

  /*
   * ---------------------------------------------------------
   * FORMATTERS
   * ---------------------------------------------------------
   */

  function formatPrice(value: number) {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(value);
  }

  function formatDate(value: string) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleDateString("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  /*
   * ---------------------------------------------------------
   * PRODUCT IMAGE
   *
   * IMPORTANT:
   * This uses the actual image returned by the API.
   * No hardcoded product image is used.
   * ---------------------------------------------------------
   */

  function getProductImage(
    product?: Product | null
  ) {
    if (!product) {
      return null;
    }

    if (
      product.image &&
      typeof product.image === "string" &&
      product.image.trim() !== ""
    ) {
      return product.image;
    }

    if (
      Array.isArray(product.images) &&
      product.images.length > 0
    ) {
      const firstImage = product.images.find(
        (image) =>
          typeof image === "string" &&
          image.trim() !== ""
      );

      return firstImage || null;
    }

    return null;
  }

  /*
   * ---------------------------------------------------------
   * STATUS STYLING
   * ---------------------------------------------------------
   */

  function getStatusClass(status: string) {
    const normalized = String(status).toUpperCase();

    if (
      normalized === "PAID" ||
      normalized === "DELIVERED" ||
      normalized === "COMPLETED"
    ) {
      return "border-green-500/20 bg-green-500/10 text-green-400";
    }

    if (
      normalized === "PENDING" ||
      normalized === "PENDING_PAYMENT" ||
      normalized === "AWAITING_PAYMENT_VERIFICATION" ||
      normalized === "PROCESSING"
    ) {
      return "border-yellow-500/20 bg-yellow-500/10 text-yellow-400";
    }

    if (
      normalized === "CANCELLED" ||
      normalized === "REJECTED"
    ) {
      return "border-red-500/20 bg-red-500/10 text-red-400";
    }

    return "border-blue-500/20 bg-blue-500/10 text-blue-400";
  }

  /*
   * ---------------------------------------------------------
   * LOADING
   * ---------------------------------------------------------
   */

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0B0B0B] text-white">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-white/10 border-t-[#D4AF37]" />

          <p className="mt-4 text-sm text-white/40">
            Loading your account...
          </p>
        </div>
      </main>
    );
  }

  /*
   * ---------------------------------------------------------
   * ERROR
   * ---------------------------------------------------------
   */

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0B0B0B] px-6 text-white">
        <div className="w-full max-w-md rounded-3xl border border-red-500/20 bg-red-500/5 p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-400">
            !
          </div>

          <h1 className="mt-5 text-xl font-semibold">
            Unable to load account
          </h1>

          <p className="mt-3 text-sm leading-6 text-white/50">
            {error}
          </p>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 rounded-xl bg-[#D4AF37] px-6 py-3 text-sm font-semibold text-black transition hover:bg-[#E5C158]"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  /*
   * ---------------------------------------------------------
   * DASHBOARD
   * ---------------------------------------------------------
   */

  return (
    <main className="min-h-screen bg-[#0B0B0B] px-4 py-24 text-white sm:px-6">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}

        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[#D4AF37]">
            My Account
          </p>

          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
            Welcome back, {user.name}
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-white/50 sm:text-base">
            Manage your orders, profile, wishlist,
            and account preferences.
          </p>
        </div>

        {/* ACCOUNT SUMMARY */}

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-xs uppercase tracking-widest text-white/30">
              Account
            </p>

            <p className="mt-2 truncate text-sm font-medium">
              {user.name}
            </p>

            <p className="mt-1 truncate text-xs text-white/40">
              {user.email}
            </p>

            {user.phone && (
              <p className="mt-1 text-xs text-white/30">
                {user.phone}
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-xs uppercase tracking-widest text-white/30">
              Account Type
            </p>

            <p className="mt-2 text-sm font-medium capitalize">
              {user.role || "Customer"}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-xs uppercase tracking-widest text-white/30">
              Member Since
            </p>

            <p className="mt-2 text-sm font-medium">
              {formatDate(user.createdAt)}
            </p>
          </div>
        </div>

        {/* DASHBOARD */}

        <div className="mt-10 flex flex-col gap-8 lg:flex-row">

          {/* SIDEBAR */}

          <DashboardSidebar />

          {/* CONTENT */}

          <div className="min-w-0 flex-1">

            {/* ================================================= */}
            {/* OVERVIEW */}
            {/* ================================================= */}

            {tab === "overview" && (
              <div className="space-y-8">

                {/* QUICK STATS */}

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                    <p className="text-xs uppercase tracking-widest text-white/30">
                      Total Orders
                    </p>

                    <p className="mt-3 text-3xl font-bold">
                      {orderStats.totalOrders}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-yellow-500/10 bg-yellow-500/[0.03] p-5">
                    <p className="text-xs uppercase tracking-widest text-white/30">
                      Pending Orders
                    </p>

                    <p className="mt-3 text-3xl font-bold text-[#D4AF37]">
                      {orderStats.pendingOrders}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                    <p className="text-xs uppercase tracking-widest text-white/30">
                      Completed
                    </p>

                    <p className="mt-3 text-3xl font-bold text-green-400">
                      {orderStats.completedOrders}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                    <p className="text-xs uppercase tracking-widest text-white/30">
                      Total Spent
                    </p>

                    <p className="mt-3 text-xl font-bold text-[#D4AF37]">
                      {formatPrice(
                        orderStats.totalSpent
                      )}
                    </p>
                  </div>
                </div>

                {/* RECENT ORDERS */}

                <section>
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-[#D4AF37]">
                        Orders
                      </p>

                      <h2 className="mt-1 text-lg font-semibold">
                        Recent Orders
                      </h2>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          "/dashboard?tab=orders"
                        )
                      }
                      className="text-xs font-semibold text-[#D4AF37] hover:text-white"
                    >
                      View All
                    </button>
                  </div>

                  {ordersLoading ? (
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
                      <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-white/10 border-t-[#D4AF37]" />

                      <p className="mt-3 text-sm text-white/40">
                        Loading orders...
                      </p>
                    </div>
                  ) : ordersError ? (
                    <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
                      <p className="text-sm text-red-300">
                        {ordersError}
                      </p>
                    </div>
                  ) : orders.length === 0 ? (
                    <EmptyState
                      title="No orders yet"
                      description="Your purchases and current orders will appear here."
                      actionLabel="Browse Collections"
                      actionHref="/collections"
                    />
                  ) : (
                    <div className="space-y-3">

                      {orders
                        .slice(0, 5)
                        .map((order) => {

                          const firstItem =
                            order.items?.[0];

                          const productImage =
                            getProductImage(
                              firstItem?.product
                            );

                          return (
                            <div
                              key={order.id}
                              className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-[#D4AF37]/20"
                            >
                              <div className="flex gap-4">

                                {/* REAL PRODUCT IMAGE */}

                                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/[0.04]">

                                  {productImage ? (
                                    <Image
                                      src={productImage}
                                      alt={
                                        firstItem?.product
                                          ?.name ||
                                        "Product"
                                      }
                                      fill
                                      sizes="80px"
                                      className="object-cover"
                                    />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center text-[10px] uppercase tracking-wider text-white/20">
                                      No Image
                                    </div>
                                  )}
                                </div>

                                {/* ORDER DETAILS */}

                                <div className="min-w-0 flex-1">

                                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                                    <div>
                                      <p className="text-xs uppercase tracking-widest text-white/30">
                                        Order
                                      </p>

                                      <p className="mt-1 text-sm font-semibold">
                                        #{order.id}
                                      </p>

                                      <p className="mt-1 text-xs text-white/30">
                                        {formatDate(
                                          order.createdAt
                                        )}
                                      </p>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-3">

                                      <div>
                                        <p className="text-xs text-white/30">
                                          Amount
                                        </p>

                                        <p className="mt-1 font-semibold text-[#D4AF37]">
                                          {formatPrice(
                                            Number(
                                              order.total
                                            )
                                          )}
                                        </p>
                                      </div>

                                      <span
                                        className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase ${getStatusClass(
                                          order.paymentStatus
                                        )}`}
                                      >
                                        {String(
                                          order.paymentStatus
                                        ).replace(
                                          /_/g,
                                          " "
                                        )}
                                      </span>
                                    </div>
                                  </div>

                                  {firstItem?.product && (
                                    <p className="mt-3 truncate text-xs text-white/40">
                                      {firstItem.product.name}

                                      {order.items &&
                                        order.items.length >
                                          1 &&
                                        ` + ${
                                          order.items.length -
                                          1
                                        } more item${
                                          order.items.length -
                                            1 ===
                                          1
                                            ? ""
                                            : "s"
                                        }`}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </section>
              </div>
            )}

            {/* ================================================= */}
            {/* ORDERS */}
            {/* ================================================= */}

            {tab === "orders" && (
              <section>

                <div className="mb-6">
                  <p className="text-xs uppercase tracking-widest text-[#D4AF37]">
                    My Orders
                  </p>

                  <h2 className="mt-2 text-2xl font-bold">
                    Order History
                  </h2>

                  <p className="mt-2 text-sm text-white/40">
                    View your purchases, payment
                    status, and order progress.
                  </p>
                </div>

                {ordersError && (
                  <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-300">
                    {ordersError}
                  </div>
                )}

                {ordersLoading ? (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-[#D4AF37]" />

                    <p className="mt-4 text-sm text-white/40">
                      Loading your orders...
                    </p>
                  </div>
                ) : orders.length === 0 ? (
                  <EmptyState
                    title="You have no orders"
                    description="When you place an order, it will appear here."
                    actionLabel="Shop Now"
                    actionHref="/collections"
                  />
                ) : (
                  <div className="space-y-4">

                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]"
                      >

                        {/* ORDER HEADER */}

                        <div className="border-b border-white/10 p-5">

                          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                            <div>
                              <p className="text-xs uppercase tracking-widest text-white/30">
                                Order ID
                              </p>

                              <p className="mt-1 font-semibold">
                                #{order.id}
                              </p>

                              <p className="mt-1 text-xs text-white/30">
                                {formatDate(
                                  order.createdAt
                                )}
                              </p>
                            </div>

                            <div className="flex flex-wrap gap-2">

                              <span
                                className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase ${getStatusClass(
                                  order.paymentStatus
                                )}`}
                              >
                                Payment:{" "}
                                {String(
                                  order.paymentStatus
                                ).replace(
                                  /_/g,
                                  " "
                                )}
                              </span>

                              <span
                                className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase ${getStatusClass(
                                  order.status
                                )}`}
                              >
                                {String(
                                  order.status
                                ).replace(
                                  /_/g,
                                  " "
                                )}
                              </span>

                            </div>
                          </div>
                        </div>

                        {/* ORDER ITEMS */}

                        <div className="p-5">

                          <div className="space-y-4">

                            {order.items?.map(
                              (item) => {

                                const productImage =
                                  getProductImage(
                                    item.product
                                  );

                                return (
                                  <div
                                    key={item.id}
                                    className="flex items-center gap-4"
                                  >

                                    {/* REAL PRODUCT IMAGE */}

                                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/[0.04]">

                                      {productImage ? (
                                        <Image
                                          src={
                                            productImage
                                          }
                                          alt={
                                            item
                                              .product
                                              ?.name ||
                                            "Product"
                                          }
                                          fill
                                          sizes="64px"
                                          className="object-cover"
                                        />
                                      ) : (
                                        <div className="flex h-full w-full items-center justify-center text-[9px] uppercase tracking-wider text-white/20">
                                          No Image
                                        </div>
                                      )}
                                    </div>

                                    {/* PRODUCT DETAILS */}

                                    <div className="min-w-0 flex-1">

                                      <p className="truncate text-sm font-medium">
                                        {item.product
                                          ?.name ||
                                          "Product"}
                                      </p>

                                      <p className="mt-1 text-xs text-white/30">
                                        Qty:{" "}
                                        {
                                          item.quantity
                                        }
                                      </p>

                                      <p className="mt-1 text-xs text-white/30">
                                        {formatPrice(
                                          Number(
                                            item.price
                                          )
                                        )}{" "}
                                        each
                                      </p>

                                    </div>

                                    <p className="shrink-0 text-sm font-semibold">
                                      {formatPrice(
                                        Number(
                                          item.price
                                        ) *
                                          Number(
                                            item.quantity
                                          )
                                      )}
                                    </p>
                                  </div>
                                );
                              }
                            )}

                          </div>

                          {/* TOTAL */}

                          <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">

                            <span className="text-sm text-white/40">
                              Order Total
                            </span>

                            <span className="text-lg font-bold text-[#D4AF37]">
                              {formatPrice(
                                Number(
                                  order.total
                                )
                              )}
                            </span>

                          </div>

                        </div>
                      </div>
                    ))}

                  </div>
                )}
              </section>
            )}

            {/* ================================================= */}
            {/* PROFILE */}
            {/* ================================================= */}

            {tab === "profile" && (
              <section>

                <div className="mb-6">
                  <p className="text-xs uppercase tracking-widest text-[#D4AF37]">
                    Account
                  </p>

                  <h2 className="mt-2 text-2xl font-bold">
                    My Profile
                  </h2>
                </div>

                <UserProfile />

              </section>
            )}

            {/* ================================================= */}
            {/* WISHLIST */}
            {/* ================================================= */}

            {tab === "wishlist" && (
              <section>

                <div className="mb-6">
                  <p className="text-xs uppercase tracking-widest text-[#D4AF37]">
                    Saved Items
                  </p>

                  <h2 className="mt-2 text-2xl font-bold">
                    Wishlist
                  </h2>
                </div>

                <EmptyState
                  title="Your wishlist is empty"
                  description="Save your favorite Senator wear, Agbada, Kaftan, and Suits here."
                  actionLabel="Browse Collections"
                  actionHref="/collections"
                />

              </section>
            )}

            {/* ================================================= */}
            {/* SETTINGS */}
            {/* ================================================= */}

            {tab === "settings" && (
              <section>

                <div className="mb-6">
                  <p className="text-xs uppercase tracking-widest text-[#D4AF37]">
                    Preferences
                  </p>

                  <h2 className="mt-2 text-2xl font-bold">
                    Account Settings
                  </h2>
                </div>

                <div className="space-y-4">

                  {/* EMAIL SETTINGS */}

                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">

                    <h3 className="font-semibold">
                      Email Notifications
                    </h3>

                    <p className="mt-2 text-sm text-white/40">
                      Receive important updates about
                      your orders and payments.
                    </p>

                    <div className="mt-5 flex items-center justify-between">

                      <span className="text-sm">
                        Order updates
                      </span>

                      <div className="h-6 w-11 rounded-full bg-[#D4AF37] p-1">
                        <div className="ml-auto h-4 w-4 rounded-full bg-black" />
                      </div>

                    </div>
                  </div>

                  {/* ACCOUNT INFORMATION */}

                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">

                    <h3 className="font-semibold">
                      Account Information
                    </h3>

                    <div className="mt-4 space-y-3 text-sm">

                      <div className="flex justify-between gap-4 border-b border-white/5 pb-3">

                        <span className="text-white/40">
                          Name
                        </span>

                        <span>
                          {user.name}
                        </span>

                      </div>

                      <div className="flex justify-between gap-4 border-b border-white/5 pb-3">

                        <span className="text-white/40">
                          Email
                        </span>

                        <span className="truncate">
                          {user.email}
                        </span>

                      </div>

                      <div className="flex justify-between gap-4">

                        <span className="text-white/40">
                          Account Type
                        </span>

                        <span className="capitalize">
                          {user.role ||
                            "Customer"}
                        </span>

                      </div>

                    </div>
                  </div>

                  {/* SUPPORT */}

                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">

                    <h3 className="font-semibold">
                      Need Help?
                    </h3>

                    <p className="mt-2 text-sm text-white/40">
                      Contact Benkaso Collection if you
                      need assistance with your account
                      or order.
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        router.push("/contact")
                      }
                      className="mt-5 rounded-xl border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-5 py-3 text-sm font-semibold text-[#D4AF37] transition hover:bg-[#D4AF37]/20"
                    >
                      Contact Support
                    </button>

                  </div>

                </div>
              </section>
            )}

          </div>
        </div>
      </div>
    </main>
  );
}