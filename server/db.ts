import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from '@shared/schema';
import { ensureDataDir, DB_PATH } from './utils';

// Veritabanı bağlantısını başlatmak için fonksiyon
async function initDB() {
  await ensureDataDir();
  const sqlite = new Database(DB_PATH);
  return drizzle(sqlite, { schema });
}

// Veritabanı bağlantısı
let _db: ReturnType<typeof drizzle> | null = null;

// Veritabanına erişim sağlayan getter fonksiyonu
export const getDB = async () => {
  if (!_db) {
    _db = await initDB();
  }
  return _db;
};