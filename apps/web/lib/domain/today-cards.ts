import { addDays, dateDiff } from "./cycle-engine";
import type { CyclePhase } from "./cycle-phase";
import type { DomainEntry } from "./types";

export type TodayCard = {
  kind: "cycle" | "observation" | "action" | "article";
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  tone: "blue" | "pink" | "dark" | "article";
};

type TodayCardsInput = {
  entries: DomainEntry[];
  today: string;
  hasCycleData: boolean;
  cycleDay?: number;
  phase?: CyclePhase;
  delayed?: boolean;
  expectedStart?: string;
  uncertaintyDays?: number;
  periodActive?: boolean;
  periodDay?: number;
};

const phaseCopy: Record<CyclePhase, { label: string; href: string }> = {
  menstruation: { label: "Менструальная фаза", href: "/knowledge/daily-period-3" },
  follicular: { label: "Фолликулярная фаза", href: "/knowledge/cycle-basics-2" },
  "ovulation-window": { label: "Предполагаемая овуляторная фаза", href: "/knowledge/fertility-2" },
  luteal: { label: "Лютеиновая фаза", href: "/knowledge/pms-1" },
};

function hasCheckin(entry: DomainEntry) {
  return Boolean(entry.mood || entry.energy || typeof entry.pain === "number" || entry.symptoms?.length || entry.sleepHours !== undefined || entry.notes);
}

function recentCheckins(entries: DomainEntry[], today: string) {
  return entries.filter((entry) => {
    const age = dateDiff(entry.date, today);
    return age >= 0 && age <= 6 && hasCheckin(entry);
  });
}

function buildObservation(entries: DomainEntry[], today: string): TodayCard | undefined {
  const recent = recentCheckins(entries, today);
  if (recent.length < 3) return undefined;

  const symptoms = new Map<string, number>();
  recent.forEach((entry) => entry.symptoms?.forEach((symptom) => symptoms.set(symptom, (symptoms.get(symptom) ?? 0) + 1)));
  const frequent = [...symptoms.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0];
  if (frequent && frequent[1] >= 2) {
    return { kind: "observation", eyebrow: "Последние 7 дней", title: `${frequent[0]} — ${frequent[1]} раза`, description: `Основано на ${recent.length} отметках. Это наблюдение, а не причина симптома.`, href: "/insights", tone: "pink" };
  }

  const lowEnergyCount = recent.filter((entry) => entry.energy === "low").length;
  if (lowEnergyCount >= 2) {
    return { kind: "observation", eyebrow: "Последние 7 дней", title: `Мало энергии — ${lowEnergyCount} раза`, description: `Основано на ${recent.length} отметках. Продолжайте наблюдение, чтобы увидеть повторения.`, href: "/insights", tone: "pink" };
  }

  return { kind: "observation", eyebrow: "Последние 7 дней", title: `${recent.length} отметки о состоянии`, description: "Пока нет одного часто повторяющегося симптома.", href: "/insights", tone: "pink" };
}

function buildNextAction(input: TodayCardsInput): TodayCard | undefined {
  const todayEntry = input.entries.find((entry) => entry.date === input.today);
  if ((todayEntry?.pain ?? 0) >= 7) {
    return { kind: "action", eyebrow: "Важно проверить", title: "Важно проверить!", description: "Открыть проверку сильной боли.", href: "/concerns/pain", tone: "dark" };
  }
  if (todayEntry?.period === "heavy") {
    return { kind: "action", eyebrow: "Важно проверить", title: "Важно проверить!", description: "Открыть проверку обильных месячных.", href: "/concerns/heavy-flow", tone: "dark" };
  }
  if (input.delayed) {
    return { kind: "action", eyebrow: "Важно проверить", title: "Важно проверить!", description: "Открыть проверку задержки.", href: "/concerns/delay", tone: "dark" };
  }
  return undefined;
}

function buildArticle(phase?: CyclePhase): TodayCard {
  const article = phase ? phaseCopy[phase] : { label: "Четыре фазы цикла", href: "/knowledge/cycle-basics-2" };
  return { kind: "article", eyebrow: "Для прочтения", title: article.label, description: "Короткий образовательный материал без персональных медицинских выводов.", href: article.href, tone: "article" };
}

function formatForecastRange(expectedStart: string, uncertaintyDays: number) {
  const start = new Date(`${addDays(expectedStart, -uncertaintyDays)}T12:00:00Z`);
  const end = new Date(`${addDays(expectedStart, uncertaintyDays)}T12:00:00Z`);
  const day = new Intl.DateTimeFormat("ru-RU", { day: "numeric", timeZone: "UTC" });
  const dayMonth = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long", timeZone: "UTC" });
  return start.getUTCMonth() === end.getUTCMonth() ? `${day.format(start)}–${dayMonth.format(end)}` : `${dayMonth.format(start)} – ${dayMonth.format(end)}`;
}

function buildForecastCard(input: TodayCardsInput): TodayCard {
  if (!input.hasCycleData || !input.expectedStart) {
    return { kind: "cycle", eyebrow: "Ближайший прогноз", title: "Прогноз месячных", description: "Добавить дату и открыть", href: "/calendar?action=period", tone: "blue" };
  }
  if (input.periodActive) {
    return { kind: "cycle", eyebrow: "Ближайший прогноз", title: `Месячные: ${input.periodDay ?? 1}-й день`, description: "Открыть прогноз", href: "/calendar", tone: "blue" };
  }
  if (input.delayed) {
    return { kind: "cycle", eyebrow: "Ближайший прогноз", title: "Месячные пока не начались", description: "Открыть прогноз", href: "/calendar", tone: "blue" };
  }
  return { kind: "cycle", eyebrow: "Ближайший прогноз", title: `Месячные: ${formatForecastRange(input.expectedStart, input.uncertaintyDays ?? 3)}`, description: "Открыть прогноз", href: "/calendar", tone: "blue" };
}

export function buildTodayCards(input: TodayCardsInput): TodayCard[] {
  const observation = buildObservation(input.entries, input.today);
  const importantCheck = buildNextAction(input);
  return [buildForecastCard(input), ...(observation ? [observation] : []), ...(importantCheck ? [importantCheck] : []), buildArticle(input.phase)];
}
