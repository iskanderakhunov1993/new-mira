"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { AuthShell } from "@/components/AuthShell";
import { loginAccount } from "@/lib/demo-session";
import { TelegramAuthAction } from "@/components/TelegramAuthAction";

export default function LoginPage() {
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
    if (!email.includes("@") || password.length < 8) return setError("Проверьте email и пароль");

    setIsSubmitting(true);
    try {
      const profile = await loginAccount(email, password);
      router.push(profile.onboardingComplete ? "/today" : "/onboarding");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Ошибка входа");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell eyebrow="Рады видеть снова" title="Ваши наблюдения уже рядом" text="Продолжайте отмечать цикл и самочувствие в своём темпе." quote="Понимание начинается с небольших наблюдений">
      <div className="auth-form-heading"><span>Вход в аккаунт</span><h2>С возвращением</h2><p>Введите данные, чтобы продолжить.</p></div>
      <form className="auth-form" onSubmit={submit} noValidate>
        <label><span>Email</span><div className="input-wrap"><Mail /><input name="email" type="email" autoComplete="email" placeholder="you@example.com" required /></div></label>
        <label><span>Пароль</span><div className="input-wrap"><LockKeyhole /><input name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Ваш пароль" required /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}>{showPassword ? <EyeOff /> : <Eye />}</button></div></label>
        <div className="auth-form-meta"><span>Вход сохранится на этом устройстве</span><a href="#">Забыли пароль?</a></div>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="button auth-submit" type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>Войти <ArrowRight /></button>
      </form>
      <TelegramAuthAction />
      <p className="auth-switch">Нет аккаунта? <Link href="/register">Создать аккаунт</Link></p>
      <p className="auth-demo-note"><LockKeyhole /> Вход защищён Supabase Auth</p>
    </AuthShell>
  );
}
