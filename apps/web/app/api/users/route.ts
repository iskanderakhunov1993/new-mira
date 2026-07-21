import { NextRequest, NextResponse } from "next/server";
import { readUserDatabase, sanitizeUserRecord, writeUserDatabase, type UserRecord } from "@/lib/user-db";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get("email");
  if (!email) {
    return NextResponse.json({ error: "Missing email" }, { status: 400 });
  }

  const database = readUserDatabase();
  const record = database.users.find((user) => user.email.toLowerCase() === email.toLowerCase());
  if (!record) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(sanitizeUserRecord(record));
}

export async function POST(request: NextRequest) {
  const payload = await request.json();
  const email = String(payload.email ?? "").trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ error: "Missing email" }, { status: 400 });
  }

  const database = readUserDatabase();
  let record = database.users.find((user) => user.email.toLowerCase() === email.toLowerCase());
  const updates: Partial<UserRecord> = { ...payload, email };

  if (record) {
    record = { ...record, ...updates };
    database.users = database.users.map((user) => (user.email.toLowerCase() === email.toLowerCase() ? record! : user));
  } else {
    record = { ...updates } as UserRecord;
    database.users.push(record);
  }

  writeUserDatabase(database);
  return NextResponse.json(sanitizeUserRecord(record));
}

export async function DELETE(request: NextRequest) {
  const email = request.nextUrl.searchParams.get("email");
  if (!email) {
    return NextResponse.json({ error: "Missing email" }, { status: 400 });
  }

  const database = readUserDatabase();
  const nextUsers = database.users.filter((user) => user.email.toLowerCase() !== email.toLowerCase());
  database.users = nextUsers;
  writeUserDatabase(database);
  return NextResponse.json({ success: true });
}
