import Link from "next/link";
import { WifiOff } from "lucide-react";

export default function OfflinePage() {
  return <main className="offline-page"><section><WifiOff /><h1>Нет соединения</h1><p>Mira не сохраняет медицинские данные офлайн, чтобы избежать конфликтов и потери записей. Подключитесь к интернету и повторите действие.</p><Link href="/today">Попробовать снова</Link></section></main>;
}
