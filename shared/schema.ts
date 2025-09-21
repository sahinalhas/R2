import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";


// Hatırlatıcılar tablosu
export const reminders = sqliteTable("reminders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  appointmentId: integer("appointment_id").notNull(), // İlgili randevu
  type: text("type").notNull(), // Hatırlatıcı tipi (SMS, Email)
  scheduledTime: text("scheduled_time").notNull(), // Hatırlatıcının gönderileceği zaman
  status: text("status").notNull().default("Bekliyor"), // Durum (Bekliyor, Gönderildi, Başarısız)
  recipientInfo: text("recipient_info").notNull(), // Alıcı bilgisi (telefon, email)
  content: text("content").notNull(), // Hatırlatıcı içeriği
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Öğrenci tablosu
export const students = sqliteTable("students", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  studentClass: text("student_class").notNull(), // Sınıf bilgisi (9-A, 10-B gibi)
  studentNumber: text("student_number").notNull(), // Okul numarası
  birthDate: text("birth_date"),
  gender: text("gender"), // Cinsiyet (Erkek, Kadın)
  parentName: text("parent_name"), // Veli adı
  parentPhone: text("parent_phone"), // Veli telefonu
  notes: text("notes"), // Genel notlar
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Randevu tablosu
export const appointments = sqliteTable("appointments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  studentId: integer("student_id").notNull(), // Öğrenci ID referansı
  appointmentType: text("appointment_type").notNull(), // Randevu türü (Akademik, Kariyer, Psikolojik vb)
  date: text("date").notNull(), // Randevu tarihi
  time: text("time").notNull(), // Randevu saati
  duration: integer("duration").notNull(), // Dakika olarak süre
  status: text("status").notNull(), // Durum (Bekliyor, Tamamlandı, İptal Edildi)
  notes: text("notes"), // Randevu notları
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Görüşme kayıtları tablosu
export const sessions = sqliteTable("sessions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  studentId: integer("student_id").notNull(), // Öğrenci ID referansı
  appointmentId: integer("appointment_id"), // İlgili randevu (varsa)
  sessionType: text("session_type").notNull(), // Görüşme türü (Akademik, Kariyer, Psikolojik, vb.)
  date: text("date").notNull(), // Görüşme tarihi
  summary: text("summary").notNull(), // Görüşme özeti
  problems: text("problems"), // Belirlenen problemler
  actions: text("actions"), // Önerilen aksiyonlar
  followUp: integer("follow_up", { mode: "boolean" }), // Takip görüşmesi gerekli mi
  followUpDate: text("follow_up_date"), // Takip tarihi
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Rapor şablonları tablosu
export const reportTemplates = sqliteTable("report_templates", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(), // Şablon adı
  type: text("type").notNull(), // Şablon türü (evaluation, behavior, academic, psychological)
  description: text("description"), // Şablon açıklaması
  structure: text("structure").notNull(), // Şablon yapısı (JSON formatında alanlar)
  defaultContent: text("default_content").notNull(), // Varsayılan içerik
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true), // Şablon aktif mi?
  category: text("category").notNull().default("general"), // Kategori (general, student, classroom, special)
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Raporlar tablosu
export const reports = sqliteTable("reports", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(), // Rapor başlığı
  type: text("type").notNull(), // Rapor türü (Öğrenci, Sınıf, Genel)
  studentId: integer("student_id"), // İlgili öğrenci (varsa)
  studentClass: text("student_class"), // İlgili sınıf (varsa)
  content: text("content").notNull(), // Rapor içeriği
  templateId: integer("template_id"), // Kullanılan şablon ID (varsa)
  metadata: text("metadata"), // Ek meta veriler (JSON formatında)
  tags: text("tags"), // Etiketler (virgülle ayrılmış)
  status: text("status").notNull().default("Taslak"), // Rapor durumu (Taslak, Yayınlandı, Arşivlendi)
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Aktivite kayıtları
export const activities = sqliteTable("activities", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  type: text("type").notNull(), // Aktivite tipi (Yeni öğrenci, Yeni randevu, Rapor, Görüşme)
  description: text("description").notNull(), // Aktivite açıklaması
  relatedId: integer("related_id"), // İlgili öğe ID'si
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Kullanıcı ayarları tablosu
export const userSettings = sqliteTable("user_settings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  settingKey: text("setting_key").notNull(),
  settingValue: text("setting_value").notNull(),
  settingCategory: text("setting_category").notNull(), // personal, app, calendar, data
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Anket tablosu - Ana anket tanımları
export const surveys = sqliteTable("surveys", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(), // Anket başlığı
  description: text("description"), // Anket açıklaması
  type: text("type").notNull(), // Anket tipi (ÖğrenciAnketi, VeliAnketi, ÖğretmenAnketi, vb.)
  targetAudience: text("target_audience").notNull(), // Hedef kitle (Öğrenci, Veli, Öğretmen)
  questions: text("questions").notNull(), // JSON formatında sorular (SQLite'da JSON desteği olmadığı için string olarak saklıyoruz)
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true), // Anket aktif mi?
  anonymous: integer("anonymous", { mode: "boolean" }).notNull().default(false), // Anket isimsiz mi?
  startDate: text("start_date"), // Başlangıç tarihi (opsiyonel)
  endDate: text("end_date"), // Bitiş tarihi (opsiyonel)
  createdBy: integer("created_by").notNull(), // Anketi oluşturan kullanıcı ID
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Anket atama tablosu - Kime atandı?
export const surveyAssignments = sqliteTable("survey_assignments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  surveyId: integer("survey_id").notNull(), // İlgili anket ID
  studentId: integer("student_id").notNull(), // Atanan öğrenci ID
  assignedAt: text("assigned_at").notNull().default(sql`CURRENT_TIMESTAMP`), // Atanma tarihi
  status: text("status").notNull().default("Beklemede"), // Durum (Beklemede, Tamamlandı, İptal Edildi)
  dueDate: text("due_date"), // Son teslim tarihi
  completedAt: text("completed_at"), // Tamamlanma tarihi
});

// Anket yanıtları tablosu - Doldurulan anket yanıtları
export const surveyResponses = sqliteTable("survey_responses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  surveyId: integer("survey_id").notNull(), // İlgili anket ID
  studentId: integer("student_id").notNull(), // Öğrenci ID
  assignmentId: integer("assignment_id").notNull(), // İlgili atama ID
  answers: text("answers").notNull(), // JSON formatında yanıtlar
  submittedAt: text("submitted_at").notNull().default(sql`CURRENT_TIMESTAMP`), // Gönderilme tarihi
  ipAddress: text("ip_address"), // Gönderen IP adresi (istatistik amaçlı)
});

// Insert şemaları
export const insertStudentSchema = createInsertSchema(students).omit({
  id: true,
  createdAt: true
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true, 
  createdAt: true
});

export const insertSessionSchema = createInsertSchema(sessions).omit({
  id: true,
  createdAt: true
});

export const insertReportTemplateSchema = createInsertSchema(reportTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertReportSchema = createInsertSchema(reports).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  createdAt: true
});



export const insertReminderSchema = createInsertSchema(reminders).omit({
  id: true,
  createdAt: true
});

export const insertUserSettingSchema = createInsertSchema(userSettings).omit({
  id: true,
  createdAt: true
});

// Anket şemaları
export const insertSurveySchema = createInsertSchema(surveys).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertSurveyAssignmentSchema = createInsertSchema(surveyAssignments).omit({
  id: true,
  assignedAt: true,
  completedAt: true
});

export const insertSurveyResponseSchema = createInsertSchema(surveyResponses).omit({
  id: true,
  submittedAt: true
});



// Anket Excel Import tablosu
export const surveyImports = sqliteTable("survey_imports", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  surveyId: integer("survey_id").notNull(), // İlgili anket ID
  fileName: text("file_name").notNull(), // Yüklenen dosya adı
  recordCount: integer("record_count").notNull(), // İçe aktarılan kayıt sayısı
  status: text("status").notNull().default("İşleniyor"), // Durum (İşleniyor, Tamamlandı, Hata)
  errorMessage: text("error_message"), // Hata mesajı (varsa)
  processedBy: integer("processed_by").notNull(), // İşlemi yapan kullanıcı ID
  importedAt: text("imported_at").notNull().default(sql`CURRENT_TIMESTAMP`), // İçe aktarım tarihi
});

// Tipler
export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type Student = typeof students.$inferSelect;

export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Appointment = typeof appointments.$inferSelect;

export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Session = typeof sessions.$inferSelect;

export type InsertReportTemplate = z.infer<typeof insertReportTemplateSchema>;
export type ReportTemplate = typeof reportTemplates.$inferSelect;

export type InsertReport = z.infer<typeof insertReportSchema>;
export type Report = typeof reports.$inferSelect;

export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Activity = typeof activities.$inferSelect;



export type InsertReminder = z.infer<typeof insertReminderSchema>;
export type Reminder = typeof reminders.$inferSelect;

export type InsertUserSetting = z.infer<typeof insertUserSettingSchema>;
export type UserSetting = typeof userSettings.$inferSelect;

export type InsertSurvey = z.infer<typeof insertSurveySchema>;
export type Survey = typeof surveys.$inferSelect;

export type InsertSurveyAssignment = z.infer<typeof insertSurveyAssignmentSchema>;
export type SurveyAssignment = typeof surveyAssignments.$inferSelect;

export type InsertSurveyResponse = z.infer<typeof insertSurveyResponseSchema>;
export type SurveyResponse = typeof surveyResponses.$inferSelect;



export type InsertSurveyImport = Omit<typeof surveyImports.$inferInsert, "id" | "importedAt">;
export type SurveyImport = typeof surveyImports.$inferSelect;