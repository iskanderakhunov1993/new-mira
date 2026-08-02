"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Activity, ArrowDown, ArrowUp, Check, ChevronRight, EyeOff, GlassWater, Package, Pill, Plus, Settings2, Scale, Thermometer } from "lucide-react";
import type { DailyRecommendation } from "@/lib/domain/daily-recommendations";
import type { MeasurementTrend } from "@/lib/domain/measurement-trends";
import type { TodayWidget } from "@/lib/demo-session";
import { MeasurementSparkline } from "@/components/MeasurementSparkline";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  recommendations: DailyRecommendation[];
  waterMl: number;
  waterTargetMl: number;
  savingWater: boolean;
  waterError?: string;
  onAddWater: () => void;
  initialWidgets: TodayWidget[];
  hiddenWidgets: TodayWidget[];
  weightTrend: MeasurementTrend;
  temperatureTrend: MeasurementTrend;
  onWidgetsChange: (widgets: TodayWidget[]) => Promise<void>;
  onHideWidget: (widget: TodayWidget) => Promise<void>;
};

const widgetLabels: Record<TodayWidget, string> = { water: "Вода", movement: "Активность", plan: "Лекарства", weight: "Вес", temperature: "Базальная температура" };
const defaultWidgets: TodayWidget[] = ["water", "movement", "temperature", "weight", "plan"];

function initialWidgetSelection(widgets: TodayWidget[]) {
  const legacyDefault = widgets.length === 3 && widgets.every((widget) => ["water", "movement", "plan"].includes(widget));
  return legacyDefault || widgets.length === 0 ? defaultWidgets : widgets;
}

function formatMetric(value: number | undefined, unit: string) {
  if (value === undefined) return "Добавить значение";
  return `${value.toLocaleString("ru-RU", { maximumFractionDigits: 2 })} ${unit}`;
}

function MeasurementRow({ trend, title, unit, icon }: { trend: MeasurementTrend; title: string; unit: string; icon: ReactNode }) {
  return <Link className="today-dashboard-row today-dashboard-measurement" href={`/analytics/measurements?metric=${trend.metric}`}>
    <span className="today-dashboard-icon metric">{icon}</span>
    <span className="today-dashboard-copy"><strong>{title}</strong><small>{formatMetric(trend.latest, unit)}</small></span>
    <span className="today-dashboard-chart">{trend.points.length > 1 ? <MeasurementSparkline trend={trend} /> : <small>{trend.points.length ? "Первая запись" : "Нет данных"}</small>}</span>
    <ChevronRight aria-hidden="true" />
  </Link>;
}

