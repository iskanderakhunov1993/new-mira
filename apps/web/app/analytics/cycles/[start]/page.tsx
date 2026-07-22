"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, Info, Sparkles } from "lucide-react";
import { useParams } from "next/navigation";
import { getProfile, MiraProfile } from "@/lib/demo-session";
import { buildCycles, cycleStatus, formatCycleDate } from "@/lib/cycle-analytics";

export default function CycleDetailPage() {
  const params = useParams<{ start: string }>(); const [profile, setProfile] = useState<MiraProfile | null>(null);
  useEffect(() => { void getProfile().then(setProfile).catch(() => setProfile(null)); }, []);
  const cycles = useMemo(() => buildCycles(profile?.entries ?? []), [profile]); const cycle = cycles.find((item) => item.start === params.start); const completed = cycles.filter((item) => !item.current); const status = cycleStatus(cycle, completed);
  const symptomCounts = new Map<string, number>(); cycle?.entries.forEach((entry) => entry.symptoms?.forEach((item) => symptomCounts.set(item, (symptomCounts.get(item) ?? 0) + 1))); const symptoms = [...symptomCounts.entries()].sort((a,b) => b[1]-a[1]).slice(0,4);
  if (!cycle) return <main className="cycle-subpage"><div className="analytics-empty"><h2>Цикл не найден</h2><Link href="/analytics/cycles">Вернуться к истории</Link></div></main>;
  return <main className="cycle-subpage"><div className="cycle-subpage-shell"><header className="cycle-subpage-top"><Link href="/analytics/cycles" aria-label="Назад"><ChevronLeft /></Link><h1>Сведения о цикле</h1><i /></header><section className="cycle-detail-strip"><h2>{formatCycleDate(cycle.start)} — {formatCycleDate(cycle.end)}</h2><div>{Array.from({ length: Math.min(cycle.length, 40) }, (_, index) => <i className={index < cycle.periodDays ? "period" : ""} key={index} />)}</div></section><section className="cycle-detail-metric"><header><h2>Длина цикла</h2><Info /></header><strong>{cycle.length} <span>дней</span></strong><b className={status.tone}>{status.label}</b><p>{cycle.current ? "Текущий цикл ещё продолжается и не участвует в среднем." : "Сравнение основано только на вашей истории завершённых циклов."}</p></section><section className="cycle-detail-metric"><header><h2>Продолжительность месячных</h2><Info /></header><strong>{cycle.periodDays} <span>дней</span></strong><p>Учитываются только фактически отмеченные дни.</p></section><section className="cycle-detail-facts"><Sparkles /><div><h2>Что отмечено в этом цикле</h2>{symptoms.length ? symptoms.map(([name,count]) => <p key={name}><strong>{name}</strong><span>{count} раз</span></p>) : <p>Симптомы не отмечены.</p>}</div></section></div></main>;
}
