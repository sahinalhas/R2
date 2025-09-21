import type { Express, Request, Response, NextFunction } from "express";
import { insertReportSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { services } from "../services";
import { ServiceError } from "../services/BaseService";

/**
 * Rapor rotalarını kaydet
 * @param app Express uygulaması
 */
export function registerReportRoutes(app: Express): void {
  // Hata işleme yardımcı fonksiyonu
  const handleServiceError = (error: any, res: Response) => {
    console.error("Rapor servisi hatası:", error);
    
    if (error instanceof ServiceError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    
    return res.status(500).json({ 
      message: error.message || "Bir hata oluştu.",
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  };

  // Tüm raporları getir veya öğrenci ID'sine göre filtrele
  app.get("/api/reports", async (req: Request, res: Response) => {
    try {
      if (req.query.studentId) {
        const studentId = parseInt(req.query.studentId as string);
        
        // Öğrenci ID parametresi kontrolü
        if (isNaN(studentId)) {
          return res.status(400).json({ message: "Geçersiz öğrenci ID formatı." });
        }
        
        const reports = await services.report.getReportsByStudentId(studentId);
        return res.json(reports);
      } else {
        const reports = await services.report.getAll();
        return res.json(reports);
      }
    } catch (error) {
      handleServiceError(error, res);
    }
  });

  // ID'ye göre tek bir rapor getir
  app.get("/api/reports/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      // ID parametresi kontrolü
      if (isNaN(id)) {
        return res.status(400).json({ message: "Geçersiz rapor ID formatı." });
      }
      
      const report = await services.report.getById(id);
      
      if (!report) {
        return res.status(404).json({ message: "Rapor bulunamadı." });
      }
      
      res.json(report);
    } catch (error) {
      handleServiceError(error, res);
    }
  });

  // Yeni rapor oluştur
  app.post("/api/reports", async (req: Request, res: Response) => {
    try {
      const result = insertReportSchema.safeParse(req.body);
      
      if (!result.success) {
        const errorMessage = fromZodError(result.error).message;
        return res.status(400).json({ message: errorMessage });
      }
      
      // Servis katmanı üzerinden rapor oluştur
      // Bu, aktivite kaydı, önbellek yönetimi ve bildirim gönderme işlemlerini de içerir
      const newReport = await services.report.create(result.data);
      
      res.status(201).json(newReport);
    } catch (error) {
      handleServiceError(error, res);
    }
  });

  // Rapor bilgilerini güncelle
  app.put("/api/reports/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      // ID parametresi kontrolü
      if (isNaN(id)) {
        return res.status(400).json({ message: "Geçersiz rapor ID formatı." });
      }
      
      const result = insertReportSchema.partial().safeParse(req.body);
      
      if (!result.success) {
        const errorMessage = fromZodError(result.error).message;
        return res.status(400).json({ message: errorMessage });
      }
      
      // Servis katmanı üzerinden rapor güncelle
      // Bu, aktivite kaydı, önbellek yönetimi ve bildirim gönderme işlemlerini de içerir
      const updatedReport = await services.report.update(id, result.data);
      
      res.json(updatedReport);
    } catch (error) {
      handleServiceError(error, res);
    }
  });

  // Raporu sil
  app.delete("/api/reports/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      // ID parametresi kontrolü
      if (isNaN(id)) {
        return res.status(400).json({ message: "Geçersiz rapor ID formatı." });
      }
      
      // Servis katmanı üzerinden rapor sil
      // Bu, aktivite kaydı, önbellek yönetimi ve bildirim gönderme işlemlerini de içerir
      const success = await services.report.delete(id);
      
      res.status(204).send();
    } catch (error) {
      handleServiceError(error, res);
    }
  });
  
  // Şablondan yeni rapor oluştur
  app.post("/api/reports/from-template", async (req: Request, res: Response) => {
    try {
      const { templateId, studentId, title, content, customFields } = req.body;
      
      // Parametre kontrolü
      if (!templateId || isNaN(parseInt(templateId))) {
        return res.status(400).json({ message: "Geçerli bir şablon ID'si gerekmektedir." });
      }

      if (!studentId || isNaN(parseInt(studentId))) {
        return res.status(400).json({ message: "Geçerli bir öğrenci ID'si gerekmektedir." });
      }
      
      // Şablonu getir
      const template = await services.reportTemplate.getById(parseInt(templateId));
      
      if (!template) {
        return res.status(404).json({ message: "Belirtilen şablon bulunamadı." });
      }
      
      // Öğrenciyi kontrol et
      const student = await services.student.getById(parseInt(studentId));
      
      if (!student) {
        return res.status(404).json({ message: "Belirtilen öğrenci bulunamadı." });
      }
      
      // Şablondan varsayılan değerleri al ve özelleştir
      const reportContent = content || template.defaultContent;
      const reportTitle = title || `${student.firstName} ${student.lastName} - ${template.name}`;
      
      // Yeni rapor oluştur
      const newReport = await services.report.create({
        title: reportTitle,
        content: reportContent,
        studentId: parseInt(studentId),
        type: template.type,
        templateId: template.id,
        metadata: customFields ? JSON.stringify(customFields) : null
      });
      
      res.status(201).json(newReport);
    } catch (error) {
      handleServiceError(error, res);
    }
  });
  
  // Rapor şablonları için rotalar diğer servis tarafından yönetilir
}