export type MedicationReason = "pain" | "migraine" | "iron" | "contraception" | "heavy_bleeding" | "supplement" | "other";
export type MedicationEffect = "pending" | "full" | "partial" | "none" | "worse";

export type MedicationIntake = {
  id: string;
  name: string;
  activeIngredient?: string;
  dose?: string;
  takenAt: string;
  reason: MedicationReason;
  prescribedByDoctor: boolean;
  effect: MedicationEffect;
  sideEffects?: string;
};

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
