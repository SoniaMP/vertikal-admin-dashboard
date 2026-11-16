import Link from "next/link";
import { UserPlus, RefreshCw } from "lucide-react";

/**
 * The two ways in are not equals: most people arriving here are new, and the
 * ones renewing already know which door is theirs. So the alta is the filled
 * block and the renovación takes the ground tone, rather than both sharing
 * the field tone and leaving the choice unweighted.
 */
const TONE_STYLES = {
  primary: {
    card: "bg-[var(--primary)] hover:bg-[var(--primary-hover)] focus-visible:outline-[var(--lime)]",
    icon: "text-[var(--lime)]",
    title: "text-white",
    description: "text-[var(--on-primary-muted)]",
  },
  secondary: {
    card: "bg-[var(--ground)] hover:bg-[var(--ground-hover)] focus-visible:outline-primary",
    icon: "text-primary",
    title: "text-primary",
    description: "text-[var(--on-ground-muted)]",
  },
} as const;

const OPTIONS = [
  {
    href: "/registro/alta",
    icon: UserPlus,
    title: "Alta nueva",
    description: "Quiero darme de alta como nuevo socio",
    tone: "primary",
  },
  {
    href: "/registro/renovacion",
    icon: RefreshCw,
    title: "Renovación",
    description: "Ya soy socio y quiero renovar mi registro",
    tone: "secondary",
  },
] as const;

export function RegistrationEntry() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {OPTIONS.map(({ href, icon: Icon, title, description, tone }) => {
        const style = TONE_STYLES[tone];

        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center gap-3 px-6 py-10 text-center transition-colors focus-visible:outline-3 ${style.card}`}
          >
            <Icon aria-hidden="true" className={`size-10 ${style.icon}`} />
            <h2 className={`text-xl font-semibold ${style.title}`}>{title}</h2>
            <p className={`max-w-[34ch] text-balance ${style.description}`}>
              {description}
            </p>
          </Link>
        );
      })}
    </div>
  );
}
