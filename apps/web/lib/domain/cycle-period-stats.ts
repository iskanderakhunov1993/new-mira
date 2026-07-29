export type CyclePeriod = "3m" | "6m" | "12m" | "all";

type CompletedCycleLike = {
  completed: boolean;
  entries?: Array<{ date: string; pain?: number }>;
  length: number;
  periodDays: number;
  start: string;
};

const periodMonths: Record<Exclude<CyclePeriod, "all">, number> = {
  "3m": 3,
  "6m": 6,
  "12m": 12,
};

function cutoffDate(today: string, period: Exclude<CyclePeriod, "all">) {
  const date = new Date(`${today}T12:00:00Z`);
  date.setUTCMonth(date.getUTCMonth() - periodMonths[period]);
  return date.toISOString().slice(0, 10);
}

export function buildCyclePeriodStats<T extends CompletedCycleLike>(
  cycles: T[],
  period: CyclePeriod,
  today = new Date().toISOString().slice(0, 10),
) {
  const completed = cycles.filter((cycle) => cycle.completed && cycle.start <= today);
  const filtered = period === "all"
    ? completed
    : completed.filter((cycle) => cycle.start >= cutoffDate(today, period));
  const lengths = filtered.map((cycle) => cycle.length);
  const periodLengths = filtered.map((cycle) => cycle.periodDays).filter((value) => value > 0);
  const average = (values: number[]) => values.length
    ? Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10
    : undefined;

  return {
    cycles: filtered,
    averageCycleLength: average(lengths),
    averagePeriodLength: average(periodLengths),
    range: lengths.length ? { min: Math.min(...lengths), max: Math.max(...lengths) } : undefined,
    completedCount: filtered.length,
  };
}

export type CycleAttention = {
  cycleStart: string;
  text: string;
  title: string;
  type: "cycle-change" | "long-period" | "repeated-pain";
};

export function buildCycleReliability(completedCount: number) {
  if (completedCount >= 6) {
    return {
      label: "Более устойчивая картина",
      text: `Основано на ${completedCount} завершённых циклах`,
    };
  }
  if (completedCount >= 3) {
    return {
      label: "Первые наблюдения",
      text: `Основано на ${completedCount} завершённых циклах`,
    };
  }
  return {
    label: "Пока мало данных",
    text: `${completedCount} из 3 циклов для первого сравнения`,
  };
}

function consecutiveHighPain(entries: Array<{ date: string; pain?: number }>) {
  const dates = entries
    .filter((entry) => (entry.pain ?? 0) >= 7)
    .map((entry) => entry.date)
    .sort();
  return dates.some((date, index) => {
    if (!index) return false;
    const previous = new Date(`${dates[index - 1]}T12:00:00Z`);
    const current = new Date(`${date}T12:00:00Z`);
    return (current.getTime() - previous.getTime()) / 86_400_000 === 1;
  });
}

export function buildCycleAttention<T extends CompletedCycleLike>(cycles: T[]): CycleAttention | undefined {
  const recent = cycles.filter((cycle) => cycle.completed).slice(-4);
  const painCycle = [...recent].reverse().find((cycle) => consecutiveHighPain(cycle.entries ?? []));
  if (painCycle) {
    return {
      cycleStart: painCycle.start,
      type: "repeated-pain",
      title: "Сильная боль повторялась несколько дней",
      text: "В одном из циклов боль 7 из 10 или сильнее отмечалась два дня подряд. Если это повторяется или мешает обычной жизни, стоит обсудить записи с врачом.",
    };
  }

  const longPeriod = [...recent].reverse().find((cycle) => cycle.periodDays > 7);
  if (longPeriod) {
    return {
      cycleStart: longPeriod.start,
      type: "long-period",
      title: "Кровотечение отмечалось больше семи дней",
      text: `В цикле было отмечено ${longPeriod.periodDays} дней кровотечения. Mira показывает сохранённые факты — это не диагноз.`,
    };
  }

  if (recent.length < 4) return undefined;
  const latest = recent.at(-1)!;
  const baseline = recent.slice(0, -1);
  const average = baseline.reduce((sum, cycle) => sum + cycle.length, 0) / baseline.length;
  const difference = Math.abs(latest.length - average);
  if (difference < Math.max(4, average * 0.2)) return undefined;
  return {
    cycleStart: latest.start,
    type: "cycle-change",
    title: "Последний цикл заметно отличался от предыдущих",
    text: `${latest.length} дней против среднего ${Math.round(average)} дней в трёх предыдущих циклах. Если изменение повторится или вас что-то беспокоит, можно показать историю врачу.`,
  };
}
