"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toggleMembershipFederated } from "@/app/admin/(dashboard)/registros/membership-actions";
import { StatusPill } from "./status-pill";

type Props = {
  membershipId: string;
  isFederated: boolean;
};

export function FederatedToggle({ membershipId, isFederated }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleSelect(value: boolean) {
    if (value === isFederated) return;
    startTransition(async () => {
      await toggleMembershipFederated(membershipId, value);
    });
  }

  return (
    <Popover>
      {/* Not federating is a choice, not a fault: it reads as quiet text, and
          only the federated row carries a mark. A red block on every member
          who pays the cuota alone turned the column into a warning. */}
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={isPending}
          className={cn("cursor-pointer", isPending && "opacity-50")}
        >
          {isFederated ? (
            <StatusPill tone="positive">Federado</StatusPill>
          ) : (
            <span className="text-sm text-muted-foreground">No federado</span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-1" align="start">
        <div className="flex flex-col gap-0.5">
          <Button
            variant={isFederated ? "secondary" : "ghost"}
            size="sm"
            className="justify-start text-xs"
            onClick={() => handleSelect(true)}
          >
            Federado
          </Button>
          <Button
            variant={!isFederated ? "secondary" : "ghost"}
            size="sm"
            className="justify-start text-xs"
            onClick={() => handleSelect(false)}
          >
            No federado
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
