export type InsightFeedItem = {
  basis: string;
  confidence: string;
  description: string;
  href: string;
  id: string;
  nextStep: string;
  tag: "Изменилось" | "Повторяется";
  title: string;
  tone: "attention" | "pattern";
};

type InsightFeedOptions = {
  attention?: {
    cycleStart: string;
    text: string;
    title: string;
  };
  completedCycles: number;
  pattern?: {
    dayRange: { min: number; max: number };
    evaluatedCycles: number;
    matchedCycles: number;
    name: string;
  };
};

export function buildInsightFeed(options: InsightFeedOptions): InsightFeedItem[] {
  const items: InsightFeedItem[] = [];

  if (options.attention) {
    items.push({
      id: `attention-${options.attention.cycleStart}`,
      tag: "Изменилось",
      tone: "attention",
      title: options.attention.title,
      description: options.attention.text,
      basis: "Основано на фактических отметках. Это не диагноз.",
      confidence: options.completedCycles >= 4
        ? "Сравнение выполнено по последним четырём завершённым циклам."
        : "Показан сохранённый факт без вывода о причине.",
      nextStep: "Откройте цикл, проверьте записи и при необходимости добавьте их в отчёт для врача.",
      href: `/analytics/cycles/${options.attention.cycleStart}`,
    });
  }

  if (options.pattern) {
    items.push({
      id: `pattern-${options.pattern.name}`,
      tag: "Повторяется",
      tone: "pattern",
      title: `Похоже, «${options.pattern.name}» повторяется`,
      description: `Вы отмечали этот симптом в ${options.pattern.matchedCycles} из ${options.pattern.evaluatedCycles} циклов — обычно на ${options.pattern.dayRange.min}–${options.pattern.dayRange.max}-й день.`,
      basis: `Основано на ${options.pattern.evaluatedCycles} завершённых циклах.`,
      confidence: `${options.pattern.matchedCycles} совпадения из ${options.pattern.evaluatedCycles} сопоставимых циклов.`,
      nextStep: "Посмотрите дни с отметками и продолжайте наблюдение. Повторение не определяет причину симптома.",
      href: `/insights/symptoms/${encodeURIComponent(options.pattern.name)}`,
    });
  }

  return items;
}
