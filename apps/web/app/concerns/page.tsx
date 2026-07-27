import Link from "next/link";
import { Activity, ArrowLeft, CalendarClock, ChevronRight, Droplets, HeartPulse, ShieldCheck, Waves, Wind } from "lucide-react";

const concerns = [
  {
    href: "/concerns/pain",
    title: "Сильная боль",
    text: "Оценить интенсивность и сопутствующие признаки",
    icon: Activity,
    tone: "pain",
  },
  {
    href: "/concerns/heavy-flow",
    title: "Обильные месячные",
    text: "Зафиксировать интенсивность и длительность",
    icon: Droplets,
    tone: "flow",
  },
  {
    href: "/concerns/delay",
    title: "Месячные не начались",
    text: "Проверить задержку и важные сочетания симптомов",
    icon: CalendarClock,
    tone: "delay",
  },
  {
    href: "/concerns/discharge",
    title: "Выделения, зуд или жжение",
    text: "Зафиксировать изменения и сопутствующие признаки",
    icon: Waves,
    tone: "discharge",
  },
  {
    href: "/concerns/postcoital",
    title: "Боль или кровь после секса",
    text: "Оценить боль, кровотечение и другие изменения",
    icon: HeartPulse,
    tone: "postcoital",
  },
  {
    href: "/concerns/weakness",
    title: "Слабость или головокружение",
    text: "Проверить сочетание с кровотечением и болью",
    icon: Wind,
    tone: "weakness",
  },
] as const;

export default function ConcernsPage() {
  return (
    <main className="concern-page">
      <div className="concern-shell concern-picker">
        <header>
          <Link href="/today" aria-label="Назад"><ArrowLeft /></Link>
          <div><small>Самочувствие</small><h1>Что происходит?</h1></div>
          <span><ShieldCheck /></span>
        </header>
        <p className="concern-lead">Выберите основную проблему. Mira задаст только нужные вопросы и предложит безопасный следующий шаг.</p>
        <section className="concern-choice-list" aria-label="Выберите проблему">
          {concerns.map(({ href, title, text, icon: Icon, tone }) => (
            <Link className={`concern-choice concern-choice-${tone}`} href={href} key={href}>
              <span><Icon /></span>
              <div><h2>{title}</h2><p>{text}</p></div>
              <ChevronRight />
            </Link>
          ))}
        </section>
        <p className="concern-disclaimer">Mira не ставит диагноз и не заменяет консультацию врача. При резком ухудшении состояния обратитесь за медицинской помощью.</p>
      </div>
    </main>
  );
}
