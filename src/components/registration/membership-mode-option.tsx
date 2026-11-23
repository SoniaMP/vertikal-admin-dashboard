import { RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ModeOption = {
  value: string;
  title: string;
  description: string;
};

type MembershipModeOptionProps = {
  option: ModeOption;
  isSelected: boolean;
  /** True when this branch has nothing to sell and cannot be picked. */
  isClosed: boolean;
  /** One line saying why it cannot be picked, shown only when it is closed. */
  closedNote: string;
};

/**
 * One of the two ways into the alta, as a block whose whole surface is the
 * target.
 *
 * A closed branch is not faded out. Half opacity dropped its description to
 * about 2:1 against the sheet, which left the member unable to read what the
 * option even was. It takes the flow's field tone instead, keeps its own
 * description in a tone tinted from that ground, and says in one line why it
 * is not available.
 */
export function MembershipModeOption({
  option,
  isSelected,
  isClosed,
  closedNote,
}: MembershipModeOptionProps) {
  return (
    <label className={cn(isClosed ? "cursor-not-allowed" : "cursor-pointer")}>
      <Card
        className={cn(
          "transition-colors",
          isClosed && "border-transparent bg-[var(--field)]",
          isSelected && "border-primary ring-2 ring-primary/20",
          !isClosed && !isSelected && "hover:border-primary/50",
        )}
      >
        <CardContent className="flex items-start gap-3 p-4">
          <RadioGroupItem
            value={option.value}
            disabled={isClosed}
            className="mt-1"
          />
          <div className="flex-1">
            <span className="text-base font-bold">{option.title}</span>
            <p
              className={cn(
                "mt-1 text-sm font-normal",
                isClosed
                  ? "text-[var(--on-ground-muted)]"
                  : "text-muted-foreground",
              )}
            >
              {option.description}
            </p>
            {isClosed && (
              <p className="mt-1 text-sm font-semibold text-foreground">
                {closedNote}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </label>
  );
}
