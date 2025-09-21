import type { Express, Request, Response, NextFunction } from "express";
import { insertSessionSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { services } from "../services";
import { 
  sendSuccess, 
  sendCreated, 
  sendNoContent, 
  sendNotFound, 
  sendBadRequest 
} from "../utils/response";
import { ValidationError, NotFoundError } from "../utils/errors";
import { Logger, LogSource } from "../utils/logger";

/**
 * Görüşme rotalarını kaydet
 * @param app Express uygulaması
 */
export function registerSessionRoutes(app: Express): void {
  // Tüm görüşmeleri getir veya öğrenci ID'sine göre filtrele
  app.get("/api/sessions", async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.query.studentId) {
        const studentId = parseInt(req.query.studentId as string);
        Logger.info(LogSource.API, `Öğrenci (ID: ${studentId}) görüşmeleri istendi`);
        const sessions = await services.session.getSessionsByStudentId(studentId);
        sendSuccess(res, sessions, `${studentId} ID'li öğrencinin görüşmeleri başarıyla getirildi`);
      } else {
        Logger.info(LogSource.API, "Tüm görüşmeler istendi");
        const sessions = await services.session.getSessions();
        sendSuccess(res, sessions, "Görüşmeler başarıyla getirildi");
      }
    } catch (error) {
      next(error);
    }
  });

  // ID'ye göre tek bir görüşme getir
  app.get("/api/sessions/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      Logger.info(LogSource.API, `Görüşme (ID: ${id}) istendi`);
      
      const session = await services.session.getSession(id);
      
      if (!session) {
        throw new NotFoundError("Görüşme bulunamadı");
      }
      
      sendSuccess(res, session, "Görüşme başarıyla getirildi");
    } catch (error) {
      next(error);
    }
  });

  // Yeni görüşme oluştur
  app.post("/api/sessions", async (req: Request, res: Response, next: NextFunction) => {
    try {
      Logger.info(LogSource.API, "Yeni görüşme oluşturma isteği alındı");
      const result = insertSessionSchema.safeParse(req.body);
      
      if (!result.success) {
        const errorMessage = fromZodError(result.error).message;
        throw new ValidationError(errorMessage, result.error.format());
      }
      
      // Servis katmanı üzerinden görüşme oluştur
      // Bu, aktivite kaydı ve bildirim gönderme işlemlerini de içerir
      const newSession = await services.session.createSession(result.data);
      
      Logger.info(LogSource.API, `Yeni görüşme oluşturuldu ID: ${newSession.id}`);
      sendCreated(res, newSession, "Görüşme başarıyla oluşturuldu");
    } catch (error) {
      next(error);
    }
  });

  // Görüşme bilgilerini güncelle
  app.put("/api/sessions/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      Logger.info(LogSource.API, `Görüşme (ID: ${id}) güncelleme isteği alındı`);
      
      const result = insertSessionSchema.partial().safeParse(req.body);
      
      if (!result.success) {
        const errorMessage = fromZodError(result.error).message;
        throw new ValidationError(errorMessage, result.error.format());
      }
      
      // Servis katmanı üzerinden görüşme güncelle
      // Bu, aktivite kaydı ve bildirim gönderme işlemlerini de içerir
      const updatedSession = await services.session.updateSession(id, result.data);
      
      if (!updatedSession) {
        throw new NotFoundError("Görüşme bulunamadı");
      }
      
      Logger.info(LogSource.API, `Görüşme (ID: ${id}) başarıyla güncellendi`);
      sendSuccess(res, updatedSession, "Görüşme başarıyla güncellendi");
    } catch (error) {
      next(error);
    }
  });

  // Görüşmeyi sil
  app.delete("/api/sessions/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      Logger.info(LogSource.API, `Görüşme (ID: ${id}) silme isteği alındı`);
      
      // Servis katmanı üzerinden görüşme sil
      // Bu, aktivite kaydı ve bildirim gönderme işlemlerini de içerir
      const success = await services.session.deleteSession(id);
      
      if (!success) {
        throw new NotFoundError("Görüşme bulunamadı");
      }
      
      Logger.info(LogSource.API, `Görüşme (ID: ${id}) başarıyla silindi`);
      sendNoContent(res);
    } catch (error) {
      next(error);
    }
  });
}