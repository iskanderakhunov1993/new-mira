import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, MoonStar, ShieldCheck } from "lucide-react";
import { LEGAL_EFFECTIVE_DATE, LEGAL_VERSION, legalOperator, legalOperatorIsConfigured } from "@/lib/legal";

type LegalDocumentProps = {
  eyebrow: string;
  title: string;
  summary: string;
  children: ReactNode;
};

export function LegalDocument({ eyebrow, title, summary, children }: LegalDocumentProps) {
  return <main className="legal-page"><div className="legal-shell">
    <header className="legal-top"><Link href="/" aria-label="Вернуться на главную"><ArrowLeft /></Link><Link className="logo" href="/"><span className="logo-mark"><MoonStar /></span><span>Mira</span></Link><span /></header>
    <section className="legal-hero"><span>{eyebrow}</span><h1>{title}</h1><p>{summary}</p><small>Редакция {LEGAL_VERSION} · действует с {LEGAL_EFFECTIVE_DATE}</small></section>
    {!legalOperatorIsConfigured && <aside className="legal-draft" role="note"><ShieldCheck /><div><strong>Рабочая редакция для тестирования</strong><p>Перед публичным запуском владелец Mira должен указать в настройках Vercel полное имя или наименование оператора, адрес и email для обращений.</p></div></aside>}
    <article className="legal-content">{children}</article>
    <section className="legal-operator" id="operator"><h2>Оператор и обращения</h2>{legalOperatorIsConfigured ? <><p><strong>{legalOperator.name}</strong></p><p>{legalOperator.address}</p><p><a href={`mailto:${legalOperator.email}`}>{legalOperator.email}</a></p></> : <p>Реквизиты оператора не опубликованы: публичный сбор чувствительных данных до их заполнения не должен начинаться.</p>}</section>
    <footer className="legal-footer"><Link href="/privacy">Конфиденциальность</Link><Link href="/terms">Условия использования</Link><Link href="/register">Вернуться к регистрации</Link></footer>
  </div></main>;
}
