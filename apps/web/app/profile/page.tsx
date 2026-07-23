"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Bug, Check, ChevronRight, Database, Download, Eye, FileHeart, HandHeart, Lightbulb, LogOut, ShieldCheck, Trash2, UserRound, X } from "lucide-react";
import { clearHealthHistory, deleteLocalProfile, getAssessments, getProfile, MiraProfile, saveProfile, signOutAccount } from "@/lib/demo-session";
import { PwaInstallAction } from "@/components/PwaInstallAction";
import { TelegramLinkAction } from "@/components/TelegramLinkAction";

type ConfirmAction = "history" | "account" | null;
type SupportInfo = "bug" | "idea" | "donate" | null;

const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() || process.env.NEXT_PUBLIC_LEGAL_OPERATOR_EMAIL?.trim() || "";
const configuredDonationUrl = process.env.NEXT_PUBLIC_DONATION_URL?.trim() || "";
const donationUrl = configuredDonationUrl.startsWith("https://") ? configuredDonationUrl : "";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<MiraProfile | null>(null);
  const [name, setName] = useState("");
  const [cycleLength, setCycleLength] = useState(28);
  const [periodLength, setPeriodLength] = useState(5);
  const [saved, setSaved] = useState(false);
  const [confirming, setConfirming] = useState<ConfirmAction>(null);
  const [supportInfo, setSupportInfo] = useState<SupportInfo>(null);

  useEffect(() => {
    void getProfile().then((current) => {
      setProfile(current); setName(current?.name ?? ""); setCycleLength(current?.cycleLength ?? 28); setPeriodLength(current?.periodLength ?? 5);
    }).catch(() => setProfile(null));
  }, []);

  async function updateProfile() {
    const updated = await saveProfile({ name: name.trim() || undefined, cycleLength, periodLength });
    setProfile(updated); setSaved(true); window.setTimeout(() => setSaved(false), 1800);
  }

  async function updatePreference(key: "cycleForecasts" | "privateInsights") {
    const preferences = { cycleForecasts: profile?.preferences?.cycleForecasts ?? true, privateInsights: profile?.preferences?.privateInsights ?? false, [key]: !(profile?.preferences?.[key] ?? (key === "cycleForecasts")) };
    const consents = key === "privateInsights" ? { ...profile?.consents, sensitiveInsights: preferences.privateInsights } : profile?.consents;
    const updated = await saveProfile({ preferences, consents }); setProfile(updated);
  }

  async function exportData() {
    const data = profile;
    if (!data) return;
    const assessments = await getAssessments();
    const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), profile: data, assessments }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob); const anchor = document.createElement("a");
    anchor.href = url; anchor.download = `mira-data-${new Date().toISOString().slice(0, 10)}.json`; anchor.click(); URL.revokeObjectURL(url);
  }

  async function confirmAction() {
    if (confirming === "history") { const updated = await clearHealthHistory(); setProfile(updated); setConfirming(null); }
    if (confirming === "account") { await deleteLocalProfile(); router.replace("/"); }
  }

  async function logout() {
    await signOutAccount();
    router.replace("/login");
  }

  async function restartSpotlight() {
    const updated = await saveProfile({ spotlightStatus: "pending" });
    setProfile(updated);
    router.push("/today");
  }

  function toggleSupportInfo(value: Exclude<SupportInfo, null>) {
    setSupportInfo((current) => current === value ? null : value);
  }

  const feedbackLink = (type: "bug" | "idea") => {
    if (!supportEmail) return "";
    const subject = type === "bug" ? "Mira: сообщение об ошибке" : "Mira: идея для продукта";
    const body = type === "bug"
      ? "Где возникла ошибка:\n\nЧто произошло:\n\nЧто ожидалось:\n\nШаги для повторения:\n"
      : "Моя идея:\n\nКакую задачу она поможет решить:\n";
    return `mailto:${supportEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const entryCount = profile?.entries?.length ?? 0;
  return <main className="profile-page"><div className="profile-shell">
    <header className="profile-top"><Link href="/today" aria-label="Вернуться на главную"><ArrowLeft /></Link><div><small>Аккаунт</small><h1>Профиль</h1></div><span><UserRound /></span></header>

    <section className="profile-identity"><span>{(profile?.name ?? profile?.email ?? "M").slice(0, 1).toUpperCase()}</span><div><h2>{profile?.name || "Пользователь Mira"}</h2><p>{profile ? (profile.email || "Telegram Mini App") : "Профиль загружается"}</p></div><ShieldCheck /></section>

    <section className="profile-section"><header><div><h2>Основные данные</h2><p>Используются для персонального прогноза цикла.</p></div></header><div className="profile-fields"><label><span>Имя</span><input value={name} onChange={(event) => setName(event.target.value)} placeholder="Как к вам обращаться" /></label><div><label><span>Средняя длина цикла</span><select value={cycleLength} onChange={(event) => setCycleLength(Number(event.target.value))}>{Array.from({ length: 25 }, (_, index) => index + 21).map((value) => <option value={value} key={value}>{value} дней</option>)}</select></label><label><span>Месячные обычно идут</span><select value={periodLength} onChange={(event) => setPeriodLength(Number(event.target.value))}>{Array.from({ length: 9 }, (_, index) => index + 2).map((value) => <option value={value} key={value}>{value} дней</option>)}</select></label></div></div><button className={`profile-save ${saved ? "saved" : ""}`} onClick={updateProfile}>{saved ? <><Check />Сохранено</> : "Сохранить изменения"}</button></section>

    <section className="profile-section profile-list"><header><div><h2>Настройки Mira</h2><p>Выберите, как приложение использует ваши отметки.</p></div></header><button onClick={() => updatePreference("cycleForecasts")}><i><Eye /></i><span><strong>Прогнозы цикла</strong><small>Показывать предполагаемые даты</small></span><b className={(profile?.preferences?.cycleForecasts ?? true) ? "on" : ""}><em /></b></button><button onClick={() => updatePreference("privateInsights")}><i><ShieldCheck /></i><span><strong>Чувствительные данные в подсказках</strong><small>Учитывать интимные отметки в личных наблюдениях</small></span><b className={(profile?.preferences?.privateInsights ?? false) ? "on" : ""}><em /></b></button><button onClick={restartSpotlight}><i><UserRound /></i><span><strong>Повторить знакомство</strong><small>Снова показать подсказку первой отметки</small></span><ChevronRight /></button></section>

    <section className="profile-section profile-list profile-install"><header><div><h2>Приложение</h2><p>Открывайте одну Mira в PWA и Telegram — отметки синхронизируются через ваш профиль.</p></div></header><PwaInstallAction /><TelegramLinkAction /></section>

    <section className="profile-section profile-list"><header><div><h2>Данные и приватность</h2><p>Профиль и записи хранятся только в защищённой базе аккаунта.</p></div></header><Link href="/analytics/report"><i><FileHeart /></i><span><strong>Отчёт для врача</strong><small>Настроить состав и сохранить PDF</small></span><ChevronRight /></Link><button onClick={() => void exportData()}><i><Download /></i><span><strong>Скачать все данные</strong><small>Файл JSON · {entryCount} отметок</small></span><ChevronRight /></button><div className="profile-storage"><Database /><p><strong>Supabase PostgreSQL</strong><span>Браузер не хранит постоянную копию данных здоровья.</span></p></div></section>

    <section className="profile-section profile-list profile-support"><header><div><h2>Помощь и развитие</h2><p>Обратная связь помогает делать Mira понятнее и надёжнее.</p></div></header><button type="button" aria-expanded={supportInfo === "bug"} onClick={() => toggleSupportInfo("bug")}><i><Bug /></i><span><strong>Сообщить об ошибке</strong><small>Расскажите, что произошло</small></span><ChevronRight /></button><button type="button" aria-expanded={supportInfo === "idea"} onClick={() => toggleSupportInfo("idea")}><i><Lightbulb /></i><span><strong>Предложить идею</strong><small>Помогите сделать Mira удобнее</small></span><ChevronRight /></button><button type="button" aria-expanded={supportInfo === "donate"} onClick={() => toggleSupportInfo("donate")}><i><HandHeart /></i><span><strong>Поддержать Mira</strong><small>Добровольный донат на развитие проекта</small></span><ChevronRight /></button>
      {supportInfo && <aside className="profile-support-panel" aria-live="polite">
        <button type="button" className="profile-support-close" aria-label="Закрыть" onClick={() => setSupportInfo(null)}><X /></button>
        {supportInfo === "bug" && <><strong>Нашли ошибку?</strong><p>Опишите экран, что произошло и какой результат вы ожидали. Данные о здоровье не прикладываются автоматически.</p>{feedbackLink("bug") ? <a href={feedbackLink("bug")}>Написать о проблеме</a> : <small>Канал обратной связи пока не подключён.</small>}</>}
        {supportInfo === "idea" && <><strong>Есть идея?</strong><p>Расскажите, что вы хотите делать в Mira проще. Симптомы, заметки и история цикла в обращение не передаются.</p>{feedbackLink("idea") ? <a href={feedbackLink("idea")}>Предложить идею</a> : <small>Канал обратной связи пока не подключён.</small>}</>}
        {supportInfo === "donate" && <><strong>Mira полностью бесплатна</strong><p>Если хотите помочь развитию проекта, можно сделать добровольный донат. Он не открывает дополнительные функции и не влияет на доступ.</p>{donationUrl ? <a href={donationUrl} target="_blank" rel="noreferrer">Перейти к донату</a> : <small>Ссылка для доната пока не подключена.</small>}</>}
      </aside>}
    </section>

    <section className="profile-section profile-list profile-danger"><header><div><h2>Управление аккаунтом</h2></div></header><button onClick={() => setConfirming("history")}><i><Trash2 /></i><span><strong>Очистить историю здоровья</strong><small>Удалить циклы, симптомы и заметки</small></span><ChevronRight /></button><button onClick={logout}><i><LogOut /></i><span><strong>Выйти</strong><small>Локальная сессия будет завершена</small></span><ChevronRight /></button><button onClick={() => setConfirming("account")}><i><Trash2 /></i><span><strong>Удалить аккаунт</strong><small>Необратимо удалить профиль и все данные</small></span><ChevronRight /></button></section>

    <p className="profile-version">Mira · прототип PWA · данные не являются медицинским заключением</p>
  </div>

  {confirming && <div className="profile-confirm-backdrop" role="presentation"><section role="dialog" aria-modal="true" aria-labelledby="confirm-title"><span><Trash2 /></span><h2 id="confirm-title">{confirming === "history" ? "Очистить историю?" : "Удалить профиль?"}</h2><p>{confirming === "history" ? `Будут удалены ${entryCount} отметок: месячные, симптомы, боль, настроение и заметки. Данные профиля сохранятся.` : "Будут удалены профиль, настройки и вся история здоровья из базы Mira. Отменить действие после удаления нельзя."}</p><button className="confirm-delete" onClick={confirmAction}>{confirming === "history" ? "Очистить историю" : "Удалить всё"}</button><button className="confirm-cancel" onClick={() => setConfirming(null)}>Отмена</button></section></div>}
  </main>;
}
