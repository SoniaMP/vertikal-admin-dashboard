// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { useForm, FormProvider } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { SupplementSelector } from "../supplement-selector";
import { EMPTY_REGISTRATION_VALUES } from "@/helpers/empty-registration-values";
import type { RegistrationInput } from "@/validations/registration";
import type { SupplementSummary, SupplementGroupSummary } from "@/types";

const GROUP: SupplementGroupSummary = {
  id: "grp-1",
  name: "Espeleosocorristas",
  price: 3000,
};

function standalone(
  id: string,
  name: string,
  price: number | null,
  active = true,
): SupplementSummary {
  return {
    id,
    name,
    description: "",
    price,
    active,
    supplementGroupId: null,
    supplementGroup: null,
  };
}

function grouped(id: string, name: string, active = true): SupplementSummary {
  return {
    id,
    name,
    description: "",
    price: null,
    active,
    supplementGroupId: GROUP.id,
    supplementGroup: GROUP,
  };
}

function Harness({
  supplements,
  supplementGroups = [],
}: {
  supplements: SupplementSummary[];
  supplementGroups?: SupplementGroupSummary[];
}) {
  const form = useForm<RegistrationInput>({
    defaultValues: EMPTY_REGISTRATION_VALUES,
  });

  return (
    <FormProvider {...form}>
      <Form {...form}>
        <SupplementSelector
          supplements={supplements}
          supplementGroups={supplementGroups}
        />
      </Form>
    </FormProvider>
  );
}

describe("SupplementSelector", () => {
  it("shows nothing at all when the federation sells no extras", () => {
    const { container } = render(<Harness supplements={[]} />);

    // Not an empty heading either: the step should look as if extras did not
    // exist, because for this federation they do not. jest-dom is not set up
    // here, so the DOM is read directly.
    expect(container.innerHTML).toBe("");
  });

  it("disappears when every extra it was given is retired", () => {
    const { container } = render(
      <Harness supplements={[standalone("sup-1", "Tarjeta", 500, false)]} />,
    );

    expect(container.innerHTML).toBe("");
  });

  it("prices a standalone extra on its own line", () => {
    render(<Harness supplements={[standalone("sup-1", "Tarjeta", 500)]} />);

    expect(screen.getByText("Tarjeta")).toBeTruthy();
    expect(screen.getByText("+5,00 €")).toBeTruthy();
  });

  it("charges the group once instead of pricing its members", () => {
    render(
      <Harness
        supplements={[grouped("sup-1", "Rescate"), grouped("sup-2", "Seguro")]}
        supplementGroups={[GROUP]}
      />,
    );

    // One price for the box, and none beside either member: two ticks must not
    // read as two charges.
    expect(screen.getAllByText("+30,00 €")).toHaveLength(1);
    expect(screen.getByText("Precio único, elijas lo que elijas.")).toBeTruthy();
  });

  it("offers every member of the group as its own tick", () => {
    render(
      <Harness
        supplements={[grouped("sup-1", "Rescate"), grouped("sup-2", "Seguro")]}
        supplementGroups={[GROUP]}
      />,
    );

    expect(screen.getAllByRole("checkbox")).toHaveLength(2);
  });

  it("hides a group whose members are all retired", () => {
    render(
      <Harness
        supplements={[
          standalone("sup-1", "Tarjeta", 500),
          grouped("sup-2", "Rescate", false),
        ]}
        supplementGroups={[GROUP]}
      />,
    );

    expect(screen.queryByText("Espeleosocorristas")).toBeNull();
    expect(screen.getByText("Tarjeta")).toBeTruthy();
  });

  it("hides a group with no members in this federation", () => {
    render(
      <Harness
        supplements={[standalone("sup-1", "Tarjeta", 500)]}
        supplementGroups={[GROUP]}
      />,
    );

    expect(screen.queryByText("Espeleosocorristas")).toBeNull();
  });

  it("keeps a retired member out of a group that is still sold", () => {
    render(
      <Harness
        supplements={[grouped("sup-1", "Rescate"), grouped("sup-2", "Seguro", false)]}
        supplementGroups={[GROUP]}
      />,
    );

    expect(screen.getByText("Rescate")).toBeTruthy();
    expect(screen.queryByText("Seguro")).toBeNull();
  });

  it("ticks and unticks, so a changed mind does not pay twice", () => {
    render(<Harness supplements={[standalone("sup-1", "Tarjeta", 500)]} />);
    const checkbox = screen.getByRole("checkbox");

    expect(checkbox.getAttribute("aria-checked")).toBe("false");

    fireEvent.click(checkbox);
    expect(checkbox.getAttribute("aria-checked")).toBe("true");

    // The id has to leave the list again, not just the tick: the list is what
    // the checkout bills from.
    fireEvent.click(checkbox);
    expect(checkbox.getAttribute("aria-checked")).toBe("false");
  });

  it("keeps both ids when two extras are picked", () => {
    render(
      <Harness
        supplements={[
          standalone("sup-1", "Tarjeta", 500),
          standalone("sup-2", "Seguro", 900),
        ]}
      />,
    );
    const [first, second] = screen.getAllByRole("checkbox");

    fireEvent.click(first);
    fireEvent.click(second);

    expect(first.getAttribute("aria-checked")).toBe("true");
    expect(second.getAttribute("aria-checked")).toBe("true");
  });
});
