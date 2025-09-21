import type { Express, Request, Response, NextFunction } from "express";
import { insertSurveyResponseSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { services } from "../services";
import { 
  sendSuccess, 
  sendCreated, 
  sendBadRequest
} from '../utils/response';
import { Logger, LogSource } from '../utils/logger';
import { ValidationError } from '../utils/errors';

export function registerSurveyResponseRoutes(app: Express): void {
  // Anket yanıtlarını getir (surveyId veya studentId ile filtrelenebilir)
  app.get("/api/survey-responses", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const surveyId = req.query.surveyId ? parseInt(req.query.surveyId as string) : undefined;
      const studentId = req.query.studentId ? parseInt(req.query.studentId as string) : undefined;
      
      if (!surveyId && !studentId) {
        throw new ValidationError("surveyId veya studentId parametresi gereklidir.");
      }
      
      let responses;
      if (surveyId) {
        Logger.info(LogSource.API, `${surveyId} ID'li ankete ait yanıtlar istendi`);
        responses = await services.surveyResponse.getSurveyResponses(surveyId);
        sendSuccess(res, responses, `${surveyId} ID'li ankete ait yanıtlar başarıyla getirildi`);
      } else if (studentId) {
        Logger.info(LogSource.API, `${studentId} ID'li öğrenciye ait anket yanıtları istendi`);
        responses = await services.surveyResponse.getSurveyResponsesByStudentId(studentId);
        sendSuccess(res, responses, `${studentId} ID'li öğrenciye ait anket yanıtları başarıyla getirildi`);
      }
    } catch (error) {
      next(error);
    }
  });
  
  // ID'ye göre tek bir anket yanıtı getir
  app.get("/api/survey-responses/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      Logger.info(LogSource.API, `ID: ${id} ile anket yanıtı istendi`);
      
      const response = await services.surveyResponse.getSurveyResponse(id);
      
      if (!response) {
        throw new ValidationError(`ID: ${id} ile anket yanıtı bulunamadı`);
      }
      
      sendSuccess(res, response, "Anket yanıtı başarıyla getirildi");
    } catch (error) {
      next(error);
    }
  });
  
  // Yeni anket yanıtı oluştur
  app.post("/api/survey-responses", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = insertSurveyResponseSchema.safeParse(req.body);
      
      if (!result.success) {
        const errorMessage = fromZodError(result.error).message;
        throw new ValidationError(errorMessage);
      }
      
      Logger.info(LogSource.API, "Yeni anket yanıtı oluşturma isteği", { 
        surveyId: result.data.surveyId,
        studentId: result.data.studentId || 'Anonim'
      });
      
      // Servis katmanını kullanarak anket yanıtını oluştur
      const response = await services.surveyResponse.createSurveyResponse(result.data);
      
      // İlgili atamayı tamamlandı olarak işaretle (eğer bir atama ID'si varsa)
      if (result.data.assignmentId) {
        await services.surveyAssignment.updateSurveyAssignmentStatus(result.data.assignmentId, "tamamlandı");
      }
      
      sendCreated(res, response, "Anket yanıtı başarıyla kaydedildi");
    } catch (error) {
      next(error);
    }
  });
  
  // Toplu anket yanıtı oluştur
  app.post("/api/survey-responses/bulk", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { surveyId, responses } = req.body;
      
      if (!surveyId || !Array.isArray(responses) || responses.length === 0) {
        throw new ValidationError("surveyId ve en az bir yanıt gereklidir");
      }
      
      Logger.info(LogSource.API, `${surveyId} ID'li anket için toplu yanıt oluşturma isteği`);
      
      const results = [];
      
      // Her bir yanıtı işle
      for (const responseData of responses) {
        const data = {
          surveyId,
          ...responseData
        };
        
        const result = insertSurveyResponseSchema.safeParse(data);
        
        if (result.success) {
          const savedResponse = await services.surveyResponse.createSurveyResponse(result.data);
          results.push(savedResponse);
          
          // İlgili atamayı tamamlandı olarak işaretle (eğer bir atama ID'si varsa)
          if (result.data.assignmentId) {
            await services.surveyAssignment.updateSurveyAssignmentStatus(result.data.assignmentId, "tamamlandı");
          }
        } else {
          const errorMessage = fromZodError(result.error).message;
          Logger.warn(LogSource.API, `Yanıt doğrulama hatası: ${errorMessage}`, data);
        }
      }
      
      sendCreated(res, results, `${results.length} anket yanıtı başarıyla kaydedildi`);
    } catch (error) {
      next(error);
    }
  });
}