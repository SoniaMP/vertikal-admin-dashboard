import { prisma } from "@/lib/prisma";

export async function fetchUsers() {
  return prisma.user.findMany({
    include: {
      roles: { include: { role: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}
