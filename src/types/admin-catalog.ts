import type {
  Supplement,
  SupplementGroup,
  SupplementPrice,
  SupplementGroupPrice,
} from "@prisma/client";

/**
 * The catalog rows as the admin panel loads them.
 *
 * Declared once because every row, list and dialog in the supplements panel
 * passes the same shapes along, and eight private copies of them drift the
 * moment one query gains a field.
 */

/** Any supplement, with what it would cost to delete it. */
export type AdminSupplement = Supplement & {
  /** Memberships that already bought it; above zero it can only be retired. */
  _count: { membershipSupplements: number };
};

/** A supplement sold on its own: its own price, its own federations. */
export type AdminStandaloneSupplement = AdminSupplement & {
  supplementGroup: SupplementGroup | null;
  prices: SupplementPrice[];
  typeLinks: { typeId: string }[];
};

/** A group with the supplements it sells, its price and its federations. */
export type AdminSupplementGroup = SupplementGroup & {
  supplements: AdminSupplement[];
  groupPrices: SupplementGroupPrice[];
  typeLinks: { typeId: string }[];
};
