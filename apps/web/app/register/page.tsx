"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ArrowRight, Check, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { AuthShell } from "@/components/AuthShell";
import { PublicPageView } from "@/components/PublicProductAnalytics";
import { registerAccount } from "@/lib/demo-session";
import { LEGAL_VERSION } from "@/lib/legal";
import { TelegramAuthAction } from "@/components/TelegramAuthAction";

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    const data = new FormData(event.currentTarget);
    const normalizedEmail = email.trim();
    const termsConsent = data.get("termsConsent") === "on";
    const healthDataConsent = data.get("healthDataConsent") === "on";

    if (!normalizedEmail.includes("@")) return setError("Введите корректный email");
    if (password.length < 8) return setError("Пароль должен содержать минимум 8 символов");
    if (!termsConsent) return setError("Подтвердите совершеннолетие и примите условия использования");
    if (!healthDataConsent) return setError("Нужно отдельно согласиться на обработку данных о цикле и здоровье");

    setIsSubmitting(true);
    try {
      const result = await registerAccount(normalizedEmail, password, { terms: true, privacyPolicy: true, healthData: true, version: LEGAL_VERSION });
      if (result.requiresEmailConfirmation) {
        setSuccess("Проверьте почту и подтвердите адрес. После подтверждения вы вернётесь в Mira.");
      } else {
        router.push("/onboarding");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Ошибка регистрации");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function continueAfterConfirmation() {
    setError("");
    setIsSubmitting(true);
    try {
      const { loginAccount } = await import("@/lib/demo-session");
      const profile = await loginAccount(email.trim(), password);
      setPassword("");
      router.push(profile.onboardingComplete ? "/today" : "/onboarding");
    } catch {
      setError("Почта ещё не подтверждена. Откройте письмо от Mira и затем нажмите кнопку ещё раз.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (<>
    <PublicPageView name="register_view" route="/register" />
    <AuthShell eyebrow="Ваше пространство" title="Начните понимать свой цикл" text="Несколько спокойных отметок помогут увидеть общую картину без догадок." quote="Только вы решаете, что хранить и чем делиться">
      <div className="auth-form-heading"><span>Создание аккаунта</span><h2>Добро пожаловать<br />в Mira</h2><p>Все функции доступны бесплатно. Регистрация займёт меньше минуты.</p></div>
      {success ? <div className="auth-confirmation" role="status">
        <span className="auth-confirmation-icon"><Mail /></span>
        <h3>Подтвердите почту</h3>
        <p>Мы отправили письмо на <strong>{email.trim()}</strong>. Откройте его, вернитесь в установленную Mira и продолжите — повторно вводить данные не потребуется.</p>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="button auth-submit" type="button" disabled={isSubmitting} onClick={() => void continueAfterConfirmation()}>{isSubmitting ? "Проверяем…" : "Я подтвердила почту"} <ArrowRight /></button>
        <p className="auth-session-note">После входа сессия сохранится на этом устройстве до 90 дней.</p>
      </div> : <form className="auth-form" onSubmit={submit} noValidate>
        <label><span>Email</span><div className="input-wrap"><Mail /><input name="email" type="email" autoComplete="email" placeholder="you@example.com" required value={email} onChange={(event) => setEmail(event.target.value)} /></div></label>
        <label><span>Пароль</span><div className="input-wrap"><LockKeyhole /><input name="password" type={showPassword ? "text" : "password"} autoComplete="new-password" placeholder="Минимум 8 символов" required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}>{showPassword ? <EyeOff /> : <Eye />}</button></div></label>
        <label className="consent"><input name="termsConsent" type="checkbox" /><span className="custom-check"><Check /></span><span>Мне исполнилось 18 лет, я принимаю <Link href="/terms" target="_blank">условия использования</Link> и ознакомилась с <Link href="/privacy" target="_blank">политикой конфиденциальности</Link>.</span></label>
        <label className="consent"><input name="healthDataConsent" type="checkbox" /><span className="custom-check"><Check /></span><span>Я отдельно соглашаюсь на обработку чувствительных данных о цикле, симптомах и самочувствии для работы Mira. Согласие можно отозвать удалением истории или аккаунта.</span></label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="button auth-submit" type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>Создать аккаунт <ArrowRight /></button>
      </form>}
      {!success && <TelegramAuthAction />}
      <p className="auth-switch">Уже есть аккаунт? <Link href="/login">Войти</Link></p>
      <p className="auth-demo-note"><LockKeyhole /> Пароль обрабатывается Supabase Auth и не хранится в Mira</p>
    </AuthShell>
  </>);
}
