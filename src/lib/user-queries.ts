import { prisma } from "@/lib/prisma";

export async function fetchUsers() {
  return prisma.user.findMany({
    include: {
      roles: { include: { role: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function fetchInstructors() {
  return prisma.user.findMany({
    where: { roles: { some: { role: { name: "INSTRUCTOR" } } } },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}
