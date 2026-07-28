import type { DomainEntry } from "./types";

export const MIRA_GOALS = [
  "understand",
  "pain",
  "heavy_flow",
  "medication",
  "doctor",
  "pms",
] as const;

export type MiraGoal = (typeof MIRA_GOALS)[number];

export type TodayPrimaryAction = {
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  actionLabel: string;
  tone: "default" | "attention";
};

type Input = {
  goal?: string;
  today: string;
  entries: DomainEntry[];
  delayed?: boolean;
};

const goalDefaults: Record<MiraGoal, TodayPrimaryAction> = {
  understand: {
    eyebrow: "Главное сегодня",
    title: "Добавьте короткую отметку",
    description: "Самочувствие, симптомы или настроение помогут Mira увидеть изменения со временем.",
    href: "/diary?section=symptoms",
    actionLabel: "Отметить состояние",
    tone: "default",
  },
  pain: {
    eyebrow: "Ваша цель · боль",
    title: "Как меняется боль сегодня?",
    description: "Отметьте силу и влияние боли, чтобы сравнить дни и подготовить факты для врача.",
    href: "/diary?section=symptoms",
    actionLabel: "Оценить боль",
    tone: "default",
  },
  heavy_flow: {
    eyebrow: "Ваша цель · кровотечение",
    title: "Отметьте интенсивность месячных",
    description: "Фактические отметки помогут увидеть длительность и изменения между циклами.",
    href: "/calendar?action=period",
    actionLabel: "Отметить месячные",
    tone: "default",
  },
  medication: {
    eyebrow: "Ваша цель · лекарства",
    title: "Запишите приём и эффект",
    description: "Mira сохранит время, причину и вашу оценку эффекта, но не назначает препараты.",
    href: "/diary?section=medication",
    actionLabel: "Записать приём",
    tone: "default",
  },
  doctor: {
    eyebrow: "Ваша цель · подготовка к врачу",
    title: "Добавьте факт в историю",
    description: "Сегодняшняя отметка попадёт в сводку только по вашему выбору.",
    href: "/diary?section=symptoms",
    actionLabel: "Добавить наблюдение",
    tone: "default",
  },
  pms: {
    eyebrow: "Ваша цель · ПМС",
    title: "Отметьте настроение и энергию",
    description: "Несколько регулярных отметок помогут осторожно сравнить дни разных циклов.",
    href: "/diary?section=mood",
    actionLabel: "Отметить самочувствие",
    tone: "default",
  },
};

function normalizeGoal(goal?: string): MiraGoal {
  return MIRA_GOALS.includes(goal as MiraGoal) ? goal as MiraGoal : "understand";
}

export function buildTodayPrimaryAction(input: Input): TodayPrimaryAction {
  const todayEntry = input.entries.find((entry) => entry.date === input.today);

  if ((todayEntry?.pain ?? 0) >= 7) {
    return {
      eyebrow: "Важно проверить",
      title: "Сегодня отмечена сильная боль",
      description: "Ответьте на несколько вопросов, чтобы понять, нужна ли срочная медицинская помощь.",
      href: "/concerns/pain",
      actionLabel: "Проверить состояние",
      tone: "attention",
    };
  }

  if (todayEntry?.period === "heavy" && (todayEntry.periodHourlyChange || todayEntry.periodLeak)) {
    return {
      eyebrow: "Важно проверить",
      title: "Есть признаки обильного кровотечения",
      description: "Проверьте сопутствующие признаки. Mira не назначает препараты и не ставит диагноз.",
      href: "/concerns/heavy-flow",
      actionLabel: "Проверить состояние",
      tone: "attention",
    };
  }

  if (input.delayed) {
    return {
      eyebrow: "Важно проверить",
      title: "Месячные пока не начались",
      description: "Проверьте возможные причины задержки и ситуации, когда стоит обратиться к врачу.",
      href: "/concerns/delay",
      actionLabel: "Открыть проверку",
      tone: "attention",
    };
  }

  const hasTodayEntry = Boolean(todayEntry && (
    todayEntry.period
    || typeof todayEntry.pain === "number"
    || todayEntry.symptoms?.length
    || todayEntry.mood
    || todayEntry.energy
    || todayEntry.medicationIntakes?.length
  ));

  if (hasTodayEntry) {
    return {
      eyebrow: "Отметка сохранена",
      title: "Сегодняшний контекст уже в истории",
      description: "Можно дополнить запись или посмотреть, что Mira заметила по вашим данным.",
      href: "/diary",
      actionLabel: "Дополнить запись",
      tone: "default",
    };
  }

  return goalDefaults[normalizeGoal(input.goal)];
}
