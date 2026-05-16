import { kv } from '@vercel/kv';
import fs from 'fs';
import path from 'path';

export interface ArcContent {
  id: string;
  title: string;
  url: string;
  type: string;
  date?: string;
  detectedAt: string;
}

// In-memory fallback for serverless restarts (temporary)
let memorySeen: string[] = [];
let memoryLatest: ArcContent[] = [];

const LOCAL_DB_PATH = path.join(process.cwd(), 'local_db.json');

function isVercel() {
  return process.env.VERCEL === '1';
}

function readLocalDb() {
  if (isVercel()) return { seen: memorySeen, latest: memoryLatest, stats: { total: 0, lastChecked: 'Never' } };
  
  if (!fs.existsSync(LOCAL_DB_PATH)) return { seen: [], latest: [], stats: { total: 0, lastChecked: 'Never' } };
  try {
    return JSON.parse(fs.readFileSync(LOCAL_DB_PATH, 'utf-8'));
  } catch {
    return { seen: [], latest: [], stats: { total: 0, lastChecked: 'Never' } };
  }
}

function writeLocalDb(data: any) {
  if (isVercel()) {
    memorySeen = data.seen;
    memoryLatest = data.latest;
    return;
  }
  try {
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('Failed to write local DB:', e);
  }
}

export async function isNewContent(id: string): Promise<boolean> {
  try {
    if (process.env.KV_URL) {
      const exists = await kv.sismember('seen_content_ids', id);
      return exists === 0;
    }
  } catch (e) {
    console.error('KV Error:', e);
  }
  const db = readLocalDb();
  return !db.seen.includes(id);
}

export async function markAsSeen(id: string) {
  try {
    if (process.env.KV_URL) {
      await kv.sadd('seen_content_ids', id);
      return;
    }
  } catch (e) {}
  const db = readLocalDb();
  db.seen.push(id);
  writeLocalDb(db);
}

export async function saveContent(content: ArcContent) {
  try {
    if (process.env.KV_URL) {
      await kv.lpush('latest_content', JSON.stringify(content));
      await kv.ltrim('latest_content', 0, 49);
      return;
    }
  } catch (e) {}
  const db = readLocalDb();
  db.latest.unshift(content);
  db.latest = db.latest.slice(0, 50);
  writeLocalDb(db);
}

export async function getLatestContent(): Promise<ArcContent[]> {
  try {
    if (process.env.KV_URL) {
      const data = await kv.lrange('latest_content', 0, -1);
      return data.map((item: any) => (typeof item === 'string' ? JSON.parse(item) : item));
    }
  } catch (e) {}
  const db = readLocalDb();
  return db.latest;
}

export async function updateStats(count: number) {
  const now = new Date().toISOString();
  try {
    if (process.env.KV_URL) {
      await kv.incrby('total_detected', count);
      await kv.set('last_checked_at', now);
      return;
    }
  } catch (e) {}
  const db = readLocalDb();
  db.stats.total += count;
  db.stats.lastChecked = now;
  writeLocalDb(db);
}

export async function getStats() {
  try {
    if (process.env.KV_URL) {
      const total = await kv.get('total_detected') || 0;
      const lastChecked = await kv.get('last_checked_at') || 'Never';
      return { total, lastChecked };
    }
  } catch (e) {}
  const db = readLocalDb();
  return db.stats;
}
