import type { Metadata, Viewport } from "next";
import {
  ArrowRight,
  BarChart3,
  BatteryMedium,
  CalendarDays,
  Check,
  ChevronRight,
  CircleUserRound,
  ClipboardList,
  CloudSun,
  Download,
  FileHeart,
  HeartPulse,
  LockKeyhole,
  MessageCircleHeart,
  MoonStar,
  Pill,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Trash2,
} from "lucide-react";
import { LandingMotion } from "@/components/LandingMotion";
import { LandingMobileMenu } from "@/components/LandingMobileMenu";
import { LandingTrackerDemo } from "@/components/LandingTrackerDemo";
import { PublicPageView, RegisterCta } from "@/components/PublicProductAnalytics";

export const metadata: Metadata = {
  title: "Mira — трекер менструального цикла и самочувствия",
  description: "Отслеживайте цикл, симптомы, настроение и самочувствие. Замечайте изменения и сохраняйте понятную историю наблюдений для себя и врача.",
  openGraph: {
    title: "Mira — слушай себя",
    description: "Бережный трекер цикла, самочувствия и личных наблюдений.",
    type: "website",
    locale: "ru_RU",
  },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#f7f4ee" };

const principles = [
  { icon: ClipboardList, title: "Простые ежедневные отметки", text: "Сохраняйте только то, что важно сегодня." },
  { icon: BarChart3, title: "Понятная аналитика", text: "Факты и повторения без сложных медицинских выводов." },
  { icon: ShieldCheck, title: "Контроль над данными", text: "Скачивайте историю и управляйте сохранёнными записями." },
];

const steps = [
  ["01", "Отмечайте состояние за минуту", "Цикл, боль, энергия, настроение, сон и лекарства — в одном дневнике."],
  ["02", "Наблюдайте изменения", "Mira показывает повторения только тогда, когда для сравнения достаточно ваших отметок."],
  ["03", "Готовьтесь к разговору с врачом", "Соберите нужный период в аккуратную сводку без попыток поставить диагноз."],
];

const analytics = [
  ["Средняя длина", "28 дней", "4 завершённых цикла"],
  ["Колебания", "26–31 день", "Ваш фактический диапазон"],
  ["Менструация", "4–5 дней", "По сохранённым отметкам"],
  ["Частый симптом", "Головная боль", "3 отметки за 2 цикла"],
];

function Logo() {
  return (
    <a className="ml-logo" href="#top" aria-label="Mira — к началу страницы">
      <span><MoonStar aria-hidden="true" /></span>
      <b>Mira</b>
      <small>Слушай себя</small>
    </a>
  );
}

function Header() {
  return (
    <header className="ml-header" data-landing-header>
      <div className="ml-shell ml-header-inner">
        <Logo />
        <nav className="ml-desktop-nav" aria-label="Основная навигация">
          <a href="#features">Возможности</a>
          <a href="#how">Как работает</a>
          <a href="#analytics">Аналитика</a>
          <a href="#doctor">Для врача</a>
          <a href="#privacy">Безопасность</a>
        </nav>
        <div className="ml-header-actions">
          <a className="ml-login" href="/login">Войти</a>
          <RegisterCta className="ml-button ml-button-small">Попробовать бесплатно</RegisterCta>
        </div>
        <LandingMobileMenu />
      </div>
    </header>
  );
}

function PhoneMockup() {
  return (
    <div className="ml-phone-stage" aria-label="Демонстрация главного экрана Mira">
      <div className="ml-phone">
        <div className="ml-phone-status"><span>9:41</span><i /><span>● ◒</span></div>
        <div className="ml-phone-head"><div><small>Сегодня</small><strong>18 июля</strong></div><CircleUserRound /></div>
        <div className="ml-phase-card">
          <div className="ml-cycle-ring"><div><strong>18</strong><span>день цикла</span></div></div>
          <div><small>Следующие месячные</small><strong>примерно через 10 дней</strong><p>Прогноз ±3 дня</p></div>
        </div>
        <div className="ml-phone-metrics">
          <article><BatteryMedium /><span>Энергия</span><strong>Средняя</strong></article>
          <article><CloudSun /><span>Настроение</span><strong>Спокойное</strong></article>
          <article><HeartPulse /><span>Симптомы</span><strong>1 отметка</strong></article>
        </div>
        <div className="ml-phone-tip"><Sparkles /><div><small>Рекомендация дня</small><strong>Запишите, как меняется энергия к вечеру</strong></div></div>
      </div>
      <div className="ml-phone-note ml-note-top"><Check /><span><small>Дневник</small><strong>Отметка сохранена</strong></span></div>
      <div className="ml-phone-note ml-note-bottom"><ShieldCheck /><span><small>Приватность</small><strong>Данные принадлежат вам</strong></span></div>
    </div>
  );
}

function AnalyticsPreview() {
  return (
    <div className="ml-analytics-preview">
      <header><div><small>Личная динамика</small><strong>Последние 4 цикла</strong></div><span>Демо</span></header>
      <div className="ml-chart" role="img" aria-label="Пример графика длины четырёх циклов: 28, 31, 28 и 26 дней">
        <svg viewBox="0 0 640 250" aria-hidden="true">
          <path className="ml-chart-grid" d="M30 42H610M30 96H610M30 150H610M30 204H610" />
          <path className="ml-chart-area" d="M52 147 C135 130 155 54 235 72 S352 166 428 132 S526 180 588 188 L588 204 L52 204 Z" />
          <path className="ml-chart-line" d="M52 147 C135 130 155 54 235 72 S352 166 428 132 S526 180 588 188" />
          {[["52", "147"], ["235", "72"], ["428", "132"], ["588", "188"]].map(([cx, cy]) => <circle cx={cx} cy={cy} r="8" key={cx} />)}
        </svg>
        <div><span>28 дней</span><span>31 день</span><span>28 дней</span><span>26 дней</span></div>
      </div>
      <p><Sparkles /> Последний цикл короче трёх предыдущих. Это наблюдение по вашей истории, а не медицинская оценка.</p>
    </div>
  );
}

function DoctorReportPreview() {
  return (
    <div className="ml-report-preview" aria-label="Демонстрационный пример отчёта для врача">
      <header><div><span><FileHeart /></span><div><small>Сводка наблюдений</small><strong>Май — июль 2026</strong></div></div><b>Mira</b></header>
      <div className="ml-report-metrics"><span><small>Циклы</small><strong>4</strong></span><span><small>Диапазон</small><strong>26–31</strong></span><span><small>Месячные</small><strong>4–5 дней</strong></span></div>
      <section><strong>Что войдёт в отчёт</strong><ul><li><Check /> История и длительность циклов</li><li><Check /> Интенсивность и симптомы</li><li><Check /> Лекарства и оценка эффекта</li><li><Check /> Выбранные пользователем заметки</li></ul></section>
      <footer><ShieldCheck /><span>Отчёт помогает вспомнить факты, но не заменяет консультацию и медицинскую документацию.</span></footer>
    </div>
  );
}

export default function LandingPage() {
  return (
    <main id="top" className="mira-landing">
      <LandingMotion />
      <PublicPageView name="landing_view" route="/" />
      <Header />

      <section className="ml-hero ml-shell" aria-labelledby="ml-hero-title">
        <div className="ml-hero-copy">
          <span className="ml-kicker"><HeartPulse /> Бережный трекер женского здоровья</span>
          <h1 id="ml-hero-title">Понимай свой цикл.<br /><em>Слушай себя.</em></h1>
          <p>Mira помогает отслеживать цикл, замечать изменения в самочувствии и готовить понятные данные для разговора с врачом.</p>
          <div className="ml-hero-actions">
            <RegisterCta className="ml-button">Начать бесплатно <ArrowRight /></RegisterCta>
            <a className="ml-button-secondary" href="#features">Посмотреть возможности <ChevronRight /></a>
          </div>
          <span className="ml-private-note"><LockKeyhole /> Без рекламы. Данные принадлежат вам.</span>
        </div>
        <PhoneMockup />
      </section>

      <section className="ml-trust ml-shell" aria-label="Принципы Mira">
        {principles.map(({ icon: Icon, title, text }) => <article key={title}><span><Icon /></span><div><strong>{title}</strong><p>{text}</p></div></article>)}
      </section>

      <section className="ml-section ml-how ml-shell" id="how" data-reveal>
        <div className="ml-section-heading"><span>Как работает Mira</span><h2>Одна минута сегодня.<br />Больше ясности со временем.</h2><p>Простой ежедневный ритуал превращается в историю, которую легче понять и обсудить.</p></div>
        <ol>{steps.map(([index, title, text]) => <li key={index}><span>{index}</span><div><strong>{title}</strong><p>{text}</p></div></li>)}</ol>
      </section>

      <section className="ml-feature-section ml-shell" id="features" data-reveal>
        <div className="ml-feature-copy"><span className="ml-section-label">Ежедневный трекинг</span><h2>Важное — без длинных анкет</h2><p>Интерактивный пример показывает, как быстро можно отметить состояние. Данные в демо не сохраняются.</p><ul><li><Check /> Удобно одной рукой</li><li><Check /> Можно заполнить только нужное</li><li><Check /> Никаких оценок «правильно» или «неправильно»</li></ul></div>
        <LandingTrackerDemo />
      </section>

      <section className="ml-analytics ml-shell" id="analytics" data-reveal>
        <div className="ml-section-heading"><span>Аналитика без сложных графиков</span><h2>Не просто цифры —<br />то, что повторяется.</h2><p>Mira помогает увидеть изменения и подготовить вопросы. Причины симптомов и диагнозы определяет врач.</p></div>
        <div className="ml-analytics-layout">
          <div className="ml-analytics-cards">{analytics.map(([title, value, note]) => <article key={title}><small>{title}</small><strong>{value}</strong><span>{note}</span></article>)}</div>
          <AnalyticsPreview />
        </div>
      </section>

      <section className="ml-personal-day ml-shell" data-reveal>
        <div className="ml-day-visual"><span><CalendarDays /></span><strong>18</strong><small>день цикла</small><i>Информационный пример</i></div>
        <div className="ml-day-copy"><span className="ml-section-label">Персональный день</span><h2>Контекст, который помогает решить, что отметить сегодня</h2><ul><li><BatteryMedium /><span><strong>Энергия может быть ниже обычного</strong><small>Сравнение с вашими предыдущими отметками</small></span></li><li><MessageCircleHeart /><span><strong>Вчера отмечалась головная боль</strong><small>Можно продолжить наблюдение сегодня</small></span></li><li><Pill /><span><strong>Не забудьте записать приём лекарства</strong><small>Только если вы уже принимаете его по своему плану</small></span></li><li><Stethoscope /><span><strong>Сильная или необычная боль</strong><small>Обратитесь за медицинской помощью</small></span></li></ul><p>Рекомендации носят информационный характер и не являются назначением.</p></div>
      </section>

      <section className="ml-doctor ml-shell" id="doctor" data-reveal>
        <div className="ml-doctor-copy"><span className="ml-section-label">Отчёт для врача</span><h2>Приходите не с воспоминаниями, а с аккуратно собранной историей</h2><p>Выберите период и категории данных. Mira соберёт фактические отметки в понятную сводку — без предположений о диагнозе.</p><a className="ml-button-secondary" href="/analytics/report">Посмотреть пример отчёта <ArrowRight /></a></div>
        <DoctorReportPreview />
      </section>

      <section className="ml-privacy ml-shell" id="privacy" data-reveal>
        <div className="ml-privacy-symbol"><ShieldCheck /></div>
        <div><span className="ml-section-label">Конфиденциальность — основа</span><h2>Личная история остаётся под вашим контролем</h2><p>Доступ защищён аккаунтом. Mira не показывает рекламу и не продаёт личные данные. В профиле можно скачать историю, очистить записи или удалить аккаунт.</p><div className="ml-privacy-grid"><span><LockKeyhole /> Защита чувствительных данных</span><span><Download /> Выгрузка истории</span><span><Trash2 /> Удаление данных</span><span><ShieldCheck /> Понятные настройки</span></div><a href="/privacy">Подробнее о конфиденциальности <ArrowRight /></a></div>
      </section>

      <section className="ml-final ml-shell" data-reveal>
        <span><MoonStar /></span><h2>Начните лучше понимать своё самочувствие</h2><p>Одна минута в день помогает сохранить историю, которую легко забыть.</p><RegisterCta className="ml-button">Начать бесплатно <ArrowRight /></RegisterCta><small>Mira не ставит диагнозы и не заменяет врача.</small>
      </section>

      <footer className="ml-footer">
        <div className="ml-shell ml-footer-inner"><div><Logo /><p>Бережный дневник цикла и самочувствия.<br />Информационный сервис 18+.</p></div><nav aria-label="Навигация в подвале"><a href="#features">Возможности</a><a href="/privacy">Конфиденциальность</a><a href="/terms">Условия использования</a><a href="/privacy#operator">Связаться с нами</a></nav><p>Mira не является медицинской услугой, методом контрацепции и не заменяет консультацию врача.<br />© 2026 Mira</p></div>
      </footer>
    </main>
  );
}
