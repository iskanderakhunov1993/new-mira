"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarRange,
  Check,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  Droplet,
  HeartPulse,
  Lightbulb,
  LockKeyhole,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import { AppTabBar } from "@/components/AppTabBar";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getInsightInteractions,
  getProfile,
  type InsightInteraction,
  type MiraProfile,
  saveInsightInteraction,
  trackProductEvent,
} from "@/lib/demo-session";
import { buildPersonalization } from "@/lib/personalization";
import { buildCycleAttention } from "@/lib/domain/cycle-period-stats";
import { buildInsightFeed, type InsightFeedItem } from "@/lib/domain/insight-feed";
import styles from "./insights.module.css";

type InsightsTab = "personal" | "checks";
type LoadState = "loading" | "ready" | "error";

const confidenceProgress: Record<InsightFeedItem["confidenceLevel"], number> = {
  first_signs: 38,
  moderate: 68,
  strong: 92,
  observed_change: 76,
};

function CycleDayStrip({ range }: { range?: { min: number; max: number } }) {
  if (!range) return null;
  const totalDays = Math.max(10, Math.min(14, range.max + 2));
  return <div className={styles.dayStrip} aria-label={`Обычно с ${range.min}-го по ${range.max}-й день цикла`}>
    {Array.from({ length: totalDays }, (_, index) => {
      const day = index + 1;
      const active = day >= range.min && day <= range.max;
      return <span className={active ? styles.activeDay : undefined} key={day}><small>{day}</small><i /></span>;
    })}
  </div>;
}

function PrimaryInsight({
  item,
  read,
  onDetail,
  onDismiss,
  onEvidence,
}: {
  item: InsightFeedItem;
  read: boolean;
  onDetail: () => void;
  onDismiss: () => void;
  onEvidence: () => void;
}) {
  return <Card className={styles.primaryCard}>
    <CardHeader className={styles.primaryHeader}>
      <div className={styles.statusRow}>
        <Badge className={item.tone === "attention" ? styles.attentionBadge : styles.patternBadge} variant="secondary">
          {item.tag}
        </Badge>
        {read && <span className={styles.readStatus}><CircleCheck />Прочитано</span>}
      </div>
      <CardTitle className={styles.primaryTitle}>{item.title}</CardTitle>
      <CardDescription className={styles.primaryDescription}>{item.description}</CardDescription>
      <CardAction className={styles.primaryIcon}><Sparkles /></CardAction>
    </CardHeader>
    <CardContent className={styles.primaryContent}>
      <CycleDayStrip range={item.cycleDayRange} />
      <div className={styles.confidenceRow}>
        <div><strong>{item.sample.matchedCycles} из {item.sample.evaluatedCycles} циклов</strong><span>{item.confidenceLabel}</span></div>
        <Progress className={styles.confidenceProgress} value={confidenceProgress[item.confidenceLevel]}>
          <ProgressLabel>Уровень данных</ProgressLabel>
          <ProgressValue>{(_formattedValue, value) => `${value ?? 0}%`}</ProgressValue>
        </Progress>
      </div>
      <Accordion className={styles.evidenceAccordion}>
        <AccordionItem value="evidence">
          <AccordionTrigger className={styles.evidenceTrigger} onClick={onEvidence}>Почему Mira это показывает</AccordionTrigger>
          <AccordionContent className={styles.evidenceContent}>
            <p><strong>Основание</strong>{item.basis}</p>
            <p><strong>Что можно сделать</strong>{item.nextStep}</p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </CardContent>
    <CardFooter className={styles.primaryFooter}>
      <Link className={styles.primaryCta} href={item.href} onClick={onDetail}>Посмотреть закономерность <ArrowRight /></Link>
      <Button className={styles.dismissButton} onClick={onDismiss} type="button" variant="ghost">Не актуально</Button>
    </CardFooter>
  </Card>;
}

function SecondaryInsight({ item, read, onOpen }: { item: InsightFeedItem; read: boolean; onOpen: () => void }) {
  return <Link className={styles.secondaryInsight} href={item.href} onClick={onOpen}>
    <span className={item.tone === "attention" ? styles.secondaryAttention : styles.secondaryPattern}>
      {read ? <Check /> : <Lightbulb />}
    </span>
    <span><small>{item.tag} · {item.confidenceLabel}</small><strong>{item.title}</strong></span>
    <ChevronRight />
  </Link>;
}

function LoadingState() {
  return <div aria-label="Загрузка инсайтов" className={styles.loadingState} role="status">
    <span /><span /><span /><span />
  </div>;
}

