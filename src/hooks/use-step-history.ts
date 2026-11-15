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

  /**
   * Handed to the browser rather than changing the step here: consuming the
   * entry we pushed is what keeps the two in step. Setting state directly
   * would leave a stale forward entry, and the back button would then need
   * two presses to do anything.
   */
  const goBack = useCallback(() => window.history.back(), []);

  return { step, goTo, goBack };
}
