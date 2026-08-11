const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
console.log("Starting database seed...");

/*

* ============================
* ADMIN ACCOUNT
* ============================
  */

const adminEmail = "admin@benkaso.com";
const adminPassword = "Admin@12345";

const hashedPassword =
await bcrypt.hash(adminPassword, 12);

const admin = await prisma.user.upsert({
where: {
email: adminEmail,
},

update: {
  name: "Benkaso Admin",
  password: hashedPassword,
  role: "ADMIN",
},

create: {
  id: crypto.randomUUID(),
  name: "Benkaso Admin",
  email: adminEmail,
  password: hashedPassword,
  role: "ADMIN",
  updatedAt: new Date(),
},

});

console.log("Admin account ready:");
console.log("Email: ${adminEmail}");
console.log("Password: ${adminPassword}");

/*

* ============================
* STORE SETTINGS
* ============================
  */

await prisma.storeSettings.upsert({
where: {
id: "store",
},

update: {},

create: {
  id: "store",
  storeName: "Benkaso Collection",
  updatedAt: new Date(),
},

});

/*

* ============================
* PRODUCTS
* ============================
  */

const products = [
{
name: "Classic Black Tuxedo",
slug: "classic-black-tuxedo",
description:
"Premium tailored black tuxedo for elegant occasions.",
price: 85000,
category: "Bespoke Suits",
image: "/products/tuxedo.jpg",
imagesJson: JSON.stringify([
"/products/tuxedo.jpg",
]),
colorsJson: JSON.stringify([
"black",
]),
sizesJson: JSON.stringify([
"M",
"L",
"XL",
"XXL",
]),
stock: 10,
isFeatured: true,
isNew: true,
inStock: true,
updatedAt: new Date(),
},

{
  name: "Royal Blue Senator Wear",
  slug: "royal-blue-senator-wear",
  description:
    "Modern Nigerian senator outfit with luxury finishing.",
  price: 65000,
  category: "Senator Wear",
  image: "/products/senator.jpg",
  imagesJson: JSON.stringify([
    "/products/senator.jpg",
  ]),
  colorsJson: JSON.stringify([
    "royal blue",
  ]),
  sizesJson: JSON.stringify([
    "M",
    "L",
    "XL",
    "XXL",
  ]),
  stock: 15,
  isFeatured: true,
  isNew: true,
  inStock: true,
  updatedAt: new Date(),
},

{
  name: "White Luxury Shirt",
  slug: "white-luxury-shirt",
  description:
    "Premium cotton shirt for business and events.",
  price: 35000,
  category: "Traditional Wear",
  image: "/products/shirt.jpg",
  imagesJson: JSON.stringify([
    "/products/shirt.jpg",
  ]),
  colorsJson: JSON.stringify([
    "white",
  ]),
  sizesJson: JSON.stringify([
    "S",
    "M",
    "L",
    "XL",
    "XXL",
  ]),
  stock: 20,
  isFeatured: false,
  isNew: true,
  inStock: true,
  updatedAt: new Date(),
},

];

for (const product of products) {
await prisma.product.upsert({
where: {
slug: product.slug,
},

  update: {
    name: product.name,
    description: product.description,
    category: product.category,
    image: product.image,
    imagesJson: product.imagesJson,
    colorsJson: product.colorsJson,
    sizesJson: product.sizesJson,
    price: product.price,
    stock: product.stock,
    isFeatured: product.isFeatured,
    isNew: product.isNew,
    inStock: product.inStock,
    updatedAt: new Date(),
  },

  create: {
    id: crypto.randomUUID(),
    ...product,
  },
});

}

console.log(
"${products.length} products seeded successfully."
);

console.log("Seed complete.");
}

main()
.catch((error) => {
console.error("Seed failed:", error);
process.exit(1);
})
.finally(async () => {
await prisma.$disconnect();
});