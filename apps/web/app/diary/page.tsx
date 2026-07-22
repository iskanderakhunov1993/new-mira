"use client";

import { Dispatch, SetStateAction, Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Activity, BarChart3, BatteryMedium, CalendarDays, Check, ChevronLeft, ChevronRight, CircleAlert, Droplet, FileText, GlassWater, Heart, HeartPulse, Leaf, Minus, MoonStar, Pill, Plus, Save, Scale, Search, Smile, Sparkles, TestTube, Thermometer, Waves, X } from "lucide-react";
import { AppTabBar } from "@/components/AppTabBar";
import { CycleEntry, getProfile, MiraProfile, saveEntry, saveProfile } from "@/lib/demo-session";

type Section = "period" | "symptoms" | "mood" | "sleep" | "notes" | "digestion" | "discharge" | "energy" | "intimacy" | "medication" | "lifestyle" | "tests";

const symptomGroups = [
  { id: "symptoms", title: "Общее самочувствие", description: "Боль и физические ощущения", icon: HeartPulse, tone: "physical", options: ["Всё в порядке", "Спазмы", "Головная боль", "Усталость", "Чувствительная грудь", "Боль в спине", "Прыщи", "Приливы жара", "Ночная потливость", "Боль в суставах", "Боль внизу живота", "Бессонница", "Забывчивость", "Зуд во влагалище", "Сухость во влагалище"] },
  { id: "digestion", title: "Пищеварение", description: "Живот, аппетит и стул", icon: Leaf, tone: "digestion", options: ["Без изменений", "Вздутие", "Тошнота", "Запор", "Диарея", "Тяга к сладкому", "Повышенный аппетит", "Сниженный аппетит", "Боль в животе", "Изжога", "Газообразование"] },
  { id: "discharge", title: "Выделения", description: "Характер выделений в течение дня", icon: Waves, tone: "discharge", options: ["Выделений нет", "Кремообразные", "Водянистые", "Липкие", "Слизистые", "Кровомажущие", "Нетипичные", "Белые комковатые", "Серые", "С неприятным запахом"] },
  { id: "energy", title: "Энергия и стресс", description: "Ресурс и эмоциональная нагрузка", icon: BatteryMedium, tone: "energy", options: ["Высокая энергия", "Нормальная энергия", "Мало энергии", "Стресс", "Тревога", "Раздражительность", "Апатия", "Спокойствие", "Перепады настроения", "Подавленность", "Навязчивые мысли"] },
  { id: "intimacy", title: "Интимная жизнь", description: "Личная отметка — не включается в отчёт автоматически", icon: Heart, tone: "intimacy", options: ["Секса не было", "Секс с защитой", "Секс без защиты", "Оральный секс", "Анальный секс", "Мастурбация", "Интимные прикосновения", "Секс-игрушки", "Оргазм", "Сильное желание", "Среднее желание", "Слабое желание"] },
  { id: "medication", title: "Лекарства", description: "Что вы принимали сегодня", icon: Pill, tone: "medication", options: ["Ничего не принимала", "Контрацептив вовремя", "Пропуск контрацептива", "Обезболивающее", "Витамины", "Добавки", "Другое лекарство"] },
  { id: "lifestyle", title: "Активность и события", description: "Нагрузка и события, которые могут влиять на самочувствие", icon: Activity, tone: "lifestyle", options: ["Тренировка", "Йога", "Бег", "Ходьба", "Плавание", "Алкоголь", "Путешествие", "Медитация", "Болезнь или травма", "Высокая нагрузка"] },
  { id: "tests", title: "Тесты и измерения", description: "Результаты домашних тестов и наблюдений", icon: TestTube, tone: "tests", options: ["Тест на беременность: отрицательный", "Тест на беременность: положительный", "Тест на овуляцию: отрицательный", "Тест на овуляцию: положительный", "Измерена базальная температура"] },
];
const trackingOptionCount = symptomGroups.reduce((sum, group) => sum + group.options.length, 0);
const moodOptions: { value: CycleEntry["mood"]; label: string; emoji: string }[] = [
  { value: "low", label: "Тяжело", emoji: "😔" },
  { value: "calm", label: "Спокойно", emoji: "😌" },
  { value: "good", label: "Хорошо", emoji: "🙂" },
];

