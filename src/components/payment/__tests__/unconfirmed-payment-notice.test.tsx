// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { UnconfirmedPaymentNotice } from "../unconfirmed-payment-notice";
import { CLUB_CONTACT_EMAIL } from "@/helpers/club-contact";

function renderNotice() {
  render(
    <UnconfirmedPaymentNotice
      backHref="/cursos"
      backLabel="Volver a cursos"
      subject="No tengo la confirmación"
    />,
  );
}

describe("UnconfirmedPaymentNotice", () => {
  it("tells the member not to pay twice, which is the one wrong move here", () => {
    renderNotice();

    expect(screen.getByText("No vuelvas a pagar.")).toBeDefined();
  });

  it("names the address, so someone who just paid has a human to ask", () => {
    renderNotice();

    const link = screen.getByRole("link", { name: CLUB_CONTACT_EMAIL });
    expect(link.getAttribute("href")).toContain(`mailto:${CLUB_CONTACT_EMAIL}`);
  });

  it("keeps the way back where the caller put it", () => {
    renderNotice();

    const back = screen.getByRole("link", { name: "Volver a cursos" });
    expect(back.getAttribute("href")).toBe("/cursos");
  });
});
