import { IStorage } from '../storage';
import { createAndSendNotification, NotificationCategory } from '../websocket';
import { 
  ApiError, 
  BusinessError, 
  NotFoundError, 
  DatabaseError,
  ValidationError,
  HttpStatus,
  ErrorCategory 
} from '../utils/errors';
import { Logger, LogSource } from '../utils/logger';

/**
 * Servis işlemleri sırasında oluşabilecek hatalar için özel hata sınıfı
 * @deprecated Yeni ApiError tabanlı hata sınıflarını kullanın
 */
export class ServiceError extends ApiError {
  constructor(message: string, statusCode: number = 400) {
    super(
      message,
      statusCode,
      statusCode === 404 ? ErrorCategory.RESOURCE : 
      statusCode === 400 ? ErrorCategory.VALIDATION : 
      statusCode >= 500 ? ErrorCategory.SYSTEM :
      ErrorCategory.BUSINESS
    );
    this.name = 'ServiceError';
  }
}

/**
 * CRUD işlemleri için jenerik tipleri tanımlama
 * T: Varlık tipi (örn. Student)
 * InsertT: Ekleme işlemi için veri tipi (örn. InsertStudent)
 */
export interface ICrudOperations<T, InsertT> {
  getAll(): Promise<T[]>;
  getById(id: number): Promise<T | undefined>;
  create(data: InsertT): Promise<T>;
  update(id: number, data: Partial<InsertT>): Promise<T | undefined>;
  delete(id: number): Promise<boolean>;
}

/**
 * Tüm servisler için temel sınıf
 * Bu sınıf, depolama katmanını kullanarak temel işlemleri gerçekleştirir
 * ve yaygın kullanılan yardımcı metotlar sağlar
 */
export class BaseService {
  /**
   * Depolama katmanı referansı
   */
  protected storage: IStorage;
  
  /**
   * Basit önbellek mekanizması
   * Key-Value çiftleri şeklinde verileri saklayabilir
   */
  private static cache: Map<string, { data: any, timestamp: number }> = new Map();
  
  /**
   * İstek sayaçları
   */
  private static requestStats: Map<string, { count: number, lastReset: number }> = new Map();
  
  /**
   * Önbellek süresi (ms cinsinden)
   */
  protected cacheTTL: number = 60000; // 1 dakika
  
  /**
   * Performans istatistiklerini sıfırlama aralığı (ms)
   */
  private static readonly STATS_RESET_INTERVAL = 3600000; // 1 saat

  /**
   * @param storage Depolama katmanı
   */
  constructor(storage: IStorage) {
    this.storage = storage;
  }
  
  /**
   * Önbellekten veri alma veya ekleme işlemi
   * @param key Önbellek anahtarı
   * @param fetchFn Veri yoksa çağrılacak fonksiyon
   * @param ttl Veri yaşam süresi (ms)
   * @returns Promise<T>
   */
  protected async getOrSetCache<T>(
    key: string, 
    fetchFn: () => Promise<T>, 
    ttl: number = this.cacheTTL
  ): Promise<T> {
    // İstek istatistiklerini güncelle
    this.updateRequestStats(key);
    
    const cached = BaseService.cache.get(key);
    const now = Date.now();
    
    // Eğer önbellekte varsa ve süresi dolmamışsa
    if (cached && (now - cached.timestamp < ttl)) {
      return cached.data as T;
    }
    
    // Yoksa veriyi getir ve önbelleğe ekle
    const data = await fetchFn();
    BaseService.cache.set(key, { data, timestamp: now });
    return data;
  }
  
  /**
   * İstek istatistiklerini günceller
   * @param key İstek anahtarı
   */
  private updateRequestStats(key: string): void {
    const now = Date.now();
    const stats = BaseService.requestStats.get(key) || { count: 0, lastReset: now };
    
    // İstatistikleri belirli aralıklarla sıfırla
    if (now - stats.lastReset > BaseService.STATS_RESET_INTERVAL) {
      stats.count = 0;
      stats.lastReset = now;
    }
    
    // İstek sayısını artır
    stats.count++;
    BaseService.requestStats.set(key, stats);
    
    // Sık yapılan istekler için önbellek süresini otomatik olarak ayarla
    if (stats.count > 10) {
      const cached = BaseService.cache.get(key);
      if (cached) {
        // Daha sık istenen veriler için önbellek süresini uzat
        const ttlExtension = Math.min(stats.count * 1000, 300000); // En fazla 5 dakika
        cached.timestamp = now - this.cacheTTL + ttlExtension;
        BaseService.cache.set(key, cached);
      }
    }
  }
  
