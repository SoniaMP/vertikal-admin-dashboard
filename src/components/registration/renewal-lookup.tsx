"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { dniSchema } from "@/validations/registration";
import {
  findMemberByDni,
  type RenewalSearchResult,
} from "@/app/registro/actions";

type RenewalLookupProps = {
  onFound: (data: RenewalSearchResult) => void;
};

type LookupState = "idle" | "loading" | "not-found" | "error";

export function RenewalLookup({ onFound }: RenewalLookupProps) {
  const [dni, setDni] = useState("");
  const [state, setState] = useState<LookupState>("idle");

  const isDniValid = dniSchema.safeParse(dni).success;

  async function handleSearch() {
    if (!isDniValid) return;

    setState("loading");
    try {
      const result = await findMemberByDni(dni);
      if (result) {
        onFound(result);
      } else {
        setState("not-found");
      }
    } catch {
      setState("error");
    }
  }

  return (
    <Card>
      <CardContent className="space-y-6 pt-6">
        <div className="space-y-2">
          <Label htmlFor="renewal-dni">DNI del socio</Label>
          <Input
            id="renewal-dni"
            value={dni}
            onChange={(e) => {
              setDni(e.target.value.trim());
              if (state !== "idle" && state !== "loading") setState("idle");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && isDniValid) handleSearch();
            }}
          />
        </div>

        {state === "not-found" && (
          <p className="text-sm text-destructive">
            No se ha encontrado ningún registro con este DNI
          </p>
        )}

        {state === "error" && (
          <p className="text-sm text-destructive">
            Error al buscar el registro. Inténtalo de nuevo.
          </p>
        )}

        <div className="flex items-center justify-between">
          <Button variant="ghost" asChild>
            <Link href="/registro">
              <ArrowLeft className="mr-2 size-4" />
              Volver atrás
            </Link>
          </Button>
          <Button
            onClick={handleSearch}
            disabled={!isDniValid || state === "loading"}
          >
            {state === "loading" && (
              <Loader2 className="mr-2 size-4 animate-spin" />
            )}
            Siguiente
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
