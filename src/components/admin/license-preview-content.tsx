import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/helpers/price-calculator";
import type {
  LicenseTypePreview,
  SubtypePreview,
} from "@/helpers/license-preview";

type Props = {
  preview: LicenseTypePreview;
  seasonName: string;
};

export function LicensePreviewContent({ preview, seasonName }: Props) {
  const { readiness, subtypes, visibility } = preview;
  const visibleSubtypes = subtypes.filter((subtype) => subtype.isVisible);

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {visibility === "draft"
          ? `Lo que un socio podrá contratar en ${seasonName} cuando publiques esta federativa.`
          : `Lo que un socio puede contratar ahora mismo en ${seasonName}.`}{" "}
        Se listan todas las categorías de la temporada: las que no tengan
        precio no se podrán elegir.
      </p>

      {!readiness.canPublish && (
        <Warning>
          Ningún socio vería esta federativa: no tiene ningún precio
          configurado en la temporada activa.
        </Warning>
      )}

      {readiness.canPublish && visibleSubtypes.length < subtypes.length && (
        <Warning>
          {subtypes.length - visibleSubtypes.length} modalidad(es) no
          aparecerán porque no tienen ningún precio.
        </Warning>
      )}

      <div className="space-y-3">
        {subtypes.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Esta federativa no tiene modalidades activas.
          </p>
        )}
        {subtypes.map((subtype) => (
          <SubtypeBlock key={subtype.id} subtype={subtype} />
        ))}
      </div>

      <p className="border-t pt-3 text-xs text-muted-foreground">
        {readiness.sellableCount} combinación(es) con precio ·{" "}
        {readiness.gapCount} sin precio
      </p>
    </div>
  );
}

function Warning({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{children}</span>
    </div>
  );
}

function SubtypeBlock({ subtype }: { subtype: SubtypePreview }) {
  return (
    <div className="rounded-md border p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium">{subtype.name}</span>
        {!subtype.isVisible && <Badge variant="secondary">No se verá</Badge>}
        {subtype.isVisible && subtype.isDraft && (
          <Badge variant="outline">Borrador</Badge>
        )}
      </div>
      <ul className="mt-2 space-y-1 text-sm">
        {subtype.categories.length === 0 && (
          <li className="text-muted-foreground">No hay categorías activas.</li>
        )}
        {subtype.categories.map((category) => (
          <li key={category.id} className="flex justify-between gap-4">
            <span
              className={
                category.price === null ? "text-muted-foreground" : undefined
              }
            >
              {category.name}
            </span>
            <span
              className={
                category.price === null
                  ? "text-muted-foreground"
                  : "font-medium"
              }
            >
              {category.price === null
                ? `No disponible en ${subtype.name}`
                : formatPrice(category.price)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
