"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { ArrowLeft, Check, LoaderCircle, Save, Trash2 } from "lucide-react";
import { AppPageState } from "@/components/AppPageState";
import { CycleEntry, deleteEntry, getProfile, saveEntry, saveProfile, trackProductEvent } from "@/lib/demo-session";

const moods = [{ value: "low", label: "Тяжело", icon: "😔" }, { value: "calm", label: "Спокойно", icon: "😌" }, { value: "good", label: "Хорошо", icon: "🙂" }] as const;
const energies = [{ value: "low", label: "Мало" }, { value: "normal", label: "Обычно" }, { value: "high", label: "Много" }] as const;
const flows = [{ value: undefined, label: "Нет" }, { value: "spotting", label: "Мажущие" }, { value: "light", label: "Слабые" }, { value: "medium", label: "Средние" }, { value: "heavy", label: "Обильные" }] as const;
const symptomOptions = ["Спазмы", "Головная боль", "Усталость", "Вздутие", "Чувствительная грудь", "Раздражительность"];

function TrackContent() {
  const router = useRouter();
  const search = useSearchParams();
  const date = search.get("date") ?? new Date().toISOString().slice(0, 10);
  const [existing, setExisting] = useState<CycleEntry>();
  const [mood, setMood] = useState<CycleEntry["mood"]>();
  const [energy, setEnergy] = useState<CycleEntry["energy"]>();
  const [pain, setPain] = useState<number>();
  const [period, setPeriod] = useState<CycleEntry["period"]>();
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"loading" | "ready" | "saving" | "error">("loading");

  async function load() {
    try {
      const profile = await getProfile({ refresh: true });
      const entry = profile?.entries?.find((item) => item.date === date);
      setExisting(entry); setMood(entry?.mood); setEnergy(entry?.energy); setPain(entry?.pain); setPeriod(entry?.period); setSymptoms(entry?.symptoms ?? []); setNotes(entry?.notes ?? "");
      setStatus("ready");
      void trackProductEvent("checkin_started", "/track");
    } catch { setStatus("error"); }
  }

  useEffect(() => {
    let cancelled = false;
    void getProfile({ refresh: true }).then((profile) => {
      if (cancelled) return;
      const entry = profile?.entries?.find((item) => item.date === date);
      setExisting(entry); setMood(entry?.mood); setEnergy(entry?.energy); setPain(entry?.pain); setPeriod(entry?.period); setSymptoms(entry?.symptoms ?? []); setNotes(entry?.notes ?? "");
      setStatus("ready");
      void trackProductEvent("checkin_started", "/track");
    }).catch(() => { if (!cancelled) setStatus("error"); });
    return () => { cancelled = true; };
  }, [date]);

  async function save() {
    setStatus("saving");
    try {
      const updated = await saveEntry({ ...existing, date, mood, energy, pain, period, symptoms: symptoms.length ? symptoms : undefined, notes: notes.trim() || undefined });
      void trackProductEvent(existing ? "entry_updated" : "checkin_completed", "/track");
      if (updated.spotlightStatus === "shown") {
        await saveProfile({ spotlightStatus: "completed" });
        void trackProductEvent("spotlight_completed", "/track");
      }
      router.push(`/check-in/result?date=${date}`);
    } catch { setStatus("error"); }
  }

  async function remove() {
    setStatus("saving");
    try { await deleteEntry(date); void trackProductEvent("entry_deleted", "/track"); router.push("/calendar"); } catch { setStatus("error"); }
  }

  const toggleSymptom = (value: string) => setSymptoms((items) => items.includes(value) ? items.filter((item) => item !== value) : [...items, value]);
  if (status === "loading") return <main className="track-page"><AppPageState kind="loading" title="Загружаем отметку" text="Это займёт несколько секунд." /></main>;
  if (status === "error") return <main className="track-page"><AppPageState kind="error" title="Не удалось загрузить данные" text="Проверьте соединение. Несохранённые данные не были отправлены." onRetry={() => { setStatus("loading"); void load(); }} /></main>;

  return <main className="track-page"><div className="track-shell">
    <header className="track-top"><Link href="/today" aria-label="Назад"><ArrowLeft /></Link><div><small>{new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long" }).format(new Date(`${date}T12:00:00`))}</small><h1>Как вы сегодня?</h1></div><i /></header>
    <section className="track-card"><h2>Настроение</h2><div className="track-choice-grid mood">{moods.map((item) => <button className={mood === item.value ? "selected" : ""} type="button" onClick={() => setMood(item.value)} key={item.value}><span>{item.icon}</span>{item.label}</button>)}</div></section>
    <section className="track-card"><h2>Энергия</h2><div className="track-choice-grid">{energies.map((item) => <button className={energy === item.value ? "selected" : ""} type="button" onClick={() => setEnergy(item.value)} key={item.value}>{item.label}</button>)}</div></section>
    <section className="track-card"><div className="track-slider-title"><h2>Боль</h2><strong>{pain === undefined ? "Не выбрано" : `${pain} из 10`}</strong></div><input type="range" min="0" max="10" value={pain ?? 0} onChange={(event) => setPain(Number(event.target.value))} /><button className="track-clear-value" type="button" onClick={() => setPain(undefined)}>Не отмечать боль</button></section>
    <section className="track-card"><h2>Выделения</h2><div className="track-flow-grid">{flows.map((item) => <button className={period === item.value ? "selected" : ""} type="button" onClick={() => setPeriod(item.value)} key={item.label}>{item.label}</button>)}</div></section>
    <details className="track-optional"><summary>Дополнительные симптомы <span>необязательно</span></summary><div className="track-symptoms">{symptomOptions.map((item) => <button className={symptoms.includes(item) ? "selected" : ""} type="button" onClick={() => toggleSymptom(item)} key={item}><Check />{item}</button>)}</div></details>
    <label className="track-notes"><span>Заметка <small>необязательно</small></span><textarea maxLength={500} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Что важно запомнить?" /></label>
    <div className="track-actions">{existing && <button className="track-delete" type="button" disabled={status === "saving"} onClick={remove}><Trash2 />Удалить запись</button>}<button className="button" type="button" disabled={status === "saving"} onClick={save}>{status === "saving" ? <><LoaderCircle className="spin" />Сохраняем</> : <><Save />Сохранить</>}</button></div>
  </div></main>;
}

export default function TrackPage() { return <Suspense fallback={<main className="track-page"><AppPageState kind="loading" title="Загружаем" text="Подготавливаем отметку." /></main>}><TrackContent /></Suspense>; }