export default function InsightsPage() {
  const [profile, setProfile] = useState<MiraProfile | null>(null);
  const [interactions, setInteractions] = useState<Map<string, InsightInteraction>>(new Map());
  const [activeTab, setActiveTab] = useState<InsightsTab>("personal");
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [interactionError, setInteractionError] = useState<string | null>(null);
  const [lastDismissed, setLastDismissed] = useState<InsightFeedItem | null>(null);

  const load = useCallback(async () => {
    setLoadState("loading");
    setInteractionError(null);
    try {
      const nextProfile = await getProfile({ refresh: true });
      setProfile(nextProfile);
      try {
        const nextInteractions = await getInsightInteractions();
        setInteractions(new Map(nextInteractions.map((item) => [item.insightKey, item])));
      } catch {
        setInteractionError("Статусы инсайтов временно не синхронизированы. Сама страница продолжает работать.");
      }
      setLoadState("ready");
    } catch {
      setLoadState("error");
    }
  }, []);

  useEffect(() => {
    const loadTimer = window.setTimeout(() => { void load(); }, 0);
    void trackProductEvent("insights_viewed", "/insights");
    return () => window.clearTimeout(loadTimer);
  }, [load]);

  const entries = useMemo(() => profile?.entries ?? [], [profile?.entries]);
  const personalization = useMemo(() => buildPersonalization(entries), [entries]);
  const attention = useMemo(() => buildCycleAttention(personalization.completed), [personalization.completed]);
  const feed = useMemo(() => buildInsightFeed({
    completedCycles: personalization.completed.length,
    attention,
    pattern: personalization.patterns[0],
  }), [attention, personalization.completed.length, personalization.patterns]);
  const visibleFeed = feed.filter((item) => !interactions.get(item.id)?.dismissedAt);
  const primary = visibleFeed[0];
  const secondary = visibleFeed.slice(1);
  const trackedDays = entries.filter((entry) => entry.period || entry.symptoms?.length || entry.pain !== undefined || entry.mood || entry.energy || entry.sleepHours !== undefined || entry.medicationIntakes?.length).length;
  const symptomMarks = entries.reduce((sum, entry) => sum + (entry.symptoms?.length ?? 0), 0);
  const ready = personalization.completed.length >= 3;
  const privateInsightsEnabled = Boolean(profile?.preferences?.privateInsights && profile?.consents?.sensitiveInsights);

  function optimisticInteraction(item: InsightFeedItem, action: "read" | "dismiss" | "restore") {
    const previous = interactions.get(item.id);
    const now = new Date().toISOString();
    const optimistic = action === "read"
      ? { insightKey: item.id, readAt: previous?.readAt ?? now, dismissedAt: previous?.dismissedAt ?? null }
      : action === "dismiss"
        ? { insightKey: item.id, readAt: previous?.readAt ?? now, dismissedAt: now }
        : { insightKey: item.id, readAt: previous?.readAt ?? null, dismissedAt: null };
    setInteractions((current) => new Map(current).set(item.id, optimistic));
    setInteractionError(null);
    void saveInsightInteraction(item.id, action).then((saved) => {
      setInteractions((current) => new Map(current).set(item.id, saved));
    }).catch(() => {
      setInteractions((current) => {
        const next = new Map(current);
        if (previous) next.set(item.id, previous); else next.delete(item.id);
        return next;
      });
      setInteractionError("Не удалось сохранить действие. Попробуйте ещё раз.");
    });
  }

  function openInsight(item: InsightFeedItem) {
    optimisticInteraction(item, "read");
    void trackProductEvent("insight_detail_opened", "/insights");
  }

  function openEvidence(item: InsightFeedItem) {
    optimisticInteraction(item, "read");
    void trackProductEvent("insight_evidence_opened", "/insights");
  }

  function dismissInsight(item: InsightFeedItem) {
    setLastDismissed(item);
    optimisticInteraction(item, "dismiss");
    void trackProductEvent("insight_dismissed", "/insights");
  }

  function restoreInsight() {
    if (!lastDismissed) return;
    optimisticInteraction(lastDismissed, "restore");
    void trackProductEvent("insight_restored", "/insights");
  }

  return <main className={styles.page}>
    <div className={styles.shell}>
      <header className={styles.header}>
        <div><small>Только ваши записи</small><h1>Инсайты</h1><p>Коротко о том, что изменилось или повторяется.</p></div>
        <span><Lightbulb /></span>
      </header>

      <Tabs className={styles.tabs} onValueChange={(value) => value && setActiveTab(value as InsightsTab)} value={activeTab}>
        <TabsList aria-label="Разделы инсайтов" className={styles.tabsList}>
          <TabsTrigger value="personal">Для вас</TabsTrigger>
          <TabsTrigger value="checks">Проверить</TabsTrigger>
        </TabsList>

        <TabsContent className={styles.tabContent} value="personal">
          {loadState === "loading" && <LoadingState />}
          {loadState === "error" && <Alert className={styles.stateAlert} variant="destructive"><CircleAlert /><AlertTitle>Не удалось загрузить инсайты</AlertTitle><AlertDescription>Проверьте соединение и попробуйте снова.</AlertDescription><AlertAction><Button onClick={() => void load()} variant="outline">Повторить</Button></AlertAction></Alert>}
          {loadState === "ready" && <>
            {interactionError && <Alert className={styles.syncAlert}><CircleAlert /><AlertTitle>Синхронизация недоступна</AlertTitle><AlertDescription>{interactionError}</AlertDescription></Alert>}
            {lastDismissed && interactions.get(lastDismissed.id)?.dismissedAt && <Alert className={styles.undoAlert}><RotateCcw /><AlertTitle>Инсайт скрыт</AlertTitle><AlertDescription>Он исчезнет только для этой версии данных.</AlertDescription><AlertAction><Button onClick={restoreInsight} variant="outline">Вернуть</Button></AlertAction></Alert>}

            {primary ? <>
              <section aria-labelledby="main-insight-heading" className={styles.feedSection}>
                <div className={styles.sectionHeading}><div><small>Главное наблюдение</small><h2 id="main-insight-heading">Что Mira заметила</h2></div></div>
                <PrimaryInsight
                  item={primary}
                  onDetail={() => openInsight(primary)}
                  onDismiss={() => dismissInsight(primary)}
                  onEvidence={() => openEvidence(primary)}
                  read={Boolean(interactions.get(primary.id)?.readAt)}
                />
              </section>
              {secondary.length > 0 && <section aria-labelledby="more-insights-heading" className={styles.secondarySection}>
                <div className={styles.sectionHeading}><div><small>Ещё по вашим отметкам</small><h2 id="more-insights-heading">Другие наблюдения</h2></div></div>
                <div className={styles.secondaryList}>{secondary.map((item) => <SecondaryInsight item={item} key={item.id} onOpen={() => openInsight(item)} read={Boolean(interactions.get(item.id)?.readAt)} />)}</div>
              </section>}
            </> : ready ? <Card className={styles.emptyCard}><CardContent><CircleCheck /><h2>Всё просмотрено</h2><p>Новых наблюдений пока нет. Mira покажет их, когда изменятся данные или появится устойчивое повторение.</p><Link href="/diary?section=symptoms">Добавить отметку</Link></CardContent></Card> : <Card className={styles.emptyCard}><CardContent><Sparkles /><h2>Собираем личную картину</h2><p>{personalization.completed.length} из 3 завершённых циклов · {trackedDays} дней с отметками. До достаточной выборки Mira не делает выводов.</p><Link href="/diary?section=symptoms">Добавить отметку</Link></CardContent></Card>}

            <Accordion className={styles.transparency}>
              <AccordionItem value="data">
                <AccordionTrigger className={styles.transparencyTrigger}>Какие данные использует Mira</AccordionTrigger>
                <AccordionContent className={styles.transparencyContent}>
                  <div><span><CalendarRange /><strong>{personalization.completed.length}</strong><small>завершённых циклов</small></span><span><Droplet /><strong>{entries.filter((entry) => entry.period).length}</strong><small>отметок месячных</small></span><span><HeartPulse /><strong>{symptomMarks}</strong><small>отметок симптомов</small></span><span><LockKeyhole /><strong>{privateInsightsEnabled ? "Вкл." : "Выкл."}</strong><small>приватные инсайты</small></span></div>
                  <p>Интимные данные не анализируются и не попадают в отчёт без отдельного согласия.</p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </>}
        </TabsContent>

        <TabsContent className={styles.tabContent} value="checks">
          <Card className={styles.checksIntro}><CardHeader><CardAction><Stethoscope /></CardAction><Badge variant="outline">Не диагноз</Badge><CardTitle>Проверить самочувствие</CardTitle><CardDescription>Короткие маршруты помогают оценить срочность и собрать факты для врача.</CardDescription></CardHeader></Card>
          <div className={styles.checksList}>
            <Link href="/concerns/pain" onClick={() => void trackProductEvent("insight_check_started", "/insights")}><HeartPulse /><span><small>1–2 минуты</small><strong>Сильная или повторяющаяся боль</strong><em>Оценить интенсивность и тревожные признаки</em></span><ChevronRight /></Link>
            <Link href="/concerns/heavy-flow" onClick={() => void trackProductEvent("insight_check_started", "/insights")}><Droplet /><span><small>1–2 минуты</small><strong>Обильное кровотечение</strong><em>Зафиксировать частоту смены средств и самочувствие</em></span><ChevronRight /></Link>
            <Link href="/concerns/delay" onClick={() => void trackProductEvent("insight_check_started", "/insights")}><CalendarRange /><span><small>Около минуты</small><strong>Задержка месячных</strong><em>Проверить контекст без автоматического вывода</em></span><ChevronRight /></Link>
          </div>
          <Link className={styles.doctorLink} href="/analytics/report"><Stethoscope /><span><strong>Подготовить отчёт для врача</strong><small>Вы сами выбираете, какие данные включить</small></span><ChevronRight /></Link>
          <Alert className={styles.disclaimer}><ShieldCheck /><AlertTitle>Важно</AlertTitle><AlertDescription>Результат проверки не является диагнозом. При резком ухудшении самочувствия обращайтесь за медицинской помощью.</AlertDescription></Alert>
        </TabsContent>
      </Tabs>
    </div>
    <AppTabBar active="insights" />
  </main>;
}
