export type AssessmentType = "delay" | "pain" | "heavy_flow";
export type SafetyLevel = "self_care" | "routine_care" | "urgent_care" | "emergency";

export type DelayAnswers = {
  delayedDays: number;
  pregnancyPossible: boolean;
  pregnancyTest: "not_taken" | "negative" | "positive" | "unknown";
  pain: number;
  unusualBleeding: boolean;
  faintOrDizzy: boolean;
  shoulderPain: boolean;
  factors: string[];
};

export type PainAnswers = {
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

export type HeavyFlowAnswers = {
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

export type AssessmentAnswers = DelayAnswers | PainAnswers | HeavyFlowAnswers;

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
  if (type === "delay") {
    const answers = value as DelayAnswers;
    if ((answers.pregnancyPossible && answers.unusualBleeding && answers.pain >= 7) || answers.faintOrDizzy || answers.shoulderPain) return "emergency";
    if (answers.pregnancyPossible && (answers.unusualBleeding || answers.pain >= 4)) return "urgent_care";
    if (answers.pregnancyTest === "positive" || answers.delayedDays >= 7) return "routine_care";
    return "self_care";
  }
  if (type === "pain") {
    const answers = value as PainAnswers;
    if (answers.faintOrDizzy || (answers.pregnancyPossible && answers.unusualBleeding && answers.intensity >= 7)) return "emergency";
    if (answers.intensity >= 8 || answers.worsening || answers.feverOrVomiting) return "urgent_care";
    if (answers.intensity >= 7 || answers.impact === "strong" || answers.duration === "several_days") return "routine_care";
    return "self_care";
  }
  const answers = value as HeavyFlowAnswers;
  if (answers.weakOrDizzy && answers.changeFrequency === "hourly_several_hours") return "emergency";
  if (answers.changeFrequency === "hourly_several_hours" || (answers.pregnancyPossible && answers.pain >= 7)) return "urgent_care";
  if (answers.durationDays > 7 || answers.weakOrDizzy || answers.heavierThanUsual) return "routine_care";
  return "self_care";
}

export function buildAssessmentResult(assessment: Pick<HealthAssessment, "type" | "answers" | "resultCode">) {
  const labels = {
    self_care: { title: "Можно продолжить наблюдение", next: "Сохраните отметку и следите за изменениями самочувствия." },
    routine_care: { title: "Стоит обсудить это с врачом", next: "Запланируйте консультацию, особенно если ситуация повторяется или мешает обычным делам." },
    urgent_care: { title: "Нужна медицинская оценка сегодня", next: "Обратитесь за срочной медицинской консультацией сегодня." },
    emergency: { title: "Нужна срочная помощь", next: "Если состояние сохраняется или ухудшается, обратитесь в местную экстренную службу — 112 в России." },
  } as const;
  const facts = assessment.type === "delay"
    ? [`Отклонение: ${(assessment.answers as DelayAnswers).delayedDays} дн.`, `Боль: ${(assessment.answers as DelayAnswers).pain}/10`]
    : assessment.type === "pain"
      ? [`Боль: ${(assessment.answers as PainAnswers).intensity}/10`, `Влияние: ${(assessment.answers as PainAnswers).impact}`]
      : [`Длительность: ${(assessment.answers as HeavyFlowAnswers).durationDays} дн.`, `Боль: ${(assessment.answers as HeavyFlowAnswers).pain}/10`];
  return { ...labels[assessment.resultCode], facts, comparison: "Сравнение с личной картиной появится после нескольких сопоставимых отметок.", influence: "Mira показывает только отмеченные вами факторы и не определяет причину или диагноз.", reason: `Уровень результата: ${assessment.resultCode}. Он рассчитан по ответам в этой форме и консервативным safety-правилам.` };
}
