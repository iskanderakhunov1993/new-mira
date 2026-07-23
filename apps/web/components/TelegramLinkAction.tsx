"use client";

import { Send } from "lucide-react";
import { useState } from "react";

export function TelegramLinkAction() {
  const [status, setStatus] = useState("");

  async function connect() {
    setStatus("Создаём безопасную ссылку…");
    const response = await fetch("/api/auth/telegram/link", { method: "POST" });
    const result = await response.json() as { url?: string; error?: string };
    if (!response.ok || !result.url) {
      setStatus(result.error || "Не удалось создать ссылку");
      return;
    }
    window.location.href = result.url;
  }

  return <button type="button" onClick={() => void connect()}>
    <i><Send /></i>
    <span><strong>Подключить Telegram</strong><small>{status || "Одна история и отметки на обеих платформах"}</small></span>
  </button>;
}
