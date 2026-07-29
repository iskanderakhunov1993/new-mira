import { Send } from "lucide-react";

export function TelegramAuthAction() {
  return <>
    <div className="auth-divider"><span>или</span></div>
    <a className="telegram-auth-action" href="/api/auth/telegram">
      <Send />
      <strong>Без почты и пароля</strong>
    </a>
  </>;
}
