import type { DomainEntry } from "./types";
import { summarizeEntry } from "./entry-summary";

export function buildCheckInResult(entry: DomainEntry, history: DomainEntry[]) {
  const summary = summarizeEntry(entry);
  const previous = history.filter((item) => item.date < entry.date).slice(-7);
  const averagePain = previous.filter((item) => typeof item.pain === "number").reduce((sum, item, _, rows) => sum + (item.pain ?? 0) / rows.length, 0);
  const strongPain = (entry.pain ?? 0) >= 7;
  const heavyFlow = entry.period === "heavy";
  const change = previous.length >= 3 && typeof entry.pain === "number" ? entry.pain > averagePain + 1 ? "Сегодня боль выше ваших недавних отметок." : "Боль близка к вашим недавним отметкам." : "Пока мало данных для сравнения с вашей обычной картиной.";
  return {
    title: summary.hasEntry ? "Отметка сохранена" : "Данных для результата пока нет",
    facts: summary.labels,
    change,
    influence: previous.length >= 3 ? "Mira будет сопоставлять состояние только с вашими фактическими отметками." : "Продолжайте отмечать состояние — первые осторожные сравнения появятся после нескольких дней.",
    next: strongPain || heavyFlow ? "Обратите внимание на самочувствие и при ухудшении обратитесь за медицинской помощью." : "Вернитесь завтра и добавьте короткую отметку.",
    attention: strongPain ? "Вы отметили сильную боль. Если она внезапная, усиливается или мешает обычным делам, стоит обратиться к врачу." : heavyFlow ? "Вы отметили обильные выделения. Если средство приходится менять каждый час несколько часов подряд или есть слабость и головокружение, нужна медицинская оценка." : undefined,
  };
}
