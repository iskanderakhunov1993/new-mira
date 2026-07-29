import { NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/supabase/auth";
import { LEGAL_VERSION } from "@/lib/legal";
import { profileUpdateSchema } from "@/lib/contracts/profile";

export const runtime = "nodejs";

function serializeProfile(profile: Awaited<ReturnType<typeof loadProfile>>) {
  if (!profile) return null;
  return {
    email: profile.email,
    name: profile.name ?? undefined,
    onboardingComplete: profile.onboardingComplete,
    onboardingStep: profile.onboardingStep,
    goal: profile.goal ?? undefined,
    lastPeriod: profile.lastPeriod?.toISOString().slice(0, 10),
    cycleLength: profile.cycleLength,
    cyclePattern: profile.cyclePattern,
    periodLength: profile.periodLength,
    weightKg: profile.weightKg ?? undefined,
    preferences: {
      cycleForecasts: profile.cycleForecasts,
      privateInsights: profile.privateInsights,
    },
    consents: {
      healthData: profile.healthDataConsent,
      privacyPolicy: profile.privacyConsent,
      sensitiveInsights: profile.sensitiveConsent,
      acceptedAt: profile.consentAcceptedAt?.toISOString(),
      version: profile.consentVersion ?? undefined,
    },
    firstPromptDismissed: profile.firstPromptDismissed,
    spotlightStatus: profile.spotlightStatus,
  };
}

function loadProfile(userId: string) {
  return prisma.profile.findUnique({
    where: { id: userId },
  });
}

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await loadProfile(user.id);
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  return NextResponse.json(serializeProfile(profile));
}

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = profileUpdateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid profile data", details: parsed.error.flatten() }, { status: 400 });
  }

  const payload = parsed.data;
  const registeredPrivacyConsent = user.user_metadata?.privacy_policy_consent === true;
  const registeredHealthDataConsent = user.user_metadata?.health_data_consent === true;
  const registeredConsentVersion = typeof user.user_metadata?.consent_version === "string" ? user.user_metadata.consent_version : LEGAL_VERSION;
  const registeredConsentDateValue = typeof user.user_metadata?.consent_accepted_at === "string" ? new Date(user.user_metadata.consent_accepted_at) : new Date();
  const registeredConsentDate = Number.isNaN(registeredConsentDateValue.getTime()) ? new Date() : registeredConsentDateValue;
  const registeredConsentsComplete = registeredPrivacyConsent && registeredHealthDataConsent;
  const profile = await prisma.$transaction(async (tx) => {
    await tx.profile.upsert({
      where: { id: user.id },
      create: {
        id: user.id,
        email: user.email,
        name: payload.name,
        onboardingComplete: payload.onboardingComplete ?? false,
        onboardingStep: payload.onboardingStep ?? 1,
        goal: payload.goal,
        lastPeriod: payload.lastPeriod ? new Date(`${payload.lastPeriod}T00:00:00.000Z`) : undefined,
        cycleLength: payload.cycleLength ?? 28,
        cyclePattern: payload.cyclePattern ?? "regular",
        periodLength: payload.periodLength ?? 5,
        weightKg: payload.weightKg,
        cycleForecasts: payload.preferences?.cycleForecasts ?? true,
        privateInsights: payload.preferences?.privateInsights ?? false,
        healthDataConsent: payload.consents?.healthData ?? registeredHealthDataConsent,
        privacyConsent: payload.consents?.privacyPolicy ?? registeredPrivacyConsent,
        sensitiveConsent: payload.consents?.sensitiveInsights ?? false,
        firstPromptDismissed: payload.firstPromptDismissed ?? false,
        spotlightStatus: payload.spotlightStatus ?? "pending",
        consentAcceptedAt: payload.consents?.healthData && (payload.consents?.privacyPolicy ?? registeredPrivacyConsent) ? new Date() : registeredConsentsComplete ? registeredConsentDate : undefined,
        consentVersion: payload.consents?.healthData && (payload.consents?.privacyPolicy ?? registeredPrivacyConsent) ? LEGAL_VERSION : registeredConsentsComplete ? registeredConsentVersion : undefined,
      },
      update: {
        email: user.email,
        name: payload.name,
        onboardingComplete: payload.onboardingComplete,
        onboardingStep: payload.onboardingStep,
        goal: payload.goal,
        lastPeriod: payload.lastPeriod === null ? null : payload.lastPeriod ? new Date(`${payload.lastPeriod}T00:00:00.000Z`) : undefined,
        cycleLength: payload.cycleLength,
        cyclePattern: payload.cyclePattern,
        periodLength: payload.periodLength,
        weightKg: payload.weightKg,
        cycleForecasts: payload.preferences?.cycleForecasts,
        privateInsights: payload.preferences?.privateInsights,
        healthDataConsent: payload.consents?.healthData,
        privacyConsent: payload.consents?.privacyPolicy,
        sensitiveConsent: payload.consents?.sensitiveInsights,
        firstPromptDismissed: payload.firstPromptDismissed,
        spotlightStatus: payload.spotlightStatus,
        consentAcceptedAt: payload.consents?.healthData && payload.consents?.privacyPolicy ? new Date() : undefined,
        consentVersion: payload.consents?.healthData && payload.consents?.privacyPolicy ? LEGAL_VERSION : undefined,
      },
    });

    return tx.profile.findUniqueOrThrow({
      where: { id: user.id },
    });
  });

  return NextResponse.json(serializeProfile(profile));
}

export async function DELETE() {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (user.provider === "telegram") {
    await prisma.profile.deleteMany({ where: { id: user.id } });
    return NextResponse.json({ success: true });
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!serviceRoleKey || !supabaseUrl) {
    return NextResponse.json({ error: "Account deletion is not configured" }, { status: 503 });
  }

  await prisma.profile.deleteMany({ where: { id: user.id } });

  const admin = createAdminClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) return NextResponse.json({ error: "Unable to delete account" }, { status: 500 });

  return NextResponse.json({ success: true });
}
