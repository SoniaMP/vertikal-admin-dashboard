"use client";

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
  /** The group the supplement is in, or "" for none. */
  value: string;
  onValueChange: (groupId: string) => void;
};

/**
 * Picks the group a supplement belongs to, or none.
 *
 * Feeds the form through a hidden field, because a Radix Select is not a form
 * control. The choice is held by the caller so that the federation list can
 * react to it: a grouped supplement is offered where its group is.
 */
export function SupplementGroupPicker({
  groups,
  value,
  onValueChange,
}: Props) {
  if (groups.length === 0) return null;

  return (
    <div className="space-y-2">
      <Label>Grupo (opcional)</Label>
      <input type="hidden" name="supplementGroupId" value={value} />
      <Select
        value={value === "" ? NO_GROUP : value}
        onValueChange={(next) => onValueChange(next === NO_GROUP ? "" : next)}
      >
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
