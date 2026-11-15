import { describe, it, expect } from "vitest";
import { autofillHints } from "../autofill-hints";

describe("autofillHints", () => {
  it("uses the standard token for each personal-data field", () => {
    expect(autofillHints("firstName").autoComplete).toBe("given-name");
    expect(autofillHints("email").autoComplete).toBe("email");
    expect(autofillHints("address").autoComplete).toBe("street-address");
  });

  it("maps a Spanish address to the right administrative levels", () => {
    expect(autofillHints("city").autoComplete).toBe("address-level2");
    expect(autofillHints("province").autoComplete).toBe("address-level1");
  });

  it("asks for a numeric keypad only where the value is digits", () => {
    expect(autofillHints("postalCode").inputMode).toBe("numeric");
    expect(autofillHints("firstName").inputMode).toBeUndefined();
  });

  it("turns autofill off for an identity document, which has no token", () => {
    expect(autofillHints("dni").autoComplete).toBe("off");
  });

  it("never leaves a field unset, so a browser cannot guess for us", () => {
    expect(autofillHints("somethingNew").autoComplete).toBe("off");
  });
});
