/**
 * Modüler ve gelişmiş hata işleme
 */

// HTTP durumları ve karşılık gelen hata mesajları
export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  INTERNAL_SERVER_ERROR = 500,
  SERVICE_UNAVAILABLE = 503
}

// Hata kategorileri
export enum ErrorCategory {
  VALIDATION = 'ValidationError',
  AUTHENTICATION = 'AuthenticationError',
  AUTHORIZATION = 'AuthorizationError',
  RESOURCE = 'ResourceError',
  DATABASE = 'DatabaseError',
  BUSINESS = 'BusinessError',
  INTEGRATION = 'IntegrationError',
  SYSTEM = 'SystemError'
}

/**
 * Temel API hatası sınıfı
 */
export class ApiError extends Error {
  public statusCode: HttpStatus;
  public category: ErrorCategory;
  public details?: any;
  public isOperational: boolean;
  
  constructor(
    message: string,
    statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
    category: ErrorCategory = ErrorCategory.SYSTEM,
    details?: any,
    isOperational: boolean = true
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.category = category;
    this.details = details;
    this.isOperational = isOperational;
    
    // Node.js'de stack trace hatasını düzelt
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Doğrulama hatası
 */
export class ValidationError extends ApiError {
  constructor(message: string, details?: any) {
    super(
      message,
      HttpStatus.BAD_REQUEST,
      ErrorCategory.VALIDATION,
      details
    );
  }
}

/**
 * Bulunamadı hatası
 */
export class NotFoundError extends ApiError {
  constructor(message: string, details?: any) {
    super(
      message,
      HttpStatus.NOT_FOUND,
      ErrorCategory.RESOURCE,
      details
    );
  }
}

/**
 * Yetkilendirme hatası
 */
export class AuthorizationError extends ApiError {
  constructor(message: string, details?: any) {
    super(
      message,
      HttpStatus.FORBIDDEN,
      ErrorCategory.AUTHORIZATION,
      details
    );
  }
}

/**
 * İş mantığı hatası
 */
export class BusinessError extends ApiError {
  constructor(message: string, details?: any) {
    super(
      message,
      HttpStatus.UNPROCESSABLE_ENTITY,
      ErrorCategory.BUSINESS,
      details
    );
  }
}

/**
 * Veritabanı hatası
 */
export class DatabaseError extends ApiError {
  constructor(message: string, details?: any) {
    super(
      message,
      HttpStatus.INTERNAL_SERVER_ERROR,
      ErrorCategory.DATABASE,
      details,
      false // Operational değil
    );
  }
}

/**
 * Hatayı uygun formatta yanıta dönüştürür
 * @param error Hata nesnesi
 * @returns Standart hata yanıtı
 */
export function formatErrorResponse(error: Error): {
  success: boolean;
  error: {
    code: number;
    type: string;
    message: string;
    details?: any;
  };
} {
  if (error instanceof ApiError) {
    return {
      success: false,
      error: {
        code: error.statusCode,
        type: error.category,
        message: error.message,
        details: error.details
      }
    };
  }
  
  // Standart hata
  return {
    success: false,
    error: {
      code: HttpStatus.INTERNAL_SERVER_ERROR,
      type: ErrorCategory.SYSTEM,
      message: error.message || 'Beklenmeyen bir hata oluştu'
    }
  };
}

/**
 * Hata ayıklama ve kaydetme
 * @param error Hata nesnesi
 * @param requestInfo İstek bilgisi
 */
export function logError(error: Error, requestInfo?: any): void {
  const errorDetails = {
    name: error.name,
    message: error.message,
    stack: error.stack,
    isOperational: error instanceof ApiError ? error.isOperational : false,
    statusCode: error instanceof ApiError ? error.statusCode : undefined,
    category: error instanceof ApiError ? error.category : undefined,
    details: error instanceof ApiError ? error.details : undefined,
    requestInfo
  };
  
  console.error(`[${new Date().toISOString()}] Hata oluştu:`, JSON.stringify(errorDetails, null, 2));
}