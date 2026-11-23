// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { useForm, FormProvider } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { MembershipModeStep } from "../membership-mode-step";
import { EMPTY_REGISTRATION_VALUES } from "@/helpers/empty-registration-values";
import type { RegistrationInput } from "@/validations/registration";

function Harness({ closed }: { closed: boolean }) {
  const form = useForm<RegistrationInput>({
    defaultValues: {
      ...EMPTY_REGISTRATION_VALUES,
      ...(closed ? { hasClubLicense: false } : {}),
    },
  });

  return (
    <FormProvider {...form}>
      <Form {...form}>
        <MembershipModeStep
          onNext={() => {}}
          onBack={() => {}}
          clubLicensesClosed={closed}
          seasonYear={2027}
        />
      </Form>
    </FormProvider>
  );
}

const CLUB_OPTION = "Quiero federarme con el Club Vertikal";
const EXTERNAL_OPTION = "Ya tengo licencia en vigor";

/** jest-dom is not set up here, so the attribute is read directly. */
function isDisabled(label: string): boolean {
  const radio = screen.getByRole("radio", { name: new RegExp(label) });
  return radio.hasAttribute("disabled");
}

describe("MembershipModeStep with nothing the club can sell", () => {
  it("still lets somebody federated elsewhere join", () => {
    render(<Harness closed />);

    expect(isDisabled(EXTERNAL_OPTION)).toBe(false);
  });

  it("takes the club's own licence off the table", () => {
    render(<Harness closed />);

    expect(isDisabled(CLUB_OPTION)).toBe(true);
  });

  it("names the season and says the alta is still open", () => {
    render(<Harness closed />);

    const notice = screen.getByText(/Todavía no se ha abierto el plazo/);
    expect(notice.textContent).toContain("2027");
    expect(notice.textContent).toContain("darte de alta como socio");
  });

  it("keeps saying what the club's own licence is while it is closed", () => {
    render(<Harness closed />);

    expect(screen.queryByText(/Tramitamos tu licencia/)).not.toBeNull();
    expect(screen.queryByText(/No disponible todavía/)).not.toBeNull();
  });

  it("offers both routes as usual once the season has prices", () => {
    render(<Harness closed={false} />);

    expect(isDisabled(CLUB_OPTION)).toBe(false);
    expect(isDisabled(EXTERNAL_OPTION)).toBe(false);
    expect(screen.queryByText(/Todavía no se ha abierto el plazo/)).toBeNull();
  });
});
