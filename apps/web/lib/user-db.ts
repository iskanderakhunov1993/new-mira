import fs from "fs";
import path from "path";
import type { MiraProfile } from "@/lib/demo-session";

export type UserRecord = MiraProfile & {
  email: string;
  password?: string;
};

export type UserDatabase = {
  users: UserRecord[];
};

const DB_FILE_PATH = path.join(process.cwd(), "apps/web/data/user-db.json");

function ensureDatabaseFile(): void {
  const dir = path.dirname(DB_FILE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE_PATH)) {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify({ users: [] }, null, 2), "utf-8");
  }
}

export function readUserDatabase(): UserDatabase {
  ensureDatabaseFile();
  const raw = fs.readFileSync(DB_FILE_PATH, "utf-8");
  try {
    return JSON.parse(raw) as UserDatabase;
  } catch {
    return { users: [] };
  }
}

export function writeUserDatabase(database: UserDatabase): void {
  ensureDatabaseFile();
  fs.writeFileSync(DB_FILE_PATH, JSON.stringify(database, null, 2), "utf-8");
}

export function sanitizeUserRecord(record: UserRecord): MiraProfile {
  const { password: _password, ...profile } = record;
  void _password;
  return profile;
}
