import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "your@email.com";       // ← change this
  const newPassword = "your-password";  // ← change this

  const hashed = await bcrypt.hash(newPassword, 12);

  const user = await prisma.user.update({
    where: { email },
    data: { password: hashed },
  });

  console.log("Password reset for:", user.email);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());