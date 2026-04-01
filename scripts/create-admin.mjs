import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { createHash } from "node:crypto";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
});
const prisma = new PrismaClient({ adapter });

const [email, password, name] = process.argv.slice(2);

if (!email || !password || !name) {
  console.error("Usage: node scripts/create-admin.mjs <email> <password> <name>");
  process.exit(1);
}

const existing = await prisma.user.findUnique({ where: { email } });
if (existing) {
  console.error(`User with email "${email}" already exists.`);
  process.exit(1);
}

const adminRole = await prisma.role.upsert({
  where: { name: "ADMIN" },
  update: {},
  create: { name: "ADMIN" },
});

const passwordHash = createHash("sha256").update(password).digest("hex");

const user = await prisma.user.create({
  data: {
    email,
    passwordHash,
    name,
    roles: { create: { roleId: adminRole.id } },
  },
});

console.log(`Admin user created: ${user.email} (${user.name})`);
await prisma.$disconnect();
