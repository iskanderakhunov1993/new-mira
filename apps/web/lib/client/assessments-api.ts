import {
  evaluateAssessment,
  type AssessmentAnswers,
  type AssessmentType,
  type HealthAssessment,
} from "@/lib/domain/assessment";
import { requestJson } from "@/lib/client/http";
import { getProfile } from "@/lib/client/profile-api";
import { getCachedProfile, isLocalDemoMode, setCachedProfile } from "@/lib/client/profile-state";

export async function getAssessments(): Promise<HealthAssessment[]> {
  if (isLocalDemoMode()) {
    const profile = getCachedProfile() ?? await getProfile();
    return profile?.assessments ?? [];
  }
  return requestJson<HealthAssessment[]>("/api/assessments");
}

export async function getAssessment(id: string): Promise<HealthAssessment> {
  return requestJson<HealthAssessment>(`/api/assessments/${id}`);
}

export async function saveAssessment(
  input: { date: string; type: AssessmentType; answers: AssessmentAnswers },
): Promise<HealthAssessment> {
  if (isLocalDemoMode()) {
    const profile = getCachedProfile() ?? await getProfile();
    if (!profile) throw new Error("Профиль не найден");
    const now = new Date().toISOString();
    const assessment: HealthAssessment = {
      id: `demo-${Date.now()}`,
      ...input,
      resultCode: evaluateAssessment(input.type, input.answers),
      createdAt: now,
      updatedAt: now,
    };
    setCachedProfile({ ...profile, assessments: [assessment, ...(profile.assessments ?? [])] });
    return assessment;
  }
  return requestJson<HealthAssessment>("/api/assessments", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function deleteAssessment(id: string): Promise<void> {
  if (isLocalDemoMode()) {
    const profile = getCachedProfile() ?? await getProfile();
    if (profile) {
      setCachedProfile({
        ...profile,
        assessments: (profile.assessments ?? []).filter((assessment) => assessment.id !== id),
      });
    }
    return;
  }
  await requestJson(`/api/assessments/${id}`, { method: "DELETE" });
}
