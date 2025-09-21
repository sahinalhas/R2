import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupWebSocketServer } from "../websocket";

// Modüler route dosyalarını import et
import { registerStudentRoutes } from "./students";
import { registerAppointmentRoutes } from "./appointments";
import { registerSessionRoutes } from "./sessions";
import { registerReportRoutes } from "./reports";
import { registerReportTemplateRoutes } from "./reportTemplates"; 
import { registerActivityRoutes } from "./activities";

import { registerReminderRoutes } from "./reminders";
import { registerNotificationRoutes } from "./notifications";
import { registerSettingsRoutes } from "./settings";
import { registerSurveyRoutes } from "./surveys";
import { registerSurveyAssignmentRoutes } from "./surveyAssignments";
import { registerSurveyResponseRoutes } from "./surveyResponses";
import { registerSurveyImportRoutes } from "./surveyImports";
import { registerLessonHoursRoutes } from "./lessonHours";
import { registerHealthRoutes } from "./health";

export async function registerRoutes(app: Express): Promise<Server> {
  // Her bir modül için rotaları kaydet
  registerStudentRoutes(app);
  registerAppointmentRoutes(app);
  registerSessionRoutes(app);
  registerReportRoutes(app);
  registerReportTemplateRoutes(app);
  registerActivityRoutes(app);

  registerReminderRoutes(app);
  registerNotificationRoutes(app);
  registerSettingsRoutes(app);
  registerSurveyRoutes(app);
  registerSurveyAssignmentRoutes(app);
  registerSurveyResponseRoutes(app);
  registerSurveyImportRoutes(app);
  registerLessonHoursRoutes(app);
  registerHealthRoutes(app);

  // HTTP sunucusu oluştur
  const httpServer = createServer(app);
  
  // WebSocket sunucusu oluştur
  setupWebSocketServer(httpServer);
  
  return httpServer;
}