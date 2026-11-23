import { vi } from "vitest";

type Row = Record<string, unknown>;

const CATALOG_MODELS = [
  "category",
  "supplementGroup",
  "supplement",
  "licenseType",
  "licenseSubtype",
  "licenseOffering",
  "supplementPrice",
  "supplementGroupPrice",
] as const;

type CatalogModel = (typeof CATALOG_MODELS)[number];

/**
 * An in-memory stand-in for a Prisma transaction client, limited to the
 * catalog tables the season copy touches.
 *
 * `created` is what the copy wrote, so a test can assert on the rows instead
 * of on call arguments. `calls` keeps the order, which is the only way to
 * check that a wipe happened before the copy and that children went before
 * the parents they point at.
 */
export function createFakeCatalogTx(
  seed: Partial<Record<CatalogModel, Row[]>> = {},
) {
  const created = {} as Record<CatalogModel, Row[]>;
  const calls: string[] = [];
  const tx = {} as Record<CatalogModel, unknown>;

  for (const model of CATALOG_MODELS) {
    created[model] = [];
    tx[model] = {
      findMany: vi.fn(async ({ where }: { where: { seasonId: string } }) =>
        (seed[model] ?? []).filter((row) => row.seasonId === where.seasonId),
      ),
      create: vi.fn(async ({ data }: { data: Row }) => {
        calls.push(`create:${model}`);
        created[model].push(data);
        return data;
      }),
      createMany: vi.fn(async ({ data }: { data: Row[] }) => {
        calls.push(`createMany:${model}`);
        created[model].push(...data);
        return { count: data.length };
      }),
      deleteMany: vi.fn(async () => {
        calls.push(`deleteMany:${model}`);
        return { count: 0 };
      }),
    };
  }

  return { tx, created, calls };
}
