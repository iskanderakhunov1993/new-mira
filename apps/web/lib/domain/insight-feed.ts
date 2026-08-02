import type { PatternConfidence } from "./symptom-pattern-engine";

export type InsightConfidenceLevel = PatternConfidence | "observed_change";

export type InsightFeedItem = {
  basis: string;
  confidenceLabel: string;
  confidenceLevel: InsightConfidenceLevel;
  cycleDayRange?: { min: number; max: number };
  description: string;
  href: string;
  id: string;
  nextStep: string;
  sample: { matchedCycles: number; evaluatedCycles: number };
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
    confidence: PatternConfidence;
    matchedCycles: number;
    name: string;
  };
};

const confidenceLabels: Record<PatternConfidence, string> = {
  first_signs: "Первые признаки повторения",
  moderate: "Повторение заметно",
  strong: "Устойчивое повторение",
};

function hashEvidence(value: string): string {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

export function buildVersionedInsightKey(prefix: "attention" | "pattern", evidence: unknown): string {
  return `${prefix}-${hashEvidence(JSON.stringify(evidence))}`;
}

export function buildInsightFeed(options: InsightFeedOptions): InsightFeedItem[] {
  const items: InsightFeedItem[] = [];

  if (options.attention) {
    items.push({
      id: buildVersionedInsightKey("attention", {
        ...options.attention,
        completedCycles: options.completedCycles,
      }),
      tag: "Изменилось",
      tone: "attention",
      title: options.attention.title,
      description: options.attention.text,
      basis: "Основано на фактических отметках. Это не диагноз.",
      confidenceLevel: "observed_change",
      confidenceLabel: "Заметное изменение",
      sample: {
        matchedCycles: Math.min(options.completedCycles, 4),
        evaluatedCycles: options.completedCycles,
      },
      nextStep: "Откройте цикл, проверьте записи и при необходимости добавьте их в отчёт для врача.",
      href: `/analytics/cycles/${options.attention.cycleStart}`,
    });
  }

  if (options.pattern) {
    items.push({
      id: buildVersionedInsightKey("pattern", options.pattern),
      tag: "Повторяется",
      tone: "pattern",
      title: `Похоже, «${options.pattern.name}» повторяется`,
      description: `Вы отмечали этот симптом в ${options.pattern.matchedCycles} из ${options.pattern.evaluatedCycles} циклов — обычно на ${options.pattern.dayRange.min}–${options.pattern.dayRange.max}-й день.`,
      basis: `Основано на ${options.pattern.evaluatedCycles} завершённых циклах.`,
      confidenceLevel: options.pattern.confidence,
      confidenceLabel: confidenceLabels[options.pattern.confidence],
      cycleDayRange: options.pattern.dayRange,
      sample: {
        matchedCycles: options.pattern.matchedCycles,
        evaluatedCycles: options.pattern.evaluatedCycles,
      },
      nextStep: "Посмотрите дни с отметками и продолжайте наблюдение. Повторение не определяет причину симптома.",
      href: `/insights/symptoms/${encodeURIComponent(options.pattern.name)}`,
    });
  }

  return items;
}
