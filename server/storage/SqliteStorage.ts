import { IStorage } from '../storage';
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
  SurveyImport
} from '@shared/schema';

import {
  StudentStorage,
  AppointmentStorage,
  SessionStorage,
  ReportStorage,
  ReportTemplateStorage,
  ActivityStorage,
  ReminderStorage,
  SurveyStorage,
  TimeSlotStorage
} from './index';

/**
 * SqliteStorage class that implements IStorage interface
 * This class combines all the specialized storage modules
 */
export class SqliteStorage implements IStorage {
  private studentStorage: StudentStorage;
  private appointmentStorage: AppointmentStorage;
  private sessionStorage: SessionStorage;
  private reportStorage: ReportStorage;
  private reportTemplateStorage: ReportTemplateStorage;
  private activityStorage: ActivityStorage;

  private reminderStorage: ReminderStorage;
  private surveyStorage: SurveyStorage;
  private timeSlotStorage: TimeSlotStorage;

  constructor() {
    this.studentStorage = new StudentStorage();
    this.appointmentStorage = new AppointmentStorage();
    this.sessionStorage = new SessionStorage();
    this.reportStorage = new ReportStorage();
    this.reportTemplateStorage = new ReportTemplateStorage();
    this.activityStorage = new ActivityStorage();

    this.reminderStorage = new ReminderStorage();
    this.surveyStorage = new SurveyStorage();
    this.timeSlotStorage = new TimeSlotStorage();
  }

  // #region Öğrenci işlemleri
  async getStudents(): Promise<Student[]> {
    return this.studentStorage.getStudents();
  }

  async getStudent(id: number): Promise<Student | undefined> {
    return this.studentStorage.getStudent(id);
  }

  async createStudent(student: InsertStudent): Promise<Student> {
    const newStudent = await this.studentStorage.createStudent(student);
    
    // Aktivite kaydet
    await this.createActivity({
      type: 'Yeni öğrenci',
      description: `${student.firstName} ${student.lastName} adlı öğrenci sisteme eklendi.`,
      relatedId: newStudent.id
    });
    
    return newStudent;
  }

  async updateStudent(id: number, student: Partial<InsertStudent>): Promise<Student | undefined> {
    const updatedStudent = await this.studentStorage.updateStudent(id, student);
    
    if (updatedStudent) {
      // Aktivite kaydet
      await this.createActivity({
        type: 'Öğrenci güncelleme',
        description: `${updatedStudent.firstName} ${updatedStudent.lastName} adlı öğrencinin bilgileri güncellendi.`,
        relatedId: id
      });
    }
    
    return updatedStudent;
  }

  async deleteStudent(id: number): Promise<boolean> {
    const student = await this.studentStorage.getStudent(id);
    
    if (!student) return false;
    
    const result = await this.studentStorage.deleteStudent(id);
    
    if (result) {
      // Aktivite kaydet
      await this.createActivity({
        type: 'Öğrenci silme',
        description: `${student.firstName} ${student.lastName} adlı öğrenci sistemden silindi.`,
        relatedId: null
      });
    }
    
    return result;
  }
  // #endregion

  // #region Randevu işlemleri
  async getAppointments(): Promise<Appointment[]> {
    return this.appointmentStorage.getAppointments();
  }

  async getAppointment(id: number): Promise<Appointment | undefined> {
    return this.appointmentStorage.getAppointment(id);
  }

  async getAppointmentsByStudentId(studentId: number): Promise<Appointment[]> {
    return this.appointmentStorage.getAppointmentsByStudentId(studentId);
  }

  async getAppointmentsByDate(date: string): Promise<Appointment[]> {
    return this.appointmentStorage.getAppointmentsByDate(date);
  }

  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const newAppointment = await this.appointmentStorage.createAppointment(appointment);
    
    // Öğrenci adını almak için öğrenciyi bulalım
    const student = await this.getStudent(appointment.studentId);
    
    // Aktivite kaydet
    await this.createActivity({
      type: 'Yeni randevu',
      description: `${student?.firstName} ${student?.lastName} için ${appointment.date} tarihine ${appointment.appointmentType} randevusu oluşturuldu.`,
      relatedId: newAppointment.id
    });
    
