"use client";

import Link from "next/link";
import { ChevronRight, Info } from "lucide-react";
import type { SymptomPattern } from "@/lib/personalization";
import { formatCycleDate } from "@/lib/cycle-analytics";
import { SymptomIcon } from "@/lib/symptom-catalog";

function formatMarkCount(value: number) {
  const lastTwoDigits = value % 100;
  const lastDigit = value % 10;
  const word = lastTwoDigits >= 11 && lastTwoDigits <= 14
    ? "отметок"
    : lastDigit === 1
      ? "отметка"
      : lastDigit >= 2 && lastDigit <= 4
        ? "отметки"
        : "отметок";

  return `${value} ${word}`;
}

export function SymptomPatternCard({ pattern }: { pattern: SymptomPattern }) {
  const confidence = pattern.confidence === "strong" ? "Устойчивое повторение" : pattern.confidence === "moderate" ? "Повторяется" : "Первые признаки";
  const referenceCycle = pattern.cycles.at(-1)?.cycle;
  const cycleLength = referenceCycle?.length ?? 28;
  const periodDays = referenceCycle?.periodDays ?? 5;
  const windowStart = Math.max(1, Math.min(pattern.typicalDay - 4, Math.max(1, cycleLength - 9)));
  const visibleDays = Array.from({ length: Math.min(10, cycleLength) }, (_, index) => windowStart + index);
  const ovulationDay = Math.max(periodDays + 2, cycleLength - 14);
  const phaseForDay = (day: number) => day <= periodDays ? "period" : day === ovulationDay ? "ovulation" : Math.abs(day - ovulationDay) <= 2 ? "fertile" : "cycle";
  const hasSymptom = (day: number) => day >= pattern.dayRange.min && day <= pattern.dayRange.max;
  const detailHref = `/insights/symptoms/${encodeURIComponent(pattern.name)}`;

  return <article className="symptom-pattern-card">
    <header>
      <div className="symptom-pattern-title">
        <span><SymptomIcon label={pattern.name} /></span>
        <h3>{pattern.name}</h3>
      </div>
      <Info aria-label="Наблюдение основано только на ваших отметках" />
    </header>
    <div className="symptom-pattern-body">
      <p>Вы отмечали «{pattern.name.toLocaleLowerCase("ru-RU")}» в {pattern.matchedCycles} из {pattern.evaluatedCycles} циклов. Чаще всего — {pattern.phase}.</p>
      <div className="symptom-pattern-meta"><strong>{confidence}</strong><span>{formatMarkCount(pattern.occurrences)}</span></div>
      <div className="symptom-pattern-timeline" aria-label={`Обычно с ${pattern.dayRange.min} по ${pattern.dayRange.max} день цикла`}>
        <div className="symptom-pattern-timeline-row">
          <div className="symptom-pattern-cycle-label"><span>{referenceCycle ? formatCycleDate(referenceCycle.start) : "Последний"}</span><strong>Последний цикл</strong></div>
          <div className="symptom-pattern-track">
            <div className="symptom-pattern-day-numbers">{visibleDays.map((day) => <span key={day}>{day}</span>)}</div>
            <div className="symptom-pattern-days">{visibleDays.map((day) => <span className={`${phaseForDay(day)} ${hasSymptom(day) ? "has-symptom" : ""} ${day === pattern.typicalDay ? "is-typical" : ""}`} key={day} aria-label={day === pattern.typicalDay ? `${day}-й день — типичный день отметки` : `${day}-й день`}>{day === pattern.typicalDay && <SymptomIcon label={pattern.name} strokeWidth={2} />}</span>)}</div>
          </div>
        </div>
        <div className="symptom-pattern-legend"><span><i className="period" />Месячные</span><span><i className="fertile" />Фертильные дни</span><span><i className="ovulation" />Овуляция</span></div>
      </div>
      <Link href={detailHref}>Посмотреть наблюдение <ChevronRight /></Link>
    </div>
  </article>;
}
