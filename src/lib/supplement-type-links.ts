import { prisma } from "@/lib/prisma";

export type LinkTarget = { supplementId: string } | { groupId: string };

/** Only the season's own federations: a link across years means nothing. */
async function selectSeasonTypeIds(
  seasonId: string,
  typeIds: string[],
): Promise<string[]> {
  if (typeIds.length === 0) return [];

  const types = await prisma.licenseType.findMany({
    where: { seasonId, id: { in: typeIds } },
    select: { id: true },
  });

  return types.map((type) => type.id);
}

async function replaceSupplementLinks(
  supplementId: string,
  typeIds: string[],
): Promise<void> {
  const supplement = await prisma.supplement.findUnique({
    where: { id: supplementId },
    select: { seasonId: true, supplementGroupId: true },
  });
  if (!supplement) return;

  // A grouped supplement answers for its group in everything, federations
  // included, so it carries no links of its own — not even stale ones left
  // behind by a supplement that has since joined a group.
  const wanted =
    supplement.supplementGroupId === null
      ? await selectSeasonTypeIds(supplement.seasonId, typeIds)
      : [];

  await prisma.$transaction([
    prisma.licenseTypeSupplement.deleteMany({ where: { supplementId } }),
    prisma.licenseTypeSupplement.createMany({
      data: wanted.map((typeId) => ({ typeId, supplementId })),
    }),
  ]);
}

async function replaceGroupLinks(
  groupId: string,
  typeIds: string[],
): Promise<void> {
  const group = await prisma.supplementGroup.findUnique({
    where: { id: groupId },
    select: { seasonId: true },
  });
  if (!group) return;

  const wanted = await selectSeasonTypeIds(group.seasonId, typeIds);

  await prisma.$transaction([
    prisma.licenseTypeSupplementGroup.deleteMany({ where: { groupId } }),
    prisma.licenseTypeSupplementGroup.createMany({
      data: wanted.map((typeId) => ({ typeId, groupId })),
    }),
  ]);
}

/**
 * Sets which federations offer a standalone supplement or a group, replacing
 * whatever was there.
 *
 * Ids the form did not get from this season are dropped rather than rejected:
 * the picker only ever offers the season's federations, so anything else
 * arrived by tampering or a stale tab, and it is not something an admin can
 * act on.
 */
export async function replaceTypeLinks(
  target: LinkTarget,
  typeIds: string[],
): Promise<void> {
  if ("groupId" in target) {
    await replaceGroupLinks(target.groupId, typeIds);
    return;
  }

  await replaceSupplementLinks(target.supplementId, typeIds);
}
