import { promises as fs } from 'fs';
import { join } from 'path';

// Veritabanı dosyaları için dizin
export const DATA_DIR = join(process.cwd(), 'data');
export const DB_PATH = join(DATA_DIR, 'database.sqlite');

// Veri klasörünün varlığını kontrol eder, yoksa oluşturur
export async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch (error) {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}