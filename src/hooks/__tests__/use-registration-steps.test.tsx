// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useForm, type DefaultValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRegistrationSteps } from "../use-registration-steps";
import {
  registrationSchema,
  type RegistrationInput,
} from "@/validations/registration";

const checkDni = vi.fn();
vi.mock("@/app/registro/actions", () => ({
  checkDni: (...args: unknown[]) => checkDni(...args),
}));

const EMPTY: DefaultValues<RegistrationInput> = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  dni: "",
  dateOfBirth: "",
  sex: "",
  address: "",
  city: "",
  postalCode: "",
  province: "",
  typeId: "",
  subtypeId: "",
  categoryId: "",
  supplementIds: [],
  externalLicenseLabel: "",
  externalLicenseFileUrl: "",
};

const VALID_PERSONAL_DATA = {
  firstName: "Juan",
  lastName: "García López",
  email: "juan@example.com",
  phone: "612345678",
  dni: "12345678Z",
  dateOfBirth: "1990-01-15",
  sex: "M",
  address: "Calle Mayor 10",
  city: "Murcia",
  postalCode: "30001",
  province: "Murcia",
};

function setup(defaultValues: Partial<RegistrationInput> = {}) {
  return renderHook(() => {
    const form = useForm<RegistrationInput>({
      resolver: zodResolver(registrationSchema),
      mode: "onTouched",
      defaultValues: { ...EMPTY, ...defaultValues },
    });
    return { form, steps: useRegistrationSteps({ form, mode: "new" }) };
  });
}

describe("useRegistrationSteps", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    checkDni.mockResolvedValue({ reason: undefined });
  });

  it("stays on the step when its fields are invalid", async () => {
    const { result } = setup();

    await act(async () => {
      await result.current.steps.goNext();
    });

    expect(result.current.steps.currentStep).toBe(1);
  });

  // Step one has eleven fields: without the focus jump the member presses the
  // button at the bottom and nothing visibly happens.
  it("asks RHF to focus the first field that failed", async () => {
    const { result } = setup();
    const trigger = vi.spyOn(result.current.form, "trigger");

    await act(async () => {
      await result.current.steps.goNext();
    });

    expect(trigger).toHaveBeenCalledWith(expect.anything(), {
      shouldFocus: true,
    });
  });

  // Neither a tapped radio nor the browser's autofill blurs a field, so without
  // this the red message survives the member fixing the value.
  it("touches the step fields when it fails, so later changes revalidate", async () => {
    const { result } = setup();

    expect(result.current.form.formState.touchedFields.firstName).toBeFalsy();

    await act(async () => {
      await result.current.steps.goNext();
    });

    expect(result.current.form.formState.touchedFields.firstName).toBe(true);
    expect(result.current.form.formState.touchedFields.sex).toBe(true);
  });

  // The personal data has to be valid for Zod to reach the license refinement:
  // `superRefine` never runs while the base object is still failing.
  it("touches the license branch actually shown on step 3", async () => {
    const { result } = setup({ ...VALID_PERSONAL_DATA, hasClubLicense: false });
    // Reading touchedFields is what subscribes RHF's formState proxy to it;
    // without this read the assertion below sees an empty object either way.
    expect(result.current.form.formState.touchedFields).toEqual({});
    act(() => result.current.steps.goToStep(3));

    await act(async () => {
      await result.current.steps.goNext();
    });

    const touched = result.current.form.formState.touchedFields;
    expect(touched.externalLicenseLabel).toBe(true);
    expect(touched.typeId).toBeFalsy();
  });

  it("leaves the fields untouched while the step still validates", async () => {
    const { result } = setup(VALID_PERSONAL_DATA);
    expect(result.current.form.formState.touchedFields).toEqual({});

    await act(async () => {
      await result.current.steps.goNext();
    });

    expect(result.current.steps.currentStep).toBe(2);
    expect(result.current.form.formState.touchedFields.firstName).toBeFalsy();
  });

  it("advances once the personal data is valid and the DNI is free", async () => {
    const { result } = setup(VALID_PERSONAL_DATA);

    await act(async () => {
      await result.current.steps.goNext();
    });

    expect(checkDni).toHaveBeenCalledWith("12345678Z");
    expect(result.current.steps.currentStep).toBe(2);
  });

  it("blocks the step when the DNI already has a membership", async () => {
    checkDni.mockResolvedValue({
      reason: "dni_existe_con_membresia_temporada",
    });
    const { result } = setup(VALID_PERSONAL_DATA);

    await act(async () => {
      await result.current.steps.goNext();
    });

    expect(result.current.steps.currentStep).toBe(1);
    expect(result.current.steps.error).not.toBeNull();
  });

  it("validates the club license fields on step 3 when buying through the club", async () => {
    const { result } = setup({ hasClubLicense: true });
    act(() => result.current.steps.goToStep(3));
    const trigger = vi.spyOn(result.current.form, "trigger");

    await act(async () => {
      await result.current.steps.goNext();
    });

    expect(trigger).toHaveBeenCalledWith(
      ["typeId", "subtypeId", "categoryId", "supplementIds"],
      { shouldFocus: true },
    );
  });

  it("validates the external license fields on step 3 when federating elsewhere", async () => {
    const { result } = setup({ hasClubLicense: false });
    act(() => result.current.steps.goToStep(3));
    const trigger = vi.spyOn(result.current.form, "trigger");

    await act(async () => {
      await result.current.steps.goNext();
    });

    expect(trigger).toHaveBeenCalledWith(
      ["externalLicenseLabel", "externalLicenseFileUrl"],
      { shouldFocus: true },
    );
  });
});
