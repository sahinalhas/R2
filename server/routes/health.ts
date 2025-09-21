/**
 * Sağlık kontrolü ve sistem durumu API rotaları
 */
import type { Express, Request, Response, NextFunction } from "express";
import { sendSuccess } from "../utils/response";
import { Logger, LogSource } from "../utils/logger";

/**
 * Sağlık kontrolü ve sistem durumu rotalarını kaydet
 * @param app Express uygulaması
 */
export function registerHealthRoutes(app: Express): void {
  /**
   * GET /api/health
   * Sistemin durumunu kontrol eder ve temel bilgileri döndürür
   */
  app.get("/api/health", (_req: Request, res: Response) => {
    Logger.info(LogSource.API, "Sağlık kontrolü yapıldı");
    
    // Sistem bilgilerini topla
    const healthInfo = {
      status: "up",
      version: process.env.npm_package_version || "1.0.0",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
      uptime: Math.floor(process.uptime())
    };
    
    // Standardize edilmiş başarılı yanıt formatını kullan
    sendSuccess(res, healthInfo, "Sistem sağlıklı çalışıyor");
  });
  
  /**
   * GET /api/health/runtime
   * Runtime bilgilerini döndürür (CPU, bellek, vb.)
   */
  app.get("/api/health/runtime", (_req: Request, res: Response, next: NextFunction) => {
    Logger.info(LogSource.API, "Runtime bilgileri istendi");
    
    // Detaylı runtime bilgilerini topla
    import('os').then(os => {
      const runtimeInfo = {
        node: {
          version: process.version,
          arch: process.arch,
          platform: process.platform
        },
        memory: {
          total: process.memoryUsage().heapTotal,
          used: process.memoryUsage().heapUsed,
          external: process.memoryUsage().external,
          rss: process.memoryUsage().rss
        },
        cpu: {
          cores: os.cpus().length
        },
        timestamp: new Date().toISOString()
      };
    
      // Standardize edilmiş başarılı yanıt formatını kullan
      sendSuccess(res, runtimeInfo, "Runtime bilgileri");
    }).catch(error => {
      Logger.error(LogSource.API, "Runtime bilgileri alınırken hata oluştu", error);
      next(error);
    });
  });
}