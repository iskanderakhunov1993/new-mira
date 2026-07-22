"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { ArrowRight, Check, CircleAlert, Sparkles } from "lucide-react";
import { AppPageState } from "@/components/AppPageState";
import { CycleEntry, getProfile } from "@/lib/demo-session";
import { buildCheckInResult } from "@/lib/domain/result-builder";

function ResultContent() {
  const date = useSearchParams().get("date") ?? new Date().toISOString().slice(0, 10);
  const [data, setData] = useState<{ entry: CycleEntry; history: CycleEntry[] }>();
  const [error, setError] = useState(false);
  useEffect(() => { void getProfile({ refresh: true }).then((profile) => { const entry = profile?.entries?.find((item) => item.date === date); if (!entry) return setError(true); setData({ entry, history: profile?.entries ?? [] }); }).catch(() => setError(true)); }, [date]);
  if (error) return <main className="result-page"><AppPageState kind="error" title="Результат не найден" text="Вернитесь к отметке и попробуйте сохранить её ещё раз." /></main>;
  if (!data) return <main className="result-page"><AppPageState kind="loading" title="Готовим результат" text="Собираем только факты из вашей отметки." /></main>;
  const result = buildCheckInResult(data.entry, data.history);
  return <main className="result-page"><div className="result-shell"><span className="result-check"><Check /></span><small>Готово</small><h1>{result.title}</h1><section className="result-facts"><h2>Что отмечено</h2>{result.facts.map((fact) => <span key={fact}>{fact}</span>)}</section><section className="result-card"><Sparkles /><div><small>Что изменилось</small><p>{result.change}</p></div></section><section className="result-card quiet"><div><small>Что могло повлиять</small><p>{result.influence}</p></div></section>{result.attention && <section className="result-attention"><CircleAlert /><div><strong>Обратите внимание</strong><p>{result.attention}</p></div></section>}<section className="result-next"><small>Что сделать дальше</small><p>{result.next}</p></section><div className="result-actions"><Link className="button" href="/today">Вернуться на главную <ArrowRight /></Link><Link href={`/track?date=${date}`}>Исправить отметку</Link></div></div></main>;
}

export default function CheckInResultPage() { return <Suspense fallback={<main className="result-page"><AppPageState kind="loading" title="Готовим результат" text="Собираем факты." /></main>}><ResultContent /></Suspense>; }
