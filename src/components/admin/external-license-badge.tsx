"use client";

import { useTransition } from "react";
import { FileText, Check, Undo2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { verifyExternalLicense } from "@/app/admin/(dashboard)/registros/membership-actions";

type Props = {
  membershipId: string;
  fileUrl: string | null;
  verifiedAt: Date | null;
};

function formatVerifiedAt(date: Date): string {
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function ExternalLicenseBadge({
  membershipId,
  fileUrl,
  verifiedAt,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const isVerified = verifiedAt !== null;

  function handleVerify(value: boolean) {
    startTransition(async () => {
      await verifyExternalLicense(membershipId, value);
    });
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button type="button" disabled={isPending} className="cursor-pointer">
          <Badge
            className={cn(
              "text-white transition-opacity",
              isVerified
                ? "bg-green-600 hover:bg-green-700"
                : "bg-amber-600 hover:bg-amber-700",
              isPending && "opacity-50",
            )}
          >
            {isVerified ? "Externa ✓" : "Externa — por verificar"}
          </Badge>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-60 p-2" align="start">
        <p className="px-1 pb-1.5 text-xs text-muted-foreground">
          {isVerified
            ? `Verificada el ${formatVerifiedAt(verifiedAt)}`
            : "Licencia tramitada fuera del club"}
        </p>
        <div className="flex flex-col gap-0.5">
          {fileUrl && (
            <Button
              variant="ghost"
              size="sm"
              className="justify-start text-xs"
              asChild
            >
              <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                <FileText className="mr-1.5 size-3.5" />
                Ver el PDF
              </a>
            </Button>
          )}
          {isVerified ? (
            <Button
              variant="ghost"
              size="sm"
              className="justify-start text-xs"
              onClick={() => handleVerify(false)}
            >
              <Undo2 className="mr-1.5 size-3.5" />
              Quitar la verificación
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="justify-start text-xs"
              onClick={() => handleVerify(true)}
            >
              <Check className="mr-1.5 size-3.5" />
              Marcar como verificada
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
