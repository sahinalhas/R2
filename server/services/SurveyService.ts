import { BaseService, ServiceError, ICrudOperations } from './BaseService';
import { Survey, InsertSurvey } from '@shared/schema';
import { NotificationCategory } from '../websocket';

/**
 * Anket işlemlerini yöneten servis sınıfı
 */
export class SurveyService extends BaseService implements ICrudOperations<Survey, InsertSurvey> {
  /**
   * Tüm anketleri getir
   * @returns Anket listesi
   */
  async getAll(): Promise<Survey[]> {
    return this.getOrSetCache('surveys:all', async () => {
      return this.storage.getSurveys();
    }, 60000); // 1 dakikalık önbellek
  }

  /**
   * ID'ye göre anket getir
   * @param id Anket ID
   * @returns Anket nesnesi veya undefined
   */
  async getById(id: number): Promise<Survey | undefined> {
    return this.getOrSetCache(`surveys:${id}`, async () => {
      return this.storage.getSurvey(id);
    }, 120000); // 2 dakikalık önbellek
  }

  /**
   * Belirli bir türdeki anketleri getir
   * @param type Anket türü
   * @returns Anket listesi
   */
  async getSurveysByType(type: string): Promise<Survey[]> {
    return this.getOrSetCache(`surveys:type:${type}`, async () => {
      return this.storage.getSurveysByType(type);
    }, 60000); // 1 dakikalık önbellek
  }

  /**
   * Yeni anket oluştur
   * @param survey Anket bilgileri
   * @returns Oluşturulan anket
   */
  async create(survey: InsertSurvey): Promise<Survey> {
    return this.executeWithErrorHandling(async () => {
      return this.measurePerformance(async () => {
        // Anketi oluştur
        const newSurvey = await this.storage.createSurvey(survey);
        
        // Aktivite kaydı oluştur
        await this.createActivity(
          'Yeni anket',
          `"${newSurvey.title}" başlıklı ${survey.type} tipinde yeni bir anket oluşturuldu.`,
          newSurvey.id
        );
        
        // Bildirim gönder
        this.sendNotification(
          "success",
          "Yeni Anket Oluşturuldu",
          `"${newSurvey.title}" başlıklı anket başarıyla oluşturuldu.`,
          "system",
          `/anketler/${newSurvey.id}`,
          "Anketi Görüntüle"
        );
        
        // Önbellekleri temizle
        this.invalidateCacheByPrefix('surveys');
        
        return newSurvey;
      }, "createSurvey");
    }, "Anket oluşturulurken bir hata oluştu");
  }

  /**
   * Anket bilgilerini güncelle
   * @param id Anket ID
   * @param survey Güncellenecek anket bilgileri
   * @returns Güncellenmiş anket veya undefined
   */
  async update(id: number, survey: Partial<InsertSurvey>): Promise<Survey | undefined> {
    return this.executeWithErrorHandling(async () => {
      return this.measurePerformance(async () => {
        // Mevcut anketi kontrol et
        const existingSurvey = await this.getById(id);
        if (!existingSurvey) {
          throw new ServiceError(`ID: ${id} ile anket bulunamadı`, 404);
        }
        
        // Anketi güncelle
        const updatedSurvey = await this.storage.updateSurvey(id, survey);
        
        if (updatedSurvey) {
          // Güncelleme detayları için değişiklikleri tespit et
          const changes = this.detectSurveyChanges(existingSurvey, survey);
          const changesText = changes.length > 0 
            ? changes.join(', ') 
            : 'Detaylar güncellendi';
          
          // Aktivite kaydı oluştur
          await this.createActivity(
            'Anket güncelleme',
            `"${updatedSurvey.title}" başlıklı anket güncellendi. ${changesText}`,
            updatedSurvey.id
          );
          
          // Bildirim gönder (önemli değişiklikler varsa)
          if (changes.length > 0) {
            this.sendNotification(
              "warning",
              "Anket Güncellendi",
              `"${updatedSurvey.title}" başlıklı anket güncellendi.`,
              "system",
              `/anketler/${updatedSurvey.id}`,
              "Anketi Görüntüle"
            );
          }
          
          // Önbellekleri temizle
          this.invalidateCacheByPrefix('surveys');
          this.invalidateCache(`surveys:${id}`);
          
          if (existingSurvey.type !== updatedSurvey.type) {
            this.invalidateCache(`surveys:type:${existingSurvey.type}`);
            this.invalidateCache(`surveys:type:${updatedSurvey.type}`);
          }
        }
        
        return updatedSurvey;
      }, "updateSurvey");
    }, "Anket güncellenirken bir hata oluştu");
  }

