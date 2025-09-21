import type { Express, Request, Response, NextFunction } from "express";
import { services } from "../services";
import { UploadedFile } from "express-fileupload";
import { join } from "path";
import { 
  sendSuccess, 
  sendCreated, 
  sendBadRequest
} from '../utils/response';
import { Logger, LogSource } from '../utils/logger';
import { ValidationError } from '../utils/errors';
import * as fs from 'fs';

export function registerSurveyImportRoutes(app: Express): void {
  // Excel ile anket yanıtlarını import et
  app.post("/api/survey-imports", async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Multipart/form-data ile yüklenen dosyayı işle
      if (!req.files || !req.files.excel) {
        throw new ValidationError("Excel dosyası yüklenmedi.");
      }
      
      const { surveyId, processedBy } = req.body;
      
      if (!surveyId || !processedBy) {
        throw new ValidationError("surveyId ve processedBy parametreleri gereklidir.");
      }
      
      Logger.info(LogSource.API, `${surveyId} ID'li anket için Excel dosyası import isteği`);
      
      // Express-fileupload typed edilmemiş, bu yüzden any tipinde kullanıyoruz
      const excelFile = Array.isArray(req.files.excel) 
        ? req.files.excel[0] as UploadedFile
        : req.files.excel as UploadedFile;
      
      // Geçici dosya yolu oluştur - dosya adında özel karakter olmamasını sağla
      const tmpDir = join(process.cwd(), 'tmp');
      
      // tmp klasörünün varlığını kontrol et ve yoksa oluştur
      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
      }
      
      const safeFileName = `survey_import_${surveyId}_${Date.now()}.xlsx`;
      const filePath = join(tmpDir, safeFileName);
      
      // Dosyayı taşı
      await excelFile.mv(filePath);
      
      // Servis katmanı üzerinden Excel dosyasını işle ve veritabanına aktar
      const importResult = await services.surveyResponse.importSurveyResponsesFromExcel(
        parseInt(surveyId),
        filePath,
        parseInt(processedBy)
      );
      
      // İşlem bittikten sonra geçici dosyayı temizle
      fs.promises.unlink(filePath).catch(err => {
        Logger.warn(LogSource.API, `Geçici dosya silinemedi: ${filePath}`, err);
      });
      
      sendCreated(res, importResult, "Excel dosyası başarıyla içe aktarıldı");
    } catch (error) {
      next(error);
    }
  });
  
  // Import durumlarını getir
  app.get("/api/survey-imports", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const surveyId = req.query.surveyId ? parseInt(req.query.surveyId as string) : undefined;
      
      if (!surveyId) {
        throw new ValidationError("surveyId parametresi gereklidir.");
      }
      
      Logger.info(LogSource.API, `${surveyId} ID'li ankete ait import durumları istendi`);
      
      // Servis katmanı üzerinden import işlemlerini al
      const imports = await services.surveyResponse.getSurveyImports(surveyId);
      sendSuccess(res, imports, `${surveyId} ID'li ankete ait import durumları başarıyla getirildi`);
    } catch (error) {
      next(error);
    }
  });
  
  // Import durumunu güncelle
  app.put("/api/survey-imports/:id/status", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      const { status, errorMessage } = req.body;
      
      if (!status) {
        throw new ValidationError("status parametresi gereklidir.");
      }
      
      Logger.info(LogSource.API, `${id} ID'li import durumu güncelleme isteği: ${status}`);
      
      // Servis katmanı üzerinden import durumunu güncelle
      const updatedImport = await services.surveyResponse.updateSurveyImportStatus(id, status, errorMessage);
      
      if (!updatedImport) {
        throw new ValidationError(`ID: ${id} ile import kaydı bulunamadı`);
      }
      
      sendSuccess(res, updatedImport, "Import durumu başarıyla güncellendi");
    } catch (error) {
      next(error);
    }
  });
  
  // Tek bir import bilgisini getir
  app.get("/api/survey-imports/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      Logger.info(LogSource.API, `ID: ${id} ile import bilgisi istendi`);
      
      // Servis katmanı üzerinden import bilgisini al
      const importInfo = await services.surveyResponse.getSurveyImport(id);
      
      if (!importInfo) {
        throw new ValidationError(`ID: ${id} ile import bilgisi bulunamadı`);
      }
      
      sendSuccess(res, importInfo, "Import bilgisi başarıyla getirildi");
    } catch (error) {
      next(error);
    }
  });
}