const emptyGroupOptions = ["Всё в порядке", "Без изменений", "Выделений нет", "Секса не было", "Ничего не принимала"];
const exclusiveSets = [
  ["Секса не было", "Секс с защитой", "Секс без защиты"],
  ["Контрацептив вовремя", "Пропуск контрацептива"],
  ["Тест на беременность: отрицательный", "Тест на беременность: положительный"],
  ["Тест на овуляцию: отрицательный", "Тест на овуляцию: положительный"],
];
const painLocationOptions = ["Низ живота", "Поясница", "С одной стороны", "Таз", "Другое"];
const painTypeOptions = ["Тянущая", "Острая", "Пульсирующая", "Спазмы", "Давящая"];
const intensityGroupIds = new Set(["symptoms", "digestion", "discharge", "energy"]);

function formatDay(value: string) {
  return new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long", weekday: "long" }).format(new Date(`${value}T12:00:00`));
}

type MeasurementKey = "waterMl" | "weightKg" | "basalTemperature";

function MeasurementChart({ entries, metric, unit }: { entries: CycleEntry[]; metric: MeasurementKey; unit: string }) {
  const points = entries.filter((entry) => typeof entry[metric] === "number").slice(-10).map((entry) => ({ date: entry.date, value: entry[metric] as number }));
  if (!points.length) return <div className="measurement-chart-empty">Пока нет сохранённых значений. Добавьте измерение и нажмите «Сохранить».</div>;
  const values = points.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const spread = Math.max(max - min, metric === "basalTemperature" ? .2 : 1);
  const coordinates = points.map((point, index) => ({ ...point, x: points.length === 1 ? 50 : 7 + (index / (points.length - 1)) * 86, y: 82 - ((point.value - min) / spread) * 62 }));
  const path = coordinates.map((point, index) => `${index ? "L" : "M"} ${point.x} ${point.y}`).join(" ");
  const formatDate = (value: string) => new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "short" }).format(new Date(`${value}T12:00:00`));
  return <div className="measurement-chart" role="img" aria-label={`Диаграмма: ${points.length} сохранённых значений`}>
    <div className="measurement-chart-summary"><strong>{points.at(-1)?.value.toLocaleString("ru-RU")} {unit}</strong><span>Последнее значение · {points.length} отметок</span></div>
    <svg viewBox="0 0 100 95" preserveAspectRatio="none" aria-hidden="true"><path className="measurement-chart-grid" d="M 5 20 H 95 M 5 51 H 95 M 5 82 H 95" /><path className="measurement-chart-line" d={path} />{coordinates.map((point) => <circle key={point.date} cx={point.x} cy={point.y} r="2.4" />)}</svg>
    <div className="measurement-chart-dates"><span>{formatDate(points[0].date)}</span><span>{formatDate(points.at(-1)!.date)}</span></div>
  </div>;
}

