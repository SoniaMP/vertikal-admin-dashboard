"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RenewalDniForm } from "./renewal-dni-form";
import { RenewalCodeForm } from "./renewal-code-form";
import type { RenewalPrefill } from "@/lib/renewal-prefill";

type RenewalLookupProps = {
  onVerified: (prefill: RenewalPrefill) => void;
  onSkip: () => void;
};

export function RenewalLookup({ onVerified, onSkip }: RenewalLookupProps) {
  const [dniAwaitingCode, setDniAwaitingCode] = useState<string | null>(null);

  return (
    <Card>
      <CardContent className="space-y-6 pt-6">
        {dniAwaitingCode === null ? (
          <RenewalDniForm onCodeSent={setDniAwaitingCode} />
        ) : (
          <RenewalCodeForm
            dni={dniAwaitingCode}
            onVerified={onVerified}
            onRestart={() => setDniAwaitingCode(null)}
          />
        )}

        <Separator />

        {/* Nobody is ever stuck behind the code: recovering the stored data is
            a convenience, so losing the mail cannot cost a renewal. */}
        <Button variant="outline" onClick={onSkip} className="w-full">
          Continuar sin recuperar mis datos
        </Button>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <Button variant="ghost" asChild>
            <Link href="/registro">
              <ArrowLeft className="mr-2 size-4" />
              Volver atrás
            </Link>
          </Button>
          <Button variant="link" asChild>
            <Link href="/registro/alta">¿Aún no eres socio? Hacer alta</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
