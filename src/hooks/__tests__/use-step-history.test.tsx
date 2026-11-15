// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useStepHistory } from "../use-step-history";

beforeEach(() => {
  window.history.replaceState(null, "");
});

describe("useStepHistory", () => {
  it("starts on the first step and records it", () => {
    const { result } = renderHook(() => useStepHistory(1));
    expect(result.current.step).toBe(1);
    expect(window.history.state.wizardStep).toBe(1);
  });

  it("pushes an entry for each step it moves to", () => {
    const { result } = renderHook(() => useStepHistory(1));
    const before = window.history.length;

    act(() => result.current.goTo(2));

    expect(result.current.step).toBe(2);
    expect(window.history.length).toBeGreaterThan(before);
  });

  // Next keeps its router state on the same entries, so clobbering it would
  // break client-side navigation everywhere else in the app.
  it("keeps whatever else was already on the history entry", () => {
    window.history.replaceState({ __NA: "next-internal" }, "");
    const { result } = renderHook(() => useStepHistory(1));

    act(() => result.current.goTo(3));

    expect(window.history.state.__NA).toBe("next-internal");
    expect(window.history.state.wizardStep).toBe(3);
  });

  it("follows the browser back to the step that entry carried", () => {
    const { result } = renderHook(() => useStepHistory(1));
    act(() => result.current.goTo(2));
    act(() => result.current.goTo(3));

    act(() => {
      window.dispatchEvent(new PopStateEvent("popstate", { state: { wizardStep: 2 } }));
    });

    expect(result.current.step).toBe(2);
  });

  it("falls back to the first step when an entry carries no step", () => {
    const { result } = renderHook(() => useStepHistory(1));
    act(() => result.current.goTo(4));

    act(() => {
      window.dispatchEvent(new PopStateEvent("popstate", { state: null }));
    });

    expect(result.current.step).toBe(1);
  });
});
