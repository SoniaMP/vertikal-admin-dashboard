import { describe, it, expect } from "vitest";
import { buildAttentionNotices } from "../attention-notices";

const CONFIGURED = ["club@example.com"];

describe("buildAttentionNotices", () => {
  it("says nothing when everything is configured", () => {
    const notices = buildAttentionNotices({
      membershipRecipients: CONFIGURED,
      courseRecipients: CONFIGURED,
      courseCount: 3,
    });

    expect(notices).toEqual([]);
  });

  it("warns when nobody is told about new members", () => {
    const notices = buildAttentionNotices({
      membershipRecipients: [],
      courseRecipients: CONFIGURED,
      courseCount: 3,
    });

    expect(notices.map((n) => n.id)).toEqual(["membership-notifications"]);
  });

  it("warns about courses once the club has at least one", () => {
    const notices = buildAttentionNotices({
      membershipRecipients: CONFIGURED,
      courseRecipients: [],
      courseCount: 1,
    });

    expect(notices.map((n) => n.id)).toEqual(["course-notifications"]);
  });

  it("stays quiet about courses when the club runs none", () => {
    const notices = buildAttentionNotices({
      membershipRecipients: CONFIGURED,
      courseRecipients: [],
      courseCount: 0,
    });

    expect(notices).toEqual([]);
  });

  it("stacks both notices when both are missing", () => {
    const notices = buildAttentionNotices({
      membershipRecipients: [],
      courseRecipients: [],
      courseCount: 2,
    });

    expect(notices.map((n) => n.id)).toEqual([
      "membership-notifications",
      "course-notifications",
    ]);
  });

  it("points every notice at the settings screen", () => {
    const notices = buildAttentionNotices({
      membershipRecipients: [],
      courseRecipients: [],
      courseCount: 2,
    });

    expect(notices.every((n) => n.actionHref === "/admin/ajustes")).toBe(true);
  });
});
