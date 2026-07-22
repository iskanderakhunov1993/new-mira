"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, BookHeart, Clock3, Droplets, Search, ShieldCheck } from "lucide-react";
import { AppTabBar } from "@/components/AppTabBar";
import { getProfile, type MiraProfile } from "@/lib/demo-session";
import { cyclePhaseForDate } from "@/lib/domain/cycle-phase";
import { buildKnowledgeRecommendations } from "@/lib/domain/knowledge-recommendations";
import { knowledgeArticles, knowledgeCategories } from "@/lib/knowledge-library";

export default function KnowledgePage() {
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [profile, setProfile] = useState<MiraProfile | null>(null);
  const [profileStatus, setProfileStatus] = useState<"loading" | "ready" | "error">("loading");
  useEffect(() => {
    void getProfile().then((current) => { setProfile(current); setProfileStatus("ready"); }).catch(() => setProfileStatus("error"));
  }, []);
  const today = new Date().toISOString().slice(0, 10);
  const phase = cyclePhaseForDate({ entries: profile?.entries ?? [], lastPeriod: profile?.lastPeriod, cycleLength: profile?.cycleLength, periodLength: profile?.periodLength, date: today });
  const recommendedArticles = useMemo(() => buildKnowledgeRecommendations({ entries: profile?.entries ?? [], today, phase }).map((item) => ({ ...item, article: knowledgeArticles.find((article) => article.id === item.articleId)! })), [phase, profile, today]);
  const visibleArticles = useMemo(() => knowledgeArticles.filter((article) => (category === "all" || article.categoryId === category) && `${article.title} ${article.category} ${article.description}`.toLowerCase().includes(query.toLowerCase())), [category, query]);

  return <main className="knowledge-page"><div className="knowledge-shell">
    <header className="knowledge-header"><span>Библиотека Mira</span><h1>Знания</h1><p>Понятные материалы о цикле, самочувствии и сексуальном здоровье — спокойно и без осуждения.</p></header>
    <section className="knowledge-now" aria-labelledby="knowledge-now-title"><div className="knowledge-now-heading"><div><span>По текущим данным</span><h2 id="knowledge-now-title">Подходит сейчас</h2><p>Материалы по текущему циклу и сегодняшним отметкам. Это подборка для чтения, а не медицинский вывод.</p></div></div>{profileStatus === "loading" ? <div className="knowledge-now-state">Подбираем материалы…</div> : profileStatus === "error" ? <div className="knowledge-now-state">Не удалось загрузить персональную подборку. Все статьи доступны ниже.</div> : <div className="knowledge-now-grid">{recommendedArticles.map(({ article, reason }) => <Link className="knowledge-now-card" href={`/knowledge/${article.id}`} key={article.id}><small>{reason}</small><h3>{article.title}</h3><span>{article.category} · {article.time}</span><ArrowUpRight /></Link>)}</div>}</section>
    <label className="knowledge-search"><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Найти среди 86 статей" /><kbd>⌘ K</kbd></label>
    <div className="knowledge-categories" aria-label="Категории статей"><button className={category === "all" ? "active" : ""} type="button" onClick={() => setCategory("all")}>Все</button>{knowledgeCategories.map((item) => <button className={category === item.id ? "active" : ""} type="button" onClick={() => setCategory(item.id)} key={item.id}>{item.title}</button>)}</div>
    <div className="article-heading"><h2>{category === "all" ? "Все статьи" : knowledgeCategories.find((item) => item.id === category)?.title}</h2><span>{visibleArticles.length} материалов</span></div>
    {visibleArticles.length ? <section className="article-grid">{visibleArticles.map((article, index) => <article className="article-card" key={article.id}><div className={`article-icon ${["rose", "lavender", "blue", "peach", "green", "lilac"][index % 6]}`}><Droplets /></div><div className="article-meta"><span>{article.category}</span><span><Clock3 /> {article.time}</span></div><h3>{article.title}</h3><p>{article.description}</p><Link aria-label={`Открыть: ${article.title}`} href={`/knowledge/${article.id}`}><ArrowUpRight /></Link></article>)}</section> : <div className="knowledge-empty"><BookHeart /><h3>Ничего не найдено</h3><p>Попробуйте другое слово или выберите категорию «Все».</p></div>}
    <p className="knowledge-disclaimer"><ShieldCheck /> Сейчас статьи содержат редакционный текст-заглушку. Материалы не заменяют консультацию врача.</p>
  </div><AppTabBar active="knowledge" /></main>;
}
