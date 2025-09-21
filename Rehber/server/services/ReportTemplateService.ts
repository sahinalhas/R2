import { BaseService, ServiceError, ICrudOperations } from './BaseService';
import { ReportTemplate, InsertReportTemplate } from '@shared/schema';

/**
 * Rapor şablonları yönetim servisi
 */
export class ReportTemplateService extends BaseService implements ICrudOperations<ReportTemplate, InsertReportTemplate> {
  /**
   * Tüm rapor şablonlarını getir
   * @returns Şablon listesi
   */
  async getAll(): Promise<ReportTemplate[]> {
    return this.getOrSetCache('reportTemplates:all', async () => {
      return this.storage.getReportTemplates();
    }, 300000); // 5 dakikalık önbellek - şablonlar sık değişmez
  }

  /**
   * ID'ye göre rapor şablonu getir
   * @param id Şablon ID
   * @returns Şablon nesnesi veya undefined
   */
  async getById(id: number): Promise<ReportTemplate | undefined> {
    return this.getOrSetCache(`reportTemplates:${id}`, async () => {
      return this.storage.getReportTemplate(id);
    }, 300000); // 5 dakikalık önbellek
  }

  /**
   * Aktif rapor şablonlarını getir
   * @returns Aktif şablon listesi
   */
  async getActiveTemplates(): Promise<ReportTemplate[]> {
    return this.getOrSetCache('reportTemplates:active', async () => {
      return this.storage.getActiveReportTemplates();
    }, 180000); // 3 dakikalık önbellek
  }

  /**
   * Türe göre şablon listesi getir
   * @param type Şablon türü
   * @returns Şablon listesi
   */
  async getTemplatesByType(type: string): Promise<ReportTemplate[]> {
    return this.getOrSetCache(`reportTemplates:type:${type}`, async () => {
      return this.storage.getReportTemplatesByType(type);
    }, 240000); // 4 dakikalık önbellek
  }

  /**
   * Kategoriye göre şablon listesi getir
   * @param category Şablon kategorisi
   * @returns Şablon listesi
   */
  async getTemplatesByCategory(category: string): Promise<ReportTemplate[]> {
    return this.getOrSetCache(`reportTemplates:category:${category}`, async () => {
      return this.storage.getReportTemplatesByCategory(category);
    }, 240000); // 4 dakikalık önbellek
  }

  /**
   * Şablonlarda arama yap
   * @param query Arama metni
   * @returns Eşleşen şablon listesi
   */
  async searchTemplates(query: string): Promise<ReportTemplate[]> {
    if (!query || query.trim().length < 2) {
      return this.getActiveTemplates();
    }
    
    // Arama sonuçları için daha kısa süreli önbellek kullan
    return this.getOrSetCache(`reportTemplates:search:${query}`, async () => {
      return this.storage.searchReportTemplates(query);
    }, 60000); // 1 dakikalık önbellek
  }

  /**
   * Yeni şablon oluştur
   * @param template Şablon bilgileri
   * @returns Oluşturulan şablon
   */
  async create(template: InsertReportTemplate): Promise<ReportTemplate> {
    return this.executeWithErrorHandling(async () => {
      return this.measurePerformance(async () => {
        // Şablon bilgilerini doğrula
        this.validateTemplate(template);
        
        // Şablonu oluştur
        const newTemplate = await this.storage.createReportTemplate(template);
        
        // Aktivite kaydı oluştur
        await this.createActivity(
          'Yeni rapor şablonu',
          `"${newTemplate.name}" adlı yeni bir rapor şablonu oluşturuldu.`,
          newTemplate.id
        );
        
        // Bildirim gönder
        this.sendNotification(
          "success",
          "Yeni Rapor Şablonu",
          `"${newTemplate.name}" adlı rapor şablonu başarıyla oluşturuldu.`,
          "report",
          `/rapor-sablonlari/${newTemplate.id}`,
          "Şablonu Görüntüle"
        );
        
        // Önbellekleri temizle
        this.invalidateCacheByPrefix('reportTemplates');
        
        return newTemplate;
      }, "createReportTemplate");
    }, "Rapor şablonu oluşturulurken bir hata oluştu");
  }

