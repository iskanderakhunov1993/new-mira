"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, ArrowUpRight, BookHeart, Search, ShieldAlert, ShieldCheck } from "lucide-react";
import { AppTabBar } from "@/components/AppTabBar";
import { getProfile, type MiraProfile } from "@/lib/demo-session";
import { cyclePhaseForDate } from "@/lib/domain/cycle-phase";
import { buildKnowledgeRecommendations } from "@/lib/domain/knowledge-recommendations";
import { knowledgeArticles, knowledgeTopics, type KnowledgeTopicId } from "@/lib/knowledge-library";

const primaryTopicIds: KnowledgeTopicId[] = ["cycle", "period", "wellbeing", "pms", "important", "fertility"];

export default function KnowledgePage() {
  const [query, setQuery] = useState("");
  const [activeTopic, setActiveTopic] = useState<KnowledgeTopicId | "all">("all");
  const [showAllArticles, setShowAllArticles] = useState(false);
  const [showAllTopics, setShowAllTopics] = useState(false);
  const [profile, setProfile] = useState<MiraProfile | null>(null);
  const [profileStatus, setProfileStatus] = useState<"loading" | "ready" | "error">("loading");
  const resultsRef = useRef<HTMLElement | null>(null);
  const shouldScrollToResultsRef = useRef(false);
  useEffect(() => {
    void getProfile().then((current) => { setProfile(current); setProfileStatus("ready"); }).catch(() => setProfileStatus("error"));
  }, []);
  const today = new Date().toISOString().slice(0, 10);
  const phase = cyclePhaseForDate({ entries: profile?.entries ?? [], lastPeriod: profile?.lastPeriod, cycleLength: profile?.cycleLength, periodLength: profile?.periodLength, date: today });
  const recommendedArticles = useMemo(() => buildKnowledgeRecommendations({ entries: profile?.entries ?? [], today, phase }).map((item) => ({ ...item, article: knowledgeArticles.find((article) => article.id === item.articleId)! })), [phase, profile, today]);
  const visibleArticles = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return knowledgeArticles.filter((article) => {
      const matchesTopic = activeTopic === "all" || article.topicId === activeTopic;
      const matchesQuery = `${article.title} ${article.category} ${article.description}`.toLowerCase().includes(normalizedQuery);
      return matchesTopic && matchesQuery;
    });
  }, [activeTopic, query]);
  const isBrowsing = showAllArticles || activeTopic !== "all" || query.trim().length > 0;
  const activeTopicTitle = knowledgeTopics.find((topic) => topic.id === activeTopic)?.title;
  const displayedTopics = showAllTopics ? knowledgeTopics : knowledgeTopics.filter((topic) => primaryTopicIds.includes(topic.id));

  useEffect(() => {
    if (!isBrowsing || !shouldScrollToResultsRef.current) return;
    shouldScrollToResultsRef.current = false;
    window.requestAnimationFrame(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }, [activeTopic, isBrowsing, showAllArticles]);

  const browseTopic = (topicId: KnowledgeTopicId) => {
    shouldScrollToResultsRef.current = true;
    setActiveTopic(topicId);
    setShowAllArticles(false);
  };

  const browseAllArticles = () => {
    shouldScrollToResultsRef.current = true;
    setActiveTopic("all");
    setShowAllArticles(true);
  };

  const resetBrowsing = () => {
    setQuery("");
    setActiveTopic("all");
    setShowAllArticles(false);
  };

  return <main className="knowledge-page"><div className="knowledge-shell">
    <header className="knowledge-header"><h1>Знания</h1></header>
    <label className="knowledge-search"><Search /><input aria-label="Поиск по статьям" value={query} onChange={(event) => { setQuery(event.target.value); setActiveTopic("all"); setShowAllArticles(false); }} placeholder="Поиск: ПМС, овуляция, боль…" /><span>{knowledgeArticles.length} материалов</span></label>
    {!query.trim() && <section className="knowledge-now" aria-labelledby="knowledge-now-title"><div className="knowledge-now-heading"><div><span>По текущим данным</span><h2 id="knowledge-now-title">Подходит сейчас</h2><p>Материалы по текущему циклу и сегодняшним отметкам. Это подборка для чтения, а не медицинский вывод.</p></div></div>{profileStatus === "loading" ? <div className="knowledge-now-state">Подбираем материалы…</div> : profileStatus === "error" ? <div className="knowledge-now-state">Не удалось загрузить персональную подборку. Все статьи доступны ниже.</div> : <div className="knowledge-now-grid">{recommendedArticles.map(({ article, reason }) => <Link className="knowledge-now-card" href={`/knowledge/${article.id}`} key={article.id}><small>{reason}</small><h3>{article.title}</h3><span>{article.category} · {article.time}</span><ArrowUpRight /></Link>)}</div>}</section>}
    {!query.trim() && <button className="knowledge-safety-shortcut" onClick={() => browseTopic("important")} type="button"><ShieldAlert /><span><strong>Когда нужна помощь</strong><small>Симптомы, которые не стоит откладывать</small></span><ArrowRight /></button>}
    {!query.trim() && <section className="knowledge-topics" aria-labelledby="knowledge-topics-title">
      <div className="article-heading"><div><small>Навигация</small><h2 id="knowledge-topics-title">Найти ответ</h2></div><span>{knowledgeTopics.length} тем</span></div>
      <div className="knowledge-topic-grid">{displayedTopics.map((topic) => {
        const count = knowledgeArticles.filter((article) => article.topicId === topic.id).length;
        const topicNumber = knowledgeTopics.findIndex((item) => item.id === topic.id) + 1;
        return <button aria-pressed={activeTopic === topic.id} className={`topic-${topic.id} ${activeTopic === topic.id ? "active" : ""}`} key={topic.id} onClick={() => browseTopic(topic.id)} type="button"><i>{String(topicNumber).padStart(2, "0")}</i><span><strong>{topic.title}</strong><small>{topic.description}</small><em>{count} материалов</em></span><ArrowRight /></button>;
      })}</div>
      <div className="knowledge-topic-actions"><button className="knowledge-all-button" onClick={() => setShowAllTopics((current) => !current)} type="button">{showAllTopics ? "Скрыть дополнительные темы" : "Все темы"}</button><button className="knowledge-all-button primary" onClick={browseAllArticles} type="button">Все материалы <ArrowRight /></button></div>
    </section>}
    {isBrowsing && <section className="knowledge-results" aria-live="polite" ref={resultsRef} tabIndex={-1}>
      <div className="article-heading"><div><small>{query.trim() ? "Результаты поиска" : "Материалы"}</small><h2>{query.trim() ? `По запросу «${query.trim()}»` : activeTopicTitle ?? "Все материалы"}</h2><p>{visibleArticles.length} {visibleArticles.length === 1 ? "материал" : "материалов"}</p></div><button onClick={resetBrowsing} type="button">Сбросить</button></div>
      {visibleArticles.length ? <div className="article-grid">{visibleArticles.map((article) => <article className="article-card" key={article.id}><Link aria-label={`Открыть: ${article.title}`} href={`/knowledge/${article.id}`}><span aria-hidden="true" className={`article-cover topic-${article.topicId}`} /><small>{article.category}</small><h3>{article.title}</h3><p>{article.time} · В редакционной подготовке</p><span className="article-card-action"><ArrowUpRight /></span></Link></article>)}</div> : <div className="knowledge-empty"><BookHeart /><h3>Ничего не найдено</h3><p>Попробуйте: овуляция, ПМС, железо или другую тему.</p><button onClick={resetBrowsing} type="button">Сбросить фильтры</button></div>}
    </section>}
    <p className="knowledge-disclaimer"><ShieldCheck /> Материалы находятся в редакционной подготовке и не заменяют консультацию врача.</p>
  </div><AppTabBar active="knowledge" /></main>;
}
