import Image from "next/image";

type AdminLoginBandProps = {
  /** Hidden when no season is configured; it is decoration, not data. */
  seasonLabel: string | null;
};

/**
 * The full-height field of colour beside the form, carrying the club's mark
 * in white and the one vertical line the public flow is built on. On a phone
 * it collapses into a strip above the form.
 */
export function AdminLoginBand({ seasonLabel }: AdminLoginBandProps) {
  return (
    <aside className="relative flex items-center gap-4 bg-primary px-5 py-7 md:flex-col md:items-stretch md:p-14 md:pb-12">
      <span
        aria-hidden="true"
        className="absolute inset-y-5 left-5 w-[3px] bg-[var(--lime)] md:inset-y-0 md:left-14"
      />

      <div className="pl-[18px] md:flex md:flex-1 md:items-center md:pl-8">
        {/* The mark is a dark-green PNG; the filter turns it white rather than
            carrying a second file for one screen. */}
        <Image
          src="/logo-vertical.png"
          alt="Club Vertikal"
          width={653}
          height={526}
          priority
          className="h-10 w-auto brightness-0 invert md:h-auto md:w-[280px]"
        />
      </div>

      {seasonLabel && (
        <p className="hidden pl-8 text-[13px] text-primary-foreground/70 md:block">
          {seasonLabel}
        </p>
      )}
    </aside>
  );
}
