// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { FormProvider, useForm } from "react-hook-form";
import { RegistrationSummary } from "../registration-summary";
import type { LicenseCatalogType } from "@/types";
import type { RegistrationInput } from "@/validations/registration";
import { usePrivacyConsent } from "@/hooks/use-privacy-consent";

const MEMBERSHIP_FEE = 2000;
const PAY = "Proceder al pago";
const POLICY = "Política de Privacidad";

/** The box only unlocks after the text has been opened, and Radix hides the
    page behind the dialog, so a tick needs both the open and the close. */
function privacyBox(): HTMLButtonElement {
  return screen.getByRole("checkbox") as HTMLButtonElement;
}

function readPolicy() {
  fireEvent.click(screen.getByRole("button", { name: POLICY }));
  fireEvent.click(screen.getByRole("button", { name: "Cerrar" }));
}

const EMPTY_CATALOG: LicenseCatalogType[] = [];

function Harness({
  values,
  onSubmit,
  onEdit = () => {},
  onBack = () => {},
}: {
  values: Partial<RegistrationInput>;
  onSubmit: () => void;
  onEdit?: (step: number) => void;
  onBack?: () => void;
}) {
  const form = useForm<RegistrationInput>({ defaultValues: values });
  const consent = usePrivacyConsent();
  return (
    <FormProvider {...form}>
      <RegistrationSummary
        licenseTypes={EMPTY_CATALOG}
        membershipFee={MEMBERSHIP_FEE}
        consent={consent}
        onEdit={onEdit}
        onBack={onBack}
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

  it("sends the member to the policy while the box cannot be ticked", () => {
    render(<Harness values={MEMBER_ONLY} onSubmit={() => {}} />);

    fireEvent.click(screen.getByRole("button", { name: PAY }));

    expect(privacyBox().disabled).toBe(true);
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: POLICY }),
    );
  });

  it("puts the cursor on the box once the policy has been read", () => {
    render(<Harness values={MEMBER_ONLY} onSubmit={() => {}} />);
    readPolicy();

    fireEvent.click(screen.getByRole("button", { name: PAY }));

    expect(document.activeElement).toBe(screen.getByRole("checkbox"));
  });

  it("submits once the box is ticked, and drops the message", () => {
    const onSubmit = vi.fn();
    render(<Harness values={MEMBER_ONLY} onSubmit={onSubmit} />);

    readPolicy();
    fireEvent.click(screen.getByRole("button", { name: PAY }));
    fireEvent.click(screen.getByRole("checkbox"));

    expect(screen.queryByRole("alert")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: PAY }));
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it("refuses to pay a license it could not price, consent or not", () => {
    const onSubmit = vi.fn();
    render(<Harness values={UNPRICEABLE} onSubmit={onSubmit} />);

    readPolicy();
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

describe("the privacy policy gate", () => {
  it("will not let the box be ticked before the policy is opened", () => {
    render(<Harness values={MEMBER_ONLY} onSubmit={() => {}} />);

    expect(privacyBox().disabled).toBe(true);

    fireEvent.click(privacyBox());
    expect(privacyBox().getAttribute("data-state")).toBe("unchecked");
  });

  it("explains why the box is off while it is off", () => {
    render(<Harness values={MEMBER_ONLY} onSubmit={() => {}} />);

    const hintId = privacyBox().getAttribute("aria-describedby");
    expect(hintId).not.toBeNull();
    expect(document.getElementById(hintId!)?.textContent).toContain(
      "Abre la Política de Privacidad",
    );
  });

  it("opens the box, and drops the explanation, once the text is read", () => {
    render(<Harness values={MEMBER_ONLY} onSubmit={() => {}} />);

    readPolicy();

    expect(privacyBox().disabled).toBe(false);
    expect(privacyBox().getAttribute("aria-describedby")).toBeNull();

    fireEvent.click(privacyBox());
    expect(privacyBox().getAttribute("data-state")).toBe("checked");
  });
});

describe('the summary\'s "Anterior"', () => {
  /**
   * It used to call `onEdit`, which pushes a history entry, while every other
   * step's "Anterior" pops one. Pressing both in turn bounced the member
   * between the summary and step three forever.
   */
  it("steps back instead of jumping, so the back button cannot loop", () => {
    const onBack = vi.fn();
    const onEdit = vi.fn();
    render(
      <Harness
        values={MEMBER_ONLY}
        onSubmit={() => {}}
        onBack={onBack}
        onEdit={onEdit}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Anterior" }));

    expect(onBack).toHaveBeenCalledTimes(1);
    expect(onEdit).not.toHaveBeenCalled();
  });
});
