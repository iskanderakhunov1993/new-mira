export type AssessmentType = "delay" | "pain" | "heavy_flow" | "discharge" | "postcoital" | "weakness";
export type SafetyLevel = "self_care" | "routine_care" | "urgent_care" | "emergency";
export type LifeImpact = "none" | "some" | "strong" | "cannot_function";
export type LifeEffect = "missed_work_or_study" | "sleep_disrupted" | "could_not_exercise" | "took_medicine" | "sought_medical_help";

type LifeImpactAnswers = {
  lifeImpact?: LifeImpact;
  lifeEffects?: LifeEffect[];
};

export type DelayAnswers = LifeImpactAnswers & {
  delayedDays: number;
  pregnancyPossible: boolean;
  pregnancyTest: "not_taken" | "negative" | "positive" | "unknown";
  pain: number;
  unusualBleeding: boolean;
  faintOrDizzy: boolean;
  shoulderPain: boolean;
  factors: string[];
};

export type PainAnswers = LifeImpactAnswers & {
  intensity: number;
  locations: string[];
  duration: "hours" | "one_day" | "several_days";
  pattern: "constant" | "waves";
  impact: "none" | "some" | "strong";
  worsening: boolean;
  faintOrDizzy: boolean;
  feverOrVomiting: boolean;
  pregnancyPossible: boolean;
  unusualBleeding: boolean;
  actions: string[];
};

export type HeavyFlowAnswers = LifeImpactAnswers & {
  heavierThanUsual: boolean;
  changeFrequency: "four_plus_hours" | "two_to_three_hours" | "one_to_two_hours" | "hourly_several_hours";
  nightChanges: boolean;
  leaks: boolean;
  clots: boolean;
  durationDays: number;
  weakOrDizzy: boolean;
  pain: number;
  pregnancyPossible: boolean;
};

export type DischargeAnswers = LifeImpactAnswers & {
  changes: Array<"color" | "smell" | "texture" | "amount">;
  itchOrSore: boolean;
  burningUrination: boolean;
  pelvicPain: number;
  fever: boolean;
  unusualBleeding: boolean;
  pregnancyPossible: boolean;
  faintOrDizzy: boolean;
};

export type PostcoitalAnswers = LifeImpactAnswers & {
  pain: number;
  painTiming: Array<"entry" | "deep" | "after">;
  bleeding: "none" | "spotting" | "heavy";
  dryness: boolean;
  dischargeOrBurning: boolean;
  pregnancyPossible: boolean;
  faintOrDizzy: boolean;
};

export type WeaknessAnswers = LifeImpactAnswers & {
  severity: "mild" | "marked" | "cannot_function";
  dizzy: boolean;
  fainted: boolean;
  shortOfBreath: boolean;
  racingHeart: boolean;
  heavyBleeding: boolean;
  pain: number;
  pregnancyPossible: boolean;
  unusualBleeding: boolean;
};

export type AssessmentAnswers = DelayAnswers | PainAnswers | HeavyFlowAnswers | DischargeAnswers | PostcoitalAnswers | WeaknessAnswers;

export type HealthAssessment = {
  id: string;
  date: string;
  type: AssessmentType;
  answers: AssessmentAnswers;
  resultCode: SafetyLevel;
  createdAt: string;
  updatedAt: string;
};

export function evaluateAssessment(type: AssessmentType, value: AssessmentAnswers): SafetyLevel {
  const lifeImpact = value.lifeImpact ?? "none";
  const lifeImpactLevel = lifeImpact === "cannot_function" ? "urgent_care" : lifeImpact === "strong" ? "routine_care" : null;
  if (type === "delay") {
    const answers = value as DelayAnswers;
    if ((answers.pregnancyPossible && answers.unusualBleeding && answers.pain >= 7) || answers.faintOrDizzy || answers.shoulderPain) return "emergency";
    if (answers.pregnancyPossible && (answers.unusualBleeding || answers.pain >= 4)) return "urgent_care";
    if (answers.pregnancyTest === "positive" || answers.delayedDays >= 7) return "routine_care";
    return lifeImpactLevel ?? "self_care";
  }
  if (type === "pain") {
    const answers = value as PainAnswers;
    if (answers.faintOrDizzy || (answers.pregnancyPossible && answers.unusualBleeding && answers.intensity >= 7)) return "emergency";
    if (answers.intensity >= 8 || answers.worsening || answers.feverOrVomiting) return "urgent_care";
    if (answers.intensity >= 7 || answers.impact === "strong" || answers.duration === "several_days") return "routine_care";
    return lifeImpactLevel ?? "self_care";
  }
  if (type === "heavy_flow") {
    const answers = value as HeavyFlowAnswers;
    if (answers.weakOrDizzy && answers.changeFrequency === "hourly_several_hours") return "emergency";
    if (answers.changeFrequency === "hourly_several_hours" || (answers.pregnancyPossible && answers.pain >= 7)) return "urgent_care";
    if (answers.durationDays > 7 || answers.weakOrDizzy || answers.heavierThanUsual) return "routine_care";
    return lifeImpactLevel ?? "self_care";
  }
  if (type === "discharge") {
    const answers = value as DischargeAnswers;
    if ((answers.faintOrDizzy && answers.pelvicPain >= 7) || (answers.pregnancyPossible && answers.unusualBleeding && answers.pelvicPain >= 7)) return "emergency";
    if (answers.pelvicPain >= 7 || answers.fever || (answers.pregnancyPossible && (answers.unusualBleeding || answers.pelvicPain >= 4))) return "urgent_care";
    if (answers.changes.length || answers.itchOrSore || answers.burningUrination || answers.unusualBleeding || answers.pelvicPain > 0) return "routine_care";
    return lifeImpactLevel ?? "self_care";
  }
  if (type === "postcoital") {
    const answers = value as PostcoitalAnswers;
    if ((answers.faintOrDizzy && answers.bleeding === "heavy") || (answers.pregnancyPossible && answers.bleeding !== "none" && answers.pain >= 7)) return "emergency";
    if (answers.bleeding === "heavy" || (answers.pregnancyPossible && (answers.bleeding !== "none" || answers.pain >= 4))) return "urgent_care";
    if (answers.bleeding !== "none" || answers.pain > 0 || answers.dischargeOrBurning) return "routine_care";
    return lifeImpactLevel ?? "self_care";
  }
  const answers = value as WeaknessAnswers;
  if (answers.fainted || (answers.heavyBleeding && answers.dizzy) || (answers.pregnancyPossible && answers.unusualBleeding && answers.pain >= 7)) return "emergency";
  if (answers.shortOfBreath || answers.racingHeart || answers.severity === "cannot_function" || (answers.pregnancyPossible && (answers.unusualBleeding || answers.pain >= 4))) return "urgent_care";
  if (answers.severity === "marked" || answers.dizzy || answers.heavyBleeding) return "routine_care";
  return lifeImpactLevel ?? "self_care";
}

