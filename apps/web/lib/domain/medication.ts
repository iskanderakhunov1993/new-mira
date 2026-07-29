import type { MedicationIntake } from "../contracts/entry";

export type { MedicationIntake } from "../contracts/entry";
export type MedicationReason = MedicationIntake["reason"];
export type MedicationEffect = MedicationIntake["effect"];

export const MEDICATION_REASON_LABELS: Record<MedicationReason, string> = {
  pain: "Боль",
  migraine: "Мигрень или головная боль",
  iron: "Назначенный препарат железа",
  contraception: "Гормональная контрацепция",
  heavy_bleeding: "Обильное кровотечение",
  supplement: "Витамин или добавка",
  other: "Другая причина",
};

export const MEDICATION_EFFECT_LABELS: Record<MedicationEffect, string> = {
  pending: "Эффект ещё не оценён",
  full: "Помогло полностью",
  partial: "Помогло частично",
  none: "Не помогло",
  worse: "Стало хуже",
};
