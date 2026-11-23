import { fetchClosedSeasonPrices } from "@/lib/closed-season-prices";
import { formatPrice } from "@/helpers/price-calculator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

/* 12px grey, no fill band, like every other table in the panel. */
const HEAD = "h-9 px-2 align-middle text-xs font-normal text-muted-foreground";
const HEAD_NUM = `${HEAD} text-right`;
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
                <TableHead className={HEAD}>Federativa</TableHead>
                <TableHead className={HEAD}>Modalidad</TableHead>
                <TableHead className={HEAD}>Categoría</TableHead>
                <TableHead className={HEAD_NUM}>Precio</TableHead>
                <TableHead className={HEAD_NUM}>Contratadas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {licenses.map((license) => (
                <TableRow key={license.id} className={ROW}>
                  <TableCell>{license.type.name}</TableCell>
                  <TableCell>{license.subtype.name}</TableCell>
                  <TableCell>{license.category.name}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatPrice(license.price)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">
                    {license._count.memberships}
                  </TableCell>
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
            <TableHead className={HEAD}>Nombre</TableHead>
            <TableHead className={HEAD_NUM}>Precio</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id} className={ROW}>
              <TableCell>{row.name}</TableCell>
              <TableCell className="text-right tabular-nums">
                {formatPrice(row.price)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </section>
  );
}
