import { prisma } from "@/lib/prisma";

/**
 * What the club actually charged in a season that has already closed.
 *
 * Only the combinations that carried a price: one without a price was never on
 * sale, and a report of what happened has no room for what did not. The
 * membership counts are what the editor cannot say — how many people took each
 * line at that price.
 */
export async function fetchClosedSeasonPrices(seasonId: string) {
  const [licenses, supplements, groups] = await Promise.all([
    prisma.licenseOffering.findMany({
      where: { seasonId },
      include: {
        type: { select: { name: true } },
        subtype: { select: { name: true } },
        category: { select: { name: true } },
        _count: { select: { memberships: true } },
      },
      orderBy: [
        { type: { name: "asc" } },
        { subtype: { name: "asc" } },
        { category: { name: "asc" } },
      ],
    }),
    prisma.supplementPrice.findMany({
      where: { seasonId },
      include: { supplement: { select: { name: true } } },
      orderBy: { supplement: { name: "asc" } },
    }),
    prisma.supplementGroupPrice.findMany({
      where: { seasonId },
      include: { group: { select: { name: true } } },
      orderBy: { group: { name: "asc" } },
    }),
  ]);

  return { licenses, supplements, groups };
}
