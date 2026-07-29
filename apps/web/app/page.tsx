import type { Metadata, Viewport } from "next";
import {
  ArrowRight,
  Calendar,
  Check,
  ChevronRight,
  ClipboardCheck,
  Download,
  Droplet,
  FileText,
  Heart,
  Lock,
  Moon,
  Plus,
  ShieldCheck,
  Smile,
  Sparkles,
  Zap,
} from "lucide-react";
import { LandingMotion } from "@/components/LandingMotion";
import { LandingMobileMenu } from "@/components/LandingMobileMenu";
import { DemoCta, PublicPageView, RegisterCta } from "@/components/PublicProductAnalytics";

export const metadata: Metadata = {
  title: "Mira — слушай себя",
  description: "Бережный трекер цикла и самочувствия: ежедневные отметки, личные повторения и понятная сводка для врача.",
  openGraph: {
    title: "Mira — слушай себя",
    description: "Сохраняйте важное о цикле и самочувствии без диагнозов и лишней тревоги.",
    type: "website",
    locale: "ru_RU",
  },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#faf8f5" };

const trustItems = [
  { icon: ShieldCheck, title: "Без рекламы", text: "Никаких отвлекающих блоков" },
  { icon: Heart, title: "Без диагнозов", text: "Факты и бережные наблюдения" },
  { icon: Lock, title: "Данные под контролем", text: "Историю можно скачать или удалить" },
];

const daySignals = [
  { icon: Droplet, label: "Менструация", value: "Умеренная" },
  { icon: Zap, label: "Энергия", value: "Низкая", active: true },
  { icon: Smile, label: "Настроение", value: "Спокойное" },
  { icon: Moon, label: "Сон", value: "6 ч 30 мин" },
];

const reportRows = [
  ["Длина цикла", "26–30 дней"],
  ["Частые симптомы", "Усталость, боли внизу живота, раздражительность"],
  ["Когда отмечались", "14–18 и 1–3 дни цикла"],
  ["Комментарий", "Усталость чаще во второй половине цикла"],
];

function Logo() {
  return (
    <a className="m3-logo" href="#top" aria-label="Mira — к началу страницы">
      <span><Moon aria-hidden="true" strokeWidth={1.6} /></span>
      <span><strong>Mira</strong><small>Трекер цикла и самочувствия</small></span>
    </a>
  );
}

function Header() {
  return (
    <header className="m3-header" data-landing-header>
      <div className="m3-shell m3-header-inner">
        <Logo />
        <nav className="m3-nav" aria-label="Основная навигация">
          <a href="#how">Как это работает</a>
          <a href="#features">Функции</a>
          <a href="#privacy">Безопасность</a>
          <a href="#doctor">Для врача</a>
          <a href="/privacy#operator">Поддержка</a>
        </nav>
        <div className="m3-header-actions">
          <a href="/login">Войти</a>
          <RegisterCta className="m3-button m3-button-small">Попробовать за минуту</RegisterCta>
        </div>
        <LandingMobileMenu />
      </div>
    </header>
  );
}

function DayTimeline() {
  return (
    <div className="m3-timeline" aria-label="Пример одного дня в Mira">
      <h2>Как выглядит один день</h2>
      <div className="m3-timeline-grid">
        <article>
          <time>08:30</time><span>День цикла</span>
          <div className="m3-cycle-value"><strong>18</strong></div>
          <small>из 28</small>
        </article>
        <article>
          <time>12:40</time><span>Отметили симптом</span>
          <div className="m3-timeline-icon"><Zap aria-hidden="true" strokeWidth={1.6} /></div>
          <small><i /> Усталость</small>
        </article>
        <article>
          <time>21:15</time><span>Наблюдение сохранено</span>
          <div className="m3-timeline-icon"><ClipboardCheck aria-hidden="true" strokeWidth={1.6} /></div>
          <small>Данные добавлены<br />в историю</small>
        </article>
      </div>
    </div>
  );
}

function DailyEntryPreview() {
  return (
    <div className="m3-day-preview">
      <header><div><strong>28 июля</strong><small>Сегодня</small></div><span>День цикла 18 из 28</span></header>
      <div className="m3-day-signals">
        {daySignals.map(({ icon: Icon, label, value, active }) => (
          <article className={active ? "is-active" : ""} key={label}>
            <Icon aria-hidden="true" strokeWidth={1.6} />
            <small>{label}</small><strong>{value}</strong>
          </article>
        ))}
        <article className="m3-add-signal"><Plus aria-hidden="true" strokeWidth={1.6} /><small>Добавить</small></article>
      </div>
      <label className="m3-note-preview"><span>Заметка</span><strong>Сегодня больше усталость, чем обычно.</strong></label>
    </div>
  );
}

function PatternPreview() {
  const cells = [
    [1, 1, 2, 2], [1, 2, 3, 1], [0, 1, 2, 1], [1, 0, 1, 0], [2, 1, 0, 1],
  ];
  const labels = ["Энергия", "Настроение", "Сон", "Головная боль", "Боли внизу живота"];
  return (
    <div className="m3-pattern-preview">
      <header><strong>Повторения за 3 цикла</strong><span>Личные данные</span></header>
      <div className="m3-pattern-table" role="table" aria-label="Пример повторений симптомов по фазам цикла">
        <div className="m3-pattern-head" role="row"><span /><span>1–7</span><span>8–14</span><span>15–21</span><span>22–28</span></div>
        {cells.map((row, rowIndex) => (
          <div className="m3-pattern-row" role="row" key={labels[rowIndex]}>
            <span>{labels[rowIndex]}</span>
            {row.map((level, index) => <i data-level={level} role="cell" key={index} aria-label={`Интенсивность ${level}`} />)}
          </div>
        ))}
      </div>
      <footer>
        <span><strong>Усталость</strong><small>дни 14–18</small></span>
        <span><strong>Боли внизу живота</strong><small>дни 1–3</small></span>
        <span><strong>Раздражительность</strong><small>дни 20–24</small></span>
      </footer>
    </div>
  );
}

function ReportPreview() {
  return (
    <div className="m3-report-preview">
      <header><div><FileText aria-hidden="true" strokeWidth={1.6} /><span><strong>Сводка за 3 цикла</strong><small>5 мая — 28 июля 2026</small></span></div><b>Mira</b></header>
      <div className="m3-report-table" role="table" aria-label="Пример сводки для врача">
        {reportRows.map(([label, value]) => <div role="row" key={label}><span role="cell">{label}</span><strong role="cell">{value}</strong></div>)}
      </div>
      <a href="/analytics/report"><Download aria-hidden="true" strokeWidth={1.6} /> Скачать PDF</a>
    </div>
  );
}

export default function LandingPage() {
  return (
    <main id="top" className="mira-landing m3-landing">
      <LandingMotion />
      <PublicPageView name="landing_view" route="/" />
      <Header />

      <section className="m3-hero m3-shell">
        <div className="m3-hero-copy">
          <span className="m3-kicker"><Sparkles aria-hidden="true" strokeWidth={1.6} /> Бережный дневник здоровья</span>
          <h1>Слушайте себя.<br /><em>Mira сохранит важное.</em></h1>
          <p>Понимайте свой цикл, замечайте изменения в самочувствии и приходите к врачу с фактами, а не догадками.</p>
          <div className="m3-hero-actions">
            <DemoCta className="m3-button">Попробовать за минуту <ArrowRight aria-hidden="true" /></DemoCta>
            <a href="#how">Как это работает <ChevronRight aria-hidden="true" /></a>
          </div>
          <small className="m3-data-note"><Lock aria-hidden="true" strokeWidth={1.6} /> Ваши данные принадлежат только вам</small>
        </div>
        <DayTimeline />
      </section>

      <section className="m3-trust m3-shell" id="privacy" aria-label="Принципы Mira">
        {trustItems.map(({ icon: Icon, title, text }) => <article key={title}><Icon aria-hidden="true" strokeWidth={1.6} /><span><strong>{title}</strong><small>{text}</small></span></article>)}
      </section>

      <section className="m3-story m3-story-tint" id="how" data-reveal>
        <div className="m3-shell m3-story-grid">
          <div className="m3-story-copy"><span>01</span><h2>Отметьте сегодня</h2><p>Один раз в день за минуту. Отметьте день цикла и то, что важно: настроение, симптомы, сон, уровень энергии и другое.</p><ul><li><Check /> Быстрые отметки и заметки</li><li><Check /> Напоминания в удобное время</li><li><Check /> Ваши категории — ваш выбор</li></ul></div>
          <DailyEntryPreview />
        </div>
      </section>

      <section className="m3-story" id="features" data-reveal>
        <div className="m3-shell m3-story-grid m3-story-reverse">
          <PatternPreview />
          <div className="m3-story-copy"><span>02</span><h2>Увидьте повторения</h2><p>Mira превращает ежедневные отметки в понятные закономерности вашего цикла.</p><ul><li><Check /> Понятная аналитика без сложных графиков</li><li><Check /> Сравнение циклов и фаз</li><li><Check /> Замечайте, что для вас типично</li></ul></div>
        </div>
      </section>

      <section className="m3-story m3-story-tint" id="doctor" data-reveal>
        <div className="m3-shell m3-story-grid">
          <div className="m3-story-copy"><span>03</span><h2>Возьмите факты к врачу</h2><p>Экспортируйте сводку и приходите на приём с чёткой картиной: что, когда и как часто вас беспокоит.</p><ul><li><Check /> Сводка за выбранный период</li><li><Check /> Симптомы и их частота</li><li><Check /> Удобный экспорт в PDF</li></ul></div>
          <ReportPreview />
        </div>
      </section>

      <section className="m3-final m3-shell" data-reveal>
        <span><Calendar aria-hidden="true" strokeWidth={1.6} /></span>
        <h2>Начните заботу о себе<br />с одной минуты</h2>
        <p>Отметьте сегодня и сделайте первый шаг к пониманию своего цикла.</p>
        <DemoCta className="m3-button">Попробовать за минуту <ArrowRight aria-hidden="true" /></DemoCta>
        <small><Lock aria-hidden="true" strokeWidth={1.6} /> Регистрация займёт меньше минуты</small>
      </section>

      <footer className="m3-footer">
        <div className="m3-shell"><Logo /><p>Mira помогает сохранять наблюдения, но не ставит диагнозы и не заменяет консультацию врача.</p><nav><a href="/privacy">Конфиденциальность</a><a href="/terms">Условия</a><a href="/login">Войти</a></nav></div>
      </footer>
    </main>
  );
}
