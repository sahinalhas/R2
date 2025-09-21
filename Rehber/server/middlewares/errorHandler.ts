/**
 * Hata işleyen middleware
 */
import { Request, Response, NextFunction } from 'express';
import { ApiError, HttpStatus, formatErrorResponse } from '../utils/errors';
import { Logger, LogSource } from '../utils/logger';

/**
 * Global hata yakalayıcı middleware
 * @param err Hata nesnesi
 * @param req Express request nesnesi
 * @param res Express response nesnesi
 * @param next Sonraki middleware
 */
export function errorHandlerMiddleware(
  err: Error, 
  req: Request, 
  res: Response, 
  next: NextFunction
): void {
  // HTTP durum kodu
  const statusCode = err instanceof ApiError 
    ? err.statusCode 
    : HttpStatus.INTERNAL_SERVER_ERROR;
  
  // İstek bilgisi
  const requestInfo = {
    id: req.headers['x-request-id'],
    path: req.path,
    method: req.method,
    ip: req.ip,
    userAgent: req.headers['user-agent']
  };
  
  // Hata logla
  Logger.error(LogSource.API, `Hata: ${err.message}`, {
    error: err,
    request: requestInfo
  });
  
  // Hatayı formatla ve gönder
  const errorResponse = formatErrorResponse(err);
  
  // Geliştirme ortamında stack trace'i ekle
  if (process.env.NODE_ENV === 'development') {
    (errorResponse.error as any).stack = err.stack;
  }
  
  res.status(statusCode).json(errorResponse);
}