"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Check, ChevronRight, Database, Download, Eye, FileHeart, LogOut, ShieldCheck, Trash2, UserRound } from "lucide-react";
import { clearHealthHistory, deleteLocalProfile, getProfile, MiraProfile, saveProfile, signOutAccount } from "@/lib/demo-session";

type ConfirmAction = "history" | "account" | null;

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<MiraProfile | null>(null);
  const [name, setName] = useState("");
  const [cycleLength, setCycleLength] = useState(28);
  const [periodLength, setPeriodLength] = useState(5);
  const [saved, setSaved] = useState(false);
  const [confirming, setConfirming] = useState<ConfirmAction>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const current = getProfile();
      setProfile(current); setName(current?.name ?? ""); setCycleLength(current?.cycleLength ?? 28); setPeriodLength(current?.periodLength ?? 5);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  function updateProfile() {
    const updated = saveProfile({ name: name.trim() || undefined, cycleLength, periodLength });
    setProfile(updated); setSaved(true); window.setTimeout(() => setSaved(false), 1800);
  }

  function updatePreference(key: "cycleForecasts" | "privateInsights") {
    const preferences = { cycleForecasts: profile?.preferences?.cycleForecasts ?? true, privateInsights: profile?.preferences?.privateInsights ?? false, [key]: !(profile?.preferences?.[key] ?? (key === "cycleForecasts")) };
    const updated = saveProfile({ preferences }); setProfile(updated);
  }

  function exportData() {
    const data = getProfile();
    if (!data) return;
    const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), profile: data }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob); const anchor = document.createElement("a");
    anchor.href = url; anchor.download = `mira-data-${new Date().toISOString().slice(0, 10)}.json`; anchor.click(); URL.revokeObjectURL(url);
  }

  async function confirmAction() {
    if (confirming === "history") { const updated = clearHealthHistory(); setProfile(updated); setConfirming(null); }
    if (confirming === "account") { await deleteLocalProfile(); router.replace("/"); }
  }

  async function logout() {
    await signOutAccount();
    router.replace("/login");
  }

  const entryCount = profile?.entries?.length ?? 0;
  return <main className="profile-page"><div className="profile-shell">
    <header className="profile-top"><Link href="/today" aria-label="Вернуться на главную"><ArrowLeft /></Link><div><small>Аккаунт</small><h1>Профиль</h1></div><span><UserRound /></span></header>

    <section className="profile-identity"><span>{(profile?.name ?? profile?.email ?? "M").slice(0, 1).toUpperCase()}</span><div><h2>{profile?.name || "Пользователь Mira"}</h2><p>{profile?.email || "Локальный профиль"}</p></div><ShieldCheck /></section>

    <section className="profile-section"><header><div><h2>Основные данные</h2><p>Используются для персонального прогноза цикла.</p></div></header><div className="profile-fields"><label><span>Имя</span><input value={name} onChange={(event) => setName(event.target.value)} placeholder="Как к вам обращаться" /></label><div><label><span>Средняя длина цикла</span><select value={cycleLength} onChange={(event) => setCycleLength(Number(event.target.value))}>{Array.from({ length: 25 }, (_, index) => index + 21).map((value) => <option value={value} key={value}>{value} дней</option>)}</select></label><label><span>Месячные обычно идут</span><select value={periodLength} onChange={(event) => setPeriodLength(Number(event.target.value))}>{Array.from({ length: 9 }, (_, index) => index + 2).map((value) => <option value={value} key={value}>{value} дней</option>)}</select></label></div></div><button className={`profile-save ${saved ? "saved" : ""}`} onClick={updateProfile}>{saved ? <><Check />Сохранено</> : "Сохранить изменения"}</button></section>

    <section className="profile-section profile-list"><header><div><h2>Настройки Mira</h2><p>Выберите, как приложение использует ваши отметки.</p></div></header><button onClick={() => updatePreference("cycleForecasts")}><i><Eye /></i><span><strong>Прогнозы цикла</strong><small>Показывать предполагаемые даты</small></span><b className={(profile?.preferences?.cycleForecasts ?? true) ? "on" : ""}><em /></b></button><button onClick={() => updatePreference("privateInsights")}><i><ShieldCheck /></i><span><strong>Чувствительные данные в подсказках</strong><small>Учитывать интимные отметки в личных наблюдениях</small></span><b className={(profile?.preferences?.privateInsights ?? false) ? "on" : ""}><em /></b></button></section>

    <section className="profile-section profile-list"><header><div><h2>Данные и приватность</h2><p>Основная копия данных хранится в защищённой базе аккаунта, а браузер используется как локальный кэш.</p></div></header><Link href="/analytics/report"><i><FileHeart /></i><span><strong>Отчёт для врача</strong><small>Настроить состав и сохранить PDF</small></span><ChevronRight /></Link><button onClick={exportData}><i><Download /></i><span><strong>Скачать все данные</strong><small>Файл JSON · {entryCount} отметок</small></span><ChevronRight /></button><div className="profile-storage"><Database /><p><strong>Supabase PostgreSQL</strong><span>Доступ к данным ограничен серверной сессией вашего аккаунта.</span></p></div></section>

    <section className="profile-section profile-list profile-danger"><header><div><h2>Управление аккаунтом</h2></div></header><button onClick={() => setConfirming("history")}><i><Trash2 /></i><span><strong>Очистить историю здоровья</strong><small>Удалить циклы, симптомы и заметки</small></span><ChevronRight /></button><button onClick={logout}><i><LogOut /></i><span><strong>Выйти</strong><small>Локальная сессия будет завершена</small></span><ChevronRight /></button><button onClick={() => setConfirming("account")}><i><Trash2 /></i><span><strong>Удалить аккаунт</strong><small>Необратимо удалить профиль и все данные</small></span><ChevronRight /></button></section>

    <p className="profile-version">Mira · прототип PWA · данные не являются медицинским заключением</p>
  </div>

  {confirming && <div className="profile-confirm-backdrop" role="presentation"><section role="dialog" aria-modal="true" aria-labelledby="confirm-title"><span><Trash2 /></span><h2 id="confirm-title">{confirming === "history" ? "Очистить историю?" : "Удалить профиль?"}</h2><p>{confirming === "history" ? `Будут удалены ${entryCount} отметок: месячные, симптомы, боль, настроение и заметки. Данные профиля сохранятся.` : "Будут удалены профиль, настройки и вся история здоровья в этом браузере. Отменить действие после удаления нельзя."}</p><button className="confirm-delete" onClick={confirmAction}>{confirming === "history" ? "Очистить историю" : "Удалить всё"}</button><button className="confirm-cancel" onClick={() => setConfirming(null)}>Отмена</button></section></div>}
  </main>;
}