  /**
   * Anketi sil
   * @param id Anket ID
   * @returns İşlem başarılı ise true, değilse false
   */
  async delete(id: number): Promise<boolean> {
    return this.executeWithErrorHandling(async () => {
      return this.measurePerformance(async () => {
        // Mevcut anketi kontrol et
        const survey = await this.getById(id);
        if (!survey) {
          throw new ServiceError(`ID: ${id} ile anket bulunamadı`, 404);
        }
        
        // Önce aktivite kaydı oluştur (silmeden önce)
        await this.createActivity(
          'Anket silme',
          `"${survey.title}" başlıklı anket silindi.`,
          id
        );
        
        // Bildirim gönder
        this.sendNotification(
          "error",
          "Anket Silindi",
          `"${survey.title}" başlıklı anket silindi.`,
          "system"
        );
        
        // Anketi sil
        const result = await this.storage.deleteSurvey(id);
        
        // Silme başarılıysa önbellekleri temizle
        if (result) {
          this.invalidateCacheByPrefix('surveys');
          this.invalidateCache(`surveys:${id}`);
          this.invalidateCache(`surveys:type:${survey.type}`);
          
          // İlgili anket atama ve yanıtları önbelleğini de temizle
          this.invalidateCacheByPrefix(`surveyAssignments:${id}`);
          this.invalidateCacheByPrefix(`surveyResponses:${id}`);
        }
        
        return result;
      }, "deleteSurvey");
    }, "Anket silinirken bir hata oluştu");
  }
  
  /**
   * Anketteki değişiklikleri tespit et
   * @param existingSurvey Mevcut anket
   * @param updatedData Güncellenmiş veriler
   * @returns Değişikliklerin açıklaması
   */
  private detectSurveyChanges(existingSurvey: Survey, updatedData: Partial<InsertSurvey>): string[] {
    const changes = [];
    
    if (updatedData.title !== undefined && updatedData.title !== existingSurvey.title) {
      changes.push(`Başlık: "${existingSurvey.title}" -> "${updatedData.title}"`);
    }
    
    if (updatedData.type !== undefined && updatedData.type !== existingSurvey.type) {
      changes.push(`Tür: "${existingSurvey.type}" -> "${updatedData.type}"`);
    }
    
    if (updatedData.description !== undefined && updatedData.description !== existingSurvey.description) {
      if (existingSurvey.description && updatedData.description) {
        changes.push(`Açıklama güncellendi`);
      } else if (!existingSurvey.description && updatedData.description) {
        changes.push(`Açıklama eklendi`);
      } else if (existingSurvey.description && !updatedData.description) {
        changes.push(`Açıklama kaldırıldı`);
      }
    }
    
    if (updatedData.questions !== undefined && updatedData.questions !== existingSurvey.questions) {
      changes.push(`Sorular güncellendi`);
    }
    
    if (updatedData.targetAudience !== undefined && updatedData.targetAudience !== existingSurvey.targetAudience) {
      changes.push(`Hedef kitle: "${existingSurvey.targetAudience}" -> "${updatedData.targetAudience}"`);
    }
    
    if (updatedData.isActive !== undefined && updatedData.isActive !== existingSurvey.isActive) {
      changes.push(`Durum: "${existingSurvey.isActive ? 'Aktif' : 'Pasif'}" -> "${updatedData.isActive ? 'Aktif' : 'Pasif'}"`);
    }
    
    if (updatedData.anonymous !== undefined && updatedData.anonymous !== existingSurvey.anonymous) {
      changes.push(`Anonim yanıt: "${existingSurvey.anonymous ? 'Evet' : 'Hayır'}" -> "${updatedData.anonymous ? 'Evet' : 'Hayır'}"`);
    }
    
    return changes;
  }
  
  /**
   * Eski API uyumluluğu için metotlar
   */
  async getSurveys(): Promise<Survey[]> {
    return this.getAll();
  }
  
  async getSurvey(id: number): Promise<Survey | undefined> {
    return this.getById(id);
  }
  
  async createSurvey(survey: InsertSurvey): Promise<Survey> {
    return this.create(survey);
  }
  
  async updateSurvey(id: number, survey: Partial<InsertSurvey>): Promise<Survey | undefined> {
    return this.update(id, survey);
  }
  
  async deleteSurvey(id: number): Promise<boolean> {
    return this.delete(id);
  }
}