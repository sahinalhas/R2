/**
 * API yanıtlarını standardize eden yardımcı modül
 */
import { Response } from 'express';
import { Logger, LogSource } from './logger';
import { 
  ApiError, 
  HttpStatus, 
  formatErrorResponse,
  ErrorCategory
} from './errors';

/**
 * Başarılı API yanıtı
 * @param res Express response nesnesi
 * @param data Yanıt verisi
 * @param message Başarı mesajı (opsiyonel)
 * @param statusCode HTTP durum kodu (varsayılan: 200)
 */
export function sendSuccess<T>(
  res: Response,
  data: T,
  message: string = 'İşlem başarılı',
  statusCode: number = HttpStatus.OK
): void {
  const response = {
    success: true,
    message,
    data
  };
  
  res.status(statusCode).json(response);
}

/**
 * Hata API yanıtı
 * @param res Express response nesnesi
 * @param error Hata nesnesi
 */
export function sendError(
  res: Response,
  error: Error
): void {
  const formattedError = formatErrorResponse(error);
  const statusCode = error instanceof ApiError ? error.statusCode : HttpStatus.INTERNAL_SERVER_ERROR;
  
  // Hatayı logla
  Logger.error(
    LogSource.API,
    `Hata yanıtı gönderiliyor: [${statusCode}] ${error.message}`,
    error
  );
  
  res.status(statusCode).json(formattedError);
}

/**
 * Sayfalandırılmış API yanıtı
 * @param res Express response nesnesi
 * @param data Sayfalandırılmış veri
 * @param page Mevcut sayfa
 * @param limit Sayfa başına öğe sayısı
 * @param total Toplam öğe sayısı
 * @param message Başarı mesajı (opsiyonel)
 */
export function sendPaginated<T>(
  res: Response,
  data: T[],
  page: number,
  limit: number,
  total: number,
  message: string = 'Sayfalandırılmış veriler başarıyla getirildi'
): void {
  const totalPages = Math.ceil(total / limit);
  
  const response = {
    success: true,
    message,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }
  };
  
  res.status(HttpStatus.OK).json(response);
}

/**
 * Boş başarı yanıtı (204 No Content)
 * @param res Express response nesnesi
 */
export function sendNoContent(res: Response): void {
  res.status(HttpStatus.NO_CONTENT).end();
}

/**
 * Oluşturuldu yanıtı (201 Created)
 * @param res Express response nesnesi
 * @param data Oluşturulan veri
 * @param message Başarı mesajı
 */
export function sendCreated<T>(
  res: Response,
  data: T,
  message: string = 'Kayıt başarıyla oluşturuldu'
): void {
  sendSuccess(res, data, message, HttpStatus.CREATED);
}

/**
 * HTTP 400 Bad Request yanıtı
 * @param res Express response nesnesi
 * @param message Hata mesajı
 * @param details Hata detayları (opsiyonel)
 */
export function sendBadRequest(
  res: Response,
  message: string = 'Geçersiz istek',
  details?: any
): void {
  const error = new ApiError(
    message,
    HttpStatus.BAD_REQUEST,
    ErrorCategory.VALIDATION,
    details
  );
  
  sendError(res, error);
}

/**
 * HTTP 404 Not Found yanıtı
 * @param res Express response nesnesi
 * @param message Hata mesajı
 */
export function sendNotFound(
  res: Response,
  message: string = 'Kayıt bulunamadı'
): void {
  const error = new ApiError(
    message,
    HttpStatus.NOT_FOUND,
    ErrorCategory.RESOURCE
  );
  
  sendError(res, error);
}