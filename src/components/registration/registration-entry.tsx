import Link from "next/link";
import { UserPlus, RefreshCw } from "lucide-react";

const OPTIONS = [
  {
    href: "/registro/alta",
    icon: UserPlus,
    title: "Alta nueva",
    description: "Quiero darme de alta como nuevo socio",
  },
  {
    href: "/registro/renovacion",
    icon: RefreshCw,
    title: "Renovación",
    description: "Ya soy socio y quiero renovar mi registro",
  },
] as const;

/**
 * The two cards take the sheet's field tone, the same one the inputs use:
 * white on white left them defined by a hairline alone, and a shadow would
 * only be standing in for the tone step. Hovering goes one step further down,
 * to the ground.
 */
export function RegistrationEntry() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {OPTIONS.map(({ href, icon: Icon, title, description }) => (
        <Link
          key={href}
          href={href}
          className="flex flex-col items-center gap-3 bg-[var(--field)] px-6 py-10 text-center transition-colors hover:bg-[var(--ground)] focus-visible:outline-3 focus-visible:outline-primary"
        >
          <Icon aria-hidden="true" className="size-10 text-primary" />
          <h2 className="text-xl font-semibold text-primary">{title}</h2>
          <p className="max-w-[34ch] text-balance text-muted-foreground">
            {description}
          </p>
        </Link>
      ))}
    </div>
  );
}