  /**
   * Şablon bilgilerini güncelle
   * @param id Şablon ID
   * @param template Güncellenecek şablon bilgileri
   * @returns Güncellenmiş şablon veya undefined
   */
  async update(id: number, template: Partial<InsertReportTemplate>): Promise<ReportTemplate | undefined> {
    return this.executeWithErrorHandling(async () => {
      return this.measurePerformance(async () => {
        // Mevcut şablonu kontrol et
        const existingTemplate = await this.getById(id);
        if (!existingTemplate) {
          throw new ServiceError(`ID: ${id} ile rapor şablonu bulunamadı`, 404);
        }
        
        // Şablonu güncelle
        const updatedTemplate = await this.storage.updateReportTemplate(id, template);
        
        if (updatedTemplate) {
          // Değişiklikleri tespit et
          const changes = this.detectTemplateChanges(existingTemplate, template);
          const changesText = changes.length > 0 ? changes.join(', ') : 'Detaylar güncellendi';
          
          // Aktivite kaydı oluştur
          await this.createActivity(
            'Rapor şablonu güncelleme',
            `"${updatedTemplate.name}" adlı rapor şablonu güncellendi. ${changesText}`,
            updatedTemplate.id
          );
          
          // Bildirim gönder
          this.sendNotification(
            "warning",
            "Rapor Şablonu Güncellendi",
            `"${updatedTemplate.name}" rapor şablonu güncellendi.`,
            "report",
            `/rapor-sablonlari/${updatedTemplate.id}`,
            "Şablonu Görüntüle"
          );
          
          // Önbellekleri temizle
          this.invalidateCache(`reportTemplates:${id}`);
          this.invalidateCacheByPrefix('reportTemplates:all');
          this.invalidateCacheByPrefix('reportTemplates:active');
          
          // Tür veya kategori değiştiyse, ilgili önbellekleri temizle
          if (template.type !== undefined && template.type !== existingTemplate.type) {
            this.invalidateCache(`reportTemplates:type:${existingTemplate.type}`);
            this.invalidateCache(`reportTemplates:type:${template.type}`);
          }
          
          if (template.category !== undefined && template.category !== existingTemplate.category) {
            this.invalidateCache(`reportTemplates:category:${existingTemplate.category}`);
            this.invalidateCache(`reportTemplates:category:${template.category}`);
          }
        }
        
        return updatedTemplate;
      }, "updateReportTemplate");
    }, "Rapor şablonu güncellenirken bir hata oluştu");
  }

  /**
   * Şablon aktiflik durumunu güncelle
   * @param id Şablon ID
   * @param isActive Yeni aktiflik durumu
   * @returns Güncellenmiş şablon veya undefined
   */
  async updateStatus(id: number, isActive: boolean): Promise<ReportTemplate | undefined> {
    return this.executeWithErrorHandling(async () => {
      // Mevcut şablonu kontrol et
      const existingTemplate = await this.getById(id);
      if (!existingTemplate) {
        throw new ServiceError(`ID: ${id} ile rapor şablonu bulunamadı`, 404);
      }
      
      // Durum zaten aynıysa güncelleme yapma
      if (existingTemplate.isActive === isActive) {
        return existingTemplate;
      }
      
      // Şablonu güncelle
      const updatedTemplate = await this.storage.updateTemplateStatus(id, isActive);
      
      if (updatedTemplate) {
        // Aktivite kaydı oluştur
        const statusText = isActive ? 'aktif' : 'pasif';
        await this.createActivity(
          'Rapor şablonu durum değişikliği',
          `"${updatedTemplate.name}" adlı rapor şablonu ${statusText} durumuna getirildi.`,
          updatedTemplate.id
        );
        
        // Bildirim gönder
        this.sendNotification(
          isActive ? "success" : "warning",
          "Rapor Şablonu Durumu Değişti",
          `"${updatedTemplate.name}" rapor şablonu ${statusText} durumuna getirildi.`,
          "report"
        );
        
        // Önbellekleri temizle
        this.invalidateCache(`reportTemplates:${id}`);
        this.invalidateCacheByPrefix('reportTemplates:all');
        this.invalidateCacheByPrefix('reportTemplates:active');
        this.invalidateCache(`reportTemplates:type:${updatedTemplate.type}`);
        this.invalidateCache(`reportTemplates:category:${updatedTemplate.category}`);
      }
      
      return updatedTemplate;
    }, "Rapor şablonu durumu güncellenirken bir hata oluştu");
  }

