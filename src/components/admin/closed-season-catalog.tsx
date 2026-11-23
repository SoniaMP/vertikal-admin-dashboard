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
      <p className="rounded-lg border border-dashed py-16 text-center text-sm text-muted-foreground">
        En {year} no se llegó a poner precio a nada.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      {licenses.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-medium text-foreground">Licencias</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Federativa</TableHead>
                <TableHead>Modalidad</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead className="text-right">Precio</TableHead>
                <TableHead className="text-right">Contratadas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {licenses.map((license) => (
                <TableRow key={license.id}>
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
      <h2 className="text-sm font-medium text-foreground">{title}</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead className="text-right">Precio</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
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
