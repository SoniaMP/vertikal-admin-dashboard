"use client";

import { useCallback, useEffect, useState } from "react";

const STEP_KEY = "wizardStep";

function stepFromState(state: unknown, fallback: number): number {
  if (typeof state !== "object" || state === null) return fallback;
  const value = (state as Record<string, unknown>)[STEP_KEY];
  return typeof value === "number" ? value : fallback;
}

/**
 * Keeps the wizard's step in the browser's history, so the phone's back button
 * goes back one step instead of abandoning the form.
 *
 * Nothing goes into the URL and nothing is stored. Pushing an entry for the
 * same route leaves this component mounted, so the member's answers stay in
 * memory — that is what makes this free. A reload therefore starts at step
 * one, which is honest: there is nothing to resume.
 *
 * Every move pushes, forwards or backwards. Mixing a push with a
 * `history.back()` is what made the wizard loop: the summary's "Anterior"
 * pushed while the next screen's popped, so the two bounced off each other.
 * With one rule, the browser's back button always undoes the last move.
 *
 * Next keeps its own router state on the same history entries, so every write
 * preserves what is already there.
 */
export function useStepHistory(firstStep: number) {
  const [step, setStep] = useState(firstStep);

  useEffect(() => {
    window.history.replaceState(
      { ...window.history.state, [STEP_KEY]: firstStep },
      "",
    );
  }, [firstStep]);

  useEffect(() => {
    function handlePopState(event: PopStateEvent) {
      setStep(stepFromState(event.state, firstStep));
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [firstStep]);

  const goTo = useCallback((next: number) => {
    window.history.pushState(
      { ...window.history.state, [STEP_KEY]: next },
      "",
    );
    setStep(next);
  }, []);

  return { step, goTo };
}
