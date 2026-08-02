"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Scale, Thermometer } from "lucide-react";
import { AppPageState } from "@/components/AppPageState";
import { MeasurementSparkline } from "@/components/MeasurementSparkline";
import { getProfile, type MiraProfile } from "@/lib/demo-session";
import { buildMeasurementTrend, type MeasurementMetric } from "@/lib/domain/measurement-trends";

const metricMeta = {
  weightKg: { title: "Вес", unit: "кг", icon: Scale },
  basalTemperature: { title: "Базальная температура", unit: "°C", icon: Thermometer },
} satisfies Record<MeasurementMetric, { title: string; unit: string; icon: typeof Scale }>;

function recordWord(value: number) {
  const lastTwo = value % 100;
  if (lastTwo >= 11 && lastTwo <= 14) return "записей";
  if (value % 10 === 1) return "запись";
  if (value % 10 >= 2 && value % 10 <= 4) return "записи";
  return "записей";
}

export default function MeasurementsPage() {
  const [profile, setProfile] = useState<MiraProfile | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  useEffect(() => { void getProfile().then((next) => { setProfile(next); setStatus("ready"); }).catch(() => setStatus("error")); }, []);
  const trends = useMemo(() => ([buildMeasurementTrend(profile?.entries ?? [], "weightKg", 30), buildMeasurementTrend(profile?.entries ?? [], "basalTemperature", 30)]), [profile]);
  if (status === "loading") return <main className="measurement-page"><AppPageState kind="loading" title="Загружаем измерения" text="Собираем ваши фактические записи." /></main>;
  if (status === "error") return <main className="measurement-page"><AppPageState kind="error" title="Не удалось загрузить измерения" text="Попробуйте открыть страницу ещё раз." /></main>;
  return <main className="measurement-page"><div className="measurement-shell"><header><Link href="/today" aria-label="Вернуться на Сегодня"><ArrowLeft /></Link><div><small>Личные измерения</small><h1>Динамика показателей</h1><p>Здесь показаны только сохранённые вами значения.</p></div></header>{trends.map((trend) => { const meta = metricMeta[trend.metric]; const Icon = meta.icon; return <section className="measurement-detail-card" id={trend.metric} key={trend.metric}><header><span><Icon /></span><div><small>{trend.points.length} {recordWord(trend.points.length)}</small><h2>{meta.title}</h2></div>{trend.latest !== undefined && <strong>{trend.latest.toLocaleString("ru-RU", { maximumFractionDigits: 2 })} {meta.unit}</strong>}</header>{trend.points.length ? <><MeasurementSparkline trend={trend} large /><div className="measurement-records">{trend.points.slice().reverse().map((point) => <div key={point.date}><time>{new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long", year: "numeric" }).format(new Date(`${point.date}T12:00:00`))}</time><strong>{point.value.toLocaleString("ru-RU", { maximumFractionDigits: 2 })} {meta.unit}</strong></div>)}</div></> : <div className="measurement-empty"><strong>Записей пока нет</strong><p>Добавьте значение в дневнике — Mira не подставляет примерные данные.</p><Link href="/diary?section=measurements">Добавить измерение</Link></div>}<footer>Изменение показателя само по себе не является медицинским выводом.</footer></section>; })}</div></main>;
}