function DiaryContent() {
  const searchParams = useSearchParams();
  const requested = searchParams.get("section") as Section | null;
  const requestedDate = searchParams.get("date");
  const [date, setDate] = useState(() => requestedDate ?? new Date().toISOString().slice(0, 10));
  const [period, setPeriod] = useState<CycleEntry["period"]>();
  const [pain, setPain] = useState(0);
  const [painLocations, setPainLocations] = useState<string[]>([]);
  const [painTypes, setPainTypes] = useState<string[]>([]);
  const [painImpact, setPainImpact] = useState<CycleEntry["painImpact"]>("none");
  const [periodClots, setPeriodClots] = useState(false);
  const [periodLeak, setPeriodLeak] = useState(false);
  const [periodNightChange, setPeriodNightChange] = useState(false);
  const [periodHourlyChange, setPeriodHourlyChange] = useState(false);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [symptomIntensity, setSymptomIntensity] = useState<Record<string, 1 | 2 | 3>>({});
  const [mood, setMood] = useState<CycleEntry["mood"]>();
  const [sleepHours, setSleepHours] = useState(8);
  const [notes, setNotes] = useState("");
  const [waterMl, setWaterMl] = useState(0);
  const [weightKg, setWeightKg] = useState<number | "">("");
  const [basalTemperature, setBasalTemperature] = useState<number | "">("");
  const [openChart, setOpenChart] = useState<MeasurementKey | null>(null);
  const [saved, setSaved] = useState(false);
  const [query, setQuery] = useState("");
  const [profile, setProfile] = useState<MiraProfile | null>(null);
  const [editingCategories, setEditingCategories] = useState(false);
  const [hiddenGroups, setHiddenGroups] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    void getProfile().then((currentProfile) => {
      if (cancelled) return;
      const entry = currentProfile?.entries?.find((item) => item.date === date);
      setProfile(currentProfile);
      setPeriod(entry?.period); setPain(entry?.pain ?? 0); setPainLocations(entry?.painLocations ?? []); setPainTypes(entry?.painTypes ?? []); setPainImpact(entry?.painImpact ?? "none");
      setPeriodClots(Boolean(entry?.periodClots)); setPeriodLeak(Boolean(entry?.periodLeak)); setPeriodNightChange(Boolean(entry?.periodNightChange)); setPeriodHourlyChange(Boolean(entry?.periodHourlyChange));
      setSymptoms(entry?.symptoms ?? []); setSymptomIntensity(entry?.symptomIntensity ?? {});
      setMood(entry?.mood); setSleepHours(entry?.sleepHours ?? 8); setNotes(entry?.notes ?? ""); setSaved(false);
      setWaterMl(entry?.waterMl ?? 0); setWeightKg(entry?.weightKg ?? currentProfile?.weightKg ?? ""); setBasalTemperature(entry?.basalTemperature ?? ""); setOpenChart(null);
    }).catch(() => setProfile(null));
    return () => { cancelled = true; };
  }, [date]);

  useEffect(() => {
    if (!requested || requested === "symptoms" || !["period", "mood", "sleep", "notes", "digestion", "discharge", "energy", "intimacy", "medication", "lifestyle", "tests"].includes(requested)) return;
    const timer = window.setTimeout(() => document.getElementById(`diary-${requested}`)?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
    return () => window.clearTimeout(timer);
  }, [requested]);

  function moveDate(days: number) {
    const next = new Date(`${date}T12:00:00`); next.setDate(next.getDate() + days);
    const today = new Date().toISOString().slice(0, 10);
    setDate(next.toISOString().slice(0, 10) > today ? today : next.toISOString().slice(0, 10));
  }

  function toggleSymptom(value: string) {
    setSymptoms((current) => {
      if (current.includes(value)) { setSymptomIntensity((levels) => { const next = { ...levels }; delete next[value]; return next; }); return current.filter((item) => item !== value); }
      const group = symptomGroups.find((item) => item.options.includes(value));
      if (!group) return [...current, value];
      const isEmptyChoice = emptyGroupOptions.includes(value);
      const conflictingEmptyChoice = group.options.find((item) => emptyGroupOptions.includes(item));
      const exclusiveSet = exclusiveSets.find((set) => set.includes(value));
      const blocked = new Set([
        ...(isEmptyChoice ? group.options : conflictingEmptyChoice ? [conflictingEmptyChoice] : []),
        ...(exclusiveSet ?? []),
      ]);
      setSymptomIntensity((levels) => Object.fromEntries(Object.entries(levels).filter(([name]) => !blocked.has(name))) as Record<string, 1 | 2 | 3>);
      return [...current.filter((item) => !blocked.has(item)), value];
    });
  }

  function toggleListValue(value: string, setter: Dispatch<SetStateAction<string[]>>) {
    setter((current) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
  }

  function setIntensity(symptom: string, level: 1 | 2 | 3) {
    setSymptomIntensity((current) => ({ ...current, [symptom]: level }));
  }

  async function save() {
    const numericWeight = weightKg === "" ? undefined : weightKg;
    let updated = await saveEntry({ date, period, periodClots: period ? periodClots || undefined : undefined, periodLeak: period ? periodLeak || undefined : undefined, periodNightChange: period ? periodNightChange || undefined : undefined, periodHourlyChange: period ? periodHourlyChange || undefined : undefined, pain: pain || undefined, painLocations: pain && painLocations.length ? painLocations : undefined, painTypes: pain && painTypes.length ? painTypes : undefined, painImpact: pain ? painImpact : undefined, symptoms: symptoms.length ? symptoms : undefined, symptomIntensity: Object.keys(symptomIntensity).length ? symptomIntensity : undefined, mood, sleepHours, waterMl: waterMl || undefined, weightKg: numericWeight, basalTemperature: basalTemperature === "" ? undefined : basalTemperature, notes: notes.trim() || undefined });
    if (numericWeight) updated = await saveProfile({ weightKg: numericWeight });
    setProfile(updated);
    setSaved(true); window.setTimeout(() => setSaved(false), 2400);
  }

  const normalizedQuery = query.trim().toLowerCase();
  const matches = (value: string) => !normalizedQuery || value.toLowerCase().includes(normalizedQuery);
  const symptomsMode = requested === "symptoms";
  const intimacyMode = requested === "intimacy";
  const visibleSymptomGroups = symptomGroups.map((group) => ({ ...group, options: group.options.filter(matches) })).filter((group) => !hiddenGroups.includes(group.id) && (!normalizedQuery || matches(group.title) || group.options.length > 0));
  const selectedMood = moodOptions.find((item) => item.value === mood);
  const hasSelection = Boolean(period || pain || symptoms.length || mood || notes.trim());
  const todayKey = new Date().toISOString().slice(0, 10);
  const cycleDay = profile?.lastPeriod ? Math.max(1, Math.floor((new Date(`${date}T12:00:00`).getTime() - new Date(`${profile.lastPeriod}T12:00:00`).getTime()) / 86400000) + 1) : 1;
  const waterTarget = weightKg === "" ? 1800 : Math.min(4500, Math.max(1200, Math.round((weightKg * 30) / 300) * 300));
  const waterProgress = Math.min(100, Math.round((waterMl / waterTarget) * 100));
  const quickFeelings = [
    { label: "Спокойствие", icon: "😌", selected: symptoms.includes("Спокойствие"), action: () => toggleSymptom("Спокойствие") },
    { label: "Кремообразные", icon: "💧", selected: symptoms.includes("Кремообразные"), action: () => toggleSymptom("Кремообразные") },
    { label: "Чувствительная грудь", icon: "◉", selected: symptoms.includes("Чувствительная грудь"), action: () => toggleSymptom("Чувствительная грудь") },
    { label: "Радость", icon: "🙂", selected: mood === "good", action: () => setMood(mood === "good" ? undefined : "good") },
  ];

  function dateNavigator(compact: boolean) {
    return <section className={`diary-date ${compact ? "symptom-date-header" : ""}`}><button type="button" aria-label="Предыдущий день" onClick={() => moveDate(-1)}><ChevronLeft /></button><label>{!compact && <CalendarDays />}<span>{compact && date === todayKey ? "Сегодня" : formatDay(date)}</span>{compact && <small>{cycleDay}-й день цикла</small>}<input type="date" value={date} max={todayKey} onChange={(event) => setDate(event.target.value)} /></label><button type="button" aria-label="Следующий день" disabled={date === todayKey} onClick={() => moveDate(1)}><ChevronRight /></button></section>;
  }

  if (intimacyMode) {
    const intimacyOptions = symptomGroups.find((group) => group.id === "intimacy")!.options;
    const intimacyIcons: Record<string, string> = { "Секса не было": "⊘", "Секс с защитой": "🔒", "Секс без защиты": "♡", "Оральный секс": "◒", "Анальный секс": "●", "Мастурбация": "♥", "Интимные прикосновения": "❥", "Секс-игрушки": "∿", "Оргазм": "✦", "Сильное желание": "◎", "Среднее желание": "◉", "Слабое желание": "○" };
    return <main className="diary-page intimacy-entry-page"><div className="diary-shell"><header className="intimacy-reference-top"><button type="button" aria-label="Закрыть" onClick={() => { window.location.href = "/today"; }}><X /></button><label><strong>{date === todayKey ? "Сегодня" : formatDay(date)}</strong><span>{cycleDay}-й день цикла</span><input type="date" value={date} max={todayKey} onChange={(event) => setDate(event.target.value)} /></label><i /></header><section className="intimacy-reference-card"><h1>Секс и сексуальное желание</h1><div className="intimacy-reference-options">{intimacyOptions.map((item) => <button className={symptoms.includes(item) ? "selected" : ""} type="button" onClick={() => toggleSymptom(item)} key={item}><i>{intimacyIcons[item]}</i><span>{item}</span></button>)}</div><div className="intimacy-reference-save"><small>{saved ? <><Check /> Сохранено</> : "Данные останутся только в вашем дневнике"}</small><button type="button" onClick={save}><Save /> Сохранить</button></div></section></div><AppTabBar active="diary" /></main>;
  }

  return (
    <main className={`diary-page ${symptomsMode ? "symptom-entry-page" : ""}`}>
      <div className="diary-shell">
        {!symptomsMode && <header className="diary-header"><span>Дневник</span><h1>Что было сегодня?</h1><p>Выберите всё, что описывает ваш день.</p></header>}
        {dateNavigator(symptomsMode)}
        <label className="state-search"><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Найти состояние или симптом" /></label>
        {symptomsMode ? <section className="feeling-today-card"><h2>Как вы себя чувствуете сегодня?</h2><div>{quickFeelings.map((item) => <button className={item.selected ? "selected" : ""} type="button" onClick={item.action} key={item.label}><span>{item.icon}</span><strong>{item.label}</strong></button>)}</div></section> : <section className={`daily-summary ${hasSelection ? "has-selection" : ""}`}><div className="summary-heading"><div><small>Выбрано сегодня</small><h2>{hasSelection ? "Ваше состояние" : "Пока ничего не отмечено"}</h2></div><span>{[period, pain > 0, ...symptoms, mood, notes.trim()].filter(Boolean).length}</span></div>{hasSelection && <div className="summary-chips">{selectedMood && <span className="summary-chip mood"><i>{selectedMood.emoji}</i>{selectedMood.label}</span>}{period && <span className="summary-chip period"><Droplet />{period === "spotting" ? "Мажущие" : period === "light" ? "Слабые" : period === "medium" ? "Средние" : "Обильные"}</span>}{symptoms.slice(0, 3).map((item) => <span className="summary-chip symptom" key={item}><Sparkles />{item}</span>)}{symptoms.length > 3 && <span className="summary-chip more">+{symptoms.length - 3}</span>}</div>}</section>}
        <div className={`state-category-heading ${symptomsMode ? "symptom-category-heading" : ""}`}><div><h2>Категории</h2>{symptomsMode && <small>{trackingOptionCount} симптом и событие</small>}</div>{symptomsMode ? <button type="button" onClick={() => setEditingCategories((value) => !value)}>{editingCategories ? "Готово" : "Редактировать"}</button> : <span>Можно выбрать несколько</span>}</div>
        {symptomsMode && editingCategories && <div className="category-editor">{symptomGroups.map((group) => <button className={hiddenGroups.includes(group.id) ? "" : "selected"} type="button" onClick={() => setHiddenGroups((current) => current.includes(group.id) ? current.filter((id) => id !== group.id) : [...current, group.id])} key={group.id}><Check />{group.title}</button>)}</div>}
        {!symptomsMode && (matches("месячные") || matches("боль") || matches("интенсивность")) && <section className="state-card state-period period-p0-card" id="diary-period">
          <div className="state-card-title"><span><Droplet /></span><div><h2>Месячные и боль</h2><p>Фактическая запись за выбранный день</p></div></div>
          <h3>Интенсивность выделений</h3><div className="state-chips flow-chips"><button className={period === undefined ? "selected" : ""} type="button" onClick={() => setPeriod(undefined)}><i>○</i>Нет</button><button className={period === "spotting" ? "selected" : ""} type="button" onClick={() => setPeriod("spotting")}><i>·</i>Мажущие</button><button className={period === "light" ? "selected" : ""} type="button" onClick={() => setPeriod("light")}><i>💧</i>Слабые</button><button className={period === "medium" ? "selected" : ""} type="button" onClick={() => setPeriod("medium")}><i>💧</i>Средние</button><button className={period === "heavy" ? "selected" : ""} type="button" onClick={() => setPeriod("heavy")}><i>💧</i>Обильные</button></div>
          {period && <><h3>Дополнительные признаки</h3><div className="p0-toggle-grid"><button className={periodClots ? "selected" : ""} type="button" onClick={() => setPeriodClots((value) => !value)}><Check />Сгустки</button><button className={periodLeak ? "selected" : ""} type="button" onClick={() => setPeriodLeak((value) => !value)}><Check />Протекание</button><button className={periodNightChange ? "selected" : ""} type="button" onClick={() => setPeriodNightChange((value) => !value)}><Check />Смена средства ночью</button><button className={periodHourlyChange ? "selected" : ""} type="button" onClick={() => setPeriodHourlyChange((value) => !value)}><Check />Смена каждый час несколько часов</button></div></>}
          <div className="state-slider-heading"><h3>Интенсивность боли</h3><strong>{pain === 0 ? "Нет" : `${pain} из 10`}</strong></div><input className="pain-range" type="range" min="0" max="10" value={pain} onInput={(event) => setPain(Number(event.currentTarget.value))} onChange={(event) => setPain(Number(event.target.value))} /><div className="range-labels"><span>Нет</span><span>Очень сильная</span></div>
          {pain > 0 && <div className="pain-details"><h3>Где болит?</h3><div className="p0-choice-row">{painLocationOptions.map((item) => <button className={painLocations.includes(item) ? "selected" : ""} type="button" onClick={() => toggleListValue(item, setPainLocations)} key={item}>{item}</button>)}</div><h3>Какая боль?</h3><div className="p0-choice-row">{painTypeOptions.map((item) => <button className={painTypes.includes(item) ? "selected" : ""} type="button" onClick={() => toggleListValue(item, setPainTypes)} key={item}>{item}</button>)}</div><h3>Как повлияла на день?</h3><div className="pain-impact"><button className={painImpact === "none" ? "selected" : ""} type="button" onClick={() => setPainImpact("none")}>Не мешала</button><button className={painImpact === "some" ? "selected" : ""} type="button" onClick={() => setPainImpact("some")}>Было сложнее</button><button className={painImpact === "strong" ? "selected" : ""} type="button" onClick={() => setPainImpact("strong")}>Помешала делам</button></div></div>}
          {(periodHourlyChange || pain >= 7 || painImpact === "strong") && <aside className="p0-attention"><CircleAlert /><div><strong>Эту запись стоит обсудить со специалистом</strong><p>{periodHourlyChange ? "Вы отметили необходимость менять средство каждый час несколько часов подряд. " : ""}{pain >= 7 || painImpact === "strong" ? "Сильная боль или боль, мешающая обычным делам, заслуживает медицинской оценки. " : ""}Mira показывает факт из вашей записи и не определяет причину.</p></div></aside>}
        </section>}
        {(matches("настроение") || matches("тяжело") || matches("спокойно") || matches("хорошо")) && <section className="state-card state-mood" id="diary-mood"><div className="state-card-title"><span><Smile /></span><div><h2>Настроение</h2><p>Как вы ощущали себя большую часть дня?</p></div></div><div className="state-chips mood-chips">{moodOptions.map((item) => <button className={mood === item.value ? "selected" : ""} type="button" onClick={() => setMood(item.value)} key={item.value}><i>{item.emoji}</i>{item.label}</button>)}</div></section>}
        {visibleSymptomGroups.map((group) => { const Icon = group.icon; const options = normalizedQuery && matches(group.title) ? symptomGroups.find((item) => item.id === group.id)!.options : group.options; const selectedInGroup = group.options.filter((item) => symptoms.includes(item) && !emptyGroupOptions.includes(item)); return <section className={`state-card state-group ${group.tone}`} id={group.id === "symptoms" ? "diary-symptoms" : `diary-${group.id}`} key={group.id}><div className="state-card-title"><span><Icon /></span><div><h2>{group.title}</h2><p>{group.description}</p></div></div><div className="state-chips grouped-chips">{options.map((item) => <button className={symptoms.includes(item) ? "selected" : ""} type="button" onClick={() => toggleSymptom(item)} key={item}><i>{item.includes("энерг") || item === "Спокойствие" ? "✦" : item.includes("Выдел") ? "○" : item === "Головная боль" ? "◉" : item.includes("аппетит") ? "◒" : "●"}</i>{item}</button>)}</div>{intensityGroupIds.has(group.id) && selectedInGroup.length > 0 && <div className="symptom-intensity-list"><h3>Интенсивность <small>необязательно</small></h3>{selectedInGroup.map((item) => <div key={item}><span>{item}</span><div>{([1, 2, 3] as const).map((level) => <button className={symptomIntensity[item] === level ? "selected" : ""} type="button" aria-label={`${item}: ${level === 1 ? "слабо" : level === 2 ? "средне" : "сильно"}`} onClick={() => setIntensity(item, level)} key={level}>{level === 1 ? "Слабо" : level === 2 ? "Средне" : "Сильно"}</button>)}</div></div>)}</div>}</section>; })}
        {(matches("сон") || matches("часы")) && <section className="state-card state-sleep" id="diary-sleep"><div className="state-card-title"><span><MoonStar /></span><div><h2>Сон</h2><p>Примерная продолжительность сна</p></div></div><div className="compact-sleep"><button type="button" onClick={() => setSleepHours(Math.max(3, sleepHours - .5))}>−</button><strong>{sleepHours}<small> часов</small></strong><button type="button" onClick={() => setSleepHours(Math.min(12, sleepHours + .5))}>+</button></div></section>}
        {symptomsMode && <section className="measurements-section" aria-labelledby="measurements-title">
          <div className="measurements-heading"><div><h2 id="measurements-title">Измерения</h2><p>Вода, вес и базальная температура</p></div><BarChart3 /></div>
          <article className="measurement-card water-card">
            <div className="measurement-card-title"><span><GlassWater /></span><div><h3>Вода</h3><p>Ориентир по вашему весу</p></div></div>
            <div className="water-control"><button type="button" aria-label="Убавить 300 мл" onClick={() => setWaterMl((value) => Math.max(0, value - 300))}><Minus /></button><strong>{(waterMl / 1000).toLocaleString("ru-RU", { maximumFractionDigits: 1 })}<small> / {(waterTarget / 1000).toLocaleString("ru-RU", { maximumFractionDigits: 1 })} л</small></strong><button type="button" aria-label="Добавить 300 мл" onClick={() => setWaterMl((value) => Math.min(6000, value + 300))}><Plus /></button></div>
            <div className="water-progress" aria-label={`Выполнено ${waterProgress}%`}><span style={{ width: `${waterProgress}%` }} /></div><small className="measurement-note">Шаг 300 мл · ориентировочная цель 30 мл/кг</small>
            <button className="measurement-chart-button" type="button" onClick={() => setOpenChart(openChart === "waterMl" ? null : "waterMl")}><BarChart3 />{openChart === "waterMl" ? "Скрыть диаграмму" : "Показать диаграмму"}</button>
            {openChart === "waterMl" && <MeasurementChart entries={profile?.entries ?? []} metric="waterMl" unit="мл" />}
          </article>
          <article className="measurement-card">
            <div className="measurement-card-title"><span className="weight"><Scale /></span><div><h3>Вес</h3><p>Укажите актуальное значение</p></div></div>
            <label className="measurement-input"><input aria-label="Вес в килограммах" type="number" inputMode="decimal" min="30" max="250" step="0.1" value={weightKg} placeholder="Например, 60" onChange={(event) => setWeightKg(event.target.value === "" ? "" : Number(event.target.value))} /><span>кг</span></label>
            <button className="measurement-chart-button" type="button" onClick={() => setOpenChart(openChart === "weightKg" ? null : "weightKg")}><BarChart3 />{openChart === "weightKg" ? "Скрыть диаграмму" : "Показать диаграмму"}</button>
            {openChart === "weightKg" && <MeasurementChart entries={profile?.entries ?? []} metric="weightKg" unit="кг" />}
          </article>
          <article className="measurement-card">
            <div className="measurement-card-title"><span className="temperature"><Thermometer /></span><div><h3>Базальная температура</h3><p>После пробуждения, до подъёма</p></div></div>
            <label className="measurement-input"><input aria-label="Базальная температура" type="number" inputMode="decimal" min="34" max="42" step="0.01" value={basalTemperature} placeholder="Например, 36,55" onChange={(event) => setBasalTemperature(event.target.value === "" ? "" : Number(event.target.value))} /><span>°C</span></label>
            <button className="measurement-chart-button" type="button" onClick={() => setOpenChart(openChart === "basalTemperature" ? null : "basalTemperature")}><BarChart3 />{openChart === "basalTemperature" ? "Скрыть диаграмму" : "Показать диаграмму"}</button>
            {openChart === "basalTemperature" && <MeasurementChart entries={profile?.entries ?? []} metric="basalTemperature" unit="°C" />}
          </article>
        </section>}
        {(matches("заметка") || matches("текст")) && <section className="state-card state-notes" id="diary-notes"><div className="state-card-title"><span><FileText /></span><div><h2>Личная заметка</h2><p>Не попадёт в отчёт врачу без вашего выбора</p></div></div><textarea value={notes} onChange={(event) => setNotes(event.target.value)} maxLength={500} placeholder="Что ещё важно запомнить об этом дне?" /><small className="note-count">{notes.length}/500</small></section>}
        <div className="diary-save-row"><p>{saved ? <><Check /> Запись сохранена и будет использована в истории и аналитике</> : "Изменения сохранятся для выбранной даты"}</p><button className="button" type="button" onClick={save}><Save /> Сохранить</button></div>
      </div>
      <AppTabBar active="diary" />
    </main>
  );
}

export default function DiaryPage() {
  return <Suspense fallback={<main className="diary-page" />}><DiaryContent /></Suspense>;
}