  /**
   * Şablonu sil
   * @param id Şablon ID
   * @returns İşlem başarılı ise true, değilse false
   */
  async delete(id: number): Promise<boolean> {
    return this.executeWithErrorHandling(async () => {
      return this.measurePerformance(async () => {
        // Mevcut şablonu kontrol et
        const template = await this.getById(id);
        if (!template) {
          throw new ServiceError(`ID: ${id} ile rapor şablonu bulunamadı`, 404);
        }
        
        // Şablonu sil
        const result = await this.storage.deleteReportTemplate(id);
        
        if (result) {
          // Aktivite kaydı oluştur
          await this.createActivity(
            'Rapor şablonu silme',
            `"${template.name}" adlı rapor şablonu silindi.`,
            id
          );
          
          // Bildirim gönder
          this.sendNotification(
            "error",
            "Rapor Şablonu Silindi",
            `"${template.name}" rapor şablonu sistemden silindi.`,
            "report"
          );
          
          // Önbellekleri temizle
          this.invalidateCache(`reportTemplates:${id}`);
          this.invalidateCacheByPrefix('reportTemplates:all');
          this.invalidateCacheByPrefix('reportTemplates:active');
          this.invalidateCache(`reportTemplates:type:${template.type}`);
          this.invalidateCache(`reportTemplates:category:${template.category}`);
        }
        
        return result;
      }, "deleteReportTemplate");
    }, "Rapor şablonu silinirken bir hata oluştu");
  }

  /**
   * Şablon içeriğinin doğruluğunu kontrol et
   * @param template Şablon verileri
   */
  private validateTemplate(template: InsertReportTemplate): void {
    // Structure alanı geçerli bir JSON olmalı
    try {
      if (template.structure) {
        const structure = JSON.parse(template.structure);
        if (!Array.isArray(structure) && typeof structure !== 'object') {
          throw new ServiceError(
            "Şablon yapısı geçerli bir JSON formatında olmalıdır (dizi veya nesne)", 
            400
          );
        }
      }
    } catch (error) {
      throw new ServiceError("Şablon yapısı geçerli bir JSON formatında olmalıdır", 400);
    }
    
    // Şablon türü belirlenen değerlerden biri olmalı
    const validTypes = ['evaluation', 'behavior', 'academic', 'psychological', 'general'];
    if (template.type && !validTypes.includes(template.type)) {
      throw new ServiceError(
        `Geçersiz şablon türü. Geçerli türler: ${validTypes.join(', ')}`,
        400
      );
    }
    
    // Kategori belirlenen değerlerden biri olmalı
    const validCategories = ['general', 'student', 'classroom', 'special'];
    if (template.category && !validCategories.includes(template.category)) {
      throw new ServiceError(
        `Geçersiz şablon kategorisi. Geçerli kategoriler: ${validCategories.join(', ')}`,
        400
      );
    }
  }

  /**
   * Şablondaki değişiklikleri tespit et
   * @param existingTemplate Mevcut şablon
   * @param updatedData Güncellenmiş veriler
   * @returns Değişikliklerin açıklaması
   */
  private detectTemplateChanges(existingTemplate: ReportTemplate, updatedData: Partial<InsertReportTemplate>): string[] {
    const changes = [];
    
    if (updatedData.name !== undefined && updatedData.name !== existingTemplate.name) {
      changes.push(`İsim: "${existingTemplate.name}" -> "${updatedData.name}"`);
    }
    
    if (updatedData.type !== undefined && updatedData.type !== existingTemplate.type) {
      changes.push(`Tür: "${existingTemplate.type}" -> "${updatedData.type}"`);
    }
    
    if (updatedData.category !== undefined && updatedData.category !== existingTemplate.category) {
      changes.push(`Kategori: "${existingTemplate.category}" -> "${updatedData.category}"`);
    }
    
    if (updatedData.description !== undefined && updatedData.description !== existingTemplate.description) {
      if (existingTemplate.description && updatedData.description) {
        changes.push(`Açıklama güncellendi`);
      } else if (!existingTemplate.description && updatedData.description) {
        changes.push(`Açıklama eklendi`);
      } else if (existingTemplate.description && !updatedData.description) {
        changes.push(`Açıklama kaldırıldı`);
      }
    }
    
    if (updatedData.structure !== undefined && updatedData.structure !== existingTemplate.structure) {
      changes.push(`Şablon yapısı güncellendi`);
    }
    
    if (updatedData.defaultContent !== undefined && updatedData.defaultContent !== existingTemplate.defaultContent) {
      changes.push(`Varsayılan içerik güncellendi`);
    }
    
    if (updatedData.isActive !== undefined && updatedData.isActive !== existingTemplate.isActive) {
      changes.push(`Durum: "${existingTemplate.isActive ? 'Aktif' : 'Pasif'}" -> "${updatedData.isActive ? 'Aktif' : 'Pasif'}"`);
    }
    
    return changes;
  }
}