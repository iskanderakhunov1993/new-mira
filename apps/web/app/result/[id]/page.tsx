"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, Check, CircleAlert, ShieldAlert, Trash2 } from "lucide-react";
import { AppPageState } from "@/components/AppPageState";
import { deleteAssessment, getAssessment } from "@/lib/demo-session";
import { buildAssessmentResult, type HealthAssessment } from "@/lib/domain/assessment";

export default function AssessmentResultPage() {
  const id = useParams<{ id: string }>().id;
  const router = useRouter();
  const [assessment, setAssessment] = useState<HealthAssessment>();
  const [error, setError] = useState(false);
  useEffect(() => { void getAssessment(id).then(setAssessment).catch(() => setError(true)); }, [id]);
  if (error) return <main className="result-page"><AppPageState kind="error" title="Результат не найден" text="Запись удалена или недоступна этому аккаунту." /></main>;
  if (!assessment) return <main className="result-page"><AppPageState kind="loading" title="Готовим результат" text="Проверяем только сохранённые ответы." /></main>;
  const result = buildAssessmentResult(assessment);
  const concernUrl = assessment.type === "heavy_flow" ? "/concerns/heavy-flow" : `/concerns/${assessment.type}`;
  async function remove() { await deleteAssessment(id); router.replace("/today"); }
  return <main className={`result-page assessment-result ${assessment.resultCode}`}><div className="result-shell"><span className="result-check">{assessment.resultCode === "self_care" ? <Check /> : <ShieldAlert />}</span><small>Информационный результат</small><h1>{result.title}</h1><section className="result-facts"><h2>Что отметили</h2>{result.facts.map((item) => <span key={item}>{item}</span>)}</section><section className="result-card"><div><small>Сравнение с обычной картиной</small><p>{result.comparison}</p></div></section><section className="result-card quiet"><div><small>Что могло повлиять</small><p>{result.influence}</p></div></section>{assessment.resultCode !== "self_care" && <section className="result-attention"><CircleAlert /><div><strong>{assessment.resultCode === "emergency" ? "Срочная помощь" : "Когда обратиться за помощью"}</strong><p>{result.next}</p></div></section>}<section className="result-next"><small>Что можно сделать сейчас</small><p>{result.next}</p></section><details className="result-reason"><summary>Почему Mira так решила</summary><p>{result.reason}</p></details><div className="result-actions"><Link className="button" href="/today">Вернуться на главную <ArrowRight /></Link><Link href={concernUrl}>Заполнить заново</Link><button type="button" onClick={remove}><Trash2 />Удалить результат</button></div><p className="concern-disclaimer">Mira не ставит диагноз и не заменяет медицинскую помощь.</p></div></main>;
}
