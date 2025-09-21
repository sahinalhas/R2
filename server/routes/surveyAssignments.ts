import type { Express, Request, Response, NextFunction } from "express";
import { insertSurveyAssignmentSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { z } from "zod";
import { services } from "../services";
import { 
  sendSuccess, 
  sendCreated, 
  sendNotFound
} from '../utils/response';
import { Logger, LogSource } from '../utils/logger';
import { ValidationError, NotFoundError } from '../utils/errors';

export function registerSurveyAssignmentRoutes(app: Express): void {
  // Anket atamalarını getir (surveyId veya studentId ile filtrelenebilir)
  app.get("/api/survey-assignments", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const surveyId = req.query.surveyId ? parseInt(req.query.surveyId as string) : undefined;
      const studentId = req.query.studentId ? parseInt(req.query.studentId as string) : undefined;
      
      if (!surveyId && !studentId) {
        throw new ValidationError("surveyId veya studentId parametresi gereklidir.");
      }
      
      let assignments;
      if (surveyId) {
        Logger.info(LogSource.API, `${surveyId} ID'li ankete ait atamalar istendi`);
        // Servis katmanı üzerinden anket atamalarını getir
        assignments = await services.surveyAssignment.getSurveyAssignments(surveyId);
        sendSuccess(res, assignments, `${surveyId} ID'li ankete ait atamalar başarıyla getirildi`);
      } else if (studentId) {
        Logger.info(LogSource.API, `${studentId} ID'li öğrenciye ait anket atamaları istendi`);
        // Servis katmanı üzerinden öğrencinin anket atamalarını getir
        assignments = await services.surveyAssignment.getSurveyAssignmentsByStudentId(studentId);
        sendSuccess(res, assignments, `${studentId} ID'li öğrenciye ait anket atamaları başarıyla getirildi`);
      }
    } catch (error) {
      next(error);
    }
  });
  
  // Yeni anket ataması oluştur
  app.post("/api/survey-assignments", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = insertSurveyAssignmentSchema.safeParse(req.body);
      
      if (!result.success) {
        const errorMessage = fromZodError(result.error).message;
        throw new ValidationError(errorMessage);
      }
      
      Logger.info(LogSource.API, "Yeni anket ataması oluşturma isteği", { 
        surveyId: result.data.surveyId,
        studentId: result.data.studentId
      });
      
      // Servis katmanı üzerinden anket ataması oluştur (aktivite ve bildirim işlemleri de dahil)
      const assignment = await services.surveyAssignment.assignSurveyToStudent(result.data);
      sendCreated(res, assignment, "Anket ataması başarıyla oluşturuldu");
    } catch (error) {
      next(error);
    }
  });
  
  // Birden fazla öğrenciye toplu anket ataması
  app.post("/api/survey-assignments/bulk", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const bulkAssignmentSchema = z.object({
        surveyId: z.number(),
        studentIds: z.array(z.number())
      });
      
      const result = bulkAssignmentSchema.safeParse(req.body);
      
      if (!result.success) {
        const errorMessage = fromZodError(result.error).message;
        throw new ValidationError(errorMessage);
      }
      
      const { surveyId, studentIds } = result.data;
      
      Logger.info(LogSource.API, `${surveyId} ID'li anket için toplu atama isteği`, { 
        öğrenciSayısı: studentIds.length
      });
      
      // Servis katmanı üzerinden toplu anket ataması oluştur (aktivite ve bildirim işlemleri de dahil)
      const assignments = await services.surveyAssignment.assignSurveyToMultipleStudents(surveyId, studentIds);
      sendCreated(res, assignments, `${assignments.length} öğrenciye anket ataması başarıyla oluşturuldu`);
    } catch (error) {
      next(error);
    }
  });
  
  // Anket atama durumunu güncelle
  app.put("/api/survey-assignments/:id/status", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status) {
        throw new ValidationError("Status alanı gereklidir.");
      }
      
      Logger.info(LogSource.API, `${id} ID'li anket ataması durumu güncelleme isteği: ${status}`);
      
      // Servis katmanı üzerinden anket atama durumunu güncelle (aktivite ve bildirim işlemleri de dahil)
      const updatedAssignment = await services.surveyAssignment.updateSurveyAssignmentStatus(id, status);
      
      if (!updatedAssignment) {
        throw new NotFoundError("Anket ataması bulunamadı.");
      }
      
      sendSuccess(res, updatedAssignment, "Anket atama durumu başarıyla güncellendi");
    } catch (error) {
      next(error);
    }
  });
  
  // ID'ye göre tek bir anket ataması getir
  app.get("/api/survey-assignments/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      Logger.info(LogSource.API, `ID: ${id} ile anket ataması istendi`);
      
      const assignment = await services.surveyAssignment.getSurveyAssignment(id);
      
      if (!assignment) {
        throw new NotFoundError(`ID: ${id} ile anket ataması bulunamadı`);
      }
      
      sendSuccess(res, assignment, "Anket ataması başarıyla getirildi");
    } catch (error) {
      next(error);
    }
  });
  
  // Anket atamasını sil
  app.delete("/api/survey-assignments/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      Logger.info(LogSource.API, `ID: ${id} ile anket ataması silme isteği`);
      
      const success = await services.surveyAssignment.deleteSurveyAssignment(id);
      
      if (!success) {
        throw new NotFoundError(`ID: ${id} ile anket ataması bulunamadı`);
      }
      
      sendSuccess(res, { success: true }, "Anket ataması başarıyla silindi");
    } catch (error) {
      next(error);
    }
  });
}