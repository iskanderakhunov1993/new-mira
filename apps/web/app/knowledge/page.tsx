"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, BookHeart, Search, ShieldCheck } from "lucide-react";
import { AppTabBar } from "@/components/AppTabBar";
import { getProfile, type MiraProfile } from "@/lib/demo-session";
import { cyclePhaseForDate } from "@/lib/domain/cycle-phase";
import { buildKnowledgeRecommendations } from "@/lib/domain/knowledge-recommendations";
import { knowledgeArticles } from "@/lib/knowledge-library";

export default function KnowledgePage() {
  const [query, setQuery] = useState("");
  const [profile, setProfile] = useState<MiraProfile | null>(null);
  const [profileStatus, setProfileStatus] = useState<"loading" | "ready" | "error">("loading");
  useEffect(() => {
    void getProfile().then((current) => { setProfile(current); setProfileStatus("ready"); }).catch(() => setProfileStatus("error"));
  }, []);
  const today = new Date().toISOString().slice(0, 10);
  const phase = cyclePhaseForDate({ entries: profile?.entries ?? [], lastPeriod: profile?.lastPeriod, cycleLength: profile?.cycleLength, periodLength: profile?.periodLength, date: today });
  const recommendedArticles = useMemo(() => buildKnowledgeRecommendations({ entries: profile?.entries ?? [], today, phase }).map((item) => ({ ...item, article: knowledgeArticles.find((article) => article.id === item.articleId)! })), [phase, profile, today]);
  const visibleArticles = useMemo(() => knowledgeArticles.filter((article) => `${article.title} ${article.category} ${article.description}`.toLowerCase().includes(query.trim().toLowerCase())), [query]);

  return <main className="knowledge-page"><div className="knowledge-shell">
    <header className="knowledge-header"><h1>Статьи</h1></header>
    <label className="knowledge-search"><Search /><input aria-label="Поиск по статьям" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Найти среди ${knowledgeArticles.length} статей`} /><kbd>⌘ K</kbd></label>
    <section className="knowledge-now" aria-labelledby="knowledge-now-title"><div className="knowledge-now-heading"><div><span>По текущим данным</span><h2 id="knowledge-now-title">Подходит сейчас</h2><p>Материалы по текущему циклу и сегодняшним отметкам. Это подборка для чтения, а не медицинский вывод.</p></div></div>{profileStatus === "loading" ? <div className="knowledge-now-state">Подбираем материалы…</div> : profileStatus === "error" ? <div className="knowledge-now-state">Не удалось загрузить персональную подборку. Все статьи доступны ниже.</div> : <div className="knowledge-now-grid">{recommendedArticles.map(({ article, reason }) => <Link className="knowledge-now-card" href={`/knowledge/${article.id}`} key={article.id}><small>{reason}</small><h3>{article.title}</h3><span>{article.category} · {article.time}</span><ArrowUpRight /></Link>)}</div>}</section>
    <div className="article-heading"><h2>Все статьи</h2><span>{visibleArticles.length} материалов</span></div>
    {visibleArticles.length ? <section className="article-grid">{visibleArticles.map((article) => <article className="article-card" key={article.id}><Link aria-label={`Открыть: ${article.title}`} href={`/knowledge/${article.id}`}><span aria-hidden="true" className={`article-cover topic-${article.topicId}`} /><h3>{article.title}</h3><span className="article-card-action"><ArrowUpRight /></span></Link></article>)}</section> : <div className="knowledge-empty"><BookHeart /><h3>Ничего не найдено</h3><p>Попробуйте другое слово или очистите поиск.</p></div>}
    <p className="knowledge-disclaimer"><ShieldCheck /> Сейчас статьи содержат редакционный текст-заглушку. Материалы не заменяют консультацию врача.</p>
  </div><AppTabBar active="knowledge" /></main>;
}