export function TodayDayPlan({ recommendations, waterMl, waterTargetMl, savingWater, waterError, onAddWater, initialWidgets, hiddenWidgets, weightTrend, temperatureTrend, onWidgetsChange, onHideWidget }: Props) {
  const [visible, setVisible] = useState<TodayWidget[]>(() => initialWidgetSelection(initialWidgets));
  const [hidden, setHidden] = useState<TodayWidget[]>(hiddenWidgets);
  const [savingWidgets, setSavingWidgets] = useState(false);
  const [widgetsError, setWidgetsError] = useState<string>();
  const waterProgress = Math.min(100, Math.round((waterMl / waterTargetMl) * 100));
  const movement = recommendations.find((item) => item.kind === "movement");
  const plan = recommendations.find((item) => item.kind === "medication" || item.kind === "supplement") ?? recommendations.find((item) => item.kind === "kit");
  const available = useMemo<TodayWidget[]>(() => defaultWidgets, []);
  const shown = useMemo(() => visible.filter((item) => !hidden.includes(item)).slice(0, 5), [hidden, visible]);
  const suggestion = available.find((item) => (item === "weight" || item === "temperature") && !visible.includes(item) && (item === "weight" ? weightTrend.points.length : temperatureTrend.points.length));

  async function persist(next: TodayWidget[]) {
    const previous = visible;
    setVisible(next);
    setSavingWidgets(true);
    setWidgetsError(undefined);
    try { await onWidgetsChange(next); } catch { setVisible(previous); setWidgetsError("Не удалось сохранить выбор."); } finally { setSavingWidgets(false); }
  }

  function toggleWidget(key: TodayWidget) {
    void persist(visible.includes(key) ? visible.filter((item) => item !== key) : [...visible, key].slice(-5));
  }

  function moveWidget(key: TodayWidget, direction: -1 | 1) {
    const index = visible.indexOf(key);
    const target = index + direction;
    if (target < 0 || target >= visible.length) return;
    const next = [...visible];
    [next[index], next[target]] = [next[target], next[index]];
    void persist(next);
  }

  async function hideWidget(key: TodayWidget) {
    setHidden((current) => [...current, key]);
    try { await onHideWidget(key); } catch { setHidden((current) => current.filter((item) => item !== key)); setWidgetsError("Не удалось скрыть модуль."); }
  }

  return <section className="today-day-plan" aria-labelledby="today-day-plan-title">
    <header className="today-day-plan-heading">
      <div><small>Ваши показатели</small><h2 id="today-day-plan-title">Мой день</h2></div>
      <details className="today-widget-settings">
        <summary><Settings2 aria-hidden="true" />Настроить</summary>
        <Card className="today-widget-settings-card" role="group" aria-label="Виджеты страницы Сегодня"><CardHeader><CardTitle>Показатели Today</CardTitle></CardHeader><CardContent>
          {available.map((key) => {
            const checked = visible.includes(key);
            const index = visible.indexOf(key);
            return <div className="today-widget-setting-row" key={key}>
              <button aria-pressed={checked} className={checked ? "active" : ""} disabled={savingWidgets} type="button" onClick={() => toggleWidget(key)}><span>{widgetLabels[key]}</span>{checked && <Check aria-hidden="true" />}</button>
              {checked && <span className="today-widget-order"><button type="button" aria-label={`Поднять ${widgetLabels[key]}`} disabled={index === 0 || savingWidgets} onClick={() => moveWidget(key, -1)}><ArrowUp /></button><button type="button" aria-label={`Опустить ${widgetLabels[key]}`} disabled={index === visible.length - 1 || savingWidgets} onClick={() => moveWidget(key, 1)}><ArrowDown /></button><button type="button" aria-label={`Скрыть ${widgetLabels[key]} сегодня`} disabled={savingWidgets} onClick={() => void hideWidget(key)}><EyeOff /></button></span>}
            </div>;
          })}
          <small>До пяти показателей. Порядок сохраняется в профиле.</small>{widgetsError && <small className="today-widget-settings-error" role="status">{widgetsError}</small>}
        </CardContent></Card>
      </details>
    </header>

    {suggestion && <div className="today-pin-suggestion"><div><Plus aria-hidden="true" /><span><strong>Добавить «{widgetLabels[suggestion]}»?</strong><small>После первой записи можно видеть динамику прямо здесь.</small></span></div><Button type="button" variant="secondary" disabled={savingWidgets} onClick={() => void persist([...visible, suggestion].slice(-5))}>Добавить</Button></div>}

    {shown.length ? <Card className="today-dashboard-card">
      <CardContent>
        {shown.includes("water") && <div className="today-dashboard-row today-dashboard-water">
          <span className="today-dashboard-icon water"><GlassWater aria-hidden="true" /></span>
          <span className="today-dashboard-copy"><strong>Вода</strong><small>{(waterMl / 1000).toLocaleString("ru-RU", { maximumFractionDigits: 1 })} из {(waterTargetMl / 1000).toLocaleString("ru-RU", { maximumFractionDigits: 1 })} л</small></span>
          <span className="today-dashboard-progress" role="progressbar" aria-label="Прогресс воды" aria-valuemin={0} aria-valuemax={waterTargetMl} aria-valuenow={Math.min(waterMl, waterTargetMl)}><i style={{ width: `${waterProgress}%` }} /></span>
          <Button aria-label="Добавить 300 миллилитров воды" type="button" variant="secondary" size="icon" disabled={savingWater || waterMl >= 6000} onClick={onAddWater}><Plus aria-hidden="true" /></Button>
        </div>}
        {shown.includes("movement") && <Link className="today-dashboard-row" href="/diary?section=activity"><span className="today-dashboard-icon activity"><Activity aria-hidden="true" /></span><span className="today-dashboard-copy"><strong>Активность</strong><small>Добавить движение или отдых</small></span><ChevronRight aria-hidden="true" /></Link>}
        {shown.includes("temperature") && <MeasurementRow trend={temperatureTrend} title="Базальная температура" unit="°C" icon={<Thermometer aria-hidden="true" />} />}
        {shown.includes("weight") && <MeasurementRow trend={weightTrend} title="Вес" unit="кг" icon={<Scale aria-hidden="true" />} />}
      </CardContent>
    </Card> : <Card className="today-day-plan-empty"><CardContent><strong>На сегодня всё скрыто</strong><p>Завтра показатели появятся снова. Постоянный набор можно изменить в «Настроить».</p></CardContent></Card>}

    {waterError && <p className="today-water-error" role="status">{waterError}</p>}
    {movement && <Card className="today-recommendation-card"><CardContent><span className="today-recommendation-icon"><Activity aria-hidden="true" /></span><span><small>Рекомендация дня</small><strong>{movement.title}</strong><p>{movement.description}</p></span><Link href={movement.href}>Отметить</Link></CardContent></Card>}
    {shown.includes("plan") && plan && <Link className="today-plan-row" href={plan.href}><span>{plan.kind === "kit" ? <Package aria-hidden="true" /> : <Pill aria-hidden="true" />}</span><strong>{plan.kind === "kit" ? "Личная аптечка" : "Лекарства"}</strong><small>{plan.title}</small><ChevronRight aria-hidden="true" /></Link>}
  </section>;
}
