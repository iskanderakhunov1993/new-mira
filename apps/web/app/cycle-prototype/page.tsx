"use client";

import Link from "next/link";
import {
  CalendarDays,
  ChevronRight,
  CircleHelp,
  Droplets,
  HeartPulse,
  MoonStar,
  Pill,
  Plus,
  Sparkles,
} from "lucide-react";
import { AppTabBar } from "@/components/AppTabBar";

const phases = [
  { label: "Месячные", width: "18%" },
  { label: "До овуляции", width: "28%" },
  { label: "Овуляция", width: "16%" },
  { label: "После овуляции", width: "38%" },
];

const days = [
  { weekday: "ПН", date: "27" },
  { weekday: "ВТ", date: "28" },
  { weekday: "СР", date: "29" },
  { weekday: "ЧТ", date: "30", active: true },
  { weekday: "ПТ", date: "31" },
  { weekday: "СБ", date: "1" },
  { weekday: "ВС", date: "2" },
];

export default function CyclePrototypePage() {
  return (
    <main className="cycle-prototype-page">
      <div className="cycle-prototype-shell">
        <header className="cycle-prototype-header">
          <div>
            <small>Мой цикл</small>
            <h1>17-й день</h1>
            <p>Предположительно после овуляции</p>
          </div>
          <Link href="/calendar" aria-label="Открыть календарь">
            <CalendarDays />
          </Link>
        </header>

        <nav className="cycle-prototype-week" aria-label="Неделя">
          {days.map((day) => (
            <Link className={day.active ? "active" : ""} href="/calendar" key={`${day.weekday}-${day.date}`}>
              <small>{day.weekday}</small>
              <span>{day.date}</span>
            </Link>
          ))}
        </nav>

        <section className="cycle-orientation-card">
          <div className="cycle-orientation-top">
            <span>Сейчас</span>
            <button type="button" aria-label="Как рассчитывается фаза">
              <CircleHelp />
            </button>
          </div>
          <h2>Лютеиновая фаза</h2>
          <p>До следующих месячных ориентировочно 10–12 дней</p>

          <div className="cycle-phase-track" aria-label="Шкала текущего цикла">
            {phases.map((phase) => (
              <i key={phase.label} style={{ width: phase.width }} />
            ))}
            <b style={{ left: "58%" }}><span>Сегодня</span></b>
          </div>
          <div className="cycle-phase-labels">
            <span>Месячные</span>
            <span>Овуляция</span>
            <span>Следующие</span>
          </div>

          <div className="cycle-prediction">
            <div>
              <small>Следующие месячные</small>
              <strong>9–11 августа</strong>
            </div>
            <span>Прогноз</span>
          </div>
        </section>

        <Link className="cycle-checkin-cta" href="/diary">
          <span><Plus /></span>
          <div>
            <strong>Отметить сегодня</strong>
            <small>Самочувствие, выделения, сон и лекарства</small>
          </div>
          <ChevronRight />
        </Link>

        <section className="cycle-today-summary">
          <header>
            <div>
              <small>Сегодня</small>
              <h2>Краткая сводка</h2>
            </div>
            <Link href="/diary">Изменить</Link>
          </header>
          <div>
            <article><HeartPulse /><span><small>Самочувствие</small><strong>Спокойное</strong></span></article>
            <article><MoonStar /><span><small>Сон</small><strong>7 ч 40 мин</strong></span></article>
            <article><Droplets /><span><small>Выделения</small><strong>Обычные</strong></span></article>
            <article><Pill /><span><small>Лекарства</small><strong>Нет отметок</strong></span></article>
          </div>
        </section>

        <section className="cycle-insight-card">
          <span><Sparkles /></span>
          <div>
            <small>Mira заметила</small>
            <h2>Энергия часто снижается ближе к концу цикла</h2>
            <p>Похоже, это повторялось в 3 последних циклах. Это наблюдение по вашим отметкам, а не медицинский вывод.</p>
            <Link href="/analytics">Посмотреть данные <ChevronRight /></Link>
          </div>
        </section>

        <section className="cycle-detail-links">
          <Link href="/calendar">
            <span><CalendarDays /></span>
            <div><strong>Календарь цикла</strong><small>Записи, месячные и прогнозы по дням</small></div>
            <ChevronRight />
          </Link>
          <Link href="/analytics">
            <span><Sparkles /></span>
            <div><strong>История и личная норма</strong><small>Сравнение только с вашими завершёнными циклами</small></div>
            <ChevronRight />
          </Link>
        </section>

        <p className="cycle-prototype-disclaimer">
          Прогноз меняется по мере появления новых отметок. Mira помогает замечать изменения, но не ставит диагноз.
        </p>
      </div>
      <AppTabBar active="analytics" />
    </main>
  );
}