export function buildAssessmentResult(assessment: Pick<HealthAssessment, "type" | "answers" | "resultCode">) {
  const labels = {
    self_care: { title: "Можно продолжить наблюдение", next: "Сохраните отметку и следите за изменениями самочувствия." },
    routine_care: { title: "Стоит обсудить это с врачом", next: "Запланируйте консультацию, особенно если ситуация повторяется или мешает обычным делам." },
    urgent_care: { title: "Нужна медицинская оценка сегодня", next: "Обратитесь за срочной медицинской консультацией сегодня." },
    emergency: { title: "Нужна срочная помощь", next: "Если состояние сохраняется или ухудшается, обратитесь в местную экстренную службу — 112 в России." },
  } as const;
  const impactLabels: Record<PainAnswers["impact"], string> = { none: "не мешает", some: "немного мешает", strong: "мешает обычным делам" };
  const bleedingLabels: Record<PostcoitalAnswers["bleeding"], string> = { none: "нет", spotting: "небольшое", heavy: "обильное" };
  const weaknessLabels: Record<WeaknessAnswers["severity"], string> = { mild: "небольшая", marked: "выраженная", cannot_function: "мешает обычным делам" };
  const lifeImpactLabels: Record<LifeImpact, string> = { none: "не мешает", some: "немного мешает", strong: "сильно мешает", cannot_function: "невозможно заниматься обычными делами" };
  const facts = assessment.type === "delay"
    ? [`Отклонение: ${(assessment.answers as DelayAnswers).delayedDays} дн.`, `Боль: ${(assessment.answers as DelayAnswers).pain}/10`]
    : assessment.type === "pain"
      ? [`Боль: ${(assessment.answers as PainAnswers).intensity}/10`, `Влияние: ${impactLabels[(assessment.answers as PainAnswers).impact]}`]
      : assessment.type === "heavy_flow"
        ? [`Длительность: ${(assessment.answers as HeavyFlowAnswers).durationDays} дн.`, `Боль: ${(assessment.answers as HeavyFlowAnswers).pain}/10`]
        : assessment.type === "discharge"
          ? [`Изменения: ${(assessment.answers as DischargeAnswers).changes.length ? `выбрано ${(assessment.answers as DischargeAnswers).changes.length}` : "не выбраны"}`, `Тазовая боль: ${(assessment.answers as DischargeAnswers).pelvicPain}/10`]
          : assessment.type === "postcoital"
            ? [`Боль: ${(assessment.answers as PostcoitalAnswers).pain}/10`, `Кровотечение: ${bleedingLabels[(assessment.answers as PostcoitalAnswers).bleeding]}`]
            : [`Слабость: ${weaknessLabels[(assessment.answers as WeaknessAnswers).severity]}`, `Боль: ${(assessment.answers as WeaknessAnswers).pain}/10`];
  return { ...labels[assessment.resultCode], facts: [...facts, `Влияние на жизнь: ${lifeImpactLabels[assessment.answers.lifeImpact ?? "none"]}`], comparison: "Сравнение с личной картиной появится после нескольких сопоставимых отметок.", influence: "Mira показывает только отмеченные вами факторы и не определяет причину или диагноз.", reason: `Уровень результата: ${assessment.resultCode}. Он рассчитан по ответам в этой форме и консервативным safety-правилам.` };
}
