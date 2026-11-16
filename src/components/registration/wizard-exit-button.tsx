import Link from "next/link";
import { ArrowLeft, House } from "lucide-react";
import { Button } from "@/components/ui/button";

export type WizardExit = {
  href: string;
  label: string;
  /**
   * "back" steps out of a form the member just opened; "restart" drops a
   * renewal that may already carry recovered data, so it gets the house
   * rather than an arrow, which would read as one step back.
   */
  kind: "back" | "restart";
};

const EXIT_ICONS = {
  back: ArrowLeft,
  restart: House,
} as const;

/**
 * The way out of the flow, in the slot the steps keep for going backwards.
 * It used to hang under the form as a loose centred link.
 */
export function WizardExitButton({ exit }: { exit: WizardExit }) {
  const Icon = EXIT_ICONS[exit.kind];

  return (
    <Button type="button" variant="outline" asChild>
      <Link href={exit.href}>
        <Icon aria-hidden="true" />
        {exit.label}
      </Link>
    </Button>
  );
}
