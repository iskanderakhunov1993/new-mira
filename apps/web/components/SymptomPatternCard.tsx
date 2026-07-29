"use client";

import Link from "next/link";
import { ChevronRight, Frown, Info } from "lucide-react";
import type { SymptomPattern } from "@/lib/personalization";

export function SymptomPatternCard({ pattern }: { pattern: SymptomPattern }) {
  const confidence = pattern.confidence === "strong" ? "Устойчивое повторение" : pattern.confidence === "moderate" ? "Повторяется" : "Первые признаки";
  const referenceCycle = pattern.cycles.at(-1)?.cycle;
  const cycleLength = referenceCycle?.length ?? 28;
  const periodDays = referenceCycle?.periodDays ?? 5;
  const windowStart = Math.max(1, Math.min(pattern.typicalDay - 4, Math.max(1, cycleLength - 9)));
  const visibleDays = Array.from({ length: Math.min(10, cycleLength) }, (_, index) => windowStart + index);
  const ovulationDay = Math.max(periodDays + 2, cycleLength - 14);
  const phaseForDay = (day: number) => day <= periodDays ? "period" : Math.abs(day - ovulationDay) <= 2 ? "fertile" : "cycle";
  const hasSymptom = (day: number) => day >= pattern.dayRange.min && day <= pattern.dayRange.max;
  const detailHref = `/insights/symptoms/${encodeURIComponent(pattern.name)}`;

  return <article className="symptom-pattern-card">
    <header>
      <div className="symptom-pattern-title">
        <span><Frown aria-hidden="true" /></span>
        <div><small>{confidence}</small><h3>{pattern.name}</h3></div>
      </div>
      <Info aria-label="Наблюдение основано только на ваших отметках" />
    </header>
    <p>Вы отмечали «{pattern.name.toLocaleLowerCase("ru-RU")}» в {pattern.matchedCycles} из {pattern.evaluatedCycles} циклов — обычно {pattern.phase}.</p>
    <div className="symptom-pattern-timeline" aria-label={`Обычно с ${pattern.dayRange.min} по ${pattern.dayRange.max} день цикла`}>
      <div className="symptom-pattern-day-numbers">{visibleDays.map((day) => <span key={day}>{day}</span>)}</div>
      <div className="symptom-pattern-days">{visibleDays.map((day) => <span className={`${phaseForDay(day)} ${hasSymptom(day) ? "has-symptom" : ""}`} key={day}>{hasSymptom(day) && <Frown aria-hidden="true" />}</span>)}</div>
      <div className="symptom-pattern-legend"><span><i className="period" />Месячные</span><span><i className="fertile" />Фертильные дни</span><span><i className="cycle" />Другие дни</span></div>
    </div>
    <div className="symptom-pattern-evidence"><span>{pattern.occurrences} отметок</span><span>{Math.round(pattern.recurrenceRate * 100)}% отслеженных циклов</span></div>
    <Link href={detailHref}>Посмотреть наблюдение <ChevronRight /></Link>
  </article>;
}
