import type { Express, Request, Response, NextFunction } from "express";
import { insertStudentSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { services } from "../services";
import { 
  sendSuccess, 
  sendCreated, 
  sendNoContent, 
  sendNotFound, 
  sendBadRequest, 
  sendError 
} from "../utils/response";
import { ValidationError, NotFoundError } from "../utils/errors";
import { Logger, LogSource } from "../utils/logger";

/**
 * Öğrenci rotalarını kaydet
 * @param app Express uygulaması
 */
export function registerStudentRoutes(app: Express): void {
  // Tüm öğrencileri getir
  app.get("/api/students", async (_req: Request, res: Response, next: NextFunction) => {
    try {
      Logger.info(LogSource.API, "Tüm öğrenciler istendi");
      const students = await services.student.getStudents();
      sendSuccess(res, students, "Öğrenciler başarıyla getirildi");
    } catch (error) {
      next(error); // Hata işleme middleware'ine aktar
    }
  });

  // ID'ye göre tek bir öğrenci getir
  app.get("/api/students/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      Logger.info(LogSource.API, `Öğrenci (ID: ${id}) istendi`);
      
      const student = await services.student.getStudent(id);
      
      if (!student) {
        throw new NotFoundError("Öğrenci bulunamadı");
      }
      
      sendSuccess(res, student, "Öğrenci başarıyla getirildi");
    } catch (error) {
      next(error);
    }
  });

  // Yeni öğrenci oluştur
  app.post("/api/students", async (req: Request, res: Response, next: NextFunction) => {
    try {
      Logger.info(LogSource.API, "Yeni öğrenci oluşturma isteği alındı");
      const result = insertStudentSchema.safeParse(req.body);
      
      if (!result.success) {
        const errorMessage = fromZodError(result.error).message;
        throw new ValidationError(errorMessage, result.error.format());
      }
      
      const newStudent = await services.student.createStudent(result.data);
      
      Logger.info(LogSource.API, `Yeni öğrenci oluşturuldu ID: ${newStudent.id}`);
      sendCreated(res, newStudent, "Öğrenci başarıyla oluşturuldu");
    } catch (error) {
      next(error);
    }
  });

  // Öğrenci bilgilerini güncelle
  app.put("/api/students/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      Logger.info(LogSource.API, `Öğrenci (ID: ${id}) güncelleme isteği alındı`);
      
      const result = insertStudentSchema.partial().safeParse(req.body);
      
      if (!result.success) {
        const errorMessage = fromZodError(result.error).message;
        throw new ValidationError(errorMessage, result.error.format());
      }
      
      const updatedStudent = await services.student.updateStudent(id, result.data);
      
      if (!updatedStudent) {
        throw new NotFoundError("Öğrenci bulunamadı");
      }
      
      Logger.info(LogSource.API, `Öğrenci (ID: ${id}) başarıyla güncellendi`);
      sendSuccess(res, updatedStudent, "Öğrenci başarıyla güncellendi");
    } catch (error) {
      next(error);
    }
  });

  // Öğrenciyi sil
  app.delete("/api/students/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      Logger.info(LogSource.API, `Öğrenci (ID: ${id}) silme isteği alındı`);
      
      const success = await services.student.deleteStudent(id);
      
      if (!success) {
        throw new NotFoundError("Öğrenci bulunamadı");
      }
      
      Logger.info(LogSource.API, `Öğrenci (ID: ${id}) başarıyla silindi`);
      sendNoContent(res);
    } catch (error) {
      next(error);
    }
  });
}