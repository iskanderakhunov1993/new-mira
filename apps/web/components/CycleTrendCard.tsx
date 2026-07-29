import Link from "next/link";
import { Info, TrendingUp } from "lucide-react";
import type { CycleRecord } from "@/lib/cycle-analytics";

type CycleTrendCardProps = {
  cycles: CycleRecord[];
  className?: string;
  maxCycles?: number;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "short" }).format(new Date(`${value}T12:00:00`));
}

function dayWord(value: number) {
  const mod10 = value % 10;
  const mod100 = value % 100;
  return mod10 === 1 && mod100 !== 11 ? "день" : mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14) ? "дня" : "дней";
}

export function CycleTrendCard({ cycles, className = "", maxCycles = 6 }: CycleTrendCardProps) {
  const recent = cycles.filter((cycle) => cycle.completed).slice(-maxCycles);
  const values = recent.map((cycle) => cycle.length);

  if (recent.length < 3) {
    const remaining = 3 - recent.length;
    return <section className={`cycle-trend-card ${className}`} aria-labelledby="cycle-trend-title">
      <header><div><small>Только завершённые циклы</small><h2 id="cycle-trend-title">Динамика циклов</h2></div><Info aria-label="Текущий незавершённый цикл не учитывается" /></header>
      <div className="cycle-trend-empty"><TrendingUp /><strong>Нужно ещё {remaining} {dayWord(remaining).replace("день", "цикл").replace("дня", "цикла").replace("дней", "циклов")}</strong><p>График появится после трёх завершённых циклов — раньше сравнение может вводить в заблуждение.</p></div>
    </section>;
  }

  const chartMin = Math.max(0, Math.floor((Math.min(...values) - 4) / 5) * 5);
  const chartMax = Math.ceil((Math.max(...values) + 4) / 5) * 5;
  const ticks = Array.from({ length: 6 }, (_, index) => chartMax - index * ((chartMax - chartMin) / 5));
  const xFor = (index: number) => 42 + (index * 470) / Math.max(1, recent.length - 1);
  const yFor = (value: number) => 238 - ((value - chartMin) / Math.max(1, chartMax - chartMin)) * 180;
  const points = values.map((value, index) => ({ x: xFor(index), y: yFor(value), value }));
  const path = points.slice(1).reduce((result, point, index) => {
    const previous = points[index];
    const middleX = (previous.x + point.x) / 2;
    return `${result} C ${middleX} ${previous.y}, ${middleX} ${point.y}, ${point.x} ${point.y}`;
  }, `M ${points[0].x} ${points[0].y}`);

  const baselineValues = values.slice(0, -1).slice(-3);
  const baselineMin = Math.min(...baselineValues);
  const baselineMax = Math.max(...baselineValues);
  const outsideIndices = values.map((value, index) => {
    const previous = values.slice(Math.max(0, index - 3), index);
    return previous.length >= 3 && (value < Math.min(...previous) || value > Math.max(...previous));
  });
  const hasDifference = outsideIndices.some(Boolean);
  const summary = hasDifference
    ? `Один из последних ${recent.length} завершённых циклов отличался по длине. Посмотрите динамику ниже.`
    : `Последние ${recent.length} завершённых циклов пока близки к вашей недавней истории.`;

  return <section className={`cycle-trend-card ${className}`} aria-labelledby="cycle-trend-title">
    <header><div><small>Только завершённые циклы</small><h2 id="cycle-trend-title">Динамика циклов</h2></div><Info aria-label="Сравниваем фактическую длину завершённых циклов" /></header>
    <p className="cycle-trend-summary">{summary}</p>
    <div className="cycle-trend-plot">
      <svg viewBox="0 0 560 295" role="img" aria-label={`Длина последних циклов: ${values.join(", ")} дней`}>
        {ticks.map((tick) => {
          const y = yFor(tick);
          return <g key={tick}><line x1="24" x2="522" y1={y} y2={y} /><text className="axis-label" x="544" y={y + 4}>{Math.round(tick)}</text></g>;
        })}
        <path className="trend-line" d={path} />
        {points.map((point, index) => <g key={recent[index].start}>
          <circle className={outsideIndices[index] ? "trend-point attention" : "trend-point"} cx={point.x} cy={point.y} r="6" />
          <text className="point-value" x={point.x} y={point.y - 14}>{point.value}</text>
          <text className="point-date" x={point.x} y="278">{formatDate(recent[index].start)}</text>
        </g>)}
      </svg>
      {points.map((point, index) => <Link
        aria-label={`${formatDate(recent[index].start)}: ${point.value} дней. Открыть детали цикла`}
        className="cycle-trend-point-link"
        href={`/analytics/cycles/${recent[index].start}`}
        key={recent[index].start}
        style={{ left: `${(point.x / 560) * 100}%`, top: `${(point.y / 295) * 100}%` }}
      />)}
    </div>
    <footer><strong>Ваш недавний диапазон: {baselineMin}–{baselineMax} {dayWord(baselineMax)}</strong><span>Основано на {baselineValues.length} циклах перед последним. Это личное сравнение, а не медицинская оценка.</span></footer>
  </section>;
}
