import { dateDiff } from "./cycle-engine";
import type { DomainEntry } from "./types";

export type DailyRecommendation = {
  kind: "medication" | "supplement" | "water" | "movement" | "kit";
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  tone: "blue" | "mint" | "peach" | "lilac";
};

type Input = {
  entries: DomainEntry[];
  today: string;
  weightKg?: number;
};

export function buildDailyRecommendations(input: Input): DailyRecommendation[] {
  const todayEntry = input.entries.find((entry) => entry.date === input.today);
  const severeState = (todayEntry?.pain ?? 0) >= 7 || todayEntry?.period === "heavy";
  const result: DailyRecommendation[] = [];
  const pending = todayEntry?.medicationIntakes?.find((intake) => intake.effect === "pending");

  if (pending) {
    result.push({ kind: pending.reason === "supplement" ? "supplement" : "medication", eyebrow: "Ваши записи", title: `Оценить эффект: ${pending.name}`, description: "Дополните сохранённый приём фактической оценкой.", href: `/diary?section=medication&date=${input.today}`, tone: "blue" });
  } else if ((todayEntry?.pain ?? 0) > 0 && !severeState && !todayEntry?.medicationIntakes?.length) {
    result.push({ kind: "medication", eyebrow: "После отметки боли", title: "Записать принятый препарат", description: "Только если вы уже приняли привычный или назначенный препарат.", href: `/diary?section=medication&date=${input.today}`, tone: "blue" });
  } else {
    const recentPlan = input.entries
      .filter((entry) => { const age = dateDiff(entry.date, input.today); return age > 0 && age <= 7; })
      .flatMap((entry) => entry.medicationIntakes ?? [])
      .find((intake) => intake.prescribedByDoctor || intake.reason === "supplement");
    if (recentPlan) {
      result.push({ kind: recentPlan.reason === "supplement" ? "supplement" : "medication", eyebrow: recentPlan.reason === "supplement" ? "Ваши витамины и добавки" : "Ваш план", title: `Отметить сегодня: ${recentPlan.name}`, description: "Это напоминание по вашей прошлой записи, а не назначение Mira.", href: `/diary?section=medication&date=${input.today}`, tone: recentPlan.reason === "supplement" ? "peach" : "blue" });
    }
  }

  const target = input.weightKg ? Math.min(4500, Math.max(1200, Math.round((input.weightKg * 30) / 300) * 300)) : 1800;
  const water = todayEntry?.waterMl ?? 0;
  result.push({ kind: "water", eyebrow: "Вода", title: water ? `Отмечено ${(water / 1000).toLocaleString("ru-RU", { maximumFractionDigits: 1 })} л` : "Отметить воду", description: water ? `Личный ориентир в дневнике: ${(target / 1000).toLocaleString("ru-RU", { maximumFractionDigits: 1 })} л.` : "Сохраните фактическое количество в дневнике.", href: `/diary?section=symptoms&date=${input.today}`, tone: "mint" });

  result.push(severeState
    ? { kind: "movement", eyebrow: "Активность", title: "Сначала оцените самочувствие", description: "При сильной боли или обильном кровотечении Mira не предлагает нагрузку. Откройте проверку состояния.", href: todayEntry?.period === "heavy" ? "/concerns/heavy-flow" : "/concerns/pain", tone: "peach" }
    : { kind: "movement", eyebrow: "Активность", title: "Мягкое движение по самочувствию", description: "Можно отметить прогулку, растяжку или отдых без оценки результата как лечения.", href: `/diary?section=lifestyle&date=${input.today}`, tone: "peach" });

  result.push({ kind: "kit", eyebrow: "Личная аптечка", title: input.entries.some((entry) => entry.medicationIntakes?.length) ? "Проверить список препаратов" : "Добавить первый препарат", description: "Храните список фактических приёмов, дозировку и оценку эффекта в дневнике.", href: `/diary?section=medication&date=${input.today}`, tone: "lilac" });

  return result.slice(0, 4);
}
