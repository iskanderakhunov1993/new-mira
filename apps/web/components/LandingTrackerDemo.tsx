"use client";

import { useState } from "react";
import { Activity, BedDouble, Check, Droplets, HeartPulse, MoonStar, NotebookPen, Pill, Smile } from "lucide-react";

const trackerItems = [
  { id: "flow", icon: Droplets, label: "Месячные", value: "Умеренно" },
  { id: "pain", icon: HeartPulse, label: "Боль", value: "Слабая" },
  { id: "mood", icon: Smile, label: "Настроение", value: "Спокойное" },
  { id: "energy", icon: Activity, label: "Энергия", value: "Средняя" },
  { id: "sleep", icon: BedDouble, label: "Сон", value: "7 часов" },
  { id: "medication", icon: Pill, label: "Лекарства", value: "Записать" },
  { id: "discharge", icon: MoonStar, label: "Выделения", value: "Без изменений" },
  { id: "note", icon: NotebookPen, label: "Заметка", value: "Добавить" },
];

export function LandingTrackerDemo() {
  const [selected, setSelected] = useState(() => new Set(["mood", "energy"]));

  function toggle(id: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="ml-tracker-demo">
      <header><div><small>Дневник · сегодня</small><strong>Как вы себя чувствуете?</strong></div><span>{selected.size} выбрано</span></header>
      <div className="ml-tracker-grid">
        {trackerItems.map(({ id, icon: Icon, label, value }) => {
          const active = selected.has(id);
          return <button aria-pressed={active} className={active ? "active" : ""} onClick={() => toggle(id)} type="button" key={id}><span><Icon /></span><strong>{label}</strong><small>{active ? value : "Отметить"}</small>{active && <i><Check /></i>}</button>;
        })}
      </div>
      <footer><span>Демонстрация · данные не сохраняются</span><b>Обычно меньше минуты</b></footer>
    </div>
  );
}
