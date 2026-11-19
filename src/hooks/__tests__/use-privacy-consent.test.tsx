// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { usePrivacyConsent } from "../use-privacy-consent";

describe("usePrivacyConsent", () => {
  it("starts with nothing read and nothing accepted", () => {
    const { result } = renderHook(() => usePrivacyConsent());

    expect(result.current.hasOpenedPolicy).toBe(false);
    expect(result.current.isChecked).toBe(false);
  });

  it("records the policy as read once it has been opened", () => {
    const { result } = renderHook(() => usePrivacyConsent());

    act(() => result.current.markPolicyOpened());

    expect(result.current.hasOpenedPolicy).toBe(true);
  });

  // Closing the dialog does not unread the text, and a second opening must
  // not re-lock a box the member already ticked.
  it("never goes back to unread", () => {
    const { result } = renderHook(() => usePrivacyConsent());

    act(() => result.current.markPolicyOpened());
    act(() => result.current.markPolicyOpened());

    expect(result.current.hasOpenedPolicy).toBe(true);
  });

  it("takes the tick and gives it back", () => {
    const { result } = renderHook(() => usePrivacyConsent());

    act(() => result.current.accept(true));
    expect(result.current.isChecked).toBe(true);

    act(() => result.current.accept(false));
    expect(result.current.isChecked).toBe(false);
  });

  // The whole reason the state sits in the wizard: the summary that draws it
  // unmounts on every trip back to an earlier step.
  it("keeps both halves while the wizard stays mounted", () => {
    const { result, rerender } = renderHook(() => usePrivacyConsent());

    act(() => result.current.markPolicyOpened());
    act(() => result.current.accept(true));

    rerender();

    expect(result.current.hasOpenedPolicy).toBe(true);
    expect(result.current.isChecked).toBe(true);
  });
});
