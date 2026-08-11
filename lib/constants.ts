export const SITE_NAME = "Benkaso Collection";
export const SITE_TAGLINE = "Bespoke Tailoring. Timeless Luxury.";
export const SITE_DESCRIPTION =
  "Benkaso Collection is a premium men's fashion and tailoring house specializing in bespoke suits, agbada, senator wear, kaftans, and custom tailoring.";
export const SITE_URL = "https://www.benkasocollection.com";

export const WHATSAPP_NUMBER = "2348000000000";
export const WHATSAPP_MESSAGE = "Hello Benkaso Collection, I'd like to enquire about your tailoring services.";

export const CONTACT_EMAIL = "hello@benkasocollection.com";
export const CONTACT_PHONE = "+234 800 000 0000";
export const CONTACT_ADDRESS = "14 Adeola Odeku Street, Victoria Island, Lagos";

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Collections", href: "/collections" },
  { label: "Custom Tailoring", href: "/customize" },
  { label: "Book Measurement", href: "/booking" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

export const PRODUCT_CATEGORIES = [
  "Bespoke Suits",
  "Agbada",
  "Senator Wear",
  "Kaftans",
  "Native Wears",
  "Corporate Wears",
  "Wedding Suits",
  "Luxury Shoes",
  "Luxury Accessories",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export const ORDER_STAGES = [
  "Pending",
  "Measurement Scheduled",
  "Tailoring",
  "Quality Check",
  "Ready",
  "Shipped",
  "Delivered",
] as const;

export type OrderStage = (typeof ORDER_STAGES)[number];