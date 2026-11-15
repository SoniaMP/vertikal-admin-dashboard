import { describe, it, expect } from "vitest";
import { buildRegistrationSteps } from "../registration-steps";

describe("buildRegistrationSteps", () => {
  it("always has four steps, whichever license the member picks", () => {
    expect(buildRegistrationSteps(true)).toHaveLength(4);
    expect(buildRegistrationSteps(false)).toHaveLength(4);
    expect(buildRegistrationSteps(undefined)).toHaveLength(4);
  });

  it("renames step 3 for a member who federates elsewhere", () => {
    expect(buildRegistrationSteps(false)[2].label).toBe("Tu licencia");
    expect(buildRegistrationSteps(true)[2].label).toBe("Federativa");
  });
});
