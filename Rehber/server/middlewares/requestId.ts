/**
 * Her isteğe benzersiz ID ekleyen middleware
 */
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

/**
 * İsteğe benzersiz bir ID ekler
 * @param req Express request nesnesi
 * @param res Express response nesnesi
 * @param next Sonraki middleware
 */
export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  // İsteğin x-request-id başlığı yoksa, yeni bir UUID oluştur
  const requestId = req.headers['x-request-id'] || randomUUID();
  
  // Request nesnesine ID ekle
  req.headers['x-request-id'] = requestId;
  
  // Response başlıklarına da aynı ID'yi ekle
  res.setHeader('x-request-id', requestId);
  
  next();
}