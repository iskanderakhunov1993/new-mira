"use client";

import { LabelList, Line, LineChart, ReferenceArea, ReferenceDot, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import type { CycleRecord } from "@/lib/cycle-analytics";
import styles from "./CycleOverviewChart.module.css";

type CycleOverviewChartProps = {
  cycles: CycleRecord[];
};

const chartConfig = {
  length: { label: "Длина цикла", color: "#c15486" },
} satisfies ChartConfig;

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "short" }).format(new Date(`${value}T12:00:00`));
}

export function CycleOverviewChart({ cycles }: CycleOverviewChartProps) {
  const recent = cycles.filter((cycle) => cycle.completed).slice(-6);

  if (recent.length < 3) {
    return <div className={styles.empty}><strong>Пока мало данных для динамики</strong><span>График появится после трёх завершённых циклов.</span></div>;
  }

  const values = recent.map((cycle) => cycle.length);
  const baseline = values.slice(0, -1).slice(-3);
  const baselineMin = Math.min(...baseline);
  const baselineMax = Math.max(...baseline);
  const min = Math.max(0, Math.min(...values, baselineMin) - 4);
  const max = Math.max(...values, baselineMax) + 4;
  const yTicks = Array.from({ length: Math.floor((max - min) / 3) + 1 }, (_, index) => min + index * 3);
  const latest = recent.at(-1)!;
  const chartData = recent.map((cycle) => ({
    date: formatDate(cycle.start),
    fullDate: cycle.start,
    length: cycle.length,
  }));

  return <div className={styles.chartWrap}>
    <div className={styles.rangeLabel}>Личный диапазон<br />{baselineMin}–{baselineMax} дней</div>
    <ChartContainer
      className={styles.chart}
      config={chartConfig}
      initialDimension={{ width: 720, height: 250 }}
      role="img"
      aria-label={`Длина завершённых циклов: ${values.join(", ")} дней. Личный диапазон ${baselineMin}–${baselineMax} дней.`}
    >
      <LineChart accessibilityLayer data={chartData} margin={{ top: 24, right: 28, bottom: 8, left: 0 }}>
        <ReferenceArea y1={baselineMin} y2={baselineMax} fill="#f6eaf1" fillOpacity={0.82} strokeOpacity={0} />
        <XAxis axisLine={false} dataKey="date" tickLine={false} tickMargin={14} />
        <YAxis axisLine={false} domain={[min, max]} interval={0} ticks={yTicks} tickLine={false} tickMargin={8} width={28} />
        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel formatter={(value) => <span>{Number(value)} дней</span>} />} />
        <Line
          dataKey="length"
          type="monotone"
          stroke="var(--color-length)"
          strokeWidth={2.5}
          dot={{ r: 5, fill: "#ffffff", stroke: "var(--color-length)", strokeWidth: 2 }}
          activeDot={{ r: 7, fill: "#ffffff", stroke: "var(--color-length)", strokeWidth: 3 }}
        ><LabelList dataKey="length" fill="#4b4249" fontSize={11} fontWeight={750} offset={10} position="top" /></Line>
        <ReferenceDot x={formatDate(latest.start)} y={latest.length} r={6} fill="#bd5c8f" stroke="#ffffff" strokeWidth={2} />
      </LineChart>
    </ChartContainer>
  </div>;
}
