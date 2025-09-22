import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from '@shared/schema';
import { ensureDataDir, DB_PATH } from './utils';
import { drizzle } from 'drizzle-orm/better-sqlite3';

function ensureTableColumns(sqlite: Database) {
  const getColumns = (table: string): Set<string> => {
    const rows = sqlite.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[];
    return new Set(rows.map(r => r.name));
  };
  const addColumn = (table: string, ddl: string) => {
    sqlite.exec(`ALTER TABLE ${table} ADD COLUMN ${ddl};`);
  };
  const addColumnNoDefault = (table: string, col: string, type: string) => {
    sqlite.exec(`ALTER TABLE ${table} ADD COLUMN ${col} ${type};`);
  };

  // Ensure reports table exists
  sqlite.exec(`CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    type TEXT NOT NULL,
    student_id INTEGER,
    student_class TEXT,
    content TEXT NOT NULL,
    template_id INTEGER,
    metadata TEXT,
    tags TEXT,
    status TEXT NOT NULL DEFAULT 'Taslak',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );`);
  const reportCols = getColumns('reports');
  if (!reportCols.has('student_class')) addColumn('reports', 'student_class TEXT');
  if (!reportCols.has('template_id')) addColumn('reports', 'template_id INTEGER');
  if (!reportCols.has('metadata')) addColumn('reports', 'metadata TEXT');
  if (!reportCols.has('tags')) addColumn('reports', 'tags TEXT');
  if (!reportCols.has('status')) addColumn('reports', "status TEXT NOT NULL DEFAULT 'Taslak'");
  if (!reportCols.has('created_at')) addColumnNoDefault('reports', 'created_at', 'TEXT');
  if (!reportCols.has('updated_at')) addColumnNoDefault('reports', 'updated_at', 'TEXT');
  // Backfill null timestamps to current time
  sqlite.exec("UPDATE reports SET created_at = COALESCE(created_at, datetime('now')) WHERE created_at IS NULL;");
  sqlite.exec("UPDATE reports SET updated_at = COALESCE(updated_at, datetime('now')) WHERE updated_at IS NULL;");

  // Ensure report_templates table exists
  sqlite.exec(`CREATE TABLE IF NOT EXISTS report_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    description TEXT,
    structure TEXT NOT NULL,
    default_content TEXT NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1,
    category TEXT NOT NULL DEFAULT 'general',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );`);
  const rtCols = getColumns('report_templates');
  if (!rtCols.has('description')) addColumn('report_templates', 'description TEXT');
  if (!rtCols.has('structure')) addColumn('report_templates', 'structure TEXT NOT NULL');
  if (!rtCols.has('default_content')) addColumn('report_templates', 'default_content TEXT NOT NULL');
  if (!rtCols.has('is_active')) addColumn('report_templates', 'is_active INTEGER NOT NULL DEFAULT 1');
  if (!rtCols.has('category')) addColumn('report_templates', "category TEXT NOT NULL DEFAULT 'general'");
  if (!rtCols.has('created_at')) addColumnNoDefault('report_templates', 'created_at', 'TEXT');
  if (!rtCols.has('updated_at')) addColumnNoDefault('report_templates', 'updated_at', 'TEXT');
  // Backfill template timestamps
  sqlite.exec("UPDATE report_templates SET created_at = COALESCE(created_at, datetime('now')) WHERE created_at IS NULL;");
  sqlite.exec("UPDATE report_templates SET updated_at = COALESCE(updated_at, datetime('now')) WHERE updated_at IS NULL;");
}

// Veritabanı bağlantısını başlatmak için fonksiyon
async function initDB() {
  await ensureDataDir();
  const sqlite = new Database(DB_PATH);
  // Ensure schema compatibility for existing databases
  ensureTableColumns(sqlite);
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
