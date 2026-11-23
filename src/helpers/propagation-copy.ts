import type { PropagationScope } from "@/types/catalog-propagation";

type Input = {
  /** The row's kind with its Spanish article: "esta categoría", "este grupo". */
  entityLabel: string;
  name: string;
  years: number[];
  scope: PropagationScope;
  /** The state after the save. Only read when the scope is "state". */
  isActive: boolean;
};

export type PropagationCopy = {
  title: string;
  description: string;
  confirmLabel: string;
};

/**
 * The wording of the propagation question.
 *
 * Kept out of the component so the phrasing can be read and tested on its
 * own: it is the only thing standing between an admin and a change they did
 * not mean to make across several years.
 */
export function describePropagation({
  entityLabel,
  name,
  years,
  scope,
  isActive,
}: Input): PropagationCopy {
  const list = listYears(years);
  const alsoExists = `${capitalize(entityLabel)} «${name}» existe también en ${list}, de forma independiente.`;

  if (scope === "state") {
    const verb = isActive ? "Reactivar" : "Retirar";
    return {
      title: `¿${verb} también en ${list}?`,
      description: `${alsoExists} Allí sigue como estaba, y así se queda salvo que digas lo contrario.`,
      confirmLabel: `${verb} en ${list}`,
    };
  }

  return {
    title: `¿Aplicar el texto también en ${list}?`,
    description: `${alsoExists} Allí conserva su nombre y su descripción anteriores, y así se queda salvo que digas lo contrario.`,
    confirmLabel: `Aplicar en ${list}`,
  };
}

/** "2027", "2027 y 2028", "2027, 2028 y 2029". */
function listYears(years: number[]): string {
  if (years.length === 0) return "";
  if (years.length === 1) return String(years[0]);

  const last = years[years.length - 1];
  const rest = years.slice(0, -1).join(", ");
  return `${rest} y ${last}`;
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
