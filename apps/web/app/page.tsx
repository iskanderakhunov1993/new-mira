import {
  ArrowRight,
  BadgeCheck,
  Ban,
  CalendarDays as CalendarBlank,
  ChartNoAxesCombined as ChartLineUp,
  Check,
  ClipboardCheck,
  Download,
  Droplet as Drop,
  FileHeart,
  Heart,
  MoonStar as MoonStars,
  Plus,
  ShieldCheck,
  Smile as Smiley,
  Smartphone,
  Sparkles as Sparkle,
  WalletCards,
} from "lucide-react";
import { LandingMotion } from "@/components/LandingMotion";
import { PublicPageView, RegisterCta } from "@/components/PublicProductAnalytics";

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
    icon: FileHeart,
    eyebrow: "История",
    title: "Соберите факты для врача",
    text: "Выберите даты, боль и симптомы для понятной сводки. Личные заметки не включаются без вашего решения.",
    className: "benefit-private",
  },
];

const faqs = [
  ["Mira действительно полностью бесплатна?", "Да. В Mira нет подписки, рекламы и платных функций. Все возможности MVP доступны бесплатно."],
  ["Можно использовать прогноз как контрацепцию?", "Нет. Прогноз — приблизительный календарный диапазон. Mira не является методом контрацепции и не подтверждает овуляцию или беременность."],
  ["Где хранятся мои данные?", "Постоянная история хранится в базе Supabase и связана с вашим аккаунтом. Браузер не хранит постоянную копию данных о здоровье."],
  ["Можно скачать или удалить историю?", "Да. В профиле можно скачать данные, очистить историю или полностью удалить аккаунт."],
  ["Почему нужен email?", "Email нужен для защищённого входа и доступа к одной истории с ваших устройств. Пароль обрабатывает Supabase Auth."],
  ["Работает ли Mira без интернета?", "Оболочка приложения может открыться, но медицинские записи без соединения не сохраняются, чтобы не создавать конфликтующие версии данных."],
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
    <div className="phone-wrap" role="img" aria-label="Пример актуального главного экрана Mira с прогнозом диапазона, быстрыми отметками и наблюдением">
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
            <div className="cycle-label"><span className="dot" /> Ориентировочный прогноз</div>
            <strong>Месячные примерно<br />через <b>2 дня</b></strong>
            <p>25-й день цикла · диапазон ±3 дня</p>
            <div className="cycle-visual"><span>±3</span><small>дня</small></div>
          </section>
          <div className="quick-title"><strong>Как вы сегодня?</strong><span>Все отметки</span></div>
          <div className="quick-actions">
            <span><i><Drop /></i>Месячные</span>
            <span><i><Plus /></i>Симптомы</span>
            <span><i><Smiley /></i>Самочувствие</span>
          </div>
          <div className="insight-card">
            <span><Sparkle /></span>
            <div><small>Mira заметила</small><strong>Усталость отмечена 3 раза за неделю</strong><p>Факт из 8 отметок · не диагноз</p></div>
          </div>
        </div>
      </div>
      <div className="floating-note note-one"><span><Check /></span><div><small>Отметка сохранена</small><strong>Около 20 секунд</strong></div></div>
      <div className="floating-note note-two"><span><ShieldCheck /></span><div><small>Вы управляете историей</small><strong>Скачать или удалить</strong></div></div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <main id="top" className="landing-page">
      <LandingMotion />
      <PublicPageView name="landing_view" route="/" />
      <header className="header shell">
        <Logo />
        <nav aria-label="Основная навигация">
          <a href="#possibilities">Возможности</a>
          <a href="#free">Почему бесплатно</a>
          <a href="#privacy">Приватность</a>
        </nav>
        <div className="header-actions"><a className="login" href="/login">Войти</a><RegisterCta className="button button-small">Попробовать Mira</RegisterCta></div>
      </header>

      <section className="hero shell">
        <div className="hero-copy">
          <div className="eyebrow"><span><Heart /></span> Без подписки и рекламы</div>
          <h1>Ваш цикл.<br />Ваш ритм.<br /><em>Всё понятнее.</em></h1>
          <p className="hero-lead">Отмечайте месячные и самочувствие за несколько секунд. Mira поможет увидеть личную картину цикла и сохранить важные факты для себя или врача.</p>
          <div className="hero-actions">
            <RegisterCta className="button">Начать вести цикл <ArrowRight /></RegisterCta>
            <a className="text-link" href="#how"><span>01</span> Посмотреть, как работает</a>
          </div>
          <div className="trust-row"><span><Check /> Все функции сразу</span><span><Check /> Без банковской карты</span><span><Check /> Историю можно удалить</span></div>
        </div>
        <PhonePreview />
      </section>

      <section className="free-manifesto shell" id="free">
        <div className="free-manifesto-copy">
          <span className="section-index">ПОЧЕМУ MIRA БЕСПЛАТНА</span>
          <h2>Понимание своего тела<br />не должно начинаться<br /><em>с оплаты.</em></h2>
          <p>Базовые инструменты для отслеживания цикла должны быть доступны каждой. Поэтому Mira не прячет календарь, дневник, историю и аналитику за подпиской.</p>
          <span className="manifesto-sign">Это не акция. Это принцип Mira.</span>
        </div>
        <div className="free-principles">
          <article>
            <span><WalletCards /></span>
            <div><strong>Никакой подписки</strong><p>Банковская карта не нужна. Все функции доступны сразу после регистрации.</p></div>
          </article>
          <article>
            <span><Ban /></span>
            <div><strong>Никакой рекламы</strong><p>Личное пространство не должно отвлекать или продавать ваше внимание.</p></div>
          </article>
          <article>
            <span><BadgeCheck /></span>
            <div><strong>История принадлежит вам</strong><p>Скачивайте данные, очищайте записи или удаляйте аккаунт в любой момент.</p></div>
          </article>
        </div>
      </section>

      <section className="result-proof shell" id="result">
        <header><span className="section-index">ПЕРВЫЙ ПОЛЕЗНЫЙ РЕЗУЛЬТАТ</span><h2>Не просто календарь.<br /><em>Понятный следующий шаг.</em></h2><p>Пример того, как Mira превращает несколько отметок в осторожное и проверяемое наблюдение.</p></header>
        <div className="result-proof-grid">
          <article><span><ClipboardCheck /></span><small>Что отмечено</small><h3>Усталость — 3 раза за последние 7 дней</h3><p>Mira показывает факты из дневника, ничего не додумывая.</p></article>
          <article><span><ChartLineUp /></span><small>Что изменилось</small><h3>Чаще, чем в предыдущие две недели</h3><p>Сравнение появляется только при достаточном количестве ваших записей.</p></article>
          <article><span><FileHeart /></span><small>Что сделать дальше</small><h3>Продолжить наблюдение или сохранить факты для врача</h3><p>Причины и диагнозы Mira не определяет.</p></article>
        </div>
        <p className="result-proof-note"><ShieldCheck /> Демонстрационный пример · основано на 8 отметках · не медицинский вывод</p>
      </section>

      <section className="statement shell" id="possibilities">
        <span className="section-index">01 — ВОЗМОЖНОСТИ</span>
        <h2>Не просто запоминайте даты.<br /><em>Начните понимать цикл.</em></h2>
        <p>Mira хранит факты и осторожно сравнивает их только с вашей личной историей.</p>
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
        <div className="how-copy"><span className="section-index">02 — КАК ЭТО РАБОТАЕТ</span><h2>Несколько секунд сегодня.<br /><em>Больше ясности со временем.</em></h2></div>
        <ol>
          <li><span>1</span><div><strong>Отмечайте</strong><p>Записывайте месячные и самочувствие в удобный момент.</p></div></li>
          <li><span>2</span><div><strong>Наблюдайте</strong><p>Mira покажет повторения, когда данных станет достаточно.</p></div></li>
          <li><span>3</span><div><strong>Действуйте</strong><p>Следите за изменениями или подготовьте факты для врача.</p></div></li>
        </ol>
      </section>

      <section className="pwa-section shell">
        <div className="pwa-icon"><Smartphone /></div>
        <div><span className="section-index">PWA ДЛЯ IPHONE И ANDROID</span><h2>Открывается в браузере.<br /><em>Работает как приложение.</em></h2><p>Добавьте Mira на экран «Домой» и открывайте одним касанием. Магазин приложений и банковская карта не нужны.</p><div className="pwa-facts"><span><Check /> Один аккаунт</span><span><Check /> Быстрый доступ</span><span><Check /> Все функции сразу</span></div></div>
        <aside><Download /><strong>Как установить</strong><p>Откройте меню браузера и выберите «На экран Домой» или «Установить приложение».</p></aside>
      </section>

      <section className="privacy shell" id="privacy">
        <div className="privacy-mark"><ShieldCheck /></div>
        <div><span className="section-index">03 — ПРИВАТНОСТЬ</span><h2>Ваши данные —<br />не плата за <em>продукт.</em></h2><p>Mira не показывает рекламу и не продаёт доступ к функциям. История защищена вашим аккаунтом. Вы можете скачать данные, очистить записи или полностью удалить аккаунт.</p><a className="privacy-link" href="/privacy">Как Mira работает с данными <ArrowRight /></a></div>
      </section>

      <section className="faq shell" id="faq">
        <header><span className="section-index">04 — ВОПРОСЫ</span><h2>Коротко о важном.</h2><p>Без мелкого шрифта и скрытых условий.</p></header>
        <div>{faqs.map(([question, answer]) => <details key={question}><summary>{question}<Plus /></summary><p>{answer}</p></details>)}</div>
      </section>

      <section className="final-cta shell">
        <span className="sparkle sparkle-left">✦</span><span className="sparkle sparkle-right">✦</span>
        <div className="eyebrow"><span><Heart /></span> Mira всегда остаётся бесплатной</div>
        <h2>Начните лучше понимать<br />свой <em>цикл.</em></h2>
        <p>Первая отметка займёт меньше минуты. Подписка и банковская карта не нужны.</p>
        <RegisterCta className="button">Начать вести цикл <ArrowRight /></RegisterCta>
      </section>

      <footer className="footer shell"><div className="footer-brand"><Logo /><p>Цикл — ваш. Данные — ваши. Доступ — бесплатный.<br />18+ · не медицинская услуга · не метод контрацепции.</p></div><div className="footer-links"><a href="#how">Как работает</a><a href="#free">Почему бесплатно</a><a href="#faq">Вопросы</a><a href="/privacy">Конфиденциальность</a><a href="/terms">Условия</a><a href="/privacy#operator">Контакты</a><span>© 2026 Mira</span></div></footer>
    </main>
  );
}
