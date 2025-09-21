import { storage } from '../storage';
import { BaseService } from './BaseService';
import { StudentService } from './StudentService';
import { ActivityService } from './ActivityService';
import { AppointmentService } from './AppointmentService';
import { SessionService } from './SessionService';
import { ReminderService } from './ReminderService';

import { ReportService } from './ReportService';
import { ReportTemplateService } from './ReportTemplateService';
import { SurveyService } from './SurveyService';
import { SurveyAssignmentService } from './SurveyAssignmentService';
import { SurveyResponseService } from './SurveyResponseService';
// Ders saatleri modülü kaldırıldı

// Tüm servislerimizi tek bir nesne içinde sunuyoruz
export const services = {
  student: new StudentService(storage),
  activity: new ActivityService(storage),
  appointment: new AppointmentService(storage),
  session: new SessionService(storage),
  reminder: new ReminderService(storage),

  report: new ReportService(storage),
  reportTemplate: new ReportTemplateService(storage),
  survey: new SurveyService(storage),
  surveyAssignment: new SurveyAssignmentService(storage),
  surveyResponse: new SurveyResponseService(storage),
  // Ders saatleri servisi kaldırıldı
};