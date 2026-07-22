import { CircleAlert, LoaderCircle } from "lucide-react";

export function AppPageState({ kind, title, text, onRetry }: { kind: "loading" | "error" | "empty"; title: string; text: string; onRetry?: () => void }) {
  return <section className={`app-page-state ${kind}`} role={kind === "error" ? "alert" : "status"}>{kind === "loading" ? <LoaderCircle className="spin" /> : <CircleAlert />}<h2>{title}</h2><p>{text}</p>{onRetry && <button type="button" onClick={onRetry}>Повторить</button>}</section>;
}
