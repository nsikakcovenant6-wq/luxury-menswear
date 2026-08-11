"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type { LucideIcon } from "lucide-react";

import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  ImageIcon,
  LayoutDashboard,
  Loader2,
  Package,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Search,
  Settings,
  ShoppingBag,
  Star,
  Trash2,
  UploadCloud,
  UserRound,
  Users,
  Wallet,
  X,
} from "lucide-react";

type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  compareAtPrice?: number | null;
  images: string[];
  description: string;
  colors: string[];
  sizes: string[];
  rating: number;
  reviewCount: number;
  isNew: boolean;
  isFeatured: boolean;
  inStock: boolean;
  stock: number;
};

type ProductDraft = {
  name: string;
  category: string;
  description: string;
  price: string;
  compareAtPrice: string;
  stock: string;
  images: string[];
  colors: string[];
  sizes: string[];
  featured: boolean;
  newArrival: boolean;
};

type OrderItem = {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  product?: {
    id: string;
    name: string;
    image?: string | null;
    price?: number;
  };
};

type Customer = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
};

type Order = {
  id: string;
  userId: string;
  total: number;
  status: string;
  paymentMethod?: string | null;
  paymentStatus?: string | null;
  paymentReference?: string | null;
  paymentConfirmedAt?: string | null;
  createdAt: string;
  updatedAt?: string;
  user: Customer;
  items: OrderItem[];
};

type StoreSettings = {
  id: string;
  storeName: string;
  bankName?: string | null;
  accountName?: string | null;
  accountNumber?: string | null;
  whatsappNumber?: string | null;
  updatedAt?: string;
};

type Tab =
  | "overview"
  | "products"
  | "orders"
  | "customers"
  | "settings"
  | "editor";

const CATEGORIES = [
  "Bespoke Suits",
  "Agbada",
  "Senator Wear",
  "Wedding Suits",
  "Kaftans",
  "Traditional Wear",
];

const SIZES = [
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "XXXL",
];

const emptyDraft: ProductDraft = {
  name: "",
  category: "Bespoke Suits",
  description: "",
  price: "",
  compareAtPrice: "",
  stock: "0",
  images: [],
  colors: [],
  sizes: [],
  featured: false,
  newArrival: false,
};

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string) {
  if (!value) return "—";

  return new Intl.DateTimeFormat(
    "en-NG",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  ).format(new Date(value));
}

function isValidImageUrl(url: string) {
  return (
    url.startsWith("https://") ||
    url.startsWith("http://")
  );
}

function getStatusLabel(status?: string | null) {
  if (!status) return "Unknown";

  return status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );
}

function getPaymentStatusClass(
  status?: string | null
) {
  switch (status) {
    case "PAID":
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-300";

    case "REJECTED":
      return "border-red-500/20 bg-red-500/10 text-red-300";

    case "AWAITING_VERIFICATION":
      return "border-yellow-500/20 bg-yellow-500/10 text-yellow-300";

    default:
      return "border-orange-500/20 bg-orange-500/10 text-orange-300";
  }
}

function getOrderStatusClass(
  status?: string | null
) {
  switch (status) {
    case "DELIVERED":
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-300";

    case "PROCESSING":
      return "border-blue-500/20 bg-blue-500/10 text-blue-300";

    case "SHIPPED":
      return "border-purple-500/20 bg-purple-500/10 text-purple-300";

    case "CANCELLED":
      return "border-red-500/20 bg-red-500/10 text-red-300";

    default:
      return "border-yellow-500/20 bg-yellow-500/10 text-yellow-300";
  }
}

async function uploadImage(
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

  if (
    !response.ok ||
    !data.success ||
    !data.url
  ) {
    throw new Error(
      data.message ||
        "Image upload failed."
    );
  }

  return data.url;
}

