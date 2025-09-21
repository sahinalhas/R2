import type { Express, Request, Response, NextFunction } from "express";
import { insertAppointmentSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { services } from "../services";
import { 
  sendSuccess, 
  sendCreated, 
  sendNoContent, 
  sendBadRequest 
} from "../utils/response";
import { ValidationError, NotFoundError } from "../utils/errors";
import { Logger, LogSource } from "../utils/logger";

/**
 * Randevu rotalarını kaydet
 * @param app Express uygulaması
 */
export function registerAppointmentRoutes(app: Express): void {
  // Uygun zaman dilimlerini getiren API
  app.get('/api/available-slots', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const date = req.query.date as string;
      Logger.info(LogSource.API, `${date} tarihi için uygun zaman dilimleri istendi`);
      
      if (!date) {
        throw new ValidationError("Tarih parametresi gereklidir");
      }
      
      // Storage sınıfımızdan uygun zaman aralıklarını getir
      const slots = await services.appointment.getAvailableTimeSlots(date);
      sendSuccess(res, slots, `${date} tarihi için uygun zaman dilimleri getirildi`);
    } catch (error) {
      next(error);
    }
  });

  // Eski API uyumluluğu için boş yanıt
  app.get('/api/working-hours', (_req: Request, res: Response) => {
    sendSuccess(res, [], "Çalışma saatleri getirildi");
  });
  
  // Tüm randevuları getir veya öğrenci ID'sine göre filtrele
  app.get("/api/appointments", async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.query.studentId) {
        const studentId = parseInt(req.query.studentId as string);
        Logger.info(LogSource.API, `Öğrenci (ID: ${studentId}) randevuları istendi`);
        const appointments = await services.appointment.getAppointmentsByStudentId(studentId);
        sendSuccess(res, appointments, `${studentId} ID'li öğrencinin randevuları başarıyla getirildi`);
      } else if (req.query.date) {
        const date = req.query.date as string;
        Logger.info(LogSource.API, `${date} tarihli randevular istendi`);
        const appointments = await services.appointment.getAppointmentsByDate(date);
        sendSuccess(res, appointments, `${date} tarihli randevular başarıyla getirildi`);
      } else {
        Logger.info(LogSource.API, "Tüm randevular istendi");
        const appointments = await services.appointment.getAppointments();
        sendSuccess(res, appointments, "Randevular başarıyla getirildi");
      }
    } catch (error) {
      next(error);
    }
  });

  // ID'ye göre tek bir randevu getir
  app.get("/api/appointments/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      Logger.info(LogSource.API, `Randevu (ID: ${id}) istendi`);
      
      const appointment = await services.appointment.getAppointment(id);
      
      if (!appointment) {
        throw new NotFoundError("Randevu bulunamadı");
      }
      
      sendSuccess(res, appointment, "Randevu başarıyla getirildi");
    } catch (error) {
      next(error);
    }
  });

  // Yeni randevu oluştur
  app.post("/api/appointments", async (req: Request, res: Response, next: NextFunction) => {
    try {
      Logger.info(LogSource.API, "Yeni randevu oluşturma isteği alındı");
      const result = insertAppointmentSchema.safeParse(req.body);
      
      if (!result.success) {
        const errorMessage = fromZodError(result.error).message;
        throw new ValidationError(errorMessage, result.error.format());
      }
      
      // Servis katmanı üzerinden randevu oluştur
      // Bu, aktivite kaydı ve bildirim gönderme işlemlerini de içerir
      const newAppointment = await services.appointment.createAppointment(result.data);
      
      Logger.info(LogSource.API, `Yeni randevu oluşturuldu ID: ${newAppointment.id}`);
      sendCreated(res, newAppointment, "Randevu başarıyla oluşturuldu");
    } catch (error) {
      next(error);
    }
  });

  // Randevu bilgilerini güncelle
  app.put("/api/appointments/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      Logger.info(LogSource.API, `Randevu (ID: ${id}) güncelleme isteği alındı`);
      
      const result = insertAppointmentSchema.partial().safeParse(req.body);
      
      if (!result.success) {
        const errorMessage = fromZodError(result.error).message;
        throw new ValidationError(errorMessage, result.error.format());
      }
      
      // Servis katmanı üzerinden randevu güncelle
      // Bu, aktivite kaydı ve bildirim gönderme işlemlerini de içerir
      const updatedAppointment = await services.appointment.updateAppointment(id, result.data);
      
      if (!updatedAppointment) {
        throw new NotFoundError("Randevu bulunamadı");
      }
      
      Logger.info(LogSource.API, `Randevu (ID: ${id}) başarıyla güncellendi`);
      sendSuccess(res, updatedAppointment, "Randevu başarıyla güncellendi");
    } catch (error) {
      next(error);
    }
  });

  // Randevuyu sil
  app.delete("/api/appointments/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      Logger.info(LogSource.API, `Randevu (ID: ${id}) silme isteği alındı`);
      
      // Servis katmanı üzerinden randevu sil
      // Bu, aktivite kaydı ve bildirim gönderme işlemlerini de içerir
      const success = await services.appointment.deleteAppointment(id);
      
      if (!success) {
        throw new NotFoundError("Randevu bulunamadı");
      }
      
      Logger.info(LogSource.API, `Randevu (ID: ${id}) başarıyla silindi`);
      sendNoContent(res);
    } catch (error) {
      next(error);
    }
  });
}