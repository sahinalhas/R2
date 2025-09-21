import Database from 'better-sqlite3';
import { ensureDataDir, DB_PATH } from './utils';

async function runMigration() {
  try {
    await ensureDataDir();
    
    console.log('Veritabanı tabloları oluşturuluyor...');
    
    const sqlite = new Database(DB_PATH);
    
    // Her bir SQL ifadesini ayrı ayrı çalıştır
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        student_class TEXT NOT NULL,
        student_number TEXT NOT NULL,
        birth_date TEXT,
        gender TEXT,
        parent_name TEXT,
        parent_phone TEXT,
        notes TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `);
    
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS appointments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        appointment_type TEXT NOT NULL,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        duration INTEGER NOT NULL,
        status TEXT NOT NULL,
        notes TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `);
    
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        appointment_id INTEGER,
        session_type TEXT NOT NULL,
        date TEXT NOT NULL,
        summary TEXT NOT NULL,
        problems TEXT,
        actions TEXT,
        follow_up INTEGER,
        follow_up_date TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `);
    
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS reports (
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
      );
    `);
    
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS report_templates (
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
      );
    `);
    
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS activities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        description TEXT NOT NULL,
        related_id INTEGER,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `);
    
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS user_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        setting_key TEXT NOT NULL,
        setting_value TEXT NOT NULL,
        setting_category TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `);
    
    // Çalışma saatleri tablosu
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS working_hours (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        day_of_week INTEGER NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `);
    
    // Hatırlatıcılar tablosu
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS reminders (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        appointment_id INTEGER NOT NULL,
        reminder_time TEXT NOT NULL,
        status TEXT NOT NULL,
        message TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `);
    
    // Anket tabloları
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS surveys (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        type TEXT NOT NULL,
        target_audience TEXT NOT NULL,
        questions TEXT NOT NULL,
        is_active INTEGER NOT NULL DEFAULT 1,
        anonymous INTEGER NOT NULL DEFAULT 0,
        start_date TEXT,
        end_date TEXT,
        created_by INTEGER NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `);
    
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS survey_assignments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        survey_id INTEGER NOT NULL,
        student_id INTEGER NOT NULL,
        assigned_at TEXT NOT NULL DEFAULT (datetime('now')),
        status TEXT NOT NULL DEFAULT 'Beklemede',
        due_date TEXT,
        completed_at TEXT
      );
    `);
    
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS survey_responses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        survey_id INTEGER NOT NULL,
        student_id INTEGER NOT NULL,
        assignment_id INTEGER NOT NULL,
        answers TEXT NOT NULL,
        submitted_at TEXT NOT NULL DEFAULT (datetime('now')),
        ip_address TEXT
      );
    `);
    
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS survey_imports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        survey_id INTEGER NOT NULL,
        file_name TEXT NOT NULL,
        record_count INTEGER NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'İşleniyor',
        error_message TEXT,
        processed_by INTEGER NOT NULL,
        imported_at TEXT NOT NULL DEFAULT (datetime('now')),
        completed_at TEXT
      );
    `);
    
    // Ders saatleri tablosu - kullanılmıyor (kaldırıldı)
    
    console.log('Tablolar başarıyla oluşturuldu!');
    
    sqlite.close();
  } catch (error) {
    console.error('Veritabanı oluşturma hatası:', error);
    process.exit(1);
  }
}

runMigration();