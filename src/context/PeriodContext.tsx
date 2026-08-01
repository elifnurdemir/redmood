import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  computeAverageCycleLength,
  computeAverageDuration,
  DEFAULT_PERIOD_DURATION,
  PeriodEntry,
} from "../utils/periodMath";

export interface MoodEntry {
  date: string; // YYYY-MM-DD
  mood: string;
}

const PERIODS_STORAGE_KEY = "redmood.periods";
const MOODS_STORAGE_KEY = "redmood.moods";
const LEGACY_STORAGE_KEY = "period";

const safeReadJSON = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
};

const safeWriteJSON = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage kotası dolu ya da kullanılamıyor olabilir (ör. gizli sekme) — sessizce yok say
  }
};

const migrateLegacyPeriod = (): PeriodEntry[] => {
  try {
    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!legacy) return [];
    const parsed = JSON.parse(legacy);
    if (!parsed?.startDate || !parsed?.duration) return [];
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    return [{ startDate: parsed.startDate, duration: parsed.duration }];
  } catch {
    return [];
  }
};

interface PeriodContextValue {
  periods: PeriodEntry[];
  moods: MoodEntry[];
  latestPeriod: PeriodEntry | null;
  averageCycleLength: number;
  averageDuration: number;
  addPeriodStart: (startDate: string, duration: number) => void;
  endPeriod: (endDate: string) => void;
  addMood: (date: string, mood: string) => void;
  clearAll: () => void;
}

const PeriodContext = createContext<PeriodContextValue | null>(null);

export const PeriodProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [periods, setPeriods] = useState<PeriodEntry[]>(() => {
    const migrated = migrateLegacyPeriod();
    if (migrated.length) {
      safeWriteJSON(PERIODS_STORAGE_KEY, migrated);
      return migrated;
    }
    return safeReadJSON<PeriodEntry[]>(PERIODS_STORAGE_KEY, []);
  });

  const [moods, setMoods] = useState<MoodEntry[]>(() =>
    safeReadJSON<MoodEntry[]>(MOODS_STORAGE_KEY, [])
  );

  useEffect(() => {
    safeWriteJSON(PERIODS_STORAGE_KEY, periods);
  }, [periods]);

  useEffect(() => {
    safeWriteJSON(MOODS_STORAGE_KEY, moods);
  }, [moods]);

  const addPeriodStart = useCallback((startDate: string, duration: number) => {
    setPeriods((prev) => {
      const withoutSameDay = prev.filter((p) => p.startDate !== startDate);
      return [...withoutSameDay, { startDate, duration }].sort(
        (a, b) =>
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      );
    });
  }, []);

  const endPeriod = useCallback((endDate: string) => {
    setPeriods((prev) => {
      if (!prev.length) return prev;
      const sorted = [...prev].sort(
        (a, b) =>
          new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      );
      const [latest, ...rest] = sorted;
      const duration =
        Math.round(
          (new Date(endDate).getTime() - new Date(latest.startDate).getTime()) /
            (1000 * 60 * 60 * 24)
        ) + 1;
      const updatedLatest = {
        ...latest,
        endDate,
        duration: duration > 0 ? duration : latest.duration,
      };
      return [updatedLatest, ...rest].sort(
        (a, b) =>
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      );
    });
  }, []);

  const addMood = useCallback((date: string, mood: string) => {
    setMoods((prev) => [...prev.filter((m) => m.date !== date), { date, mood }]);
  }, []);

  const clearAll = useCallback(() => {
    setPeriods([]);
    setMoods([]);
  }, []);

  const latestPeriod = useMemo(() => {
    if (!periods.length) return null;
    return [...periods].sort(
      (a, b) =>
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    )[0];
  }, [periods]);

  const averageCycleLength = useMemo(
    () => computeAverageCycleLength(periods),
    [periods]
  );

  const averageDuration = useMemo(
    () =>
      periods.length ? computeAverageDuration(periods) : DEFAULT_PERIOD_DURATION,
    [periods]
  );

  const value = useMemo(
    () => ({
      periods,
      moods,
      latestPeriod,
      averageCycleLength,
      averageDuration,
      addPeriodStart,
      endPeriod,
      addMood,
      clearAll,
    }),
    [
      periods,
      moods,
      latestPeriod,
      averageCycleLength,
      averageDuration,
      addPeriodStart,
      endPeriod,
      addMood,
      clearAll,
    ]
  );

  return (
    <PeriodContext.Provider value={value}>{children}</PeriodContext.Provider>
  );
};

export const usePeriodContext = (): PeriodContextValue => {
  const ctx = useContext(PeriodContext);
  if (!ctx) {
    throw new Error("usePeriodContext must be used within a PeriodProvider");
  }
  return ctx;
};
