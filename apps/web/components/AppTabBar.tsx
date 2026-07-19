import Link from "next/link";
import { BookOpenText, CalendarRange, Home, Lightbulb } from "lucide-react";

type AppTabBarProps = {
  active: "today" | "diary" | "analytics" | "insights" | "knowledge";
};

const items = [
  { id: "today", label: "Сегодня", href: "/today", icon: Home },
  { id: "analytics", label: "Мой цикл", href: "/analytics", icon: CalendarRange },
  { id: "insights", label: "Инсайты", href: "/insights", icon: Lightbulb },
  { id: "knowledge", label: "Знания", href: "/knowledge", icon: BookOpenText },
] as const;

export function AppTabBar({ active }: AppTabBarProps) {
  return (
    <nav className="bottom-nav" aria-label="Разделы приложения">
      {items.map(({ id, label, href, icon: Icon }) => <Link className={active === id ? "active" : ""} href={href} key={id}><Icon /><span>{label}</span></Link>)}
    </nav>
  );
}
