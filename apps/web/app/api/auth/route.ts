import { NextRequest, NextResponse } from "next/server";
import { readUserDatabase, writeUserDatabase, sanitizeUserRecord, type UserRecord } from "@/lib/user-db";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const action = String(body.action ?? "").trim().toLowerCase();
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  const database = readUserDatabase();
  const existing = database.users.find((user) => user.email.toLowerCase() === email.toLowerCase());

  if (action === "login") {
    if (!existing) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (existing.password !== password) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    return NextResponse.json({ profile: sanitizeUserRecord(existing) });
  }

  if (action === "register") {
    if (existing) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 });
    }

    const record: UserRecord = {
      email,
      password,
      onboardingComplete: false,
      entries: [],
    } as UserRecord;
    database.users.push(record);
    writeUserDatabase(database);
    return NextResponse.json({ profile: sanitizeUserRecord(record) });
  }

  return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
}
