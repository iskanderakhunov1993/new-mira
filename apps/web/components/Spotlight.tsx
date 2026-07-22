"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { saveProfile, trackProductEvent } from "@/lib/demo-session";

export function Spotlight({ onClose }: { onClose: () => void }) {
  useEffect(() => { void saveProfile({ spotlightStatus: "shown" }); void trackProductEvent("spotlight_shown", "/today"); }, []);
  async function skip() { await saveProfile({ spotlightStatus: "skipped" }); void trackProductEvent("spotlight_skipped", "/today"); onClose(); }
  return <div className="spotlight-backdrop" role="dialog" aria-modal="true" aria-labelledby="spotlight-title"><section><span><Sparkles /></span><small>Первая полезная отметка</small><h2 id="spotlight-title">Как вы себя чувствуете сегодня?</h2><p>Настроение, энергия и боль — меньше 20 секунд. Это поможет Mira сравнивать только ваши собственные наблюдения.</p><Link className="button" href="/track">Отметить состояние <ArrowRight /></Link><button type="button" onClick={skip}>Позже</button></section></div>;
}
