import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { hashPassword } from "../src/lib/password";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  // Ensure ADMIN role exists
  const adminRole = await prisma.role.upsert({
    where: { name: "ADMIN" },
    update: {},
    create: { name: "ADMIN" },
  });

  // Ensure INSTRUCTOR role exists
  await prisma.role.upsert({
    where: { name: "INSTRUCTOR" },
    update: {},
    create: { name: "INSTRUCTOR" },
  });

  // Create admin user if it does not exist (password: admin123 — change in production!)
  const existingAdmin = await prisma.user.findUnique({
    where: { email: "admin@vertikal.club" },
  });

  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        email: "admin@vertikal.club",
        passwordHash: await hashPassword("admin123"),
        name: "Admin",
        roles: { create: { roleId: adminRole.id } },
      },
    });
  }

  // Ensure an active season exists
  const activeSeason = await prisma.season.findFirst({
    where: { isActive: true },
  });

  if (!activeSeason) {
    const currentYear = new Date().getFullYear();
    await prisma.season.create({
      data: {
        name: String(currentYear),
        year: currentYear,
        startDate: new Date(`${currentYear}-01-01`),
        endDate: new Date(`${currentYear}-12-31`),
        isActive: true,
      },
    });
  }

  // Default membership fee: 20.00 EUR (in cents)
  await prisma.appSetting.upsert({
    where: { key: "MEMBERSHIP_FEE" },
    update: {},
    create: { key: "MEMBERSHIP_FEE", value: "2000" },
  });

  console.log("Seed completed successfully");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