function StatCard({
  title,
  value,
  icon: Icon,
  subtitle,
}: {
  title: string;
  value: string | number;
  icon: LucideIcon;
  subtitle?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs text-white/40">
            {title}
          </p>

          <p className="mt-3 text-2xl font-semibold text-white">
            {value}
          </p>

          {subtitle && (
            <p className="mt-2 text-[10px] text-white/25">
              {subtitle}
            </p>
          )}
        </div>

        <div className="rounded-xl border border-[#D4AF37]/20 bg-[#D4AF37]/10 p-3">
          <Icon className="h-5 w-5 text-[#D4AF37]" />
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [products, setProducts] =
    useState<Product[]>([]);

  const [orders, setOrders] =
    useState<Order[]>([]);

  const [settings, setSettings] =
    useState<StoreSettings | null>(null);

  const [tab, setTab] =
    useState<Tab>("overview");

  const [loading, setLoading] =
    useState(true);

  const [ordersLoading, setOrdersLoading] =
    useState(true);

  const [settingsLoading, setSettingsLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [uploading, setUploading] =
    useState(false);

  const [paymentAction, setPaymentAction] =
    useState<string | null>(null);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [search, setSearch] =
    useState("");

  const [orderSearch, setOrderSearch] =
    useState("");

  const [customerSearch, setCustomerSearch] =
    useState("");

  const [categoryFilter, setCategoryFilter] =
    useState("All");

  const [orderStatusFilter, setOrderStatusFilter] =
    useState("All");

  const [paymentStatusFilter, setPaymentStatusFilter] =
    useState("All");

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const [draft, setDraft] =
    useState<ProductDraft>(
      emptyDraft
    );

  const [selectedOrder, setSelectedOrder] =
    useState<Order | null>(null);

  const [settingsDraft, setSettingsDraft] =
    useState({
      storeName: "Benkaso Collection",
      bankName: "",
      accountName: "",
      accountNumber: "",
      whatsappNumber: "",
    });

  const fileInputRef =
    useRef<HTMLInputElement | null>(
      null
    );

  async function loadProducts() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/products",
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Failed to load products."
        );
      }

      setProducts(
        Array.isArray(data.products)
          ? data.products
          : []
      );
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load products."
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadOrders() {
    try {
      setOrdersLoading(true);

      const response = await fetch(
        "/api/admin/orders",
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Failed to load orders."
        );
      }

      setOrders(
        Array.isArray(data.orders)
          ? data.orders
          : []
      );
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load orders."
      );
    } finally {
      setOrdersLoading(false);
    }
  }

  async function loadSettings() {
    try {
      setSettingsLoading(true);

      const response = await fetch(
        "/api/admin/settings",
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to load settings."
        );
      }

      if (data.settings) {
        setSettings(data.settings);

        setSettingsDraft({
          storeName:
            data.settings.storeName ||
            "Benkaso Collection",

          bankName:
            data.settings.bankName || "",

          accountName:
            data.settings.accountName || "",

          accountNumber:
            data.settings.accountNumber || "",

          whatsappNumber:
            data.settings.whatsappNumber || "",
        });
      }
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load settings."
      );
    } finally {
      setSettingsLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
    loadOrders();
    loadSettings();
  }, []);

  const customers = useMemo(() => {
    const map =
      new Map<string, Customer>();

    for (const order of orders) {
      if (order.user?.id) {
        map.set(
          order.user.id,
          order.user
        );
      }
    }

    return Array.from(map.values());
  }, [orders]);

  const filteredProducts = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    return products.filter(
      (product) => {
        const matchesSearch =
          !query ||
          product.name
            .toLowerCase()
            .includes(query) ||
          product.category
            .toLowerCase()
            .includes(query);

        const matchesCategory =
          categoryFilter === "All" ||
          product.category ===
            categoryFilter;

        return (
          matchesSearch &&
          matchesCategory
        );
      }
    );
  }, [
    products,
    search,
    categoryFilter,
  ]);

  const filteredOrders = useMemo(() => {
    const query =
      orderSearch
        .trim()
        .toLowerCase();

    return orders.filter(
      (order) => {
        const matchesSearch =
          !query ||
          order.id
            .toLowerCase()
            .includes(query) ||
          order.user?.name
            ?.toLowerCase()
            .includes(query) ||
          order.user?.email
            ?.toLowerCase()
            .includes(query);

        const matchesOrderStatus =
          orderStatusFilter ===
            "All" ||
          order.status ===
            orderStatusFilter;

        const matchesPaymentStatus =
          paymentStatusFilter ===
            "All" ||
          order.paymentStatus ===
            paymentStatusFilter;

        return (
          matchesSearch &&
          matchesOrderStatus &&
          matchesPaymentStatus
        );
      }
    );
  }, [
    orders,
    orderSearch,
    orderStatusFilter,
    paymentStatusFilter,
  ]);

  const filteredCustomers =
    useMemo(() => {
      const query =
        customerSearch
          .trim()
          .toLowerCase();

      return customers.filter(
        (customer) =>
          !query ||
          customer.name
            .toLowerCase()
            .includes(query) ||
          customer.email
            .toLowerCase()
            .includes(query) ||
          customer.phone
            ?.toLowerCase()
            .includes(query)
      );
    }, [
      customers,
      customerSearch,
    ]);

  const totalProducts =
    products.length;

  const totalOrders =
    orders.length;

  const pendingOrders =
    orders.filter(
      (order) =>
        order.paymentStatus !==
          "PAID" ||
        order.status ===
          "PENDING_PAYMENT"
    ).length;

  const paidOrders =
    orders.filter(
      (order) =>
        order.paymentStatus ===
        "PAID"
    );

  const revenue = paidOrders.reduce(
    (sum, order) =>
      sum + Number(order.total || 0),
    0
  );

  const featuredProducts =
    products.filter(
      (product) =>
        product.isFeatured
    ).length;

  const newProducts =
    products.filter(
      (product) =>
        product.isNew
    ).length;

  const lowStockProducts =
    products.filter(
      (product) =>
        product.stock > 0 &&
        product.stock <= 5
    ).length;

  const outOfStockProducts =
    products.filter(
      (product) =>
        product.stock <= 0 ||
        !product.inStock
    ).length;

  function clearNotifications() {
    setMessage("");
    setError("");
  }

  function openNewProduct() {
    clearNotifications();

    setEditingId(null);
    setDraft({
      ...emptyDraft,
      images: [],
      colors: [],
      sizes: [],
    });

    setTab("editor");
  }

  function openEditProduct(
    product: Product
  ) {
    clearNotifications();

    setEditingId(product.id);

    setDraft({
      name: product.name,
      category:
        product.category ||
        "Bespoke Suits",
      description:
        product.description || "",
      price: String(
        product.price ?? ""
      ),
      compareAtPrice:
        product.compareAtPrice !==
          undefined &&
        product.compareAtPrice !==
          null
          ? String(
              product.compareAtPrice
            )
          : "",
      stock: String(
        product.stock ?? 0
      ),
      images: [
        ...(product.images || []),
      ],
      colors: [
        ...(product.colors || []),
      ],
      sizes: [
        ...(product.sizes || []),
      ],
      featured: Boolean(
        product.isFeatured
      ),
      newArrival: Boolean(
        product.isNew
      ),
    });

    setTab("editor");
  }

  function updateDraft(
    changes: Partial<ProductDraft>
  ) {
    setDraft((current) => ({
      ...current,
      ...changes,
    }));
  }

  async function handleImageUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const files = Array.from(
      event.target.files || []
    );

    if (!files.length) return;

    clearNotifications();
    setUploading(true);

    try {
      const uploadedUrls: string[] =
        [];

      for (const file of files) {
        if (
          !file.type.startsWith(
            "image/"
          )
        ) {
          throw new Error(
            `${file.name} is not an image.`
          );
        }

        if (
          file.size >
          10 * 1024 * 1024
        ) {
          throw new Error(
            `${file.name} is larger than 10MB.`
          );
        }

        const cloudinaryUrl =
          await uploadImage(file);

        if (
          !isValidImageUrl(
            cloudinaryUrl
          )
        ) {
          throw new Error(
            "Cloudinary returned an invalid image URL."
          );
        }

        uploadedUrls.push(
          cloudinaryUrl
        );
      }

      updateDraft({
        images: [
          ...draft.images,
          ...uploadedUrls,
        ],
      });

      setMessage(
        `${uploadedUrls.length} image${
          uploadedUrls.length === 1
            ? ""
            : "s"
        } uploaded successfully.`
      );
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Image upload failed."
      );
    } finally {
      setUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value =
          "";
      }
    }
  }

  function removeImage(index: number) {
    updateDraft({
      images: draft.images.filter(
        (_, imageIndex) =>
          imageIndex !== index
      ),
    });
  }

  function moveImage(
    index: number,
    direction: "left" | "right"
  ) {
    const images = [
      ...draft.images,
    ];

    const targetIndex =
      direction === "left"
        ? index - 1
        : index + 1;

    if (
      targetIndex < 0 ||
      targetIndex >= images.length
    ) {
      return;
    }

    const current = images[index];
    const target =
      images[targetIndex];

    if (
      current === undefined ||
      target === undefined
    ) {
      return;
    }

    images[index] = target;
    images[targetIndex] = current;

    updateDraft({ images });
  }

  function toggleColor(
    color: string
  ) {
    const exists =
      draft.colors.includes(color);

    updateDraft({
      colors: exists
        ? draft.colors.filter(
            (item) =>
              item !== color
          )
        : [
            ...draft.colors,
            color,
          ],
    });
  }

  function toggleSize(size: string) {
    const exists =
      draft.sizes.includes(size);

    updateDraft({
      sizes: exists
        ? draft.sizes.filter(
            (item) =>
              item !== size
          )
        : [
            ...draft.sizes,
            size,
          ],
    });
  }

  async function saveProduct() {
    clearNotifications();

    if (!draft.name.trim()) {
      setError(
        "Product name is required."
      );
      return;
    }

    if (!draft.category.trim()) {
      setError(
        "Product category is required."
      );
      return;
    }

    if (!draft.description.trim()) {
      setError(
        "Product description is required."
      );
      return;
    }

    const price = Number(
      draft.price
    );

    const stock = Number(
      draft.stock
    );

    if (
      !Number.isFinite(price) ||
      price < 0
    ) {
      setError(
        "Enter a valid product price."
      );
      return;
    }

    if (
      !Number.isFinite(stock) ||
      stock < 0
    ) {
      setError(
        "Enter a valid stock amount."
      );
      return;
    }

    if (!draft.images.length) {
      setError(
        "Upload at least one product image."
      );
      return;
    }

    const invalidImage =
      draft.images.some(
        (image) =>
          !isValidImageUrl(image)
      );

    if (invalidImage) {
      setError(
        "One or more images are not permanent URLs. Please upload them again."
      );
      return;
    }

    setSaving(true);

    try {
      const payload = {
        name: draft.name.trim(),
        category:
          draft.category.trim(),
        description:
          draft.description.trim(),
        images: draft.images,
        price,
        compareAtPrice:
          draft.compareAtPrice.trim()
            ? Number(
                draft.compareAtPrice
              )
            : null,
        stock: Math.floor(stock),
        colors: draft.colors,
        sizes: draft.sizes,
        featured:
          draft.featured,
        newArrival:
          draft.newArrival,
      };

      const endpoint = editingId
        ? `/api/products/${editingId}`
        : "/api/products";

      const method = editingId
        ? "PUT"
        : "POST";

      const response =
        await fetch(endpoint, {
          method,
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(
            payload
          ),
        });

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Failed to save product."
        );
      }

      await loadProducts();

      setMessage(
        editingId
          ? "Product updated successfully."
          : "Product created successfully."
      );

      setEditingId(null);
      setDraft({
        ...emptyDraft,
        images: [],
        colors: [],
        sizes: [],
      });

      setTab("products");
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to save product."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteProduct(
    product: Product
  ) {
    const confirmed =
      window.confirm(
        `Delete "${product.name}" permanently?`
      );

    if (!confirmed) return;

    clearNotifications();

    try {
      const response =
        await fetch(
          `/api/products/${product.id}`,
          {
            method: "DELETE",
          }
        );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Failed to delete product."
        );
      }

      setProducts((current) =>
        current.filter(
          (item) =>
            item.id !== product.id
        )
      );

      setMessage(
        "Product deleted successfully."
      );
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete product."
      );
    }
  }

  async function viewOrder(
    order: Order
  ) {
    clearNotifications();

    try {
      const response =
        await fetch(
          `/api/admin/orders/${order.id}`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Failed to load order."
        );
      }

      setSelectedOrder(
        data.order
      );
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load order."
      );
    }
  }

  async function updatePayment(
    order: Order,
    action: "APPROVE" | "REJECT"
  ) {
    const actionLabel =
      action === "APPROVE"
        ? "approve"
        : "reject";

    const confirmed =
      window.confirm(
        `Are you sure you want to ${actionLabel} payment for order ${order.id}?`
      );

    if (!confirmed) return;

    clearNotifications();

    setPaymentAction(
      `${order.id}:${action}`
    );

    try {
      const response =
        await fetch(
          `/api/admin/orders/${order.id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              action,
            }),
          }
        );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Failed to update payment."
        );
      }

      setOrders((current) =>
        current.map((item) =>
          item.id === order.id
            ? data.order
            : item
        )
      );

      if (
        selectedOrder?.id ===
        order.id
      ) {
        setSelectedOrder(
          data.order
        );
      }

      setMessage(
        data.message ||
          "Payment updated successfully."
      );
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to update payment."
      );
    } finally {
      setPaymentAction(null);
    }
  }

  async function updateOrderStatus(
    order: Order,
    status: string
  ) {
    clearNotifications();

    try {
      const response =
        await fetch(
          "/api/admin/orders",
          {
            method: "PATCH",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              id: order.id,
              status,
            }),
          }
        );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Failed to update order status."
        );
      }

      setOrders((current) =>
        current.map((item) =>
          item.id === order.id
            ? data.order
            : item
        )
      );

      if (
        selectedOrder?.id ===
        order.id
      ) {
        setSelectedOrder(
          data.order
        );
      }

      setMessage(
        "Order status updated successfully."
      );
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to update order status."
      );
    }
  }

  async function saveSettings() {
    clearNotifications();

    const storeName =
      settingsDraft.storeName.trim();

    const bankName =
      settingsDraft.bankName.trim();

    const accountName =
      settingsDraft.accountName.trim();

    const accountNumber =
      settingsDraft.accountNumber.trim();

    const whatsappNumber =
      settingsDraft.whatsappNumber.trim();

    if (!bankName) {
      setError("Bank name is required.");
      return;
    }

    if (!accountName) {
      setError("Account name is required.");
      return;
    }

    if (!accountNumber) {
      setError(
        "Account number is required."
      );
      return;
    }

    if (!/^\d{10}$/.test(accountNumber)) {
      setError(
        "Account number must contain exactly 10 digits."
      );
      return;
    }

    if (!whatsappNumber) {
      setError(
        "WhatsApp number is required."
      );
      return;
    }

    const cleanedWhatsApp =
      whatsappNumber.replace(/[^\d]/g, "");

    if (
      cleanedWhatsApp.length < 10 ||
      cleanedWhatsApp.length > 15
    ) {
      setError(
        "Enter a valid WhatsApp number."
      );
      return;
    }

    setSettingsLoading(true);

    try {
      const response = await fetch(
        "/api/admin/settings",
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            storeName:
              storeName ||
              "Benkaso Collection",

            bankName,

            accountName,

            accountNumber,

            whatsappNumber,
          }),
        }
      );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Failed to save store settings."
        );
      }

      if (data.settings) {
        setSettings(data.settings);

        setSettingsDraft({
          storeName:
            data.settings.storeName ||
            "Benkaso Collection",

          bankName:
            data.settings.bankName ||
            "",

          accountName:
            data.settings.accountName ||
            "",

          accountNumber:
            data.settings.accountNumber ||
            "",

          whatsappNumber:
            data.settings.whatsappNumber ||
            "",
        });
      }

      setMessage(
        "Store settings saved successfully."
      );
    } catch (err) {
      console.error(
        "Failed to save settings:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to save store settings."
      );
    } finally {
      setSettingsLoading(false);
    }
  }

  function getPreviewImage() {
    return draft.images.length > 0
      ? draft.images[0]
      : "";
  }

  function renderSidebar() {
    return (
      <aside className="hidden w-64 shrink-0 border-r border-white/10 bg-[#080808] lg:block">
        <div className="sticky top-0 flex h-screen flex-col p-5">
          <div className="mb-8 px-2">
            <p className="text-xl font-semibold tracking-tight text-[#D4AF37]">
              BENKASO
            </p>

            <p className="mt-1 text-[10px] uppercase tracking-[0.25em] text-white/30">
              Collection Admin
            </p>
          </div>

          <nav className="space-y-2">
            <button
              type="button"
              onClick={() =>
                setTab("overview")
              }
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition ${
                tab === "overview"
                  ? "bg-[#D4AF37]/10 text-[#D4AF37]"
                  : "text-white/50 hover:bg-white/5 hover:text-white"
              }`}
            >
              <LayoutDashboard className="h-5 w-5" />
              Overview
            </button>

            <button
              type="button"
              onClick={() =>
                setTab("products")
              }
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition ${
                tab === "products" ||
                tab === "editor"
                  ? "bg-[#D4AF37]/10 text-[#D4AF37]"
                  : "text-white/50 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Package className="h-5 w-5" />
              Products
            </button>

            <button
              type="button"
              onClick={() =>
                setTab("orders")
              }
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition ${
                tab === "orders"
                  ? "bg-[#D4AF37]/10 text-[#D4AF37]"
                  : "text-white/50 hover:bg-white/5 hover:text-white"
              }`}
            >
              <ShoppingBag className="h-5 w-5" />
              Orders
              {pendingOrders >
                0 && (
                <span className="ml-auto rounded-full bg-[#D4AF37] px-2 py-0.5 text-[9px] font-bold text-black">
                  {pendingOrders}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() =>
                setTab("customers")
              }
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition ${
                tab === "customers"
                  ? "bg-[#D4AF37]/10 text-[#D4AF37]"
                  : "text-white/50 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Users className="h-5 w-5" />
              Customers
            </button>

            <button
              type="button"
              onClick={() =>
                setTab("settings")
              }
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition ${
                tab === "settings"
                  ? "bg-[#D4AF37]/10 text-[#D4AF37]"
                  : "text-white/50 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Settings className="h-5 w-5" />
              Store Settings
            </button>

            <button
              type="button"
              onClick={
                openNewProduct
              }
              className="mt-4 flex w-full items-center gap-3 rounded-xl bg-[#D4AF37] px-4 py-3 text-left text-sm font-semibold text-black transition hover:bg-[#e5c354]"
            >
              <Plus className="h-5 w-5" />
              Add Product
            </button>
          </nav>

          <div className="mt-auto rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-[#D4AF37]/10 p-2">
                <ShoppingBag className="h-4 w-4 text-[#D4AF37]" />
              </div>

              <div>
                <p className="text-xs font-medium text-white">
                  Store connected
                </p>

                <p className="mt-1 text-[10px] text-white/30">
                  Database + Cloudinary
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <main className="min-h-screen bg-[#090909] text-white">
      <div className="flex min-h-screen">
        {renderSidebar()}

        <section className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 border-b border-white/10 bg-[#090909]/90 px-4 py-4 backdrop-blur-xl md:px-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-lg font-semibold">
                  {tab === "overview" &&
                    "Dashboard"}

                  {tab === "products" &&
                    "Products"}

                  {tab === "editor" &&
                    (editingId
                      ? "Edit Product"
                      : "Add Product")}

                  {tab === "orders" &&
                    "Orders"}

                  {tab === "customers" &&
                    "Customers"}

                  {tab === "settings" &&
                    "Store Settings"}
                </p>

                <p className="mt-1 text-xs text-white/35">
                  Manage your Benkaso
                  Collection
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    loadProducts();
                    loadOrders();
                    loadSettings();
                  }}
                  className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-white/50 transition hover:bg-white/10 hover:text-white"
                  title="Refresh dashboard"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${
                      loading ||
                      ordersLoading ||
                      settingsLoading
                        ? "animate-spin"
                        : ""
                    }`}
                  />
                </button>

                <button
                  type="button"
                  onClick={
                    openNewProduct
                  }
                  className="flex items-center gap-2 rounded-xl bg-[#D4AF37] px-4 py-2.5 text-xs font-semibold text-black transition hover:bg-[#e5c354]"
                >
                  <Plus className="h-4 w-4" />
                  Add Product
                </button>
              </div>
            </div>

            <div className="mt-4 flex gap-2 overflow-x-auto lg:hidden">
              {[
                {
                  id: "overview",
                  label: "Overview",
                  icon: LayoutDashboard,
                },
                {
                  id: "products",
                  label: "Products",
                  icon: Package,
                },
                {
                  id: "orders",
                  label: "Orders",
                  icon: ShoppingBag,
                },
                {
                  id: "customers",
                  label: "Customers",
                  icon: Users,
                },
                {
                  id: "settings",
                  label: "Settings",
                  icon: Settings,
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() =>
                      setTab(
                        item.id as Tab
                      )
                    }
                    className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-xs ${
                      tab ===
                      item.id
                        ? "bg-[#D4AF37] text-black"
                        : "bg-white/5 text-white/50"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </header>

          <div className="mx-auto max-w-7xl p-4 md:p-8">
            {message && (
              <div className="mb-5 flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                <CheckCircle2 className="h-4 w-4 shrink-0" />

                <span>{message}</span>

                <button
                  type="button"
                  onClick={() =>
                    setMessage("")
                  }
                  className="ml-auto"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {error && (
              <div className="mb-5 flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                <AlertCircle className="h-4 w-4 shrink-0" />

                <span>{error}</span>

                <button
                  type="button"
                  onClick={() =>
                    setError("")
                  }
                  className="ml-auto"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* =====================================================
                OVERVIEW
            ====================================================== */}

            {tab === "overview" && (
              <div className="space-y-8">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-[#D4AF37]">
                    Store overview
                  </p>

                  <h1 className="mt-2 text-3xl font-semibold tracking-tight">
                    Welcome back
                  </h1>

                  <p className="mt-2 max-w-xl text-sm leading-6 text-white/40">
                    Manage your products,
                    orders, customers,
                    payments and store
                    settings from one
                    place.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <StatCard
                    title="Total Products"
                    value={
                      totalProducts
                    }
                    icon={Package}
                  />

                  <StatCard
                    title="Total Orders"
                    value={
                      totalOrders
                    }
                    icon={ShoppingBag}
                  />

                  <StatCard
                    title="Pending Orders"
                    value={
                      pendingOrders
                    }
                    icon={AlertCircle}
                    subtitle="Awaiting payment/action"
                  />

                  <StatCard
                    title="Revenue"
                    value={formatPrice(
                      revenue
                    )}
                    icon={Wallet}
                    subtitle="Paid orders"
                  />
                </div>

                <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                    <div className="mb-5 flex items-center justify-between">
                      <div>
                        <h2 className="font-semibold">
                          Recent Orders
                        </h2>

                        <p className="mt-1 text-xs text-white/35">
                          Latest customer
                          purchases
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setTab(
                            "orders"
                          )
                        }
                        className="text-xs text-[#D4AF37]"
                      >
                        View all
                      </button>
                    </div>

                    {ordersLoading ? (
                      <div className="flex min-h-[180px] items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-[#D4AF37]" />
                      </div>
                    ) : orders.length ===
                      0 ? (
                      <div className="rounded-xl border border-dashed border-white/10 px-5 py-10 text-center">
                        <ShoppingBag className="mx-auto h-8 w-8 text-white/20" />

                        <p className="mt-3 text-sm text-white/50">
                          No orders yet.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {orders
                          .slice(
                            0,
                            6
                          )
                          .map(
                            (
                              order
                            ) => (
                              <button
                                key={
                                  order.id
                                }
                                type="button"
                                onClick={() =>
                                  viewOrder(
                                    order
                                  )
                                }
                                className="flex w-full items-center gap-3 rounded-xl border border-white/5 bg-black/20 p-3 text-left transition hover:bg-white/[0.04]"
                              >
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#D4AF37]/10">
                                  <ShoppingBag className="h-4 w-4 text-[#D4AF37]" />
                                </div>

                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-xs font-medium">
                                    {order.user?.name ||
                                      "Customer"}
                                  </p>

                                  <p className="mt-1 text-[10px] text-white/30">
                                    #
                                    {order.id.slice(
                                      0,
                                      12
                                    )}
                                  </p>
                                </div>

                                <div className="text-right">
                                  <p className="text-xs font-semibold text-[#D4AF37]">
                                    {formatPrice(
                                      order.total
                                    )}
                                  </p>

                                  <p className="mt-1 text-[10px] text-white/30">
                                    {getStatusLabel(
                                      order.status
                                    )}
                                  </p>
                                </div>
                              </button>
                            )
                          )}
                      </div>
                    )}
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                    <div className="mb-5 flex items-center justify-between">
                      <div>
                        <h2 className="font-semibold">
                          Recent Products
                        </h2>

                        <p className="mt-1 text-xs text-white/35">
                          Latest collection
                          items
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setTab(
                            "products"
                          )
                        }
                        className="text-xs text-[#D4AF37]"
                      >
                        View all
                      </button>
                    </div>

                    {products.length ===
                    0 ? (
                      <div className="rounded-xl border border-dashed border-white/10 px-5 py-10 text-center">
                        <Package className="mx-auto h-8 w-8 text-white/20" />

                        <p className="mt-3 text-sm text-white/50">
                          No products yet.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {products
                          .slice(
                            0,
                            6
                          )
                          .map(
                            (
                              product
                            ) => (
                              <div
                                key={
                                  product.id
                                }
                                className="flex items-center gap-3"
                              >
                                <div
                                  className="h-12 w-10 shrink-0 rounded-lg bg-cover bg-center"
                                  style={{
                                    backgroundImage:
                                      product
                                        .images?.[0]
                                        ? `url("${product.images[0]}")`
                                        : undefined,
                                  }}
                                />

                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-xs font-medium">
                                    {
                                      product.name
                                    }
                                  </p>

                                  <p className="mt-1 text-[10px] text-white/30">
                                    {
                                      product.category
                                    }
                                  </p>
                                </div>

                                <p className="text-xs font-medium text-[#D4AF37]">
                                  {formatPrice(
                                    product.price
                                  )}
                                </p>
                              </div>
                            )
                          )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                    <div className="flex items-center gap-3">
                      <Star className="h-5 w-5 text-[#D4AF37]" />
                      <div>
                        <p className="text-xs text-white/35">
                          Featured
                        </p>
                        <p className="mt-1 text-lg font-semibold">
                          {
                            featuredProducts
                          }
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                    <div className="flex items-center gap-3">
                      <ShoppingBag className="h-5 w-5 text-[#D4AF37]" />
                      <div>
                        <p className="text-xs text-white/35">
                          New Arrivals
                        </p>
                        <p className="mt-1 text-lg font-semibold">
                          {
                            newProducts
                          }
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="h-5 w-5 text-[#D4AF37]" />
                      <div>
                        <p className="text-xs text-white/35">
                          Low Stock
                        </p>
                        <p className="mt-1 text-lg font-semibold">
                          {
                            lowStockProducts
                          }
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                    <div className="flex items-center gap-3">
                      <Package className="h-5 w-5 text-[#D4AF37]" />
                      <div>
                        <p className="text-xs text-white/35">
                          Out of Stock
                        </p>
                        <p className="mt-1 text-lg font-semibold">
                          {
                            outOfStockProducts
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* =====================================================
                PRODUCTS
            ====================================================== */}

            {tab === "products" && (
              <div className="space-y-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-[#D4AF37]">
                      Catalog
                    </p>

                    <h1 className="mt-2 text-3xl font-semibold">
                      Your Products
                    </h1>
                  </div>

                  <button
                    type="button"
                    onClick={
                      openNewProduct
                    }
                    className="flex items-center justify-center gap-2 rounded-xl bg-[#D4AF37] px-5 py-3 text-sm font-semibold text-black"
                  >
                    <Plus className="h-4 w-4" />
                    Add Product
                  </button>
                </div>

                <div className="flex flex-col gap-3 md:flex-row">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />

                    <input
                      value={search}
                      onChange={(
                        event
                      ) =>
                        setSearch(
                          event.target
                            .value
                        )
                      }
                      placeholder="Search products..."
                      className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#D4AF37]/50"
                    />
                  </div>

                  <select
                    value={
                      categoryFilter
                    }
                    onChange={(
                      event
                    ) =>
                      setCategoryFilter(
                        event.target
                          .value
                      )
                    }
                    className="rounded-xl border border-white/10 bg-[#111] px-4 py-3 text-sm text-white outline-none focus:border-[#D4AF37]/50"
                  >
                    <option value="All">
                      All Categories
                    </option>

                    {CATEGORIES.map(
                      (
                        category
                      ) => (
                        <option
                          key={
                            category
                          }
                          value={
                            category
                          }
                        >
                          {
                            category
                          }
                        </option>
                      )
                    )}
                  </select>
                </div>

                {loading ? (
                  <div className="flex min-h-[300px] items-center justify-center">
                    <Loader2 className="h-7 w-7 animate-spin text-[#D4AF37]" />
                  </div>
                ) : filteredProducts.length ===
                  0 ? (
                  <div className="rounded-2xl border border-dashed border-white/10 py-20 text-center">
                    <Package className="mx-auto h-10 w-10 text-white/15" />

                    <h3 className="mt-4 text-sm font-medium">
                      No products found
                    </h3>

                    <button
                      type="button"
                      onClick={
                        openNewProduct
                      }
                      className="mt-5 rounded-lg bg-[#D4AF37] px-4 py-2 text-xs font-semibold text-black"
                    >
                      Add Product
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {filteredProducts.map(
                      (
                        product
                      ) => (
                        <div
                          key={
                            product.id
                          }
                          className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]"
                        >
                          <div className="relative aspect-[4/5] overflow-hidden bg-white/5">
                            {product
                              .images?.[0] ? (
                              <div
                                className="absolute inset-0 bg-cover bg-center transition duration-500 hover:scale-105"
                                style={{
                                  backgroundImage: `url("${product.images[0]}")`,
                                }}
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <ImageIcon className="h-10 w-10 text-white/15" />
                              </div>
                            )}

                            <div className="absolute left-3 top-3 flex gap-2">
                              {product.isFeatured && (
                                <span className="rounded-full bg-[#D4AF37] px-2.5 py-1 text-[10px] font-semibold text-black">
                                  Featured
                                </span>
                              )}

                              {product.isNew && (
                                <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-black">
                                  New
                                </span>
                              )}
                            </div>

                            <div className="absolute bottom-3 left-3 rounded-full bg-black/70 px-3 py-1.5 text-xs text-white backdrop-blur">
                              {
                                product.stock
                              }{" "}
                              in stock
                            </div>
                          </div>

                          <div className="p-4">
                            <p className="text-[10px] uppercase tracking-[0.15em] text-[#D4AF37]">
                              {
                                product.category
                              }
                            </p>

                            <h3 className="mt-2 truncate font-semibold">
                              {
                                product.name
                              }
                            </h3>

                            <p className="mt-2 line-clamp-2 text-xs leading-5 text-white/40">
                              {
                                product.description
                              }
                            </p>

                            <div className="mt-4 flex items-center justify-between">
                              <p className="font-semibold text-[#D4AF37]">
                                {formatPrice(
                                  product.price
                                )}
                              </p>

                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    openEditProduct(
                                      product
                                    )
                                  }
                                  className="rounded-lg border border-white/10 bg-white/5 p-2 text-white/50 transition hover:bg-white/10 hover:text-white"
                                  title="Edit"
                                >
                                  <Pencil className="h-4 w-4" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    deleteProduct(
                                      product
                                    )
                                  }
                                  className="rounded-lg border border-red-500/10 bg-red-500/5 p-2 text-red-400 transition hover:bg-red-500/10"
                                  title="Delete"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            )}

            {/* =====================================================
                ORDERS
            ====================================================== */}

            {tab === "orders" && (
              <div className="space-y-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-[#D4AF37]">
                    Sales management
                  </p>

                  <h1 className="mt-2 text-3xl font-semibold">
                    Orders
                  </h1>

                  <p className="mt-2 text-sm text-white/35">
                    Review orders, verify
                    payments and update
                    fulfillment status.
                  </p>
                </div>

                <div className="flex flex-col gap-3 lg:flex-row">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />

                    <input
                      value={
                        orderSearch
                      }
                      onChange={(
                        event
                      ) =>
                        setOrderSearch(
                          event.target
                            .value
                        )
                      }
                      placeholder="Search order ID, customer or email..."
                      className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-3 pl-11 pr-4 text-sm outline-none placeholder:text-white/25 focus:border-[#D4AF37]/50"
                    />
                  </div>

                  <select
                    value={
                      orderStatusFilter
                    }
                    onChange={(
                      event
                    ) =>
                      setOrderStatusFilter(
                        event.target
                          .value
                      )
                    }
                    className="rounded-xl border border-white/10 bg-[#111] px-4 py-3 text-sm outline-none"
                  >
                    <option value="All">
                      All Order Status
                    </option>
                    <option value="PENDING_PAYMENT">
                      Pending Payment
                    </option>
                    <option value="AWAITING_PAYMENT_VERIFICATION">
                      Awaiting Verification
                    </option>
                    <option value="PROCESSING">
                      Processing
                    </option>
                    <option value="SHIPPED">
                      Shipped
                    </option>
                    <option value="DELIVERED">
                      Delivered
                    </option>
                    <option value="CANCELLED">
                      Cancelled
                    </option>
                  </select>

                  <select
                    value={
                      paymentStatusFilter
                    }
                    onChange={(
                      event
                    ) =>
                      setPaymentStatusFilter(
                        event.target
                          .value
                      )
                    }
                    className="rounded-xl border border-white/10 bg-[#111] px-4 py-3 text-sm outline-none"
                  >
                    <option value="All">
                      All Payments
                    </option>
                    <option value="PENDING">
                      Pending
                    </option>
                    <option value="AWAITING_VERIFICATION">
                      Awaiting Verification
                    </option>
                    <option value="PAID">
                      Paid
                    </option>
                    <option value="REJECTED">
                      Rejected
                    </option>
                  </select>
                </div>

                {ordersLoading ? (
                  <div className="flex min-h-[350px] items-center justify-center">
                    <Loader2 className="h-7 w-7 animate-spin text-[#D4AF37]" />
                  </div>
                ) : filteredOrders.length ===
                  0 ? (
                  <div className="rounded-2xl border border-dashed border-white/10 py-20 text-center">
                    <ShoppingBag className="mx-auto h-10 w-10 text-white/15" />

                    <h3 className="mt-4 text-sm font-medium">
                      No orders found
                    </h3>
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[1050px] text-left">
                        <thead>
                          <tr className="border-b border-white/10 bg-black/20 text-[10px] uppercase tracking-wider text-white/30">
                            <th className="px-5 py-4">
                              Order ID
                            </th>

                            <th className="px-5 py-4">
                              Customer
                            </th>

                            <th className="px-5 py-4">
                              Items
                            </th>

                            <th className="px-5 py-4">
                              Amount
                            </th>

                            <th className="px-5 py-4">
                              Payment
                            </th>

                            <th className="px-5 py-4">
                              Order Status
                            </th>

                            <th className="px-5 py-4">
                              Date
                            </th>

                            <th className="px-5 py-4">
                              Actions
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {filteredOrders.map(
                            (
                              order
                            ) => (
                              <tr
                                key={
                                  order.id
                                }
                                className="border-b border-white/5 transition hover:bg-white/[0.02]"
                              >
                                <td className="px-5 py-4">
                                  <p className="font-mono text-xs text-white/80">
                                    #
                                    {order.id.slice(
                                      0,
                                      12
                                    )}
                                  </p>
                                </td>

                                <td className="px-5 py-4">
                                  <p className="text-sm font-medium">
                                    {
                                      order
                                        .user
                                        ?.name
                                    }
                                  </p>

                                  <p className="mt-1 text-[10px] text-white/30">
                                    {
                                      order
                                        .user
                                        ?.email
                                    }
                                  </p>
                                </td>

                                <td className="px-5 py-4">
                                  <p className="text-sm">
                                    {
                                      order
                                        .items
                                        .length
                                    }
                                  </p>

                                  <p className="mt-1 text-[10px] text-white/30">
                                    {order.items.reduce(
                                      (
                                        sum,
                                        item
                                      ) =>
                                        sum +
                                        item.quantity,
                                      0
                                    )}{" "}
                                    units
                                  </p>
                                </td>

                                <td className="px-5 py-4">
                                  <p className="text-sm font-semibold text-[#D4AF37]">
                                    {formatPrice(
                                      order.total
                                    )}
                                  </p>
                                </td>

                                <td className="px-5 py-4">
                                  <p className="text-xs text-white/60">
                                    {getStatusLabel(
                                      order.paymentMethod
                                    )}
                                  </p>

                                  <span
                                    className={`mt-2 inline-flex rounded-full border px-2 py-1 text-[9px] font-medium ${getPaymentStatusClass(
                                      order.paymentStatus
                                    )}`}
                                  >
                                    {getStatusLabel(
                                      order.paymentStatus
                                    )}
                                  </span>
                                </td>

                                <td className="px-5 py-4">
                                  <span
                                    className={`inline-flex rounded-full border px-2 py-1 text-[9px] font-medium ${getOrderStatusClass(
                                      order.status
                                    )}`}
                                  >
                                    {getStatusLabel(
                                      order.status
                                    )}
                                  </span>

                                  <div className="mt-2">
                                    <select
                                      value={
                                        order.status
                                      }
                                      onChange={(
                                        event
                                      ) =>
                                        updateOrderStatus(
                                          order,
                                          event
                                            .target
                                            .value
                                        )
                                      }
                                      className="rounded-lg border border-white/10 bg-[#111] px-2 py-1.5 text-[10px] text-white outline-none"
                                    >
                                      <option value="PENDING_PAYMENT">
                                        Pending Payment
                                      </option>
                                      <option value="AWAITING_PAYMENT_VERIFICATION">
                                        Awaiting Verification
                                      </option>
                                      <option
                                        value="PROCESSING"
                                        disabled={
                                          order.paymentStatus !==
                                          "PAID"
                                        }
                                      >
                                        Processing
                                      </option>
                                      <option value="SHIPPED">
                                        Shipped
                                      </option>
                                      <option value="DELIVERED">
                                        Delivered
                                      </option>
                                      <option value="CANCELLED">
                                        Cancelled
                                      </option>
                                    </select>
                                  </div>
                                </td>

                                <td className="px-5 py-4">
                                  <p className="whitespace-nowrap text-xs text-white/50">
                                    {formatDate(
                                      order.createdAt
                                    )}
                                  </p>
                                </td>

                                <td className="px-5 py-4">
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        viewOrder(
                                          order
                                        )
                                      }
                                      className="rounded-lg border border-white/10 bg-white/5 p-2 text-white/50 hover:bg-white/10 hover:text-white"
                                      title="View order"
                                    >
                                      <Eye className="h-4 w-4" />
                                    </button>

                                    {order.paymentStatus !==
                                      "PAID" && (
                                      <>
                                        <button
                                          type="button"
                                          disabled={
                                            paymentAction ===
                                            `${order.id}:APPROVE`
                                          }
                                          onClick={() =>
                                            updatePayment(
                                              order,
                                              "APPROVE"
                                            )
                                          }
                                          className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-2 text-emerald-300 hover:bg-emerald-500/20 disabled:opacity-50"
                                          title="Approve payment"
                                        >
                                          {paymentAction ===
                                          `${order.id}:APPROVE` ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                          ) : (
                                            <CheckCircle2 className="h-4 w-4" />
                                          )}
                                        </button>

                                        <button
                                          type="button"
                                          disabled={
                                            paymentAction ===
                                            `${order.id}:REJECT`
                                          }
                                          onClick={() =>
                                            updatePayment(
                                              order,
                                              "REJECT"
                                            )
                                          }
                                          className="rounded-lg border border-red-500/20 bg-red-500/10 p-2 text-red-300 hover:bg-red-500/20 disabled:opacity-50"
                                          title="Reject payment"
                                        >
                                          {paymentAction ===
                                          `${order.id}:REJECT` ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                          ) : (
                                            <X className="h-4 w-4" />
                                          )}
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* =====================================================
                CUSTOMERS
            ====================================================== */}

            {tab === "customers" && (
              <div className="space-y-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-[#D4AF37]">
                      Customer management
                    </p>

                    <h1 className="mt-2 text-3xl font-semibold">
                      Customers
                    </h1>

                    <p className="mt-2 text-sm text-white/35">
                      Customers are collected
                      from registered customer
                      accounts that have placed
                      orders.
                    </p>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3">
                    <p className="text-[10px] uppercase tracking-wider text-white/30">
                      Total Customers
                    </p>

                    <p className="mt-1 text-xl font-semibold text-[#D4AF37]">
                      {
                        customers.length
                      }
                    </p>
                  </div>
                </div>

                <div className="relative">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />

                  <input
                    value={
                      customerSearch
                    }
                    onChange={(
                      event
                    ) =>
                      setCustomerSearch(
                        event.target
                          .value
                      )
                    }
                    placeholder="Search customers..."
                    className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-3 pl-11 pr-4 text-sm outline-none placeholder:text-white/25 focus:border-[#D4AF37]/50"
                  />
                </div>

                {filteredCustomers.length ===
                0 ? (
                  <div className="rounded-2xl border border-dashed border-white/10 py-20 text-center">
                    <Users className="mx-auto h-10 w-10 text-white/15" />

                    <h3 className="mt-4 text-sm font-medium">
                      No customers found
                    </h3>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {filteredCustomers.map(
                      (
                        customer
                      ) => {
                        const customerOrders =
                          orders.filter(
                            (
                              order
                            ) =>
                              order
                                .user
                                ?.id ===
                              customer.id
                          );

                        const customerRevenue =
                          customerOrders.reduce(
                            (
                              sum,
                              order
                            ) =>
                              sum +
                              (order.paymentStatus ===
                              "PAID"
                                ? Number(
                                    order.total
                                  )
                                : 0),
                            0
                          );

                        return (
                          <div
                            key={
                              customer.id
                            }
                            className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
                          >
                            <div className="flex items-start gap-4">
                              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#D4AF37]/10">
                                <UserRound className="h-5 w-5 text-[#D4AF37]" />
                              </div>

                              <div className="min-w-0">
                                <h3 className="truncate font-semibold">
                                  {
                                    customer.name
                                  }
                                </h3>

                                <p className="mt-1 truncate text-xs text-white/35">
                                  {
                                    customer.email
                                  }
                                </p>

                                {customer.phone && (
                                  <p className="mt-1 text-xs text-white/35">
                                    {
                                      customer.phone
                                    }
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="mt-5 grid grid-cols-2 gap-3">
                              <div className="rounded-xl bg-black/20 p-3">
                                <p className="text-[10px] text-white/30">
                                  Orders
                                </p>

                                <p className="mt-1 text-lg font-semibold">
                                  {
                                    customerOrders.length
                                  }
                                </p>
                              </div>

                              <div className="rounded-xl bg-black/20 p-3">
                                <p className="text-[10px] text-white/30">
                                  Paid
                                </p>

                                <p className="mt-1 text-sm font-semibold text-[#D4AF37]">
                                  {formatPrice(
                                    customerRevenue
                                  )}
                                </p>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                setOrderSearch(
                                  customer.email
                                );
                                setTab(
                                  "orders"
                                );
                              }}
                              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-2.5 text-xs text-white/60 hover:bg-white/10 hover:text-white"
                            >
                              <Eye className="h-4 w-4" />
                              View Orders
                            </button>
                          </div>
                        );
                      }
                    )}
                  </div>
                )}
              </div>
            )}

            {/* =====================================================
                STORE SETTINGS
            ====================================================== */}

            {tab === "settings" && (
              <div className="mx-auto max-w-3xl space-y-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-[#D4AF37]">
                    Store configuration
                  </p>

                  <h1 className="mt-2 text-3xl font-semibold">
                    Store Settings
                  </h1>

                  <p className="mt-2 text-sm leading-6 text-white/35">
                    Configure the store name
                    and bank transfer details
                    customers use when paying
                    for orders.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                  {settingsLoading ? (
                    <div className="flex min-h-[300px] items-center justify-center">
                      <Loader2 className="h-7 w-7 animate-spin text-[#D4AF37]" />
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div>
                        <h2 className="font-semibold">
                          Store Information
                        </h2>

                        <p className="mt-1 text-xs text-white/30">
                          Basic information
                          displayed throughout
                          the store.
                        </p>
                      </div>

                      <div>
                        <label className="mb-2 block text-xs text-white/50">
                          Store name
                        </label>

                        <input
                          value={
                            settingsDraft.storeName
                          }
                          onChange={(
                            event
                          ) =>
                            setSettingsDraft(
                              (
                                current
                              ) => ({
                                ...current,
                                storeName:
                                  event
                                    .target
                                    .value,
                              })
                            )
                          }
                          className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none focus:border-[#D4AF37]/50"
                        />
                      </div>

                      <div className="border-t border-white/10 pt-6">
                        <h2 className="font-semibold">
                          Bank Transfer
                        </h2>

                        <p className="mt-1 text-xs text-white/30">
                          Customers will use
                          these details to
                          complete bank transfer
                          payments.
                        </p>
                      </div>

                      <div className="grid gap-5 md:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-xs text-white/50">
                            Bank name
                          </label>

                          <input
                            value={
                              settingsDraft.bankName
                            }
                            onChange={(
                              event
                            ) =>
                              setSettingsDraft(
                                (
                                  current
                                ) => ({
                                  ...current,
                                  bankName:
                                    event
                                      .target
                                      .value,
                                })
                              )
                            }
                            placeholder="e.g. Access Bank"
                            className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none placeholder:text-white/20 focus:border-[#D4AF37]/50"
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-xs text-white/50">
                            Account name
                          </label>

                          <input
                            value={
                              settingsDraft.accountName
                            }
                            onChange={(
                              event
                            ) =>
                              setSettingsDraft(
                                (
                                  current
                                ) => ({
                                  ...current,
                                  accountName:
                                    event
                                      .target
                                      .value,
                                })
                              )
                            }
                            placeholder="Account holder name"
                            className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none placeholder:text-white/20 focus:border-[#D4AF37]/50"
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-xs text-white/50">
                            Account number
                          </label>

                          <input
                            value={
                              settingsDraft.accountNumber
                            }
                            onChange={(
                              event
                            ) =>
                              setSettingsDraft(
                                (
                                  current
                                ) => ({
                                  ...current,
                                  accountNumber:
                                    event
                                      .target
                                      .value
                                      .replace(
                                        /\D/g,
                                        ""
                                      )
                                      .slice(
                                        0,
                                        10
                                      ),
                                })
                              )
                            }
                            inputMode="numeric"
                            maxLength={10}
                            placeholder="0123456789"
                            className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none placeholder:text-white/20 focus:border-[#D4AF37]/50"
                          />

                          <p className="mt-2 text-[10px] text-white/25">
                            Must contain exactly
                            10 digits.
                          </p>
                        </div>

                        <div>
                          <label className="mb-2 block text-xs text-white/50">
                            WhatsApp Number
                          </label>

                          <input
                            type="tel"
                            value={settingsDraft.whatsappNumber || ""}
                            onChange={(event) =>
                              setSettingsDraft((current) => ({
                                ...current,
                                whatsappNumber: event.target.value,
                              }))
                            }
                            placeholder="08012345678"
                            className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none transition focus:border-[#D4AF37]/50"
                          />

                          <p className="mt-2 text-[11px] leading-5 text-white/25">
                            Enter the store's WhatsApp number.
                            Nigerian numbers such as 08012345678
                            are automatically converted to
                            international format.
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-end border-t border-white/10 pt-6">
                        <button
                          type="button"
                          onClick={
                            saveSettings
                          }
                          disabled={
                            saving
                          }
                          className="flex items-center gap-2 rounded-xl bg-[#D4AF37] px-6 py-3 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {saving ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4" />
                          )}

                          {saving
                            ? "Saving..."
                            : "Save Settings"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {settings && (
                  <div className="rounded-2xl border border-emerald-500/10 bg-emerald-500/5 p-5">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />

                      <div>
                        <p className="text-sm font-medium text-emerald-300">
                          Bank settings connected
                        </p>

                        <p className="mt-1 text-xs text-emerald-300/50">
                          Payment information is
                          stored in your database.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* =====================================================
                PRODUCT EDITOR
            ====================================================== */}

            {tab === "editor" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-[#D4AF37]">
                      Product manager
                    </p>

                    <h1 className="mt-2 text-3xl font-semibold">
                      {editingId
                        ? "Edit Product"
                        : "Create Product"}
                    </h1>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setTab(
                        "products"
                      )
                    }
                    className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-white/50 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
                  <div className="space-y-6">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                      <h2 className="font-semibold">
                        Product Information
                      </h2>

                      <div className="mt-5 grid gap-4 md:grid-cols-2">
                        <div className="md:col-span-2">
                          <label className="mb-2 block text-xs text-white/50">
                            Product name
                          </label>

                          <input
                            value={
                              draft.name
                            }
                            onChange={(
                              event
                            ) =>
                              updateDraft({
                                name: event
                                  .target
                                  .value,
                              })
                            }
                            placeholder="e.g. Midnight Bespoke Suit"
                            className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none placeholder:text-white/20 focus:border-[#D4AF37]/50"
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-xs text-white/50">
                            Category
                          </label>

                          <select
                            value={
                              draft.category
                            }
                            onChange={(
                              event
                            ) =>
                              updateDraft({
                                category:
                                  event
                                    .target
                                    .value,
                              })
                            }
                            className="w-full rounded-xl border border-white/10 bg-[#111] px-4 py-3 text-sm outline-none focus:border-[#D4AF37]/50"
                          >
                            {CATEGORIES.map(
                              (
                                category
                              ) => (
                                <option
                                  key={
                                    category
                                  }
                                  value={
                                    category
                                  }
                                >
                                  {
                                    category
                                  }
                                </option>
                              )
                            )}
                          </select>
                        </div>

                        <div>
                          <label className="mb-2 block text-xs text-white/50">
                            Stock
                          </label>

                          <input
                            type="number"
                            min="0"
                            value={
                              draft.stock
                            }
                            onChange={(
                              event
                            ) =>
                              updateDraft({
                                stock: event
                                  .target
                                  .value,
                              })
                            }
                            className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none focus:border-[#D4AF37]/50"
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-xs text-white/50">
                            Price (NGN)
                          </label>

                          <input
                            type="number"
                            min="0"
                            value={
                              draft.price
                            }
                            onChange={(
                              event
                            ) =>
                              updateDraft({
                                price: event
                                  .target
                                  .value,
                              })
                            }
                            placeholder="100000"
                            className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none focus:border-[#D4AF37]/50"
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-xs text-white/50">
                            Compare-at price
                          </label>

                          <input
                            type="number"
                            min="0"
                            value={
                              draft.compareAtPrice
                            }
                            onChange={(
                              event
                            ) =>
                              updateDraft({
                                compareAtPrice:
                                  event
                                    .target
                                    .value,
                              })
                            }
                            placeholder="Optional"
                            className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none focus:border-[#D4AF37]/50"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="mb-2 block text-xs text-white/50">
                            Description
                          </label>

                          <textarea
                            value={
                              draft.description
                            }
                            onChange={(
                              event
                            ) =>
                              updateDraft({
                                description:
                                  event
                                    .target
                                    .value,
                              })
                            }
                            rows={5}
                            placeholder="Describe the product..."
                            className="w-full resize-none rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none placeholder:text-white/20 focus:border-[#D4AF37]/50"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="font-semibold">
                            Product Images
                          </h2>

                          <p className="mt-1 text-xs text-white/30">
                            Images are uploaded
                            permanently to
                            Cloudinary.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            fileInputRef.current?.click()
                          }
                          disabled={
                            uploading
                          }
                          className="flex items-center gap-2 rounded-xl bg-[#D4AF37] px-4 py-2.5 text-xs font-semibold text-black disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {uploading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <UploadCloud className="h-4 w-4" />
                          )}

                          {uploading
                            ? "Uploading..."
                            : "Upload Images"}
                        </button>

                        <input
                          ref={
                            fileInputRef
                          }
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={
                            handleImageUpload
                          }
                          className="hidden"
                        />
                      </div>

                      {draft.images.length ===
                      0 ? (
                        <button
                          type="button"
                          onClick={() =>
                            fileInputRef.current?.click()
                          }
                          className="mt-5 flex w-full flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-black/20 px-5 py-12 text-center transition hover:border-[#D4AF37]/40"
                        >
                          <UploadCloud className="h-8 w-8 text-white/20" />

                          <p className="mt-3 text-sm text-white/50">
                            Click to upload
                            product images
                          </p>

                          <p className="mt-1 text-xs text-white/25">
                            PNG, JPG, WEBP up to
                            10MB
                          </p>
                        </button>
                      ) : (
                        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                          {draft.images.map(
                            (
                              image,
                              index
                            ) => (
                              <div
                                key={`${image}-${index}`}
                                className="group relative aspect-[4/5] overflow-hidden rounded-xl border border-white/10 bg-black"
                              >
                                <div
                                  className="absolute inset-0 bg-cover bg-center"
                                  style={{
                                    backgroundImage: `url("${image}")`,
                                  }}
                                />

                                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/70 p-2 opacity-0 backdrop-blur transition group-hover:opacity-100">
                                  <button
                                    type="button"
                                    disabled={
                                      index ===
                                      0
                                    }
                                    onClick={() =>
                                      moveImage(
                                        index,
                                        "left"
                                      )
                                    }
                                    className="rounded-md bg-white/10 px-2 py-1 text-[10px] disabled:opacity-20"
                                  >
                                    <ChevronLeft className="h-3 w-3" />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      removeImage(
                                        index
                                      )
                                    }
                                    className="rounded-md bg-red-500/20 p-1.5 text-red-300"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>

                                  <button
                                    type="button"
                                    disabled={
                                      index ===
                                      draft
                                        .images
                                        .length -
                                        1
                                    }
                                    onClick={() =>
                                      moveImage(
                                        index,
                                        "right"
                                      )
                                    }
                                    className="rounded-md bg-white/10 px-2 py-1 text-[10px] disabled:opacity-20"
                                  >
                                    <ChevronRight className="h-3 w-3" />
                                  </button>
                                </div>

                                {index ===
                                  0 && (
                                  <span className="absolute left-2 top-2 rounded-full bg-[#D4AF37] px-2 py-1 text-[9px] font-bold text-black">
                                    MAIN
                                  </span>
                                )}
                              </div>
                            )
                          )}
                        </div>
                      )}
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                      <h2 className="font-semibold">
                        Variants
                      </h2>

                      <div className="mt-6">
                        <p className="mb-3 text-xs text-white/40">
                          Sizes
                        </p>

                        <div className="flex flex-wrap gap-2">
                          {SIZES.map(
                            (size) => {
                              const active =
                                draft.sizes.includes(
                                  size
                                );

                              return (
                                <button
                                  key={
                                    size
                                  }
                                  type="button"
                                  onClick={() =>
                                    toggleSize(
                                      size
                                    )
                                  }
                                  className={`rounded-lg border px-4 py-2 text-xs transition ${
                                    active
                                      ? "border-[#D4AF37] bg-[#D4AF37] text-black"
                                      : "border-white/10 bg-white/5 text-white/50 hover:bg-white/10"
                                  }`}
                                >
                                  {
                                    size
                                  }
                                </button>
                              );
                            }
                          )}
                        </div>
                      </div>

                      <div className="mt-6">
                        <p className="mb-3 text-xs text-white/40">
                          Colors
                        </p>

                        <div className="flex flex-wrap gap-2">
                          {[
                            "Black",
                            "White",
                            "Navy",
                            "Royal Blue",
                            "Wine",
                            "Burgundy",
                            "Cream",
                            "Gold",
                            "Brown",
                            "Grey",
                            "Green",
                          ].map(
                            (color) => {
                              const value =
                                color.toLowerCase();

                              const active =
                                draft.colors.includes(
                                  value
                                );

                              return (
                                <button
                                  key={
                                    color
                                  }
                                  type="button"
                                  onClick={() =>
                                    toggleColor(
                                      value
                                    )
                                  }
                                  className={`rounded-lg border px-4 py-2 text-xs transition ${
                                    active
                                      ? "border-[#D4AF37] bg-[#D4AF37] text-black"
                                      : "border-white/10 bg-white/5 text-white/50 hover:bg-white/10"
                                  }`}
                                >
                                  {
                                    color
                                  }
                                </button>
                              );
                            }
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                      <h2 className="font-semibold">
                        Store Visibility
                      </h2>

                      <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        <label className="flex cursor-pointer items-center justify-between rounded-xl border border-white/10 bg-black/20 p-4">
                          <div>
                            <p className="text-sm">
                              Featured Product
                            </p>

                            <p className="mt-1 text-xs text-white/30">
                              Show in featured
                              collection
                            </p>
                          </div>

                          <input
                            type="checkbox"
                            checked={
                              draft.featured
                            }
                            onChange={(
                              event
                            ) =>
                              updateDraft({
                                featured:
                                  event
                                    .target
                                    .checked,
                              })
                            }
                            className="h-5 w-5 accent-[#D4AF37]"
                          />
                        </label>

                        <label className="flex cursor-pointer items-center justify-between rounded-xl border border-white/10 bg-black/20 p-4">
                          <div>
                            <p className="text-sm">
                              New Arrival
                            </p>

                            <p className="mt-1 text-xs text-white/30">
                              Mark as a new
                              collection item
                            </p>
                          </div>

                          <input
                            type="checkbox"
                            checked={
                              draft.newArrival
                            }
                            onChange={(
                              event
                            ) =>
                              updateDraft({
                                newArrival:
                                  event
                                    .target
                                    .checked,
                              })
                            }
                            className="h-5 w-5 accent-[#D4AF37]"
                          />
                        </label>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setDraft({
                            ...emptyDraft,
                            images: [],
                            colors: [],
                            sizes: [],
                          });
                          setEditingId(
                            null
                          );
                          setTab(
                            "products"
                          );
                        }}
                        className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm text-white/60 hover:text-white"
                      >
                        Cancel
                      </button>

                      <button
                        type="button"
                        onClick={
                          saveProduct
                        }
                        disabled={
                          saving ||
                          uploading
                        }
                        className="flex items-center justify-center gap-2 rounded-xl bg-[#D4AF37] px-7 py-3 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {saving ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}

                        {saving
                          ? "Saving..."
                          : editingId
                          ? "Update Product"
                          : "Create Product"}
                      </button>
                    </div>
                  </div>

                  <aside className="xl:sticky xl:top-24 xl:self-start">
                    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
                      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Eye className="h-4 w-4 text-[#D4AF37]" />

                          <p className="text-sm font-medium">
                            Live Preview
                          </p>
                        </div>

                        <span className="text-[10px] uppercase tracking-wider text-white/25">
                          Store
                        </span>
                      </div>

                      <div className="p-4">
                        <div className="overflow-hidden rounded-2xl bg-black">
                          <div className="relative aspect-[4/5] overflow-hidden">
                            {getPreviewImage() ? (
                              <div
                                className="absolute inset-0 bg-cover bg-center"
                                style={{
                                  backgroundImage: `url("${getPreviewImage()}")`,
                                }}
                              />
                            ) : (
                              <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <ImageIcon className="h-10 w-10 text-white/10" />

                                <p className="mt-3 text-xs text-white/25">
                                  Product image
                                  preview
                                </p>
                              </div>
                            )}

                            <div className="absolute left-3 top-3 flex gap-2">
                              {draft.featured && (
                                <span className="rounded-full bg-[#D4AF37] px-2.5 py-1 text-[9px] font-semibold text-black">
                                  Featured
                                </span>
                              )}

                              {draft.newArrival && (
                                <span className="rounded-full bg-white px-2.5 py-1 text-[9px] font-semibold text-black">
                                  New
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="p-5">
                            <p className="text-[10px] uppercase tracking-[0.18em] text-[#D4AF37]">
                              {draft.category ||
                                "Category"}
                            </p>

                            <h3 className="mt-2 text-xl font-semibold">
                              {draft.name ||
                                "Product Name"}
                            </h3>

                            <p className="mt-3 line-clamp-3 text-xs leading-5 text-white/40">
                              {draft.description ||
                                "Your product description will appear here."}
                            </p>

                            <div className="mt-5 flex items-center justify-between">
                              <p className="font-semibold text-[#D4AF37]">
                                {draft.price
                                  ? formatPrice(
                                      Number(
                                        draft.price
                                      )
                                    )
                                  : "₦0"}
                              </p>

                              <span
                                className={`text-xs ${
                                  Number(
                                    draft.stock
                                  ) >
                                  0
                                    ? "text-emerald-400"
                                    : "text-red-400"
                                }`}
                              >
                                {Number(
                                  draft.stock
                                ) >
                                0
                                  ? "In Stock"
                                  : "Out of Stock"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </aside>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* =========================================================
          ORDER DETAILS MODAL
      ========================================================== */}

      {selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-[#111] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#D4AF37]">
                  Order Details
                </p>

                <h2 className="mt-1 font-mono text-sm font-semibold">
                  #{selectedOrder.id}
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedOrder(
                    null
                  )
                }
                className="rounded-xl border border-white/10 bg-white/5 p-2 text-white/50 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[calc(90vh-80px)] overflow-y-auto p-5">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl bg-white/[0.03] p-4">
                  <p className="text-[10px] uppercase tracking-wider text-white/30">
                    Customer
                  </p>

                  <p className="mt-2 text-sm font-medium">
                    {
                      selectedOrder
                        .user?.name
                    }
                  </p>

                  <p className="mt-1 break-all text-xs text-white/35">
                    {
                      selectedOrder
                        .user?.email
                    }
                  </p>
                </div>

                <div className="rounded-xl bg-white/[0.03] p-4">
                  <p className="text-[10px] uppercase tracking-wider text-white/30">
                    Amount
                  </p>

                  <p className="mt-2 text-lg font-semibold text-[#D4AF37]">
                    {formatPrice(
                      selectedOrder.total
                    )}
                  </p>

                  <p className="mt-1 text-xs text-white/35">
                    {
                      selectedOrder
                        .paymentMethod
                    }
                  </p>
                </div>

                <div className="rounded-xl bg-white/[0.03] p-4">
                  <p className="text-[10px] uppercase tracking-wider text-white/30">
                    Date
                  </p>

                  <p className="mt-2 text-xs">
                    {formatDate(
                      selectedOrder.createdAt
                    )}
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                  <p className="text-[10px] text-white/30">
                    Payment Status
                  </p>

                  <span
                    className={`mt-2 inline-flex rounded-full border px-3 py-1 text-[10px] ${getPaymentStatusClass(
                      selectedOrder.paymentStatus
                    )}`}
                  >
                    {getStatusLabel(
                      selectedOrder.paymentStatus
                    )}
                  </span>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                  <p className="text-[10px] text-white/30">
                    Order Status
                  </p>

                  <span
                    className={`mt-2 inline-flex rounded-full border px-3 py-1 text-[10px] ${getOrderStatusClass(
                      selectedOrder.status
                    )}`}
                  >
                    {getStatusLabel(
                      selectedOrder.status
                    )}
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="font-semibold">
                  Order Items
                </h3>

                <div className="mt-3 space-y-3">
                  {selectedOrder.items.map(
                    (item) => (
                      <div
                        key={
                          item.id
                        }
                        className="flex items-center gap-3 rounded-xl border border-white/5 bg-black/20 p-3"
                      >
                        <div
                          className="h-14 w-12 shrink-0 rounded-lg bg-cover bg-center"
                          style={{
                            backgroundImage:
                              item
                                .product
                                ?.image
                                ? `url("${item.product.image}")`
                                : undefined,
                          }}
                        />

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {
                              item
                                .product
                                ?.name
                            }
                          </p>

                          <p className="mt-1 text-xs text-white/35">
                            Qty:{" "}
                            {
                              item.quantity
                            }
                          </p>
                        </div>

                        <p className="text-sm font-semibold text-[#D4AF37]">
                          {formatPrice(
                            Number(
                              item.price
                            ) *
                              item.quantity
                          )}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:justify-end">
                {selectedOrder.paymentStatus !==
                  "PAID" && (
                  <>
                    <button
                      type="button"
                      disabled={
                        paymentAction ===
                        `${selectedOrder.id}:REJECT`
                      }
                      onClick={() =>
                        updatePayment(
                          selectedOrder,
                          "REJECT"
                        )
                      }
                      className="flex items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-5 py-3 text-xs font-semibold text-red-300 disabled:opacity-50"
                    >
                      <X className="h-4 w-4" />
                      Reject Payment
                    </button>

                    <button
                      type="button"
                      disabled={
                        paymentAction ===
                        `${selectedOrder.id}:APPROVE`
                      }
                      onClick={() =>
                        updatePayment(
                          selectedOrder,
                          "APPROVE"
                        )
                      }
                      className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-xs font-semibold text-black disabled:opacity-50"
                    >
                      {paymentAction ===
                      `${selectedOrder.id}:APPROVE` ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4" />
                      )}
                      Approve Payment
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onClick={() =>
                    setSelectedOrder(
                      null
                    )
                  }
                  className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-xs text-white/60 hover:text-white"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
