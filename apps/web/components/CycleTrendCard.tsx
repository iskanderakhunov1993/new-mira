"use client";

import Link from "next/link";
import { Info, TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Label, LabelList, ReferenceArea, ReferenceLine, XAxis, YAxis } from "recharts";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import type { CycleRecord } from "@/lib/cycle-analytics";

type CycleTrendCardProps = {
  cycles: CycleRecord[];
  className?: string;
  maxCycles?: number;
};

const chartConfig = {
  length: { label: "Длина цикла", color: "#778198" },
} satisfies ChartConfig;

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "short" }).format(new Date(`${value}T12:00:00`));
}

function dayWord(value: number) {
  const mod10 = value % 10;
  const mod100 = value % 100;
  return mod10 === 1 && mod100 !== 11 ? "день" : mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14) ? "дня" : "дней";
}

function cycleWord(value: number) {
  const mod10 = value % 10;
  const mod100 = value % 100;
  return mod10 === 1 && mod100 !== 11 ? "цикл" : mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14) ? "цикла" : "циклов";
}

export function CycleTrendCard({ cycles, className = "", maxCycles = 6 }: CycleTrendCardProps) {
  const recent = cycles.filter((cycle) => cycle.completed).slice(-maxCycles);
  const values = recent.map((cycle) => cycle.length);

  if (recent.length < 3) {
    const remaining = 3 - recent.length;
    return <Card className={`cycle-trend-card ${className}`} aria-labelledby="cycle-trend-title">
      <CardHeader className="cycle-trend-header"><div><small>Только завершённые циклы</small><CardTitle id="cycle-trend-title">Динамика циклов</CardTitle></div><Info aria-label="Текущий незавершённый цикл не учитывается" /></CardHeader>
      <CardContent className="cycle-trend-empty"><TrendingUp /><strong>Нужно ещё {remaining} {cycleWord(remaining)}</strong><p>Сравнение появится после трёх завершённых циклов — раньше вывод может быть неточным.</p></CardContent>
    </Card>;
  }

  const baselineValues = values.slice(0, -1).slice(-3);
  const baselineMin = Math.min(...baselineValues);
  const baselineMax = Math.max(...baselineValues);
  const latest = values.at(-1) ?? 0;
  const chartMin = Math.max(0, Math.floor((Math.min(...values, baselineMin) - 5) / 5) * 5);
  const chartMax = Math.ceil((Math.max(...values, baselineMax) + 4) / 5) * 5;
  const beforeRangeTick = Math.round(((chartMin + baselineMin) / 2) / 5) * 5;
  const ticks = Array.from(new Set([chartMin, beforeRangeTick, baselineMin, baselineMax, chartMax])).sort((a, b) => a - b);
  const summary = latest < baselineMin
    ? "Последний цикл короче вашего недавнего диапазона"
    : latest > baselineMax
      ? "Последний цикл длиннее вашего недавнего диапазона"
      : "Последний цикл входит в ваш недавний диапазон";
  const chartData = recent.map((cycle, index) => ({
    date: formatDate(cycle.start),
    length: cycle.length,
    start: cycle.start,
    latest: index === recent.length - 1,
  }));

  return <Card className={`cycle-trend-card cycle-trend-range-card ${className}`} aria-labelledby="cycle-trend-title">
    <CardHeader className="cycle-trend-header">
      <div><CardTitle id="cycle-trend-title">Динамика циклов</CardTitle><small>Только завершённые циклы</small></div>
      <Info aria-label="Сравниваем фактическую длину завершённых циклов" />
    </CardHeader>
    <CardContent className="cycle-trend-range-content">
      <p className="cycle-trend-range-insight"><TrendingUp aria-hidden="true" /><span>{summary}</span></p>
      <div className="cycle-trend-range-label" aria-hidden="true">Личный диапазон {baselineMin}–{baselineMax} {dayWord(baselineMax)}</div>
      <ChartContainer
        className="cycle-trend-range-chart"
        config={chartConfig}
        initialDimension={{ width: 680, height: Math.max(250, chartData.length * 60) }}
        role="img"
        aria-label={`Длина завершённых циклов: ${values.join(", ")} дней. Личный диапазон ${baselineMin}–${baselineMax} дней.`}
      >
        <BarChart accessibilityLayer data={chartData} layout="vertical" margin={{ top: 8, right: 72, bottom: 24, left: 0 }}>
          <CartesianGrid horizontal vertical={false} stroke="#ece8ed" />
          <ReferenceArea x1={baselineMin} x2={baselineMax} fill="#f8edf4" fillOpacity={0.82} strokeOpacity={0} />
          <ReferenceLine x={baselineMin} stroke="#ddb0c8" strokeDasharray="4 4" />
          <ReferenceLine x={baselineMax} stroke="#ddb0c8" strokeDasharray="4 4" />
          <XAxis axisLine={false} dataKey="length" domain={[chartMin, chartMax]} tickLine={false} ticks={ticks} type="number">
            <Label value="Дни цикла" position="insideBottom" offset={-14} fill="#8d858e" fontSize={11} />
          </XAxis>
          <YAxis axisLine={false} dataKey="date" tickLine={false} type="category" width={58} />
          <ChartTooltip cursor={{ fill: "rgba(248,237,244,.62)" }} content={<ChartTooltipContent hideLabel formatter={(value) => <span>{Number(value)} {dayWord(Number(value))}</span>} />} />
          <Bar dataKey="length" radius={999} barSize={8}>
            {chartData.map((item) => <Cell fill={item.latest ? "#bd5c8f" : "#778198"} key={item.start} />)}
            <LabelList dataKey="length" fill="#443b43" fontSize={11} fontWeight={750} formatter={(value) => `${Number(value)} ${dayWord(Number(value))}`} position="right" />
          </Bar>
        </BarChart>
      </ChartContainer>
      <nav className="sr-only" aria-label="Открыть завершённый цикл">{recent.map((cycle) => <Link href={`/analytics/cycles/${cycle.start}`} key={cycle.start}>{formatDate(cycle.start)}: {cycle.length} {dayWord(cycle.length)}</Link>)}</nav>
      <Accordion className="cycle-trend-method">
        <AccordionItem value="method">
          <AccordionTrigger>Как Mira сравнивает циклы</AccordionTrigger>
          <AccordionContent>Сравниваем последний завершённый цикл с тремя предыдущими. Это личный ориентир, а не медицинская оценка.</AccordionContent>
        </AccordionItem>
      </Accordion>
    </CardContent>
  </Card>;
}
