"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, ArrowRight, LoaderCircle, ShieldAlert } from "lucide-react";
import { saveAssessment } from "@/lib/demo-session";
import type { AssessmentAnswers, AssessmentType, DelayAnswers, DischargeAnswers, HeavyFlowAnswers, PainAnswers, PostcoitalAnswers, WeaknessAnswers } from "@/lib/domain/assessment";

const today = () => new Date().toISOString().slice(0, 10);
const commonDefault = { lifeImpact: "none" as const, lifeEffects: [] };
const delayDefault: DelayAnswers = { ...commonDefault, delayedDays: 1, pregnancyPossible: false, pregnancyTest: "unknown", pain: 0, unusualBleeding: false, faintOrDizzy: false, shoulderPain: false, factors: [] };
const painDefault: PainAnswers = { ...commonDefault, intensity: 0, locations: ["lower_abdomen"], duration: "hours", pattern: "constant", impact: "none", worsening: false, faintOrDizzy: false, feverOrVomiting: false, pregnancyPossible: false, unusualBleeding: false, actions: [] };
const heavyDefault: HeavyFlowAnswers = { ...commonDefault, heavierThanUsual: false, changeFrequency: "four_plus_hours", nightChanges: false, leaks: false, clots: false, durationDays: 1, weakOrDizzy: false, pain: 0, pregnancyPossible: false };
const dischargeDefault: DischargeAnswers = { ...commonDefault, changes: [], itchOrSore: false, burningUrination: false, pelvicPain: 0, fever: false, unusualBleeding: false, pregnancyPossible: false, faintOrDizzy: false };
const postcoitalDefault: PostcoitalAnswers = { ...commonDefault, pain: 0, painTiming: [], bleeding: "none", dryness: false, dischargeOrBurning: false, pregnancyPossible: false, faintOrDizzy: false };
const weaknessDefault: WeaknessAnswers = { ...commonDefault, severity: "mild", dizzy: false, fainted: false, shortOfBreath: false, racingHeart: false, heavyBleeding: false, pain: 0, pregnancyPossible: false, unusualBleeding: false };

const meta = {
  delay: { eyebrow: "Цикл", title: "Месячные не начались", text: "Сравним отклонение с прогнозом и проверим признаки, требующие внимания." },
  pain: { eyebrow: "Самочувствие", title: "Расскажите о боли", text: "Mira сохранит факты и предложит безопасный следующий шаг без диагноза." },
  heavy_flow: { eyebrow: "Месячные", title: "Обильные выделения", text: "Отметьте отличие от вашей обычной картины и сопутствующие симптомы." },
  discharge: { eyebrow: "Интимное здоровье", title: "Что изменилось?", text: "Опишите только заметные изменения. По ответам нельзя определить причину без осмотра и анализов." },
  postcoital: { eyebrow: "Интимное здоровье", title: "После секса", text: "Отметьте боль, кровотечение и другие изменения. Эти данные сохраняются как чувствительные." },
  weakness: { eyebrow: "Самочувствие", title: "Слабость или головокружение", text: "Проверим сочетание с кровотечением, болью и другими признаками." },
} as const;

function defaultAnswers(type: AssessmentType): AssessmentAnswers {
  if (type === "delay") return delayDefault;
  if (type === "pain") return painDefault;
  if (type === "heavy_flow") return heavyDefault;
  if (type === "discharge") return dischargeDefault;
  if (type === "postcoital") return postcoitalDefault;
  return weaknessDefault;
}

function Toggle({ checked, onChange, children }: { checked: boolean; onChange: (value: boolean) => void; children: React.ReactNode }) {
  return <button className={checked ? "selected" : ""} type="button" aria-pressed={checked} onClick={() => onChange(!checked)}>{children}</button>;
}