  /**
   * Önbellekten belirli bir anahtarı temizler
   * @param key Önbellek anahtarı
   */
  protected invalidateCache(key: string): void {
    BaseService.cache.delete(key);
  }
  
  /**
   * Önbellekten bir ön ek ile başlayan tüm anahtarları temizler
   * @param prefix Önbellek anahtarı ön eki
   */
  protected invalidateCacheByPrefix(prefix: string): void {
    // Array'e dönüştürerek iterasyon yapma sorununu çöz
    const keys = Array.from(BaseService.cache.keys());
    for (const key of keys) {
      if (key.startsWith(prefix)) {
        BaseService.cache.delete(key);
      }
    }
  }
  
  /**
   * Bildirim gönderme işlemini standartlaştıran yardımcı metot
   * @param type Bildirim tipi
   * @param title Bildirim başlığı
   * @param message Bildirim mesajı
   * @param category Bildirim kategorisi
   * @param link Bildirime tıklandığında yönlendirilecek link
   * @param linkText Link metni
   */
  protected sendNotification(
    type: "info" | "success" | "warning" | "error",
    title: string,
    message: string,
    category: NotificationCategory,
    link?: string,
    linkText?: string
  ): void {
    createAndSendNotification(type, title, message, category, link, linkText);
  }
  
  /**
   * Aktivite kaydı oluşturan yardımcı metot
   * @param type Aktivite tipi
   * @param description Aktivite açıklaması
   * @param relatedId İlişkili kayıt ID'si
   * @returns Promise<void>
   */
  protected async createActivity(
    type: string,
    description: string,
    relatedId?: number
  ): Promise<void> {
    await this.storage.createActivity({
      type,
      description,
      relatedId
    });
    
    // Aktiviteler güncellendiğinde önbelleği temizle
    this.invalidateCacheByPrefix('activities');
  }
  
  /**
   * Bir işlemi hata yakalama ile gerçekleştirir
   * @param operation Gerçekleştirilecek işlem
   * @param errorMessage Hata mesajı
   * @returns Promise<T>
   */
  protected async executeWithErrorHandling<T>(
    operation: () => Promise<T>, 
    errorMessage: string = 'İşlem sırasında bir hata oluştu'
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      // Gelişmiş loglama
      Logger.error(LogSource.SERVICE, `Hata: ${errorMessage}`, error);
      
      // ApiError veya ServiceError tipinde hatalar
      if (error instanceof ApiError) {
        throw error;
      }
      
      // Standart hataları BusinessError olarak dönüştür
      throw new BusinessError(
        error instanceof Error ? error.message : errorMessage,
        { originalError: error }
      );
    }
  }
  
  /**
   * Servis çağrı performansını ölçen yardımcı metot
   * @param operation Gerçekleştirilecek işlem
   * @param operationName İşlem adı
   * @returns Promise<T>
   */
  protected async measurePerformance<T>(
    operation: () => Promise<T>, 
    operationName: string
  ): Promise<T> {
    const start = Date.now();
    try {
      return await operation();
    } finally {
      const duration = Date.now() - start;
      // 100ms'den uzun süren işlemleri logla
      if (duration > 100) {
        console.warn(`Performans Uyarısı: ${operationName} işlemi ${duration}ms sürdü`);
      }
    }
  }
  
  /**
   * Öğrenci isim bilgisini getiren yardımcı metot
   * @param studentId Öğrenci ID
   * @returns Promise<string>
   */
  protected async getStudentName(studentId: number): Promise<string> {
    const student = await this.storage.getStudent(studentId);
    return student 
      ? `${student.firstName} ${student.lastName}` 
      : `ID: ${studentId}`;
  }
}