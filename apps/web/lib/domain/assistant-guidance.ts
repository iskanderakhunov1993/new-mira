import type { DomainEntry } from "./types";

export type AssistantGuidance = {
  eyebrow: string;
  title: string;
  message: string;
  actionLabel: string;
  href: string;
  tone: "calm" | "attention";
};

type AssistantEntry = DomainEntry & {
  periodHourlyChange?: boolean;
  periodLeak?: boolean;
  painImpact?: "none" | "some" | "strong";
};

export function buildAssistantGuidance(entries: AssistantEntry[], today: string): AssistantGuidance {
  const todayEntry = entries.find((entry) => entry.date === today);
  const latestEntry = [...entries].filter((entry) => entry.date <= today).sort((a, b) => b.date.localeCompare(a.date))[0];
  const source = todayEntry ?? latestEntry;

  if ((source?.pain ?? 0) >= 7 || source?.painImpact === "strong") {
    return {
      eyebrow: "Сначала проверим безопасность",
      title: "Вы отметили сильную боль",
      message: "Я не могу определить причину по одной записи. Ответьте на несколько коротких вопросов — Mira подскажет безопасный следующий шаг.",
      actionLabel: "Проверить боль",
      href: "/concerns/pain",
      tone: "attention",
    };
  }

  if (source?.period === "heavy" && (source.periodHourlyChange || source.periodLeak)) {
    return {
      eyebrow: "Важно уточнить",
      title: "Вы отметили обильные месячные",
      message: "Интенсивность лучше оценить по конкретным признакам. Это поможет понять, достаточно ли наблюдения или нужна медицинская оценка.",
      actionLabel: "Оценить кровотечение",
      href: "/concerns/heavy-flow",
      tone: "attention",
    };
  }

  const symptom = source?.symptoms?.find((item) => !["Всё в порядке", "Без изменений"].includes(item));
  if (symptom) {
    return {
      eyebrow: "По вашей последней отметке",
      title: `Вы отметили: ${symptom.toLowerCase()}`,
      message: "Одна отметка не показывает причину. Я помогу наблюдать, повторяется ли это в похожие дни цикла, и соберу факты для обсуждения с врачом.",
      actionLabel: "Посмотреть наблюдения",
      href: "/insights",
      tone: "calm",
    };
  }

  return {
    eyebrow: "Можно начать с вопроса",
    title: "Что вы хотите понять?",
    message: "Я использую только ваши записи Mira и проверенные сценарии приложения. Если данных мало, честно скажу об этом.",
    actionLabel: "Добавить самочувствие",
    href: "/diary?section=symptoms",
    tone: "calm",
  };
}
