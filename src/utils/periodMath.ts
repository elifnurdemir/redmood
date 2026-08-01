import { addDays, eachDayOfInterval, subDays } from "date-fns";

export const DEFAULT_CYCLE_LENGTH = 28;
export const DEFAULT_PERIOD_DURATION = 5;
export const LUTEAL_PHASE_LENGTH = 12; // gün: yumurtlamadan bir sonraki regle kadar geçen ortalama süre
export const FERTILE_WINDOW_BEFORE_OVULATION = 4; // gün
export const PROJECTED_CYCLE_COUNT = 12;

export interface CustomDate {
  date: Date;
  emoji?: string;
  label?: string;
  type: "period" | "ovulation" | "fertile";
}

export interface PeriodEntry {
  startDate: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  duration: number;
}

export const getPeriodDays = (start: Date, duration: number): CustomDate[] => {
  const periodDays = eachDayOfInterval({
    start,
    end: addDays(start, Math.max(duration, 1) - 1),
  });

  return periodDays.map((date) => ({
    date,
    emoji: "🩸",
    label: "Regl Dönemi",
    type: "period" as const,
  }));
};

export const getOvulationAndFertilePeriod = (
  start: Date,
  cycleLength: number
): CustomDate[] => {
  const ovulationDay = addDays(start, cycleLength - LUTEAL_PHASE_LENGTH);
  const fertileStart = subDays(ovulationDay, FERTILE_WINDOW_BEFORE_OVULATION);

  const fertileDays = eachDayOfInterval({
    start: fertileStart,
    end: ovulationDay,
  });

  const customDates: CustomDate[] = [
    {
      date: ovulationDay,
      emoji: "🥚",
      label: "Yumurtlama Günü",
      type: "ovulation",
    },
    ...fertileDays.map((date) => ({
      date,
      emoji: "💗",
      label: "Doğurgan Dönem",
      type: "fertile" as const,
    })),
  ];

  return customDates;
};

export const computeAverageCycleLength = (
  periods: PeriodEntry[]
): number => {
  if (periods.length < 2) return DEFAULT_CYCLE_LENGTH;

  const sorted = [...periods].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  const gaps: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const days = Math.round(
      (new Date(sorted[i].startDate).getTime() -
        new Date(sorted[i - 1].startDate).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    if (days > 0) gaps.push(days);
  }

  if (!gaps.length) return DEFAULT_CYCLE_LENGTH;
  return Math.round(gaps.reduce((sum, g) => sum + g, 0) / gaps.length);
};

export const computeAverageDuration = (periods: PeriodEntry[]): number => {
  if (!periods.length) return DEFAULT_PERIOD_DURATION;
  const total = periods.reduce((sum, p) => sum + p.duration, 0);
  return Math.round(total / periods.length);
};

export const generateCustomDates = (
  latestStartDate: Date,
  duration: number,
  cycleLength: number,
  cycleCount: number = PROJECTED_CYCLE_COUNT
): CustomDate[] => {
  let dates: CustomDate[] = [
    ...getPeriodDays(latestStartDate, duration),
    ...getOvulationAndFertilePeriod(latestStartDate, cycleLength),
  ];

  for (let i = 1; i <= cycleCount; i++) {
    const nextCycleStart = addDays(latestStartDate, i * cycleLength);
    dates = [
      ...dates,
      ...getPeriodDays(nextCycleStart, duration),
      ...getOvulationAndFertilePeriod(nextCycleStart, cycleLength),
    ];
  }

  return dates;
};
