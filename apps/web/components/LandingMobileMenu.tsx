"use client";

import { useRef } from "react";
import { Menu, X } from "lucide-react";
import { RegisterCta } from "@/components/PublicProductAnalytics";

const links = [
  ["#features", "Возможности"],
  ["#how", "Как работает"],
  ["#analytics", "Аналитика"],
  ["#doctor", "Для врача"],
  ["#privacy", "Безопасность"],
  ["/login", "Войти"],
];

export function LandingMobileMenu() {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const close = () => detailsRef.current?.removeAttribute("open");

  return (
    <details className="ml-mobile-menu" ref={detailsRef}>
      <summary aria-label="Открыть меню"><Menu className="menu-open" /><X className="menu-close" /></summary>
      <nav aria-label="Мобильная навигация">
        {links.map(([href, label]) => <a href={href} onClick={close} key={href}>{label}</a>)}
        <span><RegisterCta className="ml-button">Попробовать бесплатно</RegisterCta></span>
      </nav>
    </details>
  );
}
