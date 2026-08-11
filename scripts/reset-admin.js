const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const ADMIN_EMAIL =
  process.env.ADMIN_EMAIL ||
  "admin@benkasocollection.com";

const ADMIN_PASSWORD =
  process.env.ADMIN_PASSWORD ||
  "BenkasoAdmin@2026!";

async function main() {
  console.log(
    "Using database:",
    process.env.DATABASE_URL
  );

  console.log("\nChecking for admin account...");
  console.log("Email:", ADMIN_EMAIL);

  if (!ADMIN_PASSWORD) {
    throw new Error(
      "ADMIN_PASSWORD is not configured."
    );
  }

  const hashedPassword =
    await bcrypt.hash(
      ADMIN_PASSWORD,
      12
    );

  const now = new Date();

  const existingUser =
    await prisma.user.findUnique({
      where: {
        email: ADMIN_EMAIL,
      },
    });

  if (existingUser) {
    console.log(
      "\nAdmin account found. Resetting password and role..."
    );

    const updatedUser =
      await prisma.user.update({
        where: {
          id: existingUser.id,
        },
        data: {
          password: hashedPassword,
          role: "ADMIN",
          updatedAt: now,
        },
      });

    console.log(
      "\n================================"
    );
    console.log("ADMIN ACCOUNT READY");
    console.log(
      "================================"
    );
    console.log(
      "Email:",
      updatedUser.email
    );
    console.log(
      "Password:",
      ADMIN_PASSWORD
    );
    console.log(
      "Role:",
      updatedUser.role
    );
    console.log(
      "================================\n"
    );

    return;
  }

  console.log(
    "\nNo account found. Creating admin..."
  );

  const newUser =
    await prisma.user.create({
      data: {
        id: `admin_${Date.now()}`,
        name: "Benkaso Admin",
        email: ADMIN_EMAIL,
        password: hashedPassword,
        role: "ADMIN",
        createdAt: now,
        updatedAt: now,
      },
    });

  console.log(
    "\n================================"
  );
  console.log("ADMIN ACCOUNT CREATED");
  console.log(
    "================================"
  );
  console.log(
    "Email:",
    newUser.email
  );
  console.log(
    "Password:",
    ADMIN_PASSWORD
  );
  console.log(
    "Role:",
    newUser.role
  );
  console.log(
    "================================\n"
  );
}

main()
  .catch((error) => {
    console.error(
      "\nFAILED TO CREATE/RESET ADMIN:"
    );

    console.error(error);

    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });