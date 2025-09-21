/**
 * Gelişmiş loglama modülü
 * Uygulama genelinde tutarlı loglama için kullanılabilir
 */

// Log seviyeleri
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal'
}

// Log kaynakları
export enum LogSource {
  SERVER = 'server',
  DATABASE = 'database',
  API = 'api',
  AUTH = 'auth',
  STORAGE = 'storage',
  SERVICE = 'service',
  WEBSOCKET = 'websocket'
}

/**
 * Loglama formatı
 */
export interface LogFormat {
  timestamp: string;
  level: LogLevel;
  source: LogSource;
  message: string;
  data?: any;
}

/**
 * Logger sınıfı
 */
export class Logger {
  /**
   * Geliştirme modu kontrolü
   */
  private static isDevelopment = process.env.NODE_ENV === 'development';
  
  /**
   * Renkli konsol çıktısı için renk kodları
   */
  private static readonly colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    gray: '\x1b[90m'
  };
  
  /**
   * Log seviyesi renklerini belirle
   */
  private static readonly levelColors = {
    [LogLevel.DEBUG]: Logger.colors.gray,
    [LogLevel.INFO]: Logger.colors.blue,
    [LogLevel.WARN]: Logger.colors.yellow,
    [LogLevel.ERROR]: Logger.colors.red,
    [LogLevel.FATAL]: Logger.colors.magenta
  };
  
  /**
   * Formatlanmış bir log mesajı oluştur ve yazdır
   * @param level Log seviyesi
   * @param source Log kaynağı
   * @param message Log mesajı
   * @param data İlave veri
   */
  public static log(level: LogLevel, source: LogSource, message: string, data?: any): void {
    const timestamp = new Date().toISOString();
    
    // Log nesnesi oluştur
    const logEntry: LogFormat = {
      timestamp,
      level,
      source,
      message,
      data
    };
    
    // Biçimlendirilmiş log mesajı
    const formattedMessage = `${timestamp} [${source}] ${level.toUpperCase()}: ${message}`;
    
    // Seviyeye göre konsola yazdır
    switch (level) {
      case LogLevel.DEBUG:
        if (Logger.isDevelopment) {
          console.debug(Logger.colorize(LogLevel.DEBUG, formattedMessage), data || '');
        }
        break;
      case LogLevel.INFO:
        console.info(Logger.colorize(LogLevel.INFO, formattedMessage), data || '');
        break;
      case LogLevel.WARN:
        console.warn(Logger.colorize(LogLevel.WARN, formattedMessage), data || '');
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(Logger.colorize(level, formattedMessage), data || '');
        break;
    }
    
    // Burada ayrıca dosyaya kaydetme, harici bir servise gönderme vb. işlemler yapılabilir
  }
  
  /**
   * Hata durumunda kullanılacak log metodu
   * @param source Log kaynağı
   * @param message Log mesajı
   * @param error Hata nesnesi
   */
  public static error(source: LogSource, message: string, error?: any): void {
    const errorData = error ? {
      name: error.name,
      message: error.message,
      stack: error.stack,
      details: error.details
    } : undefined;
    
    Logger.log(LogLevel.ERROR, source, message, errorData);
  }
  
  /**
   * Debug loglaması
   * @param source Log kaynağı
   * @param message Log mesajı
   * @param data İlave veri
   */
  public static debug(source: LogSource, message: string, data?: any): void {
    Logger.log(LogLevel.DEBUG, source, message, data);
  }
  
  /**
   * Bilgi loglaması
   * @param source Log kaynağı
   * @param message Log mesajı
   * @param data İlave veri
   */
  public static info(source: LogSource, message: string, data?: any): void {
    Logger.log(LogLevel.INFO, source, message, data);
  }
  
  /**
   * Uyarı loglaması
   * @param source Log kaynağı
   * @param message Log mesajı
   * @param data İlave veri
   */
  public static warn(source: LogSource, message: string, data?: any): void {
    Logger.log(LogLevel.WARN, source, message, data);
  }
  
  /**
   * Kritik hata loglaması
   * @param source Log kaynağı
   * @param message Log mesajı
   * @param error Hata nesnesi
   */
  public static fatal(source: LogSource, message: string, error?: any): void {
    Logger.log(LogLevel.FATAL, source, message, error);
  }
  
  /**
   * Mesajı renklendir
   * @param level Log seviyesi
   * @param message Mesaj
   * @returns Renkli mesaj
   */
  private static colorize(level: LogLevel, message: string): string {
    if (!Logger.isDevelopment) return message;
    
    const color = Logger.levelColors[level] || Logger.colors.reset;
    return `${color}${message}${Logger.colors.reset}`;
  }
  
  /**
   * API istek-yanıt loglaması
   * @param method HTTP metodu
   * @param path URL yolu
   * @param statusCode HTTP durum kodu
   * @param duration İşlem süresi (ms)
   * @param response Yanıt verisi (opsiyonel)
   */
  public static logApiRequest(
    method: string,
    path: string,
    statusCode: number,
    duration: number,
    response?: any
  ): void {
    const logLevel = statusCode >= 400 ? LogLevel.ERROR : LogLevel.INFO;
    
    let message = `${method} ${path} ${statusCode} - ${duration}ms`;
    if (response && Logger.isDevelopment) {
      const responseStr = JSON.stringify(response).substring(0, 100);
      message += ` :: ${responseStr}${responseStr.length > 99 ? '...' : ''}`;
    }
    
    Logger.log(logLevel, LogSource.API, message);
  }
}