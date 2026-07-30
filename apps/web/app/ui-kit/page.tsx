import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  Bell,
  Calendar,
  Check,
  ChartNoAxesColumnIncreasing,
  ChevronRight,
  CircleAlert,
  CircleHelp,
  CircleUserRound,
  Cross,
  Droplet,
  FileText,
  Footprints,
  Lightbulb,
  Lock,
  Moon,
  Pill,
  Plus,
  Search,
  Settings,
  Share,
  Smile,
  SquarePen,
  TriangleAlert,
  X,
  type LucideIcon,
} from "lucide-react";
import { UiKitShadcnShowcase } from "@/components/UiKitShadcnShowcase";
import { UiKitShadcnCharts } from "@/components/UiKitShadcnCharts";
import { symptomGroups, SymptomIcon } from "@/lib/symptom-catalog";

export const metadata: Metadata = {
  title: "Mira UI Kit",
  description: "Визуальная система Mira: цвет, типографика, иконки и базовые компоненты.",
};

const colors = [
  ["Mira Pink", "#FBA0E4", "Главный бренд-цвет"],
  ["Mira Pink Pressed", "#E889D0", "Нажатие и активное состояние"],
  ["Mira Pink Soft", "#FFF0FB", "Выбранные состояния"],
  ["Lavender 500", "#887BB8", "Вторичный акцент"],
  ["Lavender 200", "#D8D1EB", "Графики и статусы"],
  ["Lavender 50", "#F2EFF9", "Спокойный фон"],
  ["Milk", "#FAF8F5", "Основной фон"],
  ["Surface", "#FFFFFF", "Карточки и sheets"],
  ["Graphite", "#24222A", "Основной текст"],
  ["Muted", "#77737E", "Вторичный текст"],
];

const icons: Array<[LucideIcon, string, string]> = [
  [Calendar, "calendar", "Календарь"],
  [Droplet, "flow", "Месячные"],
  [CircleAlert, "symptoms", "Симптомы"],
  [Smile, "mood", "Настроение"],
  [Moon, "sleep", "Сон"],
  [Footprints, "activity", "Активность"],
  [Pill, "medication", "Лекарства"],
  [Lightbulb, "recommendation", "Рекомендации"],
  [ChartNoAxesColumnIncreasing, "analytics", "Аналитика"],
  [FileText, "report", "Отчёт"],
  [Cross, "doctor", "Врач"],
  [Lock, "privacy", "Приватность"],
  [TriangleAlert, "attention", "Важно"],
  [CircleUserRound, "profile", "Профиль"],
  [Bell, "reminder", "Напоминания"],
  [SquarePen, "note", "Заметки"],
  [Search, "search", "Поиск"],
  [Share, "export", "Поделиться"],
  [Settings, "settings", "Настройки"],
  [CircleHelp, "help", "Пояснение"],
  [Plus, "add", "Добавить"],
  [Check, "done", "Готово"],
  [ChevronRight, "next", "Переход"],
  [X, "close", "Закрыть"],
];

const iconGroups = [
  { title: "Ежедневные отметки", text: "То, что пользователь фиксирует регулярно.", icons: icons.slice(0, 6) },
  { title: "Здоровье и поддержка", text: "Лекарства, рекомендации и подготовка к врачу.", icons: icons.slice(6, 12) },
  { title: "Состояния и профиль", text: "Важные сигналы, личные настройки и заметки.", icons: icons.slice(12, 18) },
  { title: "Системные действия", text: "Знакомые действия без дополнительного объяснения.", icons: icons.slice(18, 24) },
];

function SectionTitle({ eyebrow, children, text }: { eyebrow: string; children: React.ReactNode; text: string }) {
  return (
    <header className="uik-section-title">
      <span>{eyebrow}</span>
      <h2>{children}</h2>
      <p>{text}</p>
    </header>
  );
}

