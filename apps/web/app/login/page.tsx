"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { AuthShell } from "@/components/AuthShell";
import { createTestAccount, loginAccount, TEST_ACCOUNT } from "@/lib/demo-session";

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

    if (email.toLowerCase() === TEST_ACCOUNT.email && password === TEST_ACCOUNT.password) {
      createTestAccount();
      router.push("/today");
      return;
    }

    setIsSubmitting(true);
    try {
      await loginAccount(email, password);
      router.push("/today");
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
        <div className="auth-form-meta"><label className="remember"><input type="checkbox" /> Запомнить меня</label><a href="#">Забыли пароль?</a></div>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="button auth-submit" type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>Войти <ArrowRight /></button>
      </form>
      <p className="auth-switch">Нет аккаунта? <Link href="/register">Создать бесплатно</Link></p>
      <div className="demo-credentials"><strong>Тестовый аккаунт</strong><span>{TEST_ACCOUNT.email}</span><span>{TEST_ACCOUNT.password}</span></div>
      <p className="auth-demo-note"><LockKeyhole /> Демоверсия не сохраняет введённый пароль</p>
    </AuthShell>
  );
}
