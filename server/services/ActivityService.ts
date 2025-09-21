import { BaseService } from './BaseService';
import { Activity, InsertActivity } from '@shared/schema';

/**
 * Aktivite işlemlerini yöneten servis sınıfı
 */
export class ActivityService extends BaseService {
  /**
   * Tüm aktiviteleri getir
   * @returns Aktivite listesi
   */
  async getActivities(): Promise<Activity[]> {
    return this.storage.getActivities();
  }

  /**
   * Yeni aktivite oluştur
   * @param activity Aktivite bilgileri
   * @returns Oluşturulan aktivite
   */
  async createActivity(activity: InsertActivity): Promise<Activity> {
    return this.storage.createActivity(activity);
  }

  /**
   * Sistem aktivitesi oluştur
   * Bu metot, sistem tarafından otomatik olarak oluşturulan aktiviteler için kullanılır
   * @param type Aktivite türü
   * @param description Aktivite açıklaması
   * @param relatedId İlgili öğe ID (opsiyonel)
   * @returns Oluşturulan aktivite
   */
  async createSystemActivity(type: string, description: string, relatedId?: number): Promise<Activity> {
    return this.storage.createActivity({
      type,
      description,
      relatedId
    });
  }
}