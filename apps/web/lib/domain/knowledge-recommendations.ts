import type { CyclePhase } from "./cycle-phase";
import type { DomainEntry } from "./types";

export type KnowledgeRecommendation = {
  articleId: string;
  reason: string;
};

const phaseArticles: Record<CyclePhase, KnowledgeRecommendation> = {
  menstruation: { articleId: "daily-period-3", reason: "Для текущей фазы цикла" },
  follicular: { articleId: "cycle-basics-2", reason: "Для текущей фазы цикла" },
  "ovulation-window": { articleId: "discharge-2", reason: "Для текущей фазы цикла" },
  luteal: { articleId: "pms-1", reason: "Для текущей фазы цикла" },
};

const fallbackArticles: KnowledgeRecommendation[] = [
  { articleId: "cycle-basics-1", reason: "Полезно для начала" },
  { articleId: "cycle-basics-2", reason: "О цикле простыми словами" },
  { articleId: "daily-period-1", reason: "Практический материал" },
];

export function buildKnowledgeRecommendations(options: { entries: DomainEntry[]; today: string; phase?: CyclePhase }): KnowledgeRecommendation[] {
  const todayEntry = options.entries.find((entry) => entry.date === options.today);
  const symptoms = new Set(todayEntry?.symptoms ?? []);
  const result: KnowledgeRecommendation[] = [];
  const add = (item: KnowledgeRecommendation) => {
    if (!result.some((current) => current.articleId === item.articleId)) result.push(item);
  };

  if (todayEntry?.period === "heavy") add({ articleId: "flow-1", reason: "По сегодняшней отметке выделений" });
  if ((todayEntry?.pain ?? 0) > 0 || symptoms.has("Спазмы") || symptoms.has("Боль внизу живота")) add({ articleId: "relief-1", reason: "По сегодняшней отметке самочувствия" });
  if (options.phase) add(phaseArticles[options.phase]);
  if (todayEntry?.energy === "low" || symptoms.has("Усталость") || symptoms.has("Мало энергии")) add({ articleId: "relief-4", reason: "По сегодняшней отметке энергии" });
  if (symptoms.has("Головная боль") || symptoms.has("Тошнота")) add({ articleId: "relief-3", reason: "По сегодняшней отметке самочувствия" });
  if (symptoms.has("Раздражительность") || symptoms.has("Перепады настроения") || symptoms.has("Чувствительная грудь") || symptoms.has("Вздутие")) add({ articleId: "pms-3", reason: "По сегодняшней отметке симптомов" });

  fallbackArticles.forEach(add);
  return result.slice(0, 3);
}