export default function UiKitPage() {
  return (
    <main className="mira-ui-kit">
      <header className="uik-topbar">
        <Link href="/" aria-label="Вернуться на лендинг"><ArrowLeft />Mira</Link>
        <span>UI Kit · 1.0</span>
      </header>

      <section className="uik-hero">
        <span>Визуальная система Mira</span>
        <h1>Mira Health<br /><em>Design System</em></h1>
        <p>Рабочая библиотека токенов, системных элементов, графиков и health-виджетов для всех экранов Mira.</p>
        <div className="uik-principles">
          <span>iOS · mobile first</span><span>24 символа</span><span>8 pt grid</span><span>WCAG AA</span>
        </div>
      </section>

      <nav className="uik-index" aria-label="Разделы UI kit">
        <a href="#color">Цвет</a>
        <a href="#type">Типографика</a>
        <a href="#symbols">Символы</a>
        <a href="#subsymptoms">Подсимптомы</a>
        <a href="#controls">System UI</a>
        <a href="#graphs">Графики</a>
        <a href="#widgets">Health widgets</a>
      </nav>

      <section className="uik-section" id="color">
        <SectionTitle eyebrow="01 · Цвет" text="Лаванда отвечает за доверие и действия, розовый — за цикл и эмоциональные акценты. Красный используется только для реальной срочности.">
          Цвет создаёт спокойствие,<br />а не украшает экран
        </SectionTitle>
        <div className="uik-color-grid">
          {colors.map(([name, hex, usage]) => (
            <article key={name} style={{ "--swatch": hex } as React.CSSProperties}>
              <div />
              <strong>{name}</strong>
              <code>{hex}</code>
              <small>{usage}</small>
            </article>
          ))}
        </div>
        <div className="uik-status-row">
          <span className="is-success">Сохранено</span>
          <span className="is-info">Наблюдение</span>
          <span className="is-attention">Обратите внимание</span>
          <span className="is-danger">Нужна помощь</span>
        </div>
      </section>

      <section className="uik-section uik-type-section" id="type">
        <SectionTitle eyebrow="02 · Типографика" text="Системный шрифт даёт знакомую форму букв, хорошую кириллицу и сохраняет интерфейс быстрым. Размер и насыщенность создают иерархию без декора.">
          Простой шрифт.<br />Чёткая иерархия.
        </SectionTitle>
        <div className="uik-type-board">
          <article><small>Display · 52/54 · 650</small><strong>Слушай себя</strong></article>
          <article><small>Title 1 · 34/38 · 650</small><h2>Сегодня</h2></article>
          <article><small>Title 2 · 24/29 · 650</small><h3>Мои циклы</h3></article>
          <article><small>Body · 17/25 · 400</small><p>Mira помогает сохранять факты и замечать изменения со временем.</p></article>
          <article><small>Caption · 13/18 · 500</small><span>Основано на 12 отметках</span></article>
        </div>
      </section>

      <section className="uik-section" id="symbols">
        <SectionTitle eyebrow="03 · Иконки" text="Простые монохромные символы: 24×24 px, stroke 1.6, круглые окончания. Цвет появляется только в выбранном или важном состоянии.">
          Набор иконок Mira
        </SectionTitle>
        <div className="uik-icon-groups">
          {iconGroups.map((group) => (
            <section key={group.title}>
              <header>
                <h3>{group.title}</h3>
                <p>{group.text}</p>
              </header>
              <div className="uik-icon-grid">
                {group.icons.map(([Icon, name, usage]) => (
                  <article key={name}>
                    <span><Icon aria-hidden="true" strokeWidth={1.6} /></span>
                    <strong>{usage}</strong>
                    <code>{name}</code>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>

      <section className="uik-section" id="subsymptoms">
        <SectionTitle eyebrow="04 · Подсимптомы" text="Компактные пиктограммы для chips и быстрых отметок. Геометрия единая, а цвет закреплён за категорией — он не обозначает тяжесть состояния.">
          Библиотека ежедневных отметок
        </SectionTitle>
        <div className="uik-subsymptom-groups">
          {symptomGroups.map((group) => <section className={`tone-${group.uiTone}`} key={group.title}>
            <header><h3>{group.title}</h3><span>{group.options.length} элементов</span></header>
            <div>{group.options.map((label) => <article key={label}>
              <button type="button" aria-label={label}><i><SymptomIcon label={label} /></i><strong>{label}</strong></button>
              <code>{group.id}/{label.toLowerCase().replaceAll(" ", "-")}</code>
            </article>)}</div>
          </section>)}
        </div>
        <aside className="uik-subsymptom-rule"><CircleAlert /><p><strong>Правило безопасности</strong><span>Иконка помогает быстро найти отметку, но смысл всегда дублируется текстом. Интимные данные остаются отдельной приватной категорией.</span></p></aside>
      </section>

      <section className="uik-section" id="controls">
        <SectionTitle eyebrow="05 · Компоненты" text="Каждый элемент имеет одно назначение. Основное действие всегда одно; дополнительные действия визуально тише.">
          Базовые элементы интерфейса
        </SectionTitle>
        <UiKitShadcnShowcase />
      </section>

      <section className="uik-section" id="graphs">
        <SectionTitle eyebrow="06 · Графики" text="Каждый график должен отвечать на один вопрос. Вывод написан рядом; цвет не является единственным способом прочитать состояние.">
          System graphs
        </SectionTitle>
        <UiKitShadcnCharts />
      </section>

      <section className="uik-section" id="widgets">
        <SectionTitle eyebrow="07 · Health widgets" text="Компактные модули для Today и Analytics. В каждом виджете — один показатель, период, состояние данных и понятный переход.">
          Библиотека health-виджетов
        </SectionTitle>
        <div className="uik-widget-grid">
          <article className="uik-health-widget is-pink">
            <header><span><Calendar /></span><small>Сегодня</small><ChevronRight /></header>
            <strong>18</strong><h3>день цикла</h3><p>Прогноз: примерно 10 дней</p>
          </article>
          <article className="uik-health-widget">
            <header><span><CircleAlert /></span><small>Боль</small><ChevronRight /></header>
            <strong>3<span>/10</span></strong><h3>слабая</h3><p>Близко к обычному уровню</p>
          </article>
          <article className="uik-health-widget">
            <header><span><Moon /></span><small>Сон</small><ChevronRight /></header>
            <strong>7<span>ч 20м</span></strong><h3>сегодня</h3><p>На 35 минут больше среднего</p>
          </article>
          <article className="uik-health-widget is-lavender">
            <header><span><Footprints /></span><small>Активность</small><ChevronRight /></header>
            <strong>6 420</strong><h3>шагов</h3><p>Цель выполнена на 71%</p>
          </article>
          <article className="uik-health-widget">
            <header><span><Pill /></span><small>Лекарства</small><ChevronRight /></header>
            <strong>1</strong><h3>приём сегодня</h3><p>Эффект ещё не отмечен</p>
          </article>
          <article className="uik-health-widget is-attention">
            <header><span><TriangleAlert /></span><small>Наблюдение</small><ChevronRight /></header>
            <strong>2 дня</strong><h3>обильные отметки</h3><p>Если самочувствие ухудшается — обратитесь за помощью</p>
          </article>
        </div>
      </section>

      <section className="uik-section uik-rules">
        <SectionTitle eyebrow="08 · Правила" text="Эти ограничения сохраняют Mira узнаваемой, даже когда продукт растёт.">
          Как применять систему
        </SectionTitle>
        <div>
          <article><strong>8 pt</strong><p>Базовая сетка отступов: 8, 12, 16, 24, 32, 48.</p></article>
          <article><strong>20–28</strong><p>Радиус карточек; кнопки — 14–16 или capsule.</p></article>
          <article><strong>1 CTA</strong><p>Одно главное действие на экран или смысловой блок.</p></article>
          <article><strong>24 px</strong><p>Стандартная иконка, минимальная зона касания 44 px.</p></article>
          <article><strong>Без градиентов</strong><p>Кроме редких брендовых моментов и визуализации данных.</p></article>
          <article><strong>Без диагноза</strong><p>Факты, наблюдения и понятный следующий шаг.</p></article>
        </div>
      </section>

      <footer className="uik-footer">
        <Lock />
        <p>UI Kit — рабочий источник визуальных решений Mira. Следующий шаг: применить токены к лендингу, затем к Today, Diary и Analytics.</p>
      </footer>
    </main>
  );
}
