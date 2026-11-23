"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const NO_GROUP = "__none__";

type Props = {
  groups: { id: string; name: string }[];
  /** The group the supplement is in today, or null for a new one. */
  defaultGroupId: string | null;
};

/**
 * Picks the group a supplement belongs to, or none.
 *
 * Holds its own choice and feeds it to the form through a hidden field,
 * because a Radix Select is not a form control. It lives inside the dialog
 * content on purpose: that unmounts when the dialog closes, so the next time
 * it opens the choice starts from the row again instead of from the last edit.
 */
export function SupplementGroupPicker({ groups, defaultGroupId }: Props) {
  const [selected, setSelected] = useState(defaultGroupId ?? NO_GROUP);

  if (groups.length === 0) return null;

  return (
    <div className="space-y-2">
      <Label>Grupo (opcional)</Label>
      <input
        type="hidden"
        name="supplementGroupId"
        value={selected === NO_GROUP ? "" : selected}
      />
      <Select value={selected} onValueChange={setSelected}>
        <SelectTrigger>
          <SelectValue placeholder="Sin grupo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={NO_GROUP}>Sin grupo</SelectItem>
          {groups.map((group) => (
            <SelectItem key={group.id} value={group.id}>
              {group.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
