"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ArrowRight, Check, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { AuthShell } from "@/components/AuthShell";
import { registerAccount } from "@/lib/demo-session";

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "");
    const consent = data.get("consent") === "on";

    if (!email.includes("@")) return setError("Введите корректный email");
    if (password.length < 8) return setError("Пароль должен содержать минимум 8 символов");
    if (!consent) return setError("Нужно принять условия и политику приватности");

    setIsSubmitting(true);
    try {
      await registerAccount(email, password);
      router.push("/onboarding");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Ошибка регистрации");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell eyebrow="Ваше пространство" title="Начните понимать свой цикл" text="Несколько спокойных отметок помогут увидеть общую картину без догадок." quote="Только вы решаете, что хранить и чем делиться">
      <div className="auth-form-heading"><span>Создание аккаунта</span><h2>Добро пожаловать<br />в Mira</h2><p>Начните бесплатно. Займёт меньше минуты.</p></div>
      <form className="auth-form" onSubmit={submit} noValidate>
        <label><span>Email</span><div className="input-wrap"><Mail /><input name="email" type="email" autoComplete="email" placeholder="you@example.com" required /></div></label>
        <label><span>Пароль</span><div className="input-wrap"><LockKeyhole /><input name="password" type={showPassword ? "text" : "password"} autoComplete="new-password" placeholder="Минимум 8 символов" required minLength={8} /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}>{showPassword ? <EyeOff /> : <Eye />}</button></div></label>
        <label className="consent"><input name="consent" type="checkbox" /><span className="custom-check"><Check /></span><span>Я принимаю <a href="#">условия использования</a> и <a href="#">политику приватности</a></span></label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="button auth-submit" type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>Создать аккаунт <ArrowRight /></button>
      </form>
      <p className="auth-switch">Уже есть аккаунт? <Link href="/login">Войти</Link></p>
      <p className="auth-demo-note"><LockKeyhole /> Демоверсия не сохраняет введённый пароль</p>
    </AuthShell>
  );
}
