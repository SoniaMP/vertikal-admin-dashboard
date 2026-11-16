// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { HelpFooter } from "../help-footer";
import { ClubContactLink } from "../club-contact-link";
import { CLUB_CONTACT_EMAIL } from "@/helpers/club-contact";

describe("HelpFooter", () => {
  it("gives the member an address to write to, not just an invitation", () => {
    render(<HelpFooter />);

    const link = screen.getByRole("link", { name: CLUB_CONTACT_EMAIL });
    expect(link.getAttribute("href")).toBe(`mailto:${CLUB_CONTACT_EMAIL}`);
  });
});

describe("ClubContactLink", () => {
  it("carries the subject so the volunteers can triage the inbox", () => {
    render(<ClubContactLink subject="Duda sobre un curso" />);

    const href = screen.getByRole("link").getAttribute("href");
    expect(href).toBe(
      `mailto:${CLUB_CONTACT_EMAIL}?subject=Duda%20sobre%20un%20curso`,
    );
  });

  it("omits the query string entirely when there is no subject", () => {
    render(<ClubContactLink />);

    expect(screen.getByRole("link").getAttribute("href")).not.toContain("?");
  });
});
