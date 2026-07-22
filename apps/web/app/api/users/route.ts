import { NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/supabase/auth";

export const runtime = "nodejs";

const entrySchema = z.object({
  date: z.iso.date(),
  period: z.enum(["spotting", "light", "medium", "heavy"]).optional(),
  periodClots: z.boolean().optional(),
  periodLeak: z.boolean().optional(),
  periodNightChange: z.boolean().optional(),
  periodHourlyChange: z.boolean().optional(),
  pain: z.number().int().min(0).max(10).optional(),
  painLocations: z.array(z.string().max(80)).max(20).default([]),
  painTypes: z.array(z.string().max(80)).max(20).default([]),
  painImpact: z.enum(["none", "some", "strong"]).optional(),
  mood: z.enum(["low", "calm", "good"]).optional(),
  symptoms: z.array(z.string().max(80)).max(50).default([]),
  symptomIntensity: z.record(z.string(), z.number().int().min(1).max(3)).optional(),
  sleepHours: z.number().min(0).max(24).optional(),
  waterMl: z.number().int().min(0).max(20000).optional(),
  weightKg: z.number().min(20).max(500).optional(),
  basalTemperature: z.number().min(30).max(45).optional(),
  notes: z.string().max(4000).optional(),
});

const profileSchema = z.object({
  email: z.email().optional(),
  name: z.string().trim().min(1).max(80).optional(),
  onboardingComplete: z.boolean().optional(),
  onboardingStep: z.number().int().min(1).max(4).optional(),
  goal: z.string().max(80).optional(),
  lastPeriod: z.iso.date().nullable().optional(),
  cycleLength: z.number().int().min(15).max(60).optional(),
  cyclePattern: z.enum(["regular", "irregular", "unknown"]).optional(),
  periodLength: z.number().int().min(1).max(14).optional(),
  weightKg: z.number().min(20).max(500).optional(),
  preferences: z.object({
    cycleForecasts: z.boolean().optional(),
    privateInsights: z.boolean().optional(),
  }).optional(),
  consents: z.object({
    healthData: z.boolean().optional(),
    privacyPolicy: z.boolean().optional(),
    sensitiveInsights: z.boolean().optional(),
  }).optional(),
  entries: z.array(entrySchema).max(5000).optional(),
  firstPromptDismissed: z.boolean().optional(),
});

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
    entries: profile.entries.map((entry) => ({
      date: entry.date.toISOString().slice(0, 10),
      period: entry.period ?? undefined,
      periodClots: entry.periodClots ?? undefined,
      periodLeak: entry.periodLeak ?? undefined,
      periodNightChange: entry.periodNightChange ?? undefined,
      periodHourlyChange: entry.periodHourlyChange ?? undefined,
      pain: entry.pain ?? undefined,
      painLocations: entry.painLocations,
      painTypes: entry.painTypes,
      painImpact: entry.painImpact ?? undefined,
      mood: entry.mood ?? undefined,
      symptoms: entry.symptoms,
      symptomIntensity: entry.symptomIntensity ?? undefined,
      sleepHours: entry.sleepHours ?? undefined,
      waterMl: entry.waterMl ?? undefined,
      weightKg: entry.weightKg ?? undefined,
      basalTemperature: entry.basalTemperature ?? undefined,
      notes: entry.notes ?? undefined,
    })),
    firstPromptDismissed: profile.firstPromptDismissed,
  };
}

function loadProfile(userId: string) {
  return prisma.profile.findUnique({
    where: { id: userId },
    include: { entries: { orderBy: { date: "asc" } } },
  });
}

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await loadProfile(user.id);
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  return NextResponse.json(serializeProfile(profile));
}

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = profileSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid profile data", details: parsed.error.flatten() }, { status: 400 });
  }

  const payload = parsed.data;
  const registeredPrivacyConsent = user.user_metadata?.privacy_policy_consent === true;
  const profile = await prisma.$transaction(async (tx) => {
    await tx.profile.upsert({
      where: { id: user.id },
      create: {
        id: user.id,
        email: user.email!,
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
        healthDataConsent: payload.consents?.healthData ?? false,
        privacyConsent: payload.consents?.privacyPolicy ?? registeredPrivacyConsent,
        sensitiveConsent: payload.consents?.sensitiveInsights ?? false,
        firstPromptDismissed: payload.firstPromptDismissed ?? false,
        consentAcceptedAt: payload.consents?.healthData && (payload.consents?.privacyPolicy ?? registeredPrivacyConsent) ? new Date() : undefined,
        consentVersion: payload.consents?.healthData && (payload.consents?.privacyPolicy ?? registeredPrivacyConsent) ? "2026-07-22" : undefined,
      },
      update: {
        email: user.email!,
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
        consentAcceptedAt: payload.consents?.healthData && payload.consents?.privacyPolicy ? new Date() : undefined,
        consentVersion: payload.consents?.healthData && payload.consents?.privacyPolicy ? "2026-07-22" : undefined,
      },
    });

    if (payload.entries) {
      await tx.entry.deleteMany({ where: { userId: user.id } });
      if (payload.entries.length > 0) {
        await tx.entry.createMany({
          data: payload.entries.map((entry) => ({
            ...entry,
            userId: user.id,
            date: new Date(`${entry.date}T00:00:00.000Z`),
          })),
        });
      }
    }

    return tx.profile.findUniqueOrThrow({
      where: { id: user.id },
      include: { entries: { orderBy: { date: "asc" } } },
    });
  });

  return NextResponse.json(serializeProfile(profile));
}

export async function DELETE() {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
