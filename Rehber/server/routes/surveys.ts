import type { Express, Request, Response, NextFunction } from "express";
import { insertSurveySchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { services } from "../services";
import { 
  sendSuccess, 
  sendCreated, 
  sendNoContent, 
  sendBadRequest,
  sendNotFound
} from '../utils/response';
import { Logger, LogSource } from '../utils/logger';
import { ValidationError, NotFoundError } from '../utils/errors';

export function registerSurveyRoutes(app: Express): void {
  // Tüm anketleri getir
  app.get("/api/surveys", async (_req: Request, res: Response, next: NextFunction) => {
    try {
      Logger.info(LogSource.API, "Tüm anketler istendi");
      const surveys = await services.survey.getSurveys();
      sendSuccess(res, surveys, "Anketler başarıyla getirildi");
    } catch (error) {
      next(error);
    }
  });

  // Belirli bir türdeki anketleri getir
  app.get("/api/surveys/type/:type", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const type = req.params.type;
      Logger.info(LogSource.API, `${type} türündeki anketler istendi`);
      const surveys = await services.survey.getSurveysByType(type);
      sendSuccess(res, surveys, `${type} türündeki anketler başarıyla getirildi`);
    } catch (error) {
      next(error);
    }
  });

  // ID'ye göre tek bir anket getir
  app.get("/api/surveys/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      Logger.info(LogSource.API, `ID: ${id} ile anket istendi`);
      
      const survey = await services.survey.getSurvey(id);
      
      if (!survey) {
        throw new NotFoundError(`ID: ${id} ile anket bulunamadı`);
      }
      
      sendSuccess(res, survey, "Anket başarıyla getirildi");
    } catch (error) {
      next(error);
    }
  });

  // Yeni anket oluştur
  app.post("/api/surveys", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = insertSurveySchema.safeParse(req.body);
      
      if (!result.success) {
        const errorMessage = fromZodError(result.error).message;
        throw new ValidationError(errorMessage);
      }
      
      Logger.info(LogSource.API, "Yeni anket oluşturma isteği", { 
        title: result.data.title,
        type: result.data.type
      });
      
      // Servis katmanı üzerinden anket oluştur
      // Bu, aktivite kaydı ve bildirim gönderme işlemlerini de içerir
      const newSurvey = await services.survey.createSurvey(result.data);
      
      sendCreated(res, newSurvey, "Anket başarıyla oluşturuldu");
    } catch (error) {
      next(error);
    }
  });

  // Anket bilgilerini güncelle
  app.put("/api/surveys/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      const result = insertSurveySchema.partial().safeParse(req.body);
      
      if (!result.success) {
        const errorMessage = fromZodError(result.error).message;
        throw new ValidationError(errorMessage);
      }
      
      Logger.info(LogSource.API, `ID: ${id} ile anket güncelleme isteği`);
      
      // Servis katmanı üzerinden anket güncelle
      // Bu, aktivite kaydı ve bildirim gönderme işlemlerini de içerir
      const updatedSurvey = await services.survey.updateSurvey(id, result.data);
      
      if (!updatedSurvey) {
        throw new NotFoundError(`ID: ${id} ile anket bulunamadı`);
      }
      
      sendSuccess(res, updatedSurvey, "Anket başarıyla güncellendi");
    } catch (error) {
      next(error);
    }
  });

  // Anketi sil
  app.delete("/api/surveys/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      Logger.info(LogSource.API, `ID: ${id} ile anket silme isteği`);
      
      // Servis katmanı üzerinden anket sil
      // Bu, aktivite kaydı ve bildirim gönderme işlemlerini de içerir
      const success = await services.survey.deleteSurvey(id);
      
      if (!success) {
        throw new NotFoundError(`ID: ${id} ile anket bulunamadı`);
      }
      
      sendNoContent(res);
    } catch (error) {
      next(error);
    }
  });
}