import Link from "next/link";
import { ArrowLeft, Heart, MoonStar } from "lucide-react";

type AuthShellProps = {
  children: React.ReactNode;
  eyebrow: string;
  title: string;
  text: string;
  quote?: string;
};

export function AuthShell({ children, eyebrow, title, text, quote }: AuthShellProps) {
  return (
    <main className="auth-page">
      <section className="auth-brand-panel">
        <Link className="logo auth-logo" href="/">
          <span className="logo-mark"><MoonStar /></span>
          <span>Mira</span>
        </Link>
        <div className="auth-brand-copy">
          <div className="eyebrow auth-eyebrow"><span><Heart /></span>{eyebrow}</div>
          <h1>{title}</h1>
          {text && <p>{text}</p>}
        </div>
        <div className="auth-orbits" aria-hidden="true"><span /><span /><span /></div>
        {quote && <blockquote>«{quote}»<small>— принцип Mira</small></blockquote>}
      </section>
      <section className="auth-form-panel">
        <Link className="auth-back" href="/"><ArrowLeft /> На главную</Link>
        <div className="auth-form-wrap">{children}</div>
      </section>
    </main>
  );
}
