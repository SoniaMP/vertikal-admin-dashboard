"use client";

import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = Omit<ComponentProps<typeof Button>, "variant" | "size">;

/**
 * The one way a row offers an action: edit, retire, delete, preview.
 *
 * Every list in the panel had been deciding this for itself — three button
 * sizes, two icon sizes and a blue pencil in some places and a grey one in
 * others — so moving between members, federations, courses and the catalog
 * meant relearning the same four controls. The size and the tone are fixed
 * here and cannot be passed in, because the only reason they ever drifted is
 * that each call site was allowed to choose.
 *
 * Grey, not coloured, the bin included: the row is a list of options, and the
 * red belongs on the button that actually destroys something, inside the
 * confirmation. The icon takes its size from the button, so it is written
 * bare: <RowActionButton><Trash2 /></RowActionButton>.
 */
export function RowActionButton({ className, ...props }: Props) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn("text-muted-foreground hover:text-foreground", className)}
      {...props}
    />
  );
}
