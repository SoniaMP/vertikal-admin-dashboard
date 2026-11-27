import { fetchClosedSeasonPrices } from "@/lib/closed-season-prices";
import { formatPrice } from "@/helpers/price-calculator";
import { Table, TableBody, TableHeader, TableRow } from "@/components/ui/table";
import { DataCell } from "./data-cell";
import { DataHead } from "./data-head";

/* 12px grey, no fill band, like every other table in the panel. */
const ROW = "h-12";

/* A section title outranks the column labels under it, as on the open year. */
const SECTION_TITLE = "text-sm font-medium text-muted-foreground";

type Props = {
  seasonId: string;
  year: number;
};

/**
 * A season that has closed, as a report rather than an editor.
 *
 * The editing screen answers "what do we sell and for how much". This one
 * answers "what did we charge in {year}", which is a different question with
 * different furniture: no actions, no drafts, and the membership counts that
 * the editor has no room for.
 */
export async function ClosedSeasonCatalog({ seasonId, year }: Props) {
  const { licenses, supplements, groups } =
    await fetchClosedSeasonPrices(seasonId);

  const hasNothing =
    licenses.length === 0 && supplements.length === 0 && groups.length === 0;

  if (hasNothing) {
    return (
      <p className="py-8 text-center text-muted-foreground">
        En {year} no se llegó a poner precio a nada.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      {licenses.length > 0 && (
        <section className="space-y-2">
          <h2 className={SECTION_TITLE}>Licencias</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <DataHead>Federativa</DataHead>
                <DataHead>Modalidad</DataHead>
                <DataHead>Categoría</DataHead>
                <DataHead kind="number">Precio</DataHead>
                <DataHead kind="number">Contratadas</DataHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {licenses.map((license) => (
                <TableRow key={license.id} className={ROW}>
                  <DataCell>{license.type.name}</DataCell>
                  <DataCell>{license.subtype.name}</DataCell>
                  <DataCell>{license.category.name}</DataCell>
                  <DataCell kind="number">
                    {formatPrice(license.price)}
                  </DataCell>
                  <DataCell kind="number" className="text-muted-foreground">
                    {license._count.memberships}
                  </DataCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>
      )}

      <PricedList
        title="Suplementos"
        rows={supplements.map((price) => ({
          id: price.id,
          name: price.supplement.name,
          price: price.price,
        }))}
      />

      <PricedList
        title="Grupos de suplementos"
        rows={groups.map((price) => ({
          id: price.id,
          name: price.group.name,
          price: price.price,
        }))}
      />
    </div>
  );
}

type Row = {
  id: string;
  name: string;
  price: number;
};

function PricedList({ title, rows }: { title: string; rows: Row[] }) {
  if (rows.length === 0) return null;

  return (
    <section className="space-y-2">
      <h2 className={SECTION_TITLE}>{title}</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <DataHead>Nombre</DataHead>
            <DataHead kind="number">Precio</DataHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id} className={ROW}>
              <DataCell>{row.name}</DataCell>
              <DataCell kind="number">{formatPrice(row.price)}</DataCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </section>
  );
}
