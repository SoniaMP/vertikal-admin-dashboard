"use client";

import { useState, useTransition } from "react";
import { Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MemberFormFields } from "./member-form-fields";
import { FederationCascadingSelects } from "./federation-cascading-selects";
import {
  createMemberWithMembership,
  searchByDni,
  type DniSearchResult,
} from "@/app/admin/(dashboard)/registros/create-member-actions";
import type { LicenseCatalogType } from "@/types";
import type { ActionResult } from "@/lib/actions";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  catalog: LicenseCatalogType[];
};

export function CreateMemberDialog({
  open,
  onOpenChange,
  catalog,
}: Props) {
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();
  const [dniQuery, setDniQuery] = useState("");
  const [prefill, setPrefill] = useState<NonNullable<DniSearchResult>>();
  const [isSearching, setIsSearching] = useState(false);
  const [formKey, setFormKey] = useState(0);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result: ActionResult = await createMemberWithMembership(
        { success: false },
        formData,
      );
      if (result.success) {
        onOpenChange(false);
      } else {
        setError(result.error);
      }
    });
  }

  async function handleDniSearch() {
    if (!dniQuery.trim()) return;
    setIsSearching(true);
    try {
      const result = await searchByDni(dniQuery.trim());
      if (result) {
        setPrefill(result);
        setFormKey((k) => k + 1);
      }
    } finally {
      setIsSearching(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nuevo miembro</DialogTitle>
        </DialogHeader>

        <div className="flex gap-2">
          <Input
            placeholder="Buscar por DNI..."
            value={dniQuery}
            onChange={(e) => setDniQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleDniSearch();
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleDniSearch}
            disabled={isSearching}
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" key={formKey}>
          <MemberFormFields defaults={prefill} />

          <FederationCascadingSelects
            catalog={catalog}
            defaultTypeId={prefill?.typeId}
            defaultSubtypeId={prefill?.subtypeId}
            defaultCategoryId={prefill?.categoryId}
          />

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creando..." : "Crear miembro"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
