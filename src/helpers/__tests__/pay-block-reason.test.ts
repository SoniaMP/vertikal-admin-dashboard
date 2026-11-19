import { describe, it, expect } from "vitest";
import { payBlockReason } from "../pay-block-reason";

const READY = {
  hasTotal: true,
  hasOpenedPolicy: true,
  hasAcceptedPrivacy: true,
};

describe("payBlockReason", () => {
  it("lets a priced, consented registration through", () => {
    expect(payBlockReason(READY)).toBeNull();
  });

  it("asks for the privacy box and points at it", () => {
    const blocker = payBlockReason({ ...READY, hasAcceptedPrivacy: false });
    expect(blocker?.target).toBe("consent");
    expect(blocker?.message).toContain("Política de Privacidad");
  });

  it("refuses to charge when there is no total to charge", () => {
    const blocker = payBlockReason({ ...READY, hasTotal: false });
    expect(blocker?.target).toBe("license");
  });

  it("reports the missing total first: the member cannot fix it from here", () => {
    expect(
      payBlockReason({
        ...READY,
        hasTotal: false,
        hasAcceptedPrivacy: false,
      })?.target,
    ).toBe("license");
  });

  // The box is disabled until the policy has been opened, and `focus()` on a
  // disabled control does nothing, so this has to be its own target.
  it("points at the policy link while the policy is unread", () => {
    const blocker = payBlockReason({
      ...READY,
      hasOpenedPolicy: false,
      hasAcceptedPrivacy: false,
    });
    expect(blocker?.target).toBe("policy");
  });

  it("says the same sentence whether the policy is unread or unticked", () => {
    const unread = payBlockReason({
      ...READY,
      hasOpenedPolicy: false,
      hasAcceptedPrivacy: false,
    });
    const unticked = payBlockReason({ ...READY, hasAcceptedPrivacy: false });
    expect(unread?.message).toBe(unticked?.message);
  });

  it("still reports the missing total before the unread policy", () => {
    expect(
      payBlockReason({
        hasTotal: false,
        hasOpenedPolicy: false,
        hasAcceptedPrivacy: false,
      })?.target,
    ).toBe("license");
  });
});
