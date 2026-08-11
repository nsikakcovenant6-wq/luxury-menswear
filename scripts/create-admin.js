require("dotenv").config();

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const prisma = new PrismaClient();

async function main() {
  const email = "admin@benkasocollection.com";
  const password = "Admin@2026Secure";
  const name = "Benkaso Admin";

  const hashedPassword = await bcrypt.hash(
    password,
    12
  );

  const existingUser =
    await prisma.user.findUnique({
      where: {
        email,
      },
    });

  if (existingUser) {
    const updatedUser =
      await prisma.user.update({
        where: {
          id: existingUser.id,
        },
        data: {
          name,
          password: hashedPassword,
          role: "ADMIN",
        },
      });

    console.log("=================================");
    console.log("ADMIN ACCOUNT UPDATED");
    console.log("=================================");
    console.log("Email:", updatedUser.email);
    console.log("Password:", password);
    console.log("Role:", updatedUser.role);
    console.log("=================================");

    return;
  }

  const admin =
    await prisma.user.create({
      data: {
        id: crypto.randomUUID(),
        name,
        email,
        password: hashedPassword,
        role: "ADMIN",
      },
    });

  console.log("=================================");
  console.log("ADMIN ACCOUNT CREATED");
  console.log("=================================");
  console.log("Email:", admin.email);
  console.log("Password:", password);
  console.log("Role:", admin.role);
  console.log("=================================");
}

main()
  .catch((error) => {
    console.error(
      "Failed to create admin:",
      error
    );
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });