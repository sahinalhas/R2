/**
 * HTTP isteklerini loglayan ara yazılım
 */
import { Request, Response, NextFunction } from 'express';
import { Logger, LogSource, LogLevel } from '../utils/logger';

/**
 * İstek ve yanıt loglaması yapan middleware
 * @param req Express request nesnesi
 * @param res Express response nesnesi
 * @param next Sonraki middleware
 */
export function loggerMiddleware(req: Request, res: Response, next: NextFunction): void {
  // İstek başlangıç zamanı
  const start = Date.now();
  const requestId = req.headers['x-request-id'] || '-';
  
  // Başlangıçta istek bilgisini logla
  Logger.debug(LogSource.API, `İstek başladı: ${req.method} ${req.path}`, {
    requestId,
    method: req.method,
    path: req.path,
    query: req.query,
    headers: {
      'user-agent': req.headers['user-agent'],
      'content-type': req.headers['content-type'],
      'accept': req.headers['accept']
    },
    ip: req.ip
  });
  
  // Orijinal json metodunu kaydet
  const originalJson = res.json;
  let responseBody: any;
  
  // json metodunu kendi versiyonumuzla değiştir
  res.json = function(body) {
    responseBody = body;
    return originalJson.call(this, body);
  };
  
  // İstek tamamlandığında
  res.on('finish', () => {
    // İstek süresi
    const duration = Date.now() - start;
    
    // API rotalarını logla
    if (req.path.startsWith('/api')) {
      // HTTP durum koduna göre log seviyesini belirle
      const logLevel = res.statusCode >= 400 
        ? (res.statusCode >= 500 ? LogLevel.ERROR : LogLevel.WARN) 
        : LogLevel.INFO;
      
      // Özet log mesajı
      let logMessage = `${req.method} ${req.path} ${res.statusCode} - ${duration}ms`;
      
      // Detaylı log verisi
      const logData = {
        requestId,
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration,
        responseSize: res.get('content-length'),
        response: process.env.NODE_ENV === 'development' 
          ? responseBody 
          : undefined
      };
      
      // Log yaz
      Logger.log(logLevel, LogSource.API, logMessage, logData);
    }
  });
  
  next();
}