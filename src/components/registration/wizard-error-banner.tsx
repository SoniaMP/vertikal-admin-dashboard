"use client";

import { useEffect, useRef, type ReactNode } from "react";

type WizardErrorBannerProps = {
  children: ReactNode;
};

/**
 * A blocking error the member has to read before they can do anything else.
 *
 * It sits above the form, and on a phone the summary is long enough that the
 * top of the form is nowhere near what the member is looking at when they tap
 * "Proceder al pago", so the banner brings itself into view on the way in.
 * `role="alert"` has it announced instead of painted silently.
 *
 * Scrolling once, on mount, is deliberate: the banner only exists while there
 * is an error, so a new one scrolls, and a re-render does not yank the page
 * away from whatever the member is doing about it.
 */
export function WizardErrorBanner({ children }: WizardErrorBannerProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // jsdom has no scrollIntoView, and neither do very old browsers.
    ref.current?.scrollIntoView?.({ behavior: "smooth", block: "center" });
  }, []);

  return (
    <div
      ref={ref}
      role="alert"
      className="mb-6 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive"
    >
      {children}
    </div>
  );
}
