"use client";

import { useState, useTransition } from "react";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cloneSeasonPrices } from "@/app/admin/(dashboard)/tipos-federacion/actions/clone-season-prices";

type Props = {
  targetYear: number;
  sourceYears: number[];
  willOverwrite: boolean;
};

/**
 * Starts a year from another year's prices. Copying is the cheap part; the
 * dialog exists for the warning, because the copy replaces every price the
 * target year already had and there is no undo.
 */
export function ClonePricesButton({
  targetYear,
  sourceYears,
  willOverwrite,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [sourceYear, setSourceYear] = useState(String(sourceYears[0] ?? ""));
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (sourceYears.length === 0) return null;

  function handleClone() {
    setError(null);
    startTransition(async () => {
      const result = await cloneSeasonPrices(Number(sourceYear), targetYear);
      if (result.success) {
        setIsOpen(false);
        return;
      }
      setError(result.error ?? "No se pudieron clonar los precios.");
    });
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Copy className="h-4 w-4" />
          Clonar precios
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Clonar precios a {targetYear}</DialogTitle>
          <DialogDescription>
            {willOverwrite
              ? `Se reemplazarán todos los precios que ${targetYear} tiene ahora mismo. No se puede deshacer.`
              : `Se copiarán las licencias y los suplementos con sus precios. Después podrás ajustar los que cambien.`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="clone-source-year">Copiar desde</Label>
          <Select value={sourceYear} onValueChange={setSourceYear}>
            <SelectTrigger id="clone-source-year" className="w-40">
              <SelectValue placeholder="Temporada" />
            </SelectTrigger>
            <SelectContent>
              {sourceYears.map((year) => (
                <SelectItem key={year} value={String(year)}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button
            variant={willOverwrite ? "destructive" : "default"}
            onClick={handleClone}
            disabled={isPending}
          >
            {isPending ? "Clonando…" : `Clonar desde ${sourceYear}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
