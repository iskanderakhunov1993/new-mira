import {
  ArrowRight,
  CalendarDays as CalendarBlank,
  ChartNoAxesCombined as ChartLineUp,
  Check,
  Droplet as Drop,
  Heart,
  KeyRound as LockKey,
  MoonStar as MoonStars,
  Plus,
  ShieldCheck,
  Smile as Smiley,
  Sparkles as Sparkle,
} from "lucide-react";

const benefits = [
  {
    icon: CalendarBlank,
    eyebrow: "Цикл",
    title: "Всё важное — за пару касаний",
    text: "Отмечайте месячные, боль, настроение и симптомы без длинных анкет.",
    className: "benefit-cycle",
  },
  {
    icon: ChartLineUp,
    eyebrow: "Наблюдения",
    title: "Замечайте, что повторяется",
    text: "Mira бережно покажет первые закономерности и всегда объяснит, на каких отметках они основаны.",
    className: "benefit-insight",
  },
  {
    icon: LockKey,
    eyebrow: "Приватность",
    title: "Ваши данные принадлежат вам",
    text: "Вы решаете, что хранить, экспортировать или удалить. Без партнёрского доступа и социальных функций.",
    className: "benefit-private",
  },
];

function Logo() {
  return (
    <a className="logo" href="#top" aria-label="Mira — на главную">
      <span className="logo-mark"><MoonStars /></span>
      <span>Mira</span>
    </a>
  );
}

function PhonePreview() {
  return (
    <div className="phone-wrap" aria-label="Пример главного экрана приложения Mira">
      <div className="orbit orbit-one" />
      <div className="orbit orbit-two" />
      <div className="phone">
        <div className="phone-top"><span>9:41</span><span className="island" /><span>● ◒</span></div>
        <div className="phone-content">
          <div className="app-heading">
            <div><span>Доброе утро</span><strong>Сегодня, 19 июля</strong></div>
            <span className="avatar">М</span>
          </div>
          <div className="week">
            {[['ПН','15'],['ВТ','16'],['СР','17'],['ЧТ','18'],['ПТ','19'],['СБ','20'],['ВС','21']].map(([day, date]) => (
              <div className={date === '19' ? 'today' : ''} key={date}><small>{day}</small><span>{date}</span></div>
            ))}
          </div>
          <section className="cycle-card">
            <div className="cycle-label"><span className="dot" /> Текущий цикл</div>
            <strong>Месячные через<br /><b>2 дня</b></strong>
            <p>Низкая вероятность забеременеть</p>
            <div className="cycle-visual"><span>25</span><small>день цикла</small></div>
          </section>
          <div className="quick-title"><strong>Как вы сегодня?</strong><span>Все отметки</span></div>
          <div className="quick-actions">
            <button><span><Drop /></span>Месячные</button>
            <button><span><Plus /></span>Симптомы</button>
            <button><span><Smiley /></span>Настроение</button>
          </div>
          <div className="insight-card">
            <span><Sparkle /></span>
            <div><small>Mira заметила</small><strong>Сон может влиять на самочувствие</strong><p>Основано на 8 отметках</p></div>
          </div>
        </div>
      </div>
      <div className="floating-note note-one"><span><Check /></span><div><small>Отметка сохранена</small><strong>Заняло 10 секунд</strong></div></div>
      <div className="floating-note note-two"><span><ShieldCheck /></span><div><small>Личное остаётся личным</small><strong>Защищённые данные</strong></div></div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <main id="top">
      <header className="header shell">
        <Logo />
        <nav aria-label="Основная навигация">
          <a href="#possibilities">Возможности</a>
          <a href="#privacy">Приватность</a>
          <a href="#how">Как это работает</a>
        </nav>
        <div className="header-actions"><a className="login" href="/login">Войти</a><a className="button button-small" href="/register">Начать бесплатно</a></div>
      </header>

      <section className="hero shell">
        <div className="hero-copy">
          <div className="eyebrow"><span><Heart /></span> Бережно к вашему телу</div>
          <h1>Понимайте свой цикл.<br /><em>Без тревоги.</em></h1>
          <p className="hero-lead">Mira помогает отмечать самочувствие, замечать повторения и лучше понимать своё тело — спокойно и без лишнего шума.</p>
          <div className="hero-actions">
            <a className="button" href="/register">Начать бесплатно <ArrowRight /></a>
            <a className="text-link" href="#how"><span>01</span> Как работает Mira</a>
          </div>
          <div className="trust-row"><span><Check /> Без рекламы</span><span><Check /> Приватно</span><span><Check /> Можно удалить данные</span></div>
        </div>
        <PhonePreview />
      </section>

      <section className="statement shell" id="possibilities">
        <span className="section-index">01 — ВОЗМОЖНОСТИ</span>
        <h2>Меньше догадок.<br /><em>Больше ясности.</em></h2>
        <p>Mira собирает важные наблюдения в одном спокойном пространстве.</p>
      </section>

      <section className="benefits shell">
        {benefits.map(({ icon: Icon, eyebrow, title, text, className }, index) => (
          <article className={`benefit ${className}`} key={title}>
            <div className="benefit-top"><span className="benefit-icon"><Icon /></span><small>0{index + 1}</small></div>
            <span className="benefit-eyebrow">{eyebrow}</span>
            <h3>{title}</h3>
            <p>{text}</p>
            <div className="benefit-art" aria-hidden="true"><span /><span /><span /></div>
          </article>
        ))}
      </section>

      <section className="how shell" id="how">
        <div className="how-copy"><span className="section-index">02 — КАК ЭТО РАБОТАЕТ</span><h2>Один небольшой ритуал.<br /><em>Каждый день.</em></h2></div>
        <ol>
          <li><span>1</span><div><strong>Отмечайте</strong><p>Цикл и самочувствие за 10 секунд.</p></div></li>
          <li><span>2</span><div><strong>Наблюдайте</strong><p>Mira осторожно найдёт повторения.</p></div></li>
          <li><span>3</span><div><strong>Понимайте</strong><p>Смотрите историю или подготовьте факты для врача.</p></div></li>
        </ol>
      </section>

      <section className="privacy shell" id="privacy">
        <div className="privacy-mark"><ShieldCheck /></div>
        <div><span className="section-index">03 — ПРИВАТНОСТЬ</span><h2>Личное должно<br />оставаться <em>личным.</em></h2><p>Ваш дневник не станет социальной сетью. Вы управляете данными и можете удалить их в любой момент.</p></div>
      </section>

      <section className="final-cta shell">
        <span className="sparkle sparkle-left">✦</span><span className="sparkle sparkle-right">✦</span>
        <div className="eyebrow"><span><Heart /></span> Начните с себя</div>
        <h2>Познакомьтесь со своим<br />циклом <em>по-новому.</em></h2>
        <p>Первая отметка займёт меньше минуты.</p>
        <a className="button" href="/register">Создать аккаунт <ArrowRight /></a>
      </section>

      <footer className="footer shell"><Logo /><p>Трекер цикла и самочувствия</p><div><a href="#privacy">Приватность</a><span>© 2026 Mira</span></div></footer>
    </main>
  );
}