    return newAppointment;
  }

  async updateAppointment(id: number, appointment: Partial<InsertAppointment>): Promise<Appointment | undefined> {
    const currentAppointment = await this.appointmentStorage.getAppointment(id);
    
    if (!currentAppointment) return undefined;
    
    const updatedAppointment = await this.appointmentStorage.updateAppointment(id, appointment);
    
    if (updatedAppointment) {
      // Öğrenci adını almak için öğrenciyi bulalım
      const studentId = appointment.studentId || currentAppointment.studentId;
      const student = await this.getStudent(studentId);
      
      // Aktivite kaydet
      await this.createActivity({
        type: 'Randevu güncelleme',
        description: `${student?.firstName} ${student?.lastName} için ${updatedAppointment.date} tarihli randevu güncellendi.`,
        relatedId: id
      });
    }
    
    return updatedAppointment;
  }

  async deleteAppointment(id: number): Promise<boolean> {
    const appointment = await this.appointmentStorage.getAppointment(id);
    
    if (!appointment) return false;
    
    // Öğrenci adını almak için öğrenciyi bulalım
    const student = await this.getStudent(appointment.studentId);
    
    const result = await this.appointmentStorage.deleteAppointment(id);
    
    if (result) {
      // Aktivite kaydet
      await this.createActivity({
        type: 'Randevu silme',
        description: `${student?.firstName} ${student?.lastName} için ${appointment.date} tarihli randevu silindi.`,
        relatedId: null
      });
    }
    
    return result;
  }
  // #endregion

  // #region Görüşme işlemleri
  async getSessions(): Promise<Session[]> {
    return this.sessionStorage.getSessions();
  }

  async getSession(id: number): Promise<Session | undefined> {
    return this.sessionStorage.getSession(id);
  }

  async getSessionsByStudentId(studentId: number): Promise<Session[]> {
    return this.sessionStorage.getSessionsByStudentId(studentId);
  }

  async createSession(session: InsertSession): Promise<Session> {
    const newSession = await this.sessionStorage.createSession(session);
    
    // Öğrenci adını almak için öğrenciyi bulalım
    const student = await this.getStudent(session.studentId);
    
    // Aktivite kaydet
    await this.createActivity({
      type: 'Yeni görüşme',
      description: `${student?.firstName} ${student?.lastName} ile ${session.date} tarihinde ${session.sessionType} görüşmesi yapıldı.`,
      relatedId: newSession.id
    });
    
    return newSession;
  }

  async updateSession(id: number, session: Partial<InsertSession>): Promise<Session | undefined> {
    const currentSession = await this.sessionStorage.getSession(id);
    
    if (!currentSession) return undefined;
    
    const updatedSession = await this.sessionStorage.updateSession(id, session);
    
    if (updatedSession) {
      // Öğrenci adını almak için öğrenciyi bulalım
      const studentId = session.studentId || currentSession.studentId;
      const student = await this.getStudent(studentId);
      
      // Aktivite kaydet
      await this.createActivity({
        type: 'Görüşme güncelleme',
        description: `${student?.firstName} ${student?.lastName} ile yapılan ${updatedSession.date} tarihli görüşme kaydı güncellendi.`,
        relatedId: id
      });
    }
    
    return updatedSession;
  }

  async deleteSession(id: number): Promise<boolean> {
    const session = await this.sessionStorage.getSession(id);
    
    if (!session) return false;
    
    // Öğrenci adını almak için öğrenciyi bulalım
    const student = await this.getStudent(session.studentId);
    
    const result = await this.sessionStorage.deleteSession(id);
    
    if (result) {
      // Aktivite kaydet
      await this.createActivity({
        type: 'Görüşme silme',
        description: `${student?.firstName} ${student?.lastName} ile yapılan ${session.date} tarihli görüşme kaydı silindi.`,
        relatedId: null
      });
    }
    
    return result;
  }
  // #endregion

  // #region Rapor işlemleri
  async getReports(): Promise<Report[]> {
    return this.reportStorage.getReports();
  }

  async getReport(id: number): Promise<Report | undefined> {
    return this.reportStorage.getReport(id);
  }

  async getReportsByStudentId(studentId: number): Promise<Report[]> {
    return this.reportStorage.getReportsByStudentId(studentId);
  }

  async createReport(report: InsertReport): Promise<Report> {
    const newReport = await this.reportStorage.createReport(report);
    
    // Aktivite açıklaması
    let description = `"${report.title}" adlı rapor oluşturuldu.`;
    
    // Eğer öğrenci ile ilişkiliyse öğrenci bilgilerini ekleyelim
    if (report.studentId) {
      const student = await this.getStudent(report.studentId);
      if (student) {
        description = `${student.firstName} ${student.lastName} için "${report.title}" raporu oluşturuldu.`;
      }
    }
    
    // Aktivite kaydet
    await this.createActivity({
      type: 'Yeni rapor',
      description,
      relatedId: newReport.id
    });
    
    return newReport;
  }

  async updateReport(id: number, report: Partial<InsertReport>): Promise<Report | undefined> {
    const currentReport = await this.reportStorage.getReport(id);
    
    if (!currentReport) return undefined;
    
    const updatedReport = await this.reportStorage.updateReport(id, report);
    
    if (updatedReport) {
      // Aktivite açıklaması
      let description = `"${updatedReport.title}" adlı rapor güncellendi.`;
      
      // Eğer öğrenci ile ilişkiliyse öğrenci bilgilerini ekleyelim
      const studentId = report.studentId !== undefined ? report.studentId : currentReport.studentId;
      if (studentId) {
        const student = await this.getStudent(studentId);
        if (student) {
          description = `${student.firstName} ${student.lastName} için "${updatedReport.title}" raporu güncellendi.`;
        }
      }
      
      // Aktivite kaydet
      await this.createActivity({
        type: 'Rapor güncelleme',
        description,
        relatedId: id
      });
    }
    
    return updatedReport;
  }

  async deleteReport(id: number): Promise<boolean> {
    const report = await this.reportStorage.getReport(id);
    
    if (!report) return false;
    
    // Aktivite açıklaması için rapor başlığını ve varsa öğrenciyi alalım
    let description = `"${report.title}" raporu silindi.`;
    if (report.studentId) {
      const student = await this.getStudent(report.studentId);
      if (student) {
        description = `${student.firstName} ${student.lastName} için "${report.title}" raporu silindi.`;
      }
    }
    
    const result = await this.reportStorage.deleteReport(id);
    
    if (result) {
      // Aktivite kaydet
      await this.createActivity({
        type: 'Rapor silme',
        description,
        relatedId: null
      });
    }
    
    return result;
  }
  // #endregion
  
  // #region Rapor şablonu işlemleri
  async getReportTemplates(): Promise<ReportTemplate[]> {
    return this.reportTemplateStorage.getReportTemplates();
  }
  
  async getReportTemplate(id: number): Promise<ReportTemplate | undefined> {
    return this.reportTemplateStorage.getReportTemplate(id);
  }
  
  async getActiveReportTemplates(): Promise<ReportTemplate[]> {
    return this.reportTemplateStorage.getActiveReportTemplates();
  }
  
  async getReportTemplatesByType(type: string): Promise<ReportTemplate[]> {
    return this.reportTemplateStorage.getReportTemplatesByType(type);
  }
  
  async getReportTemplatesByCategory(category: string): Promise<ReportTemplate[]> {
    return this.reportTemplateStorage.getReportTemplatesByCategory(category);
  }
  
  async searchReportTemplates(query: string): Promise<ReportTemplate[]> {
    return this.reportTemplateStorage.searchReportTemplates(query);
  }
  
  async createReportTemplate(template: InsertReportTemplate): Promise<ReportTemplate> {
    const newTemplate = await this.reportTemplateStorage.createReportTemplate(template);
    
    // Aktivite kaydet
    await this.createActivity({
      type: 'Yeni rapor şablonu',
      description: `"${template.name}" adlı yeni bir rapor şablonu oluşturuldu.`,
      relatedId: newTemplate.id
    });
    
    return newTemplate;
  }
  
  async updateReportTemplate(id: number, template: Partial<InsertReportTemplate>): Promise<ReportTemplate | undefined> {
    const currentTemplate = await this.reportTemplateStorage.getReportTemplate(id);
    
    if (!currentTemplate) return undefined;
    
    const updatedTemplate = await this.reportTemplateStorage.updateReportTemplate(id, template);
    
    if (updatedTemplate) {
      // Aktivite kaydet
      await this.createActivity({
        type: 'Rapor şablonu güncelleme',
        description: `"${updatedTemplate.name}" adlı rapor şablonu güncellendi.`,
        relatedId: id
      });
    }
    
    return updatedTemplate;
  }
  
  async updateTemplateStatus(id: number, isActive: boolean): Promise<ReportTemplate | undefined> {
    const currentTemplate = await this.reportTemplateStorage.getReportTemplate(id);
    
    if (!currentTemplate) return undefined;
    
    const updatedTemplate = await this.reportTemplateStorage.updateTemplateStatus(id, isActive);
    
    if (updatedTemplate) {
      const statusText = isActive ? 'aktif' : 'pasif';
      
      // Aktivite kaydet
      await this.createActivity({
        type: 'Rapor şablonu durum değişikliği',
        description: `"${updatedTemplate.name}" adlı rapor şablonu ${statusText} durumuna getirildi.`,
        relatedId: id
      });
    }
    
    return updatedTemplate;
  }
  
  async deleteReportTemplate(id: number): Promise<boolean> {
    const template = await this.reportTemplateStorage.getReportTemplate(id);
    
    if (!template) return false;
    
    const result = await this.reportTemplateStorage.deleteReportTemplate(id);
    
    if (result) {
      // Aktivite kaydet
      await this.createActivity({
        type: 'Rapor şablonu silme',
        description: `"${template.name}" adlı rapor şablonu silindi.`,
        relatedId: null
      });
    }
    
    return result;
  }
  // #endregion

  // #region Aktivite işlemleri
  async getActivities(): Promise<Activity[]> {
    return this.activityStorage.getActivities();
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    return this.activityStorage.createActivity(activity);
  }
  // #endregion

  // Uygun zaman aralıkları
  
  // Uygun zaman aralıklarını getir
  async getAvailableTimeSlots(date: string): Promise<{ startTime: string, endTime: string }[]> {
    return this.timeSlotStorage.getAvailableTimeSlots(date);
  }

  // #region Hatırlatıcı işlemleri
  async getReminders(): Promise<Reminder[]> {
    return this.reminderStorage.getReminders();
  }
  
  async getRemindersByAppointment(appointmentId: number): Promise<Reminder[]> {
    return this.reminderStorage.getRemindersByAppointment(appointmentId);
  }
  
  async createReminder(reminder: InsertReminder): Promise<Reminder> {
    const newReminder = await this.reminderStorage.createReminder(reminder);
    
    // İlgili randevuyu bul
    const appointment = await this.getAppointment(reminder.appointmentId);
    // İlgili öğrenciyi bul
    const student = appointment ? await this.getStudent(appointment.studentId) : null;
    
    let description = `Yeni ${reminder.type} hatırlatıcı oluşturuldu.`;
    if (student && appointment) {
      description = `${student.firstName} ${student.lastName} için ${appointment.date} tarihli randevuya ${reminder.type} hatırlatıcı oluşturuldu.`;
    }
    
    // Aktivite kaydet
    await this.createActivity({
      type: 'Yeni hatırlatıcı',
      description,
      relatedId: newReminder.id
    });
    
    return newReminder;
  }
  
  async updateReminderStatus(id: number, status: string): Promise<Reminder | undefined> {
    const updatedReminder = await this.reminderStorage.updateReminderStatus(id, status);
    
    if (updatedReminder) {
      // İlgili randevuyu bul
      const appointment = await this.getAppointment(updatedReminder.appointmentId);
      // İlgili öğrenciyi bul
      const student = appointment ? await this.getStudent(appointment.studentId) : null;
      
      let description = `Hatırlatıcı durumu "${status}" olarak güncellendi.`;
      if (student && appointment) {
        description = `${student.firstName} ${student.lastName} için ${appointment.date} tarihli randevunun hatırlatıcı durumu "${status}" olarak güncellendi.`;
      }
      
      // Aktivite kaydet
      await this.createActivity({
        type: 'Hatırlatıcı güncelleme',
        description,
        relatedId: id
      });
    }
    
    return updatedReminder;
  }
  
  async deleteReminder(id: number): Promise<boolean> {
    const reminder = await this.reminderStorage.getReminders().then(reminders => 
      reminders.find(r => r.id === id)
    );
    
    if (!reminder) return false;
    
    // İlgili randevuyu bul
    const appointment = await this.getAppointment(reminder.appointmentId);
    // İlgili öğrenciyi bul
    const student = appointment ? await this.getStudent(appointment.studentId) : null;
    
    const result = await this.reminderStorage.deleteReminder(id);
    
    if (result) {
      let description = `Hatırlatıcı silindi.`;
      if (student && appointment) {
        description = `${student.firstName} ${student.lastName} için ${appointment.date} tarihli randevunun hatırlatıcısı silindi.`;
      }
      
      // Aktivite kaydet
      await this.createActivity({
        type: 'Hatırlatıcı silme',
        description,
        relatedId: null
      });
    }
    
    return result;
  }
  // #endregion



  // #region Anket işlemleri
  async getSurveys(): Promise<Survey[]> {
    return this.surveyStorage.getSurveys();
  }
  
  async getSurvey(id: number): Promise<Survey | undefined> {
    return this.surveyStorage.getSurvey(id);
  }
  
  async getSurveysByType(type: string): Promise<Survey[]> {
    return this.surveyStorage.getSurveysByType(type);
  }
  
  async createSurvey(survey: InsertSurvey): Promise<Survey> {
    const newSurvey = await this.surveyStorage.createSurvey(survey);
    
    // Aktivite kaydet
    await this.createActivity({
      type: 'Yeni anket',
      description: `"${survey.title}" başlıklı ${survey.type} türünde anket oluşturuldu.`,
      relatedId: newSurvey.id
    });
    
    return newSurvey;
  }
  
  async updateSurvey(id: number, survey: Partial<InsertSurvey>): Promise<Survey | undefined> {
    const currentSurvey = await this.surveyStorage.getSurvey(id);
    
    if (!currentSurvey) return undefined;
    
    const updatedSurvey = await this.surveyStorage.updateSurvey(id, survey);
    
    if (updatedSurvey) {
      // Aktivite kaydet
      await this.createActivity({
        type: 'Anket güncelleme',
        description: `"${updatedSurvey.title}" başlıklı anket güncellendi.`,
        relatedId: id
      });
    }
    
    return updatedSurvey;
  }
  
  async deleteSurvey(id: number): Promise<boolean> {
    const survey = await this.surveyStorage.getSurvey(id);
    
    if (!survey) return false;
    
    const result = await this.surveyStorage.deleteSurvey(id);
    
    if (result) {
      // Aktivite kaydet
      await this.createActivity({
        type: 'Anket silme',
        description: `"${survey.title}" başlıklı anket silindi.`,
        relatedId: null
      });
    }
    
    return result;
  }
  // #endregion

  // #region Anket atama işlemleri
  async getSurveyAssignments(surveyId: number): Promise<SurveyAssignment[]> {
    return this.surveyStorage.getSurveyAssignments(surveyId);
  }
  
  async getSurveyAssignment(id: number): Promise<SurveyAssignment | undefined> {
    return this.surveyStorage.getSurveyAssignment(id);
  }
  
  async getSurveyAssignmentsByStudentId(studentId: number): Promise<SurveyAssignment[]> {
    return this.surveyStorage.getSurveyAssignmentsByStudentId(studentId);
  }
  
  async assignSurveyToStudent(assignment: InsertSurveyAssignment): Promise<SurveyAssignment> {
    const newAssignment = await this.surveyStorage.assignSurveyToStudent(assignment);
    
    // Anket ve öğrenci bilgilerini alalım
    // Doğrudan atama parametresinden ID'leri kullanarak veri çekelim
    const survey = await this.getSurvey(assignment.surveyId);
    const student = await this.getStudent(assignment.studentId);
    
    // Aktivite kaydet
    if (survey && student) {
      await this.createActivity({
        type: 'Anket atama',
        description: `"${survey.title}" anketi ${student.firstName} ${student.lastName} adlı öğrenciye atandı.`,
        relatedId: newAssignment.id
      });
    }
    
    return newAssignment;
  }
  
  async assignSurveyToMultipleStudents(surveyId: number, studentIds: number[]): Promise<SurveyAssignment[]> {
    const newAssignments = await this.surveyStorage.assignSurveyToMultipleStudents(surveyId, studentIds);
    
    // Anket bilgilerini alalım
    const survey = await this.getSurvey(surveyId);
    
    // Aktivite kaydet
    if (survey) {
      await this.createActivity({
        type: 'Toplu anket atama',
        description: `"${survey.title}" anketi ${studentIds.length} öğrenciye atandı.`,
        relatedId: surveyId
      });
    }
    
    return newAssignments;
  }
  
  async updateSurveyAssignmentStatus(id: number, status: string): Promise<SurveyAssignment | undefined> {
    const currentAssignment = await this.surveyStorage.getSurveyAssignment(id);
    
    if (!currentAssignment) return undefined;
    
    const updatedAssignment = await this.surveyStorage.updateSurveyAssignmentStatus(id, status);
    
    if (updatedAssignment) {
      // Anket ve öğrenci bilgilerini alalım
      const survey = await this.getSurvey(currentAssignment.surveyId);
      const student = await this.getStudent(currentAssignment.studentId);
      
      // Aktivite kaydet
      if (survey && student) {
        await this.createActivity({
          type: 'Anket atama güncelleme',
          description: `${student.firstName} ${student.lastName} adlı öğrenciye atanan "${survey.title}" anketinin durumu "${status}" olarak güncellendi.`,
          relatedId: id
        });
      }
    }
    
    return updatedAssignment;
  }
  
  async deleteSurveyAssignment(id: number): Promise<boolean> {
    const assignment = await this.surveyStorage.getSurveyAssignment(id);
    
    if (!assignment) return false;
    
    // Anket ve öğrenci bilgilerini alalım
    const survey = await this.getSurvey(assignment.surveyId);
    const student = await this.getStudent(assignment.studentId);
    
    const result = await this.surveyStorage.deleteSurveyAssignment(id);
    
    if (result && survey && student) {
      // Aktivite kaydet
      await this.createActivity({
        type: 'Anket atama silme',
        description: `${student.firstName} ${student.lastName} adlı öğrenciye atanan "${survey.title}" anketi kaldırıldı.`,
        relatedId: null
      });
    }
    
    return result;
  }
  // #endregion

  // #region Anket yanıt işlemleri
  async getSurveyResponses(surveyId: number): Promise<SurveyResponse[]> {
    return this.surveyStorage.getSurveyResponses(surveyId);
  }
  
  async getSurveyResponse(id: number): Promise<SurveyResponse | undefined> {
    return this.surveyStorage.getSurveyResponse(id);
  }
  
  async getSurveyResponsesByStudentId(studentId: number): Promise<SurveyResponse[]> {
    return this.surveyStorage.getSurveyResponsesByStudentId(studentId);
  }
  
  async createSurveyResponse(response: InsertSurveyResponse): Promise<SurveyResponse> {
    const newResponse = await this.surveyStorage.createSurveyResponse(response);
    
    // Anket ve öğrenci bilgilerini alalım
    const survey = await this.getSurvey(response.surveyId);
    const student = await this.getStudent(response.studentId);
    
    // Aktivite kaydet
    if (survey && student) {
      await this.createActivity({
        type: 'Anket yanıtı',
        description: `${student.firstName} ${student.lastName} adlı öğrenci "${survey.title}" anketini yanıtladı.`,
        relatedId: newResponse.id
      });
      
      // Ayrıca, ilgili atama varsa durumunu güncelleyelim
      const assignments = await this.getSurveyAssignmentsByStudentId(student.id);
      const relatedAssignment = assignments.find(a => a.surveyId === survey.id);
      
      if (relatedAssignment) {
        await this.updateSurveyAssignmentStatus(relatedAssignment.id, 'Tamamlandı');
      }
    }
    
    return newResponse;
  }
  // #endregion

  // #region Excel Import işlemleri
  async importSurveyResponsesFromExcel(surveyId: number, filePath: string, processedBy: number): Promise<SurveyImport> {
    return this.surveyStorage.importSurveyResponsesFromExcel(surveyId, filePath, processedBy);
  }
  
  async getSurveyImports(surveyId: number): Promise<SurveyImport[]> {
    return this.surveyStorage.getSurveyImports(surveyId);
  }
  
  async getSurveyImport(id: number): Promise<SurveyImport | undefined> {
    return this.surveyStorage.getSurveyImport(id);
  }
  
  async updateSurveyImportStatus(id: number, status: string, errorMessage?: string): Promise<SurveyImport | undefined> {
    return this.surveyStorage.updateSurveyImportStatus(id, status, errorMessage);
  }
  // #endregion

  /**
   * Helper method to get day name from day of week
   * @param dayOfWeek Day of week (0-6, where 0 is Monday)
   * @returns Day name in Turkish
   */
  // Daha önce TimeSlotStorage'da kullanılıyordu artık gerekli değil
// BaseStorage zaten bu fonksiyonu sağlıyor
// Bu metod kaldırılmalı, ancak API değişimi olmaması için şimdilik tutuldu
private getDayName(dayOfWeek: number): string {
    const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
    return days[dayOfWeek % 7];
  }
}