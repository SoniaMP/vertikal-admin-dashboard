import { formatPrice } from "@/helpers/price-calculator";

type Props = {
  /** What it costs this season, in cents, or undefined when it has no price. */
  price: number | undefined;
};

/**
 * What an extra costs, as a figure to read rather than a field to edit.
 *
 * It used to be an input sitting in the row, which put the one number that
 * decides what a member is charged a stray keystroke away. It is changed in
 * the edit panel now, alongside the name and the federations it belongs with,
 * and saved by the same button.
 *
 * An extra with no price shows nothing here: the line below already says
 * "sin precio" as the reason it is not being sold, and a dash repeating it
 * would add a column of noise to every unpriced row.
 */
export function PriceReadout({ price }: Props) {
  if (price === undefined) return null;

  return (
    <span className="shrink-0 tabular-nums text-muted-foreground">
      {formatPrice(price)}
    </span>
  );
}
