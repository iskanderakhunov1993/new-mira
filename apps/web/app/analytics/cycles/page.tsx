"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getProfile, MiraProfile } from "@/lib/demo-session";
import { buildCycles, formatCycleDate } from "@/lib/cycle-analytics";

export default function CycleHistoryPage() {
  const [profile, setProfile] = useState<MiraProfile | null>(null); const [limit, setLimit] = useState<3 | 99>(3);
  useEffect(() => { const timer = window.setTimeout(() => setProfile(getProfile()), 0); return () => window.clearTimeout(timer); }, []);
  const cycles = useMemo(() => buildCycles(profile?.entries ?? []).reverse(), [profile]);
  return <main className="cycle-subpage"><div className="cycle-subpage-shell"><header className="cycle-subpage-top"><Link href="/analytics" aria-label="Назад"><ChevronLeft /></Link><h1>История циклов</h1><i /></header><div className="cycle-filter"><button className={limit === 99 ? "active" : ""} type="button" onClick={() => setLimit(99)}>Все</button><button className={limit === 3 ? "active" : ""} type="button" onClick={() => setLimit(3)}>Последние 3 цикла</button></div><section className="all-cycles-card"><h2>{new Date().getFullYear()}</h2>{cycles.slice(0, limit).map((cycle) => <Link href={`/analytics/cycles/${cycle.start}`} key={cycle.start}><div><strong>{cycle.current ? `Текущий цикл: ${cycle.length} день` : `${cycle.length} дней`}</strong><span>{cycle.current ? `Начался ${formatCycleDate(cycle.start)}` : `${formatCycleDate(cycle.start)} — ${formatCycleDate(cycle.end)}`}</span><p>{Array.from({ length: Math.min(cycle.length, 35) }, (_, index) => <i className={index < cycle.periodDays ? "period" : ""} key={index} />)}</p></div><ChevronRight /></Link>)}</section></div></main>;
}
