"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, Info, Sparkles } from "lucide-react";
import { useParams } from "next/navigation";
import { getProfile, MiraProfile } from "@/lib/demo-session";
import { findSymptomPattern } from "@/lib/personalization";
import { formatCycleDate } from "@/lib/cycle-analytics";

export default function SymptomDetailPage() {
  const params = useParams<{ name: string }>();
  const [profile, setProfile] = useState<MiraProfile | null>(null);
  useEffect(() => { const timer = window.setTimeout(() => setProfile(getProfile()), 0); return () => window.clearTimeout(timer); }, []);
  const name = decodeURIComponent(params.name);
  const pattern = useMemo(() => findSymptomPattern(profile?.entries ?? [], name), [profile, name]);
  if (!pattern) return <main className="cycle-subpage"><div className="analytics-empty"><h2>Пока недостаточно данных</h2><p>Нужны отметки симптома хотя бы в двух из трёх завершённых циклов.</p><Link href="/insights">Вернуться к инсайтам</Link></div></main>;
  return <main className="cycle-subpage"><div className="cycle-subpage-shell symptom-detail"><header className="cycle-subpage-top"><Link href="/insights" aria-label="Назад"><ChevronLeft /></Link><h1>Симптом</h1><i /></header><section className="symptom-detail-hero"><Sparkles /><small>Личный паттерн</small><h2>{pattern.name}</h2><p>Повторялся в {pattern.matchedCycles} из 3 циклов, обычно на {pattern.typicalDay}-й день.</p></section><section className="symptom-history"><header><h2>Отметки по циклам</h2><Info /></header>{pattern.cycles.map(({ cycle, days, averageIntensity }) => <article key={cycle.start}><div><strong>{formatCycleDate(cycle.start)}</strong><span>{days.map((day) => `${day}-й день`).join(", ")}</span></div><b>{averageIntensity ? `Интенсивность ${averageIntensity.toFixed(1)} / 3` : "Без интенсивности"}</b></article>)}</section><section className="cycle-detail-facts"><Info /><div><h2>Как использовать наблюдение</h2><p>За 1–2 дня до привычного периода появления симптома обратите внимание на сон, питание и нагрузку. Если симптом усиливается или беспокоит, обсудите историю с врачом.</p></div></section></div></main>;
}
