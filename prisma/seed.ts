import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  const saltRounds = 10;

  const users = [
    {
      name: "Alice",
      email: "alice@example.com",
      password: await bcrypt.hash("password123", saltRounds),
      role: "AUTHOR" as const,
    },
    {
      name: "Bob",
      email: "bob@example.com",
      password: await bcrypt.hash("password123", saltRounds),
      role: "REVIEWER" as const,
    },
    {
      name: "Admin",
      email: "admin@example.com",
      password: await bcrypt.hash("password123", saltRounds),
      role: "ADMIN" as const,
    },
    {
      name: "Viewer",
      email: "viewer@example.com",
      password: await bcrypt.hash("password123", saltRounds),
      role: "VIEWER" as const,
    },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user,
    });
    console.log(`✅ Seeded user: ${user.email} (${user.role})`);
  }

  console.log("✅ Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
