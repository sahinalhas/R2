import { 
  Student, InsertStudent, 
  Appointment, InsertAppointment,
  Session, InsertSession,
  Report, InsertReport,
  ReportTemplate, InsertReportTemplate,
  Activity, InsertActivity,
  Reminder, InsertReminder,
  Survey, InsertSurvey,
  SurveyAssignment, InsertSurveyAssignment,
  SurveyResponse, InsertSurveyResponse,
  SurveyImport, InsertSurveyImport
} from '@shared/schema';

// Depolama arayüzü
export interface IStorage {
  // Öğrenci işlemleri
  getStudents(): Promise<Student[]>;
  getStudent(id: number): Promise<Student | undefined>;
  createStudent(student: InsertStudent): Promise<Student>;
  updateStudent(id: number, student: Partial<InsertStudent>): Promise<Student | undefined>;
  deleteStudent(id: number): Promise<boolean>;
  
  // Randevu işlemleri
  getAppointments(): Promise<Appointment[]>;
  getAppointment(id: number): Promise<Appointment | undefined>;
  getAppointmentsByStudentId(studentId: number): Promise<Appointment[]>;
  getAppointmentsByDate(date: string): Promise<Appointment[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: number, appointment: Partial<InsertAppointment>): Promise<Appointment | undefined>;
  deleteAppointment(id: number): Promise<boolean>;
  
  // Görüşme işlemleri
  getSessions(): Promise<Session[]>;
  getSession(id: number): Promise<Session | undefined>;
  getSessionsByStudentId(studentId: number): Promise<Session[]>;
  createSession(session: InsertSession): Promise<Session>;
  updateSession(id: number, session: Partial<InsertSession>): Promise<Session | undefined>;
  deleteSession(id: number): Promise<boolean>;
  
  // Rapor işlemleri
  getReports(): Promise<Report[]>;
  getReport(id: number): Promise<Report | undefined>;
  getReportsByStudentId(studentId: number): Promise<Report[]>;
  createReport(report: InsertReport): Promise<Report>;
  updateReport(id: number, report: Partial<InsertReport>): Promise<Report | undefined>;
  deleteReport(id: number): Promise<boolean>;
  
  // Rapor şablonu işlemleri
  getReportTemplates(): Promise<ReportTemplate[]>;
  getReportTemplate(id: number): Promise<ReportTemplate | undefined>;
  getActiveReportTemplates(): Promise<ReportTemplate[]>;
  getReportTemplatesByType(type: string): Promise<ReportTemplate[]>;
  getReportTemplatesByCategory(category: string): Promise<ReportTemplate[]>;
  searchReportTemplates(query: string): Promise<ReportTemplate[]>;
  createReportTemplate(template: InsertReportTemplate): Promise<ReportTemplate>;
  updateReportTemplate(id: number, template: Partial<InsertReportTemplate>): Promise<ReportTemplate | undefined>;
  updateTemplateStatus(id: number, isActive: boolean): Promise<ReportTemplate | undefined>;
  deleteReportTemplate(id: number): Promise<boolean>;
  
  // Aktivite işlemleri
  getActivities(): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  

  
  // Hatırlatıcı işlemleri
  getReminders(): Promise<Reminder[]>;
  getRemindersByAppointment(appointmentId: number): Promise<Reminder[]>;
  createReminder(reminder: InsertReminder): Promise<Reminder>;
  updateReminderStatus(id: number, status: string): Promise<Reminder | undefined>;
  deleteReminder(id: number): Promise<boolean>;
  
  // Uygun zaman aralıkları 
  getAvailableTimeSlots(date: string): Promise<{ startTime: string, endTime: string }[]>;

  // Anket işlemleri
  getSurveys(): Promise<Survey[]>;
  getSurvey(id: number): Promise<Survey | undefined>;
  getSurveysByType(type: string): Promise<Survey[]>;
  createSurvey(survey: InsertSurvey): Promise<Survey>;
  updateSurvey(id: number, survey: Partial<InsertSurvey>): Promise<Survey | undefined>;
  deleteSurvey(id: number): Promise<boolean>;
  
  // Anket atama işlemleri
  getSurveyAssignments(surveyId: number): Promise<SurveyAssignment[]>;
  getSurveyAssignment(id: number): Promise<SurveyAssignment | undefined>;
  getSurveyAssignmentsByStudentId(studentId: number): Promise<SurveyAssignment[]>;
  assignSurveyToStudent(assignment: InsertSurveyAssignment): Promise<SurveyAssignment>;
  assignSurveyToMultipleStudents(surveyId: number, studentIds: number[]): Promise<SurveyAssignment[]>;
  updateSurveyAssignmentStatus(id: number, status: string): Promise<SurveyAssignment | undefined>;
  deleteSurveyAssignment(id: number): Promise<boolean>;
  
  // Anket yanıt işlemleri
  getSurveyResponses(surveyId: number): Promise<SurveyResponse[]>;
  getSurveyResponse(id: number): Promise<SurveyResponse | undefined>;
  createSurveyResponse(response: InsertSurveyResponse): Promise<SurveyResponse>;
  getSurveyResponsesByStudentId(studentId: number): Promise<SurveyResponse[]>;
  
  // Excel Import işlemleri
  importSurveyResponsesFromExcel(surveyId: number, filePath: string, processedBy: number): Promise<SurveyImport>;
  getSurveyImports(surveyId: number): Promise<SurveyImport[]>;
  getSurveyImport(id: number): Promise<SurveyImport | undefined>;
  updateSurveyImportStatus(id: number, status: string, errorMessage?: string): Promise<SurveyImport | undefined>;
  
  // Gelecekte yeni işlemler buraya eklenebilir
}

// Modüler SqliteStorage sınıfını import et
import { SqliteStorage } from './storage/SqliteStorage';

// SQL veritabanı depolama sınıfını kullan
export const storage: IStorage = new SqliteStorage();