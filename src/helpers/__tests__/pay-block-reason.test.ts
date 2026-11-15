import { describe, it, expect } from "vitest";
import { payBlockReason } from "../pay-block-reason";

describe("payBlockReason", () => {
  it("lets a priced, consented registration through", () => {
    expect(
      payBlockReason({ hasTotal: true, hasAcceptedPrivacy: true }),
    ).toBeNull();
  });

  it("asks for the privacy box and points at it", () => {
    const blocker = payBlockReason({
      hasTotal: true,
      hasAcceptedPrivacy: false,
    });
    expect(blocker?.target).toBe("consent");
    expect(blocker?.message).toContain("Política de Privacidad");
  });

  it("refuses to charge when there is no total to charge", () => {
    const blocker = payBlockReason({
      hasTotal: false,
      hasAcceptedPrivacy: true,
    });
    expect(blocker?.target).toBe("license");
  });

  it("reports the missing total first: the member cannot fix it from here", () => {
    expect(
      payBlockReason({ hasTotal: false, hasAcceptedPrivacy: false })?.target,
    ).toBe("license");
  });
});
