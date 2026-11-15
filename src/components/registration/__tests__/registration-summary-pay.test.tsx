// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { FormProvider, useForm } from "react-hook-form";
import { RegistrationSummary } from "../registration-summary";
import type { LicenseCatalogType } from "@/types";
import type { RegistrationInput } from "@/validations/registration";

const MEMBERSHIP_FEE = 2000;
const PAY = "Proceder al pago";

const EMPTY_CATALOG: LicenseCatalogType[] = [];

function Harness({
  values,
  onSubmit,
}: {
  values: Partial<RegistrationInput>;
  onSubmit: () => void;
}) {
  const form = useForm<RegistrationInput>({ defaultValues: values });
  return (
    <FormProvider {...form}>
      <RegistrationSummary
        licenseTypes={EMPTY_CATALOG}
        membershipFee={MEMBERSHIP_FEE}
        onEdit={() => {}}
        onSubmit={onSubmit}
        isSubmitting={false}
      />
    </FormProvider>
  );
}

/** A member who federates elsewhere: the club fee alone is a valid total. */
const MEMBER_ONLY: Partial<RegistrationInput> = {
  firstName: "Ana",
  lastName: "Ruiz",
  hasClubLicense: false,
  supplementIds: [],
};

/** Asks for a club license the empty catalog cannot price. */
const UNPRICEABLE: Partial<RegistrationInput> = {
  ...MEMBER_ONLY,
  hasClubLicense: true,
  typeId: "gone",
  subtypeId: "gone",
  categoryId: "gone",
};

describe("RegistrationSummary paying", () => {
  it("says what is missing instead of greying out, and does not submit", () => {
    const onSubmit = vi.fn();
    render(<Harness values={MEMBER_ONLY} onSubmit={onSubmit} />);

    fireEvent.click(screen.getByRole("button", { name: PAY }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole("alert").textContent).toContain(
      "Política de Privacidad",
    );
  });

  it("puts the cursor on the box it is asking the member to tick", () => {
    render(<Harness values={MEMBER_ONLY} onSubmit={() => {}} />);

    fireEvent.click(screen.getByRole("button", { name: PAY }));

    expect(document.activeElement).toBe(screen.getByRole("checkbox"));
  });

  it("submits once the box is ticked, and drops the message", () => {
    const onSubmit = vi.fn();
    render(<Harness values={MEMBER_ONLY} onSubmit={onSubmit} />);

    fireEvent.click(screen.getByRole("button", { name: PAY }));
    fireEvent.click(screen.getByRole("checkbox"));

    expect(screen.queryByRole("alert")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: PAY }));
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it("refuses to pay a license it could not price, consent or not", () => {
    const onSubmit = vi.fn();
    render(<Harness values={UNPRICEABLE} onSubmit={onSubmit} />);

    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: PAY }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole("alert").textContent).toContain(
      "paso de licencia",
    );
    expect(
      screen.getByRole("button", { name: "Cambiar la licencia" }),
    ).toBeDefined();
  });

  it("shows no total at all when it cannot price the license", () => {
    render(<Harness values={UNPRICEABLE} onSubmit={() => {}} />);
    expect(screen.queryByText("Resumen de precio")).toBeNull();
  });
});
