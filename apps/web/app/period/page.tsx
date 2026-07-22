"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Droplet, LoaderCircle, Trash2 } from "lucide-react";
import { AppPageState } from "@/components/AppPageState";
import { CycleEntry, deletePeriod, endPeriod, getProfile, MiraProfile, startPeriod, trackProductEvent, updatePeriod } from "@/lib/demo-session";

const flows: { value: NonNullable<CycleEntry["period"]>; label: string }[] = [{ value: "spotting", label: "Мажущие" }, { value: "light", label: "Слабые" }, { value: "medium", label: "Средние" }, { value: "heavy", label: "Обильные" }];

export default function PeriodPage() {
  const today = new Date().toISOString().slice(0, 10);
  const [profile, setProfile] = useState<MiraProfile | null>();
  const [date, setDate] = useState(today);
  const [flow, setFlow] = useState<NonNullable<CycleEntry["period"]>>("medium");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [editStart, setEditStart] = useState(today);
  const [editEnd, setEditEnd] = useState(today);
  const load = () => getProfile({ refresh: true }).then((current) => { setProfile(current); const latest = current?.entries?.filter((entry) => entry.periodStarted).sort((a, b) => b.date.localeCompare(a.date))[0]; const end = latest && current?.entries?.filter((entry) => entry.periodEnded && entry.date >= latest.date).sort((a, b) => a.date.localeCompare(b.date))[0]; if (latest) setEditStart(latest.date); if (end) setEditEnd(end.date); }).catch(() => setProfile(null));
  useEffect(() => { void load(); }, []);
  const currentStart = useMemo(() => profile?.entries?.filter((entry) => entry.periodStarted).sort((a, b) => b.date.localeCompare(a.date)).find((entry) => !profile.entries?.some((candidate) => candidate.periodEnded && candidate.date >= entry.date)), [profile]);
  const latestStart = useMemo(() => profile?.entries?.filter((entry) => entry.periodStarted).sort((a, b) => b.date.localeCompare(a.date))[0], [profile]);
  const latestEnd = useMemo(() => latestStart && profile?.entries?.filter((entry) => entry.periodEnded && entry.date >= latestStart.date).sort((a, b) => a.date.localeCompare(b.date))[0], [latestStart, profile]);

  async function submit(mode: "start" | "end") {
    setBusy(true); setError("");
    try { if (mode === "start") { await startPeriod(date, flow); void trackProductEvent("period_started", "/period"); } else { await endPeriod(date, flow); void trackProductEvent("period_ended", "/period"); } await load(); } catch (cause) { setError(cause instanceof Error ? cause.message : "Не удалось сохранить"); } finally { setBusy(false); }
  }
  async function remove() { if (!currentStart) return; setBusy(true); try { await deletePeriod(currentStart.date); void trackProductEvent("period_deleted", "/period"); await load(); } catch { setError("Не удалось удалить запись"); } finally { setBusy(false); } }
  async function removeLatest() { if (!latestStart) return; setBusy(true); try { await deletePeriod(latestStart.date); void trackProductEvent("period_deleted", "/period"); await load(); } catch { setError("Не удалось удалить запись"); } finally { setBusy(false); } }
  async function saveLatest() { if (!latestStart) return; setBusy(true); try { await updatePeriod(latestStart.date, { startDate: editStart, endDate: editEnd, flow }); void trackProductEvent("period_updated", "/period"); await load(); } catch { setError("Не удалось изменить даты"); } finally { setBusy(false); } }

  if (profile === undefined) return <main className="period-page"><AppPageState kind="loading" title="Загружаем данные" text="Проверяем текущий цикл." /></main>;
  if (profile === null) return <main className="period-page"><AppPageState kind="error" title="Не удалось загрузить данные" text="Проверьте соединение." onRetry={load} /></main>;
  return <main className="period-page"><div className="period-shell"><header><Link href="/today" aria-label="Назад"><ArrowLeft /></Link><div><small>Цикл</small><h1>{currentStart ? "Текущие месячные" : "Начались месячные"}</h1></div><span><Droplet /></span></header>{currentStart && <section className="period-current"><small>Начало</small><strong>{new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long" }).format(new Date(`${currentStart.date}T12:00:00`))}</strong><p>Вы можете отметить последний день или удалить ошибочную запись.</p></section>}<label className="period-date"><span>{currentStart ? "Последний день" : "Первый день"}</span><input type="date" min={currentStart?.date} max={today} value={date < (currentStart?.date ?? "") ? currentStart?.date : date} onChange={(event) => setDate(event.target.value)} /></label><section className="period-flow"><h2>Интенсивность в этот день</h2><div>{flows.map((item) => <button className={flow === item.value ? "selected" : ""} type="button" onClick={() => setFlow(item.value)} key={item.value}>{item.label}</button>)}</div></section>{error && <p className="form-error" role="alert">{error}</p>}<button className="button period-submit" type="button" disabled={busy} onClick={() => submit(currentStart ? "end" : "start")}>{busy ? <><LoaderCircle className="spin" />Сохраняем</> : currentStart ? "Отметить окончание" : "Отметить начало"}</button>{currentStart && <button className="period-delete" type="button" disabled={busy} onClick={remove}><Trash2 />Удалить эти месячные</button>}{!currentStart && latestStart && latestEnd && <details className="period-history-editor"><summary>Исправить последние месячные</summary><label><span>Начало</span><input type="date" max={today} value={editStart} onChange={(event) => setEditStart(event.target.value)} /></label><label><span>Окончание</span><input type="date" min={editStart} max={today} value={editEnd} onChange={(event) => setEditEnd(event.target.value)} /></label><button type="button" disabled={busy} onClick={saveLatest}>Сохранить исправления</button><button className="period-delete" type="button" disabled={busy} onClick={removeLatest}><Trash2 />Удалить последние месячные</button></details>}<p className="period-note">После изменения Mira автоматически пересчитает день цикла и диапазон прогноза.</p></div></main>;
}
