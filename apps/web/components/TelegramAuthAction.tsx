import { Send } from "lucide-react";

export function TelegramAuthAction() {
  return <>
    <div className="auth-divider"><span>или</span></div>
    <a className="telegram-auth-action" href="/api/auth/telegram">
      <Send />
      <span><strong>Продолжить через Telegram</strong><small>Без почты и пароля</small></span>
    </a>
  </>;
}
