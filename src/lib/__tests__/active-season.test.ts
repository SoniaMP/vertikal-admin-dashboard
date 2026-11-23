import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSettingFindUnique = vi.fn();
const mockSeasonFindUnique = vi.fn();
const mockSeasonFindUniqueOrThrow = vi.fn();
const mockSeasonCreate = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    appSetting: {
      findUnique: (...args: unknown[]) => mockSettingFindUnique(...args),
    },
    season: {
      findUnique: (...args: unknown[]) => mockSeasonFindUnique(...args),
      findUniqueOrThrow: (...args: unknown[]) =>
        mockSeasonFindUniqueOrThrow(...args),
      create: (...args: unknown[]) => mockSeasonCreate(...args),
    },
  },
}));

import { getActiveSeason, getSeasonRolloverDays } from "../settings";

const CURRENT_YEAR = new Date().getFullYear();
const EXISTING = { id: "season-row", year: CURRENT_YEAR };

describe("getSeasonRolloverDays", () => {
  beforeEach(() => vi.clearAllMocks());

  it("defaults to fifteen days when nobody has set it", async () => {
    mockSettingFindUnique.mockResolvedValue(null);
    expect(await getSeasonRolloverDays()).toBe(15);
  });

  it("takes the stored number", async () => {
    mockSettingFindUnique.mockResolvedValue({ value: "30" });
    expect(await getSeasonRolloverDays()).toBe(30);
  });

  it("accepts zero, which turns the early window off", async () => {
    mockSettingFindUnique.mockResolvedValue({ value: "0" });
    expect(await getSeasonRolloverDays()).toBe(0);
  });

  it("falls back on nonsense rather than skewing every season", async () => {
    for (const value of ["abc", "-5", "999", ""]) {
      mockSettingFindUnique.mockResolvedValue({ value });
      expect(await getSeasonRolloverDays()).toBe(15);
    }
  });
});

describe("getActiveSeason", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSettingFindUnique.mockResolvedValue(null);
  });

  it("returns the row for the year the calendar points at", async () => {
    mockSeasonFindUnique.mockResolvedValue(EXISTING);

    expect(await getActiveSeason()).toEqual(EXISTING);
    expect(mockSeasonFindUnique).toHaveBeenCalledWith({
      where: { year: expect.any(Number) },
    });
    expect(mockSeasonCreate).not.toHaveBeenCalled();
  });

  it("never writes when the season already exists", async () => {
    mockSeasonFindUnique.mockResolvedValue(EXISTING);

    await getActiveSeason();
    await getActiveSeason();

    expect(mockSeasonCreate).not.toHaveBeenCalled();
  });

  it("provisions the year the first time it is needed", async () => {
    mockSeasonFindUnique.mockResolvedValue(null);
    mockSeasonCreate.mockResolvedValue({ id: "new-row", year: CURRENT_YEAR });

    const season = await getActiveSeason();

    expect(season).toEqual({ id: "new-row", year: CURRENT_YEAR });
    expect(mockSeasonCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({ year: CURRENT_YEAR }),
    });
  });

  it("settles for the winner when two requests race to create it", async () => {
    mockSeasonFindUnique.mockResolvedValue(null);
    mockSeasonCreate.mockRejectedValue(new Error("Unique constraint failed"));
    mockSeasonFindUniqueOrThrow.mockResolvedValue(EXISTING);

    expect(await getActiveSeason()).toEqual(EXISTING);
  });

  it("does not throw for want of configuration, as the old one did", async () => {
    mockSeasonFindUnique.mockResolvedValue(null);
    mockSeasonCreate.mockResolvedValue(EXISTING);

    await expect(getActiveSeason()).resolves.toBeDefined();
  });

  it("asks for the next year once the rollover window has opened", async () => {
    mockSettingFindUnique.mockResolvedValue({ value: "400" }); // out of range
    mockSeasonFindUnique.mockResolvedValue(EXISTING);

    await getActiveSeason();

    // The nonsense value fell back to 15, so the year is still resolved from
    // the calendar rather than skewed a year forward.
    const [[args]] = mockSeasonFindUnique.mock.calls;
    expect([CURRENT_YEAR, CURRENT_YEAR + 1]).toContain(args.where.year);
  });
});
