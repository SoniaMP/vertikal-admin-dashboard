"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export type SelectableLicenseType = {
  id: string;
  name: string;
  active: boolean;
  publishedAt: Date | null;
};

type Props = {
  types: SelectableLicenseType[];
  /** The federations this extra is offered in today. */
  selectedTypeIds: string[];
};

function typeNote(type: SelectableLicenseType): string | null {
  if (!type.active) return "retirada";
  if (type.publishedAt === null) return "borrador";
  return null;
}

/**
 * Picks the federations an extra is offered in.
 *
 * Drafts are on the list on purpose: a season is configured before it is
 * published, and a link to a draft sells nothing until the federation itself
 * goes live. Retired ones stay too, so an admin can see what would come back.
 *
 * Feeds the form through hidden fields for the same reason the group picker
 * does: the checkbox is a Radix control, not a form control. Ticking nothing
 * is a valid answer — the extra is then sold nowhere.
 */
export function LicenseTypeChecklist({ types, selectedTypeIds }: Props) {
  const [selected, setSelected] = useState(new Set(selectedTypeIds));

  function toggle(typeId: string, isChecked: boolean): void {
    const next = new Set(selected);
    if (isChecked) next.add(typeId);
    else next.delete(typeId);
    setSelected(next);
  }

  if (types.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Este año todavía no tiene federativas, así que no hay dónde ofrecerlo.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <Label>Se ofrece en</Label>
      {[...selected].map((typeId) => (
        <input key={typeId} type="hidden" name="typeIds" value={typeId} />
      ))}
      <div className="grid gap-2">
        {types.map((type) => {
          const note = typeNote(type);

          return (
            <label
              key={type.id}
              className="flex items-center gap-2 text-sm font-normal"
            >
              <Checkbox
                checked={selected.has(type.id)}
                onCheckedChange={(checked) => toggle(type.id, checked === true)}
              />
              <span>{type.name}</span>
              {note && (
                <span className="text-xs text-muted-foreground">({note})</span>
              )}
            </label>
          );
        })}
      </div>
      {selected.size === 0 && (
        <p className="text-xs text-muted-foreground">
          Sin ninguna marcada no se ofrece en ningún sitio.
        </p>
      )}
    </div>
  );
}