export function ConcernFlow({ type }: { type: AssessmentType }) {
  const router = useRouter();
  const [date, setDate] = useState(today());
  const [answers, setAnswers] = useState<AssessmentAnswers>(() => defaultAnswers(type));
  const [status, setStatus] = useState<"ready" | "saving" | "error">("ready");
  const update = (value: Partial<AssessmentAnswers>) => setAnswers((current) => ({ ...current, ...value } as AssessmentAnswers));
  const toggleArray = (key: "factors" | "locations" | "actions" | "changes" | "painTiming" | "lifeEffects", value: string) => setAnswers((current) => { const list = ((current as unknown as Record<string, string[]>)[key] ?? []); return { ...current, [key]: list.includes(value) ? list.filter((item) => item !== value) : [...list, value] } as AssessmentAnswers; });

  async function submit() {
    setStatus("saving");
    try { const saved = await saveAssessment({ date, type, answers }); router.push(`/result/${saved.id}`); } catch { setStatus("error"); }
  }

  return <main className="concern-page"><div className="concern-shell">
    <header><Link href="/today" aria-label="Назад"><ArrowLeft /></Link><div><small>{meta[type].eyebrow}</small><h1>{meta[type].title}</h1></div><span><ShieldAlert /></span></header>
    <p className="concern-lead">{meta[type].text}</p>
    <label className="concern-field"><span>Дата</span><input type="date" max={today()} value={date} onChange={(event) => setDate(event.target.value)} /></label>
    {type === "delay" && (() => { const a = answers as DelayAnswers; return <>
      <label className="concern-field"><span>На сколько дней позже диапазона Mira?</span><input type="number" min="0" max="365" value={a.delayedDays} onChange={(event) => update({ delayedDays: Number(event.target.value) })} /></label>
      <section className="concern-card"><h2>Беременность возможна?</h2><div className="concern-options"><Toggle checked={a.pregnancyPossible} onChange={(value) => update({ pregnancyPossible: value })}>Да, возможна</Toggle><Toggle checked={!a.pregnancyPossible} onChange={(value) => update({ pregnancyPossible: !value })}>Нет / не знаю</Toggle></div><label><span>Тест</span><select value={a.pregnancyTest} onChange={(event) => update({ pregnancyTest: event.target.value as DelayAnswers["pregnancyTest"] })}><option value="unknown">Не знаю</option><option value="not_taken">Не делала</option><option value="negative">Отрицательный</option><option value="positive">Положительный</option></select></label></section>
      <Range label="Боль" value={a.pain} onChange={(pain) => update({ pain })} />
      <Checks items={[["Необычные кровянистые выделения", a.unusualBleeding, "unusualBleeding"], ["Слабость или головокружение", a.faintOrDizzy, "faintOrDizzy"], ["Боль в плече", a.shoulderPain, "shoulderPain"]]} update={update} />
      <section className="concern-card"><h2>Что изменилось недавно?</h2><div className="concern-options"><Toggle checked={a.factors.includes("stress")} onChange={() => toggleArray("factors", "stress")}>Стресс</Toggle><Toggle checked={a.factors.includes("illness")} onChange={() => toggleArray("factors", "illness")}>Болезнь</Toggle><Toggle checked={a.factors.includes("routine_change")} onChange={() => toggleArray("factors", "routine_change")}>Режим</Toggle></div></section>
    </>; })()}
    {type === "pain" && (() => { const a = answers as PainAnswers; return <>
      <Range label="Интенсивность боли" value={a.intensity} onChange={(intensity) => update({ intensity })} />
      <section className="concern-card"><h2>Где болит?</h2><div className="concern-options">{[["lower_abdomen","Низ живота"],["left","Слева"],["right","Справа"],["back","Поясница"],["other","Другое"]].map(([value,label]) => <Toggle key={value} checked={a.locations.includes(value)} onChange={() => toggleArray("locations", value)}>{label}</Toggle>)}</div></section>
      <section className="concern-card concern-grid"><label><span>Длительность</span><select value={a.duration} onChange={(event) => update({ duration: event.target.value as PainAnswers["duration"] })}><option value="hours">Несколько часов</option><option value="one_day">Один день</option><option value="several_days">Несколько дней</option></select></label><label><span>Характер</span><select value={a.pattern} onChange={(event) => update({ pattern: event.target.value as PainAnswers["pattern"] })}><option value="constant">Постоянная</option><option value="waves">Волнами</option></select></label><label><span>Влияние на дела</span><select value={a.impact} onChange={(event) => update({ impact: event.target.value as PainAnswers["impact"] })}><option value="none">Не мешает</option><option value="some">Немного мешает</option><option value="strong">Мешает обычным делам</option></select></label></section>
      <Checks items={[["Боль усиливается", a.worsening, "worsening"], ["Слабость или головокружение", a.faintOrDizzy, "faintOrDizzy"], ["Температура или рвота", a.feverOrVomiting, "feverOrVomiting"], ["Беременность возможна", a.pregnancyPossible, "pregnancyPossible"], ["Необычные выделения", a.unusualBleeding, "unusualBleeding"]]} update={update} />
    </>; })()}
    {type === "heavy_flow" && (() => { const a = answers as HeavyFlowAnswers; return <>
      <section className="concern-card"><h2>Как часто приходится менять средство?</h2><select value={a.changeFrequency} onChange={(event) => update({ changeFrequency: event.target.value as HeavyFlowAnswers["changeFrequency"] })}><option value="four_plus_hours">Раз в 4 часа или реже</option><option value="two_to_three_hours">Раз в 2–3 часа</option><option value="one_to_two_hours">Раз в 1–2 часа</option><option value="hourly_several_hours">Каждый час несколько часов подряд</option></select></section>
      <label className="concern-field"><span>Сколько дней продолжается?</span><input type="number" min="1" max="30" value={a.durationDays} onChange={(event) => update({ durationDays: Number(event.target.value) })} /></label>
      <Range label="Боль" value={a.pain} onChange={(pain) => update({ pain })} />
      <Checks items={[["Сильнее обычного", a.heavierThanUsual, "heavierThanUsual"], ["Нужно менять ночью", a.nightChanges, "nightChanges"], ["Есть протекания", a.leaks, "leaks"], ["Есть сгустки", a.clots, "clots"], ["Слабость или головокружение", a.weakOrDizzy, "weakOrDizzy"], ["Беременность возможна", a.pregnancyPossible, "pregnancyPossible"]]} update={update} />
    </>; })()}
    {type === "discharge" && (() => { const a = answers as DischargeAnswers; return <>
      <section className="concern-card"><h2>Что отличается от обычного состояния?</h2><div className="concern-options">{[["color","Цвет"],["smell","Запах"],["texture","Консистенция"],["amount","Количество"]].map(([value,label]) => <Toggle key={value} checked={a.changes.includes(value as DischargeAnswers["changes"][number])} onChange={() => toggleArray("changes", value)}>{label}</Toggle>)}</div></section>
      <Range label="Тазовая боль" value={a.pelvicPain} onChange={(pelvicPain) => update({ pelvicPain })} />
      <Checks items={[["Есть зуд, болезненность или раздражение", a.itchOrSore, "itchOrSore"], ["Боль или жжение при мочеиспускании", a.burningUrination, "burningUrination"], ["Температура или озноб", a.fever, "fever"], ["Кровотечение вне месячных", a.unusualBleeding, "unusualBleeding"], ["Беременность возможна", a.pregnancyPossible, "pregnancyPossible"], ["Слабость или головокружение", a.faintOrDizzy, "faintOrDizzy"]]} update={update} />
    </>; })()}
    {type === "postcoital" && (() => { const a = answers as PostcoitalAnswers; return <>
      <Range label="Интенсивность боли" value={a.pain} onChange={(pain) => update({ pain })} />
      <section className="concern-card"><h2>Когда возникает боль?</h2><div className="concern-options">{[["entry","При входе"],["deep","Глубоко внутри"],["after","После секса"]].map(([value,label]) => <Toggle key={value} checked={a.painTiming.includes(value as PostcoitalAnswers["painTiming"][number])} onChange={() => toggleArray("painTiming", value)}>{label}</Toggle>)}</div></section>
      <section className="concern-card"><h2>Было кровотечение?</h2><select value={a.bleeding} onChange={(event) => update({ bleeding: event.target.value as PostcoitalAnswers["bleeding"] })}><option value="none">Нет</option><option value="spotting">Небольшие кровянистые выделения</option><option value="heavy">Обильное кровотечение</option></select></section>
      <Checks items={[["Сухость или раздражение", a.dryness, "dryness"], ["Необычные выделения или жжение", a.dischargeOrBurning, "dischargeOrBurning"], ["Беременность возможна", a.pregnancyPossible, "pregnancyPossible"], ["Слабость или головокружение", a.faintOrDizzy, "faintOrDizzy"]]} update={update} />
    </>; })()}
    {type === "weakness" && (() => { const a = answers as WeaknessAnswers; return <>
      <section className="concern-card"><h2>Насколько это мешает?</h2><select value={a.severity} onChange={(event) => update({ severity: event.target.value as WeaknessAnswers["severity"] })}><option value="mild">Немного, обычные дела возможны</option><option value="marked">Заметно мешает обычным делам</option><option value="cannot_function">Не могу заниматься обычными делами</option></select></section>
      <Range label="Боль" value={a.pain} onChange={(pain) => update({ pain })} />
      <Checks items={[["Кружится голова", a.dizzy, "dizzy"], ["Был обморок или потеря сознания", a.fainted, "fainted"], ["Трудно дышать", a.shortOfBreath, "shortOfBreath"], ["Сердце бьётся необычно быстро", a.racingHeart, "racingHeart"], ["Есть обильное кровотечение", a.heavyBleeding, "heavyBleeding"], ["Беременность возможна", a.pregnancyPossible, "pregnancyPossible"], ["Есть необычное кровотечение", a.unusualBleeding, "unusualBleeding"]]} update={update} />
    </>; })()}
    <section className="concern-card">
      <h2>Как это повлияло на вашу жизнь?</h2>
      <select value={answers.lifeImpact ?? "none"} onChange={(event) => update({ lifeImpact: event.target.value as NonNullable<AssessmentAnswers["lifeImpact"]> })}>
        <option value="none">Не мешает</option>
        <option value="some">Немного мешает</option>
        <option value="strong">Сильно мешает</option>
        <option value="cannot_function">Не могу заниматься обычными делами</option>
      </select>
      <div className="concern-options concern-impact-effects">
        {[["missed_work_or_study","Пропустила работу или учёбу"],["sleep_disrupted","Нарушился сон"],["could_not_exercise","Не смогла тренироваться"],["took_medicine","Пришлось принять лекарство"],["sought_medical_help","Обратилась за медицинской помощью"]].map(([value,label]) => <Toggle key={value} checked={(answers.lifeEffects ?? []).includes(value as NonNullable<AssessmentAnswers["lifeEffects"]>[number])} onChange={() => toggleArray("lifeEffects", value)}>{label}</Toggle>)}
      </div>
    </section>
    {status === "error" && <p className="concern-error" role="alert">Не удалось сохранить. Проверьте соединение и попробуйте снова.</p>}
    <button className="button concern-submit" type="button" disabled={status === "saving"} onClick={submit}>{status === "saving" ? <><LoaderCircle className="spin" />Сохраняем</> : <>Показать результат <ArrowRight /></>}</button>
    <p className="concern-disclaimer">Mira не ставит диагноз и не заменяет консультацию врача.</p>
  </div></main>;
}

function Range({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) { return <section className="concern-card"><div className="concern-range"><h2>{label}</h2><strong>{value}/10</strong></div><input type="range" min="0" max="10" value={value} onChange={(event) => onChange(Number(event.target.value))} /></section>; }
function Checks({ items, update }: { items: Array<[string, boolean, string]>; update: (value: Partial<AssessmentAnswers>) => void }) { return <section className="concern-card"><h2>Обратите внимание</h2><div className="concern-checks">{items.map(([label, checked, key]) => <label key={key}><input type="checkbox" checked={checked} onChange={(event) => update({ [key]: event.target.checked } as Partial<AssessmentAnswers>)} /><span>{label}</span></label>)}</div></section>; }
