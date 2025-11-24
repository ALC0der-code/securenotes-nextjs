
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create test account
  const testEmail = "john@doe.com";
  const existingUser = await prisma.user.findUnique({
    where: { email: testEmail },
  });

  if (!existingUser) {
    const hashedPassword = await bcrypt.hash("johndoe123", 10);
    await prisma.user.create({
      data: {
        email: testEmail,
        password: hashedPassword,
        name: "John Doe",
      },
    });
    console.log("Test user created: john@doe.com / johndoe123");
  } else {
    console.log("Test user already exists");
  }

  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
