import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { createHash } from "node:crypto";

const prisma = new PrismaClient();

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
