import { Request, Response, Express, NextFunction } from 'express';
import { services } from '../services';
import { insertReportTemplateSchema } from '@shared/schema';
import { ZodError } from 'zod';
import { fromZodError } from 'zod-validation-error';
import {
  sendSuccess,
  sendCreated,
  sendNoContent,
  sendBadRequest
} from '../utils/response';
import { ValidationError, NotFoundError, BusinessError } from '../utils/errors';
import { Logger, LogSource } from '../utils/logger';

/**
 * Rapor şablonu rotalarını kaydet
 * @param app Express uygulaması
 */
export function registerReportTemplateRoutes(app: Express): void {
  // Tüm rapor şablonlarını getir
  app.get("/api/report-templates", async (_req: Request, res: Response, next: NextFunction) => {
    try {
      Logger.info(LogSource.API, "Tüm rapor şablonları istendi");
      const templates = await services.reportTemplate.getAll();
      sendSuccess(res, templates, "Rapor şablonları başarıyla getirildi");
    } catch (error) {
      next(error);
    }
  });

  // Aktif rapor şablonlarını getir
  app.get("/api/report-templates/active", async (_req: Request, res: Response, next: NextFunction) => {
    try {
      Logger.info(LogSource.API, "Aktif rapor şablonları istendi");
      const templates = await services.reportTemplate.getActiveTemplates();
      sendSuccess(res, templates, "Aktif rapor şablonları başarıyla getirildi");
    } catch (error) {
      next(error);
    }
  });

  // Türe göre rapor şablonlarını getir
  app.get("/api/report-templates/type/:type", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { type } = req.params;
      Logger.info(LogSource.API, `${type} türündeki rapor şablonları istendi`);
      const templates = await services.reportTemplate.getTemplatesByType(type);
      sendSuccess(res, templates, `${type} türündeki rapor şablonları başarıyla getirildi`);
    } catch (error) {
      next(error);
    }
  });

  // Kategoriye göre rapor şablonlarını getir
  app.get("/api/report-templates/category/:category", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { category } = req.params;
      Logger.info(LogSource.API, `${category} kategorisindeki rapor şablonları istendi`);
      const templates = await services.reportTemplate.getTemplatesByCategory(category);
      sendSuccess(res, templates, `${category} kategorisindeki rapor şablonları başarıyla getirildi`);
    } catch (error) {
      next(error);
    }
  });

  // Rapor şablonlarında arama yap
  app.get("/api/report-templates/search", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = req.query.q as string || '';
      Logger.info(LogSource.API, `Rapor şablonlarında arama yapıldı: "${query}"`);
      const templates = await services.reportTemplate.searchTemplates(query);
      sendSuccess(res, templates, `Arama sonuçları başarıyla getirildi (${templates.length} sonuç)`);
    } catch (error) {
      next(error);
    }
  });

  // ID'ye göre rapor şablonu getir
  app.get("/api/report-templates/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        throw new ValidationError("Geçersiz şablon ID formatı");
      }
      
      Logger.info(LogSource.API, `Rapor şablonu (ID: ${id}) istendi`);
      const template = await services.reportTemplate.getById(id);
      
      if (!template) {
        throw new NotFoundError("Rapor şablonu bulunamadı");
      }
      
      sendSuccess(res, template, "Rapor şablonu başarıyla getirildi");
    } catch (error) {
      next(error);
    }
  });

  // Yeni rapor şablonu oluştur
  app.post("/api/report-templates", async (req: Request, res: Response, next: NextFunction) => {
    try {
      Logger.info(LogSource.API, "Yeni rapor şablonu oluşturma isteği alındı");
      
      try {
        // Gelen veriyi doğrula
        const templateData = insertReportTemplateSchema.parse(req.body);
        
        // Şablonu oluştur
        const newTemplate = await services.reportTemplate.create(templateData);
        Logger.info(LogSource.API, `Yeni rapor şablonu oluşturuldu ID: ${newTemplate.id}`);
        sendCreated(res, newTemplate, "Rapor şablonu başarıyla oluşturuldu");
      } catch (error) {
        // Zod doğrulama hatalarını uygun şekilde işle
        if (error instanceof ZodError) {
          const validationError = fromZodError(error);
          throw new ValidationError("Şablon bilgileri geçerli değil", validationError.details);
        }
        throw error;
      }
    } catch (error) {
      next(error);
    }
  });

  // Rapor şablonunu güncelle
  app.put("/api/report-templates/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        throw new ValidationError("Geçersiz şablon ID formatı");
      }
      
      Logger.info(LogSource.API, `Rapor şablonu (ID: ${id}) güncelleme isteği alındı`);
      
      // Gelen veriyi doğrula (kısmi güncelleme için safeParse kullan)
      const result = insertReportTemplateSchema.partial().safeParse(req.body);
      
      if (!result.success) {
        const validationError = fromZodError(result.error);
        throw new ValidationError("Şablon bilgileri geçerli değil", validationError.details);
      }
      
      const templateData = result.data;
      
      // Şablonu güncelle
      const updatedTemplate = await services.reportTemplate.update(id, templateData);
      
      if (!updatedTemplate) {
        throw new NotFoundError("Güncellenecek rapor şablonu bulunamadı");
      }
      
      Logger.info(LogSource.API, `Rapor şablonu (ID: ${id}) başarıyla güncellendi`);
      sendSuccess(res, updatedTemplate, "Rapor şablonu başarıyla güncellendi");
    } catch (error) {
      next(error);
    }
  });

  // Rapor şablonunun aktiflik durumunu güncelle
  app.put("/api/report-templates/:id/status", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        throw new ValidationError("Geçersiz şablon ID formatı");
      }
      
      Logger.info(LogSource.API, `Rapor şablonu (ID: ${id}) durum güncelleme isteği alındı`);
      
      // isActive değerini kontrol et
      const { isActive } = req.body;
      if (typeof isActive !== 'boolean') {
        throw new ValidationError("isActive alanı zorunlu ve boolean tipinde olmalıdır");
      }
      
      // Şablon durumunu güncelle
      const updatedTemplate = await services.reportTemplate.updateStatus(id, isActive);
      
      if (!updatedTemplate) {
        throw new NotFoundError("Durumu güncellenecek rapor şablonu bulunamadı");
      }
      
      Logger.info(LogSource.API, `Rapor şablonu (ID: ${id}) durumu ${isActive ? 'aktif' : 'pasif'} olarak güncellendi`);
      sendSuccess(res, updatedTemplate, `Rapor şablonu durumu ${isActive ? 'aktif' : 'pasif'} olarak güncellendi`);
    } catch (error) {
      next(error);
    }
  });

  // Rapor şablonunu sil
  app.delete("/api/report-templates/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        throw new ValidationError("Geçersiz şablon ID formatı");
      }
      
      Logger.info(LogSource.API, `Rapor şablonu (ID: ${id}) silme isteği alındı`);
      
      const success = await services.reportTemplate.delete(id);
      
      if (!success) {
        throw new NotFoundError("Silinecek rapor şablonu bulunamadı");
      }
      
      Logger.info(LogSource.API, `Rapor şablonu (ID: ${id}) başarıyla silindi`);
      sendNoContent(res);
    } catch (error) {
      next(error);
    }
  });
}