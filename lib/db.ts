import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import crypto from "crypto";

export interface Selection {
  pictos: string[];
  at: string;
  sentence: string;
  hour: number;
}
export interface Profile {
  id: string;
  name: string;
  age?: number | null;
  photo?: string | null;
  createdAt: string;
  selections: Selection[];
  frequent: Record<string, number>;
}

function init(): Database.Database {
  const dataDir = path.join(process.cwd(), "data");
  fs.mkdirSync(dataDir, { recursive: true });
  const d = new Database(path.join(dataDir, "neurobridge.db"));
  d.pragma("journal_mode = WAL");
  d.exec(`
    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      age INTEGER,
      photo TEXT,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS selections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      profile_id TEXT NOT NULL,
      pictos TEXT NOT NULL,
      sentence TEXT NOT NULL,
      at TEXT NOT NULL,
      hour INTEGER NOT NULL,
      FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_sel_profile ON selections(profile_id);
  `);
  return d;
}

const g = globalThis as unknown as { __nbdb?: Database.Database };
export const db: Database.Database = g.__nbdb ?? (g.__nbdb = init());

function hydrate(row: any): Profile {
  const sels = db
    .prepare("SELECT pictos, sentence, at, hour FROM selections WHERE profile_id = ? ORDER BY id ASC")
    .all(row.id) as any[];
  const selections: Selection[] = sels.map(s => ({
    pictos: JSON.parse(s.pictos),
    sentence: s.sentence,
    at: s.at,
    hour: s.hour,
  }));
  const frequent: Record<string, number> = {};
  for (const s of selections) for (const p of s.pictos) frequent[p] = (frequent[p] ?? 0) + 1;
  return {
    id: row.id,
    name: row.name,
    age: row.age,
    photo: row.photo,
    createdAt: row.created_at,
    selections,
    frequent,
  };
}

export function listProfiles(): Profile[] {
  const rows = db.prepare("SELECT * FROM profiles ORDER BY created_at ASC").all() as any[];
  return rows.map(hydrate);
}

export function getProfile(id: string): Profile | null {
  const row = db.prepare("SELECT * FROM profiles WHERE id = ?").get(id) as any;
  return row ? hydrate(row) : null;
}

export function createProfile(name: string, age?: number | null, photo?: string | null): Profile {
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  db.prepare("INSERT INTO profiles (id, name, age, photo, created_at) VALUES (?, ?, ?, ?, ?)")
    .run(id, name, age ?? null, photo ?? null, createdAt);
  return getProfile(id)!;
}

export function deleteProfile(id: string): void {
  db.prepare("DELETE FROM selections WHERE profile_id = ?").run(id);
  db.prepare("DELETE FROM profiles WHERE id = ?").run(id);
}

export function addSelection(profileId: string, pictos: string[], sentence: string): Profile | null {
  const exists = db.prepare("SELECT id FROM profiles WHERE id = ?").get(profileId);
  if (!exists) return null;
  const now = new Date();
  db.prepare("INSERT INTO selections (profile_id, pictos, sentence, at, hour) VALUES (?, ?, ?, ?, ?)")
    .run(profileId, JSON.stringify(pictos), sentence, now.toISOString(), now.getHours());
  // keep last 50 per profile
  db.prepare(`
    DELETE FROM selections WHERE profile_id = ? AND id NOT IN (
      SELECT id FROM selections WHERE profile_id = ? ORDER BY id DESC LIMIT 50
    )`).run(profileId, profileId);
  return getProfile(profileId);
}
