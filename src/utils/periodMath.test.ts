import { format } from "date-fns";
import { describe, expect, it } from "vitest";
import {
  computeAverageCycleLength,
  computeAverageDuration,
  DEFAULT_CYCLE_LENGTH,
  generateCustomDates,
  getOvulationAndFertilePeriod,
  getPeriodDays,
} from "./periodMath";

describe("getPeriodDays", () => {
  it("returns exactly `duration` days starting at start", () => {
    const start = new Date("2026-01-01");
    const days = getPeriodDays(start, 5);
    expect(days).toHaveLength(5);
    expect(format(days[0].date, "yyyy-MM-dd")).toBe("2026-01-01");
    expect(format(days[4].date, "yyyy-MM-dd")).toBe("2026-01-05");
  });

  it("treats non-positive duration as a single day", () => {
    const start = new Date("2026-01-01");
    expect(getPeriodDays(start, 0)).toHaveLength(1);
  });
});

describe("getOvulationAndFertilePeriod", () => {
  it("places ovulation 12 days before the next period for a 28-day cycle", () => {
    const start = new Date("2026-01-01");
    const results = getOvulationAndFertilePeriod(start, 28);
    const ovulation = results.find((r) => r.type === "ovulation");
    expect(ovulation && format(ovulation.date, "yyyy-MM-dd")).toBe(
      "2026-01-17"
    );
  });

  it("includes a 4-day fertile window ending on ovulation day", () => {
    const start = new Date("2026-01-01");
    const results = getOvulationAndFertilePeriod(start, 28);
    const fertileDays = results.filter((r) => r.type === "fertile");
    expect(fertileDays).toHaveLength(5); // 4 gün öncesi + yumurtlama günü dahil
  });
});

describe("generateCustomDates", () => {
  it("projects distinct cycles cycleLength days apart, not fixed at 28", () => {
    const start = new Date("2026-01-01");
    const dates = generateCustomDates(start, 5, 30, 2);
    const periodStarts = dates
      .filter((d) => d.type === "period")
      .map((d) => format(d.date, "yyyy-MM-dd"))
      .filter((_, i) => i % 5 === 0); // her döngünün ilk günü (duration=5)

    expect(periodStarts).toContain("2026-01-01");
    expect(periodStarts).toContain("2026-01-31"); // start + 30 gün
    expect(periodStarts).toContain("2026-03-02"); // start + 60 gün
  });
});

describe("computeAverageCycleLength", () => {
  it("falls back to the default when fewer than 2 periods exist", () => {
    expect(computeAverageCycleLength([])).toBe(DEFAULT_CYCLE_LENGTH);
    expect(
      computeAverageCycleLength([{ startDate: "2026-01-01", duration: 5 }])
    ).toBe(DEFAULT_CYCLE_LENGTH);
  });

  it("averages the gaps between consecutive period start dates", () => {
    const periods = [
      { startDate: "2026-01-01", duration: 5 },
      { startDate: "2026-01-29", duration: 5 }, // 28 gün sonra
      { startDate: "2026-02-28", duration: 5 }, // 30 gün sonra
    ];
    expect(computeAverageCycleLength(periods)).toBe(29);
  });
});

describe("computeAverageDuration", () => {
  it("averages recorded durations", () => {
    const periods = [
      { startDate: "2026-01-01", duration: 4 },
      { startDate: "2026-01-29", duration: 6 },
    ];
    expect(computeAverageDuration(periods)).toBe(5);
  });
});
