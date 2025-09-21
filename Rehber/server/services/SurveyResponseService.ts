import { BaseService, ServiceError } from './BaseService';
import { SurveyResponse, InsertSurveyResponse, SurveyImport } from '@shared/schema';

/**
 * Anket yanıt işlemlerini yöneten servis sınıfı
 */
export class SurveyResponseService extends BaseService {
  /**
   * Bir ankete ait tüm yanıtları getir
   * @param surveyId Anket ID
   * @returns Anket yanıtları listesi
   */
  async getSurveyResponses(surveyId: number): Promise<SurveyResponse[]> {
    return this.getOrSetCache(`surveyResponses:survey:${surveyId}`, async () => {
      return this.storage.getSurveyResponses(surveyId);
    }, 30000); // 30 saniyelik önbellek
  }

  /**
   * ID'ye göre anket yanıtını getir
   * @param id Anket yanıtı ID
   * @returns Anket yanıtı nesnesi veya undefined
   */
  async getSurveyResponse(id: number): Promise<SurveyResponse | undefined> {
    return this.getOrSetCache(`surveyResponses:${id}`, async () => {
      return this.storage.getSurveyResponse(id);
    }, 60000); // 1 dakikalık önbellek
  }

  /**
   * Öğrenci ID'sine göre anket yanıtlarını getir
   * @param studentId Öğrenci ID
   * @returns Anket yanıtları listesi
   */
  async getSurveyResponsesByStudentId(studentId: number): Promise<SurveyResponse[]> {
    return this.getOrSetCache(`surveyResponses:student:${studentId}`, async () => {
      return this.storage.getSurveyResponsesByStudentId(studentId);
    }, 30000); // 30 saniyelik önbellek
  }

  /**
   * Yeni anket yanıtı oluştur
   * @param response Anket yanıtı bilgileri
   * @returns Oluşturulan anket yanıtı
   */
  async createSurveyResponse(response: InsertSurveyResponse): Promise<SurveyResponse> {
    return this.executeWithErrorHandling(async () => {
      return this.measurePerformance(async () => {
        // Anket yanıtını oluştur
        const newResponse = await this.storage.createSurveyResponse(response);
        
        // Anket bilgilerini getir - önbellekten gelir
        const survey = await this.getOrSetCache(`surveys:${response.surveyId}`, async () => {
          return this.storage.getSurvey(response.surveyId);
        });
        
        let studentName = 'Anonim yanıtlayan';
        if (response.studentId) {
          studentName = await this.getStudentName(response.studentId);
        }
        
        const surveyTitle = survey ? survey.title : `Anket ID: ${response.surveyId}`;
        
        // Aktivite kaydı oluştur - BaseService yardımcı metodu
        await this.createActivity(
          'Anket yanıtı',
          `"${surveyTitle}" anketine ${studentName} tarafından yanıt verildi.`,
          newResponse.id
        );
        
        // Bildirim gönder - BaseService yardımcı metodu
        this.sendNotification(
          "info",
          "Yeni Anket Yanıtı",
          `"${surveyTitle}" anketine ${studentName} tarafından yanıt verildi.`,
          "system",
          `/anketler/${response.surveyId}/yanitlar`,
          "Yanıtları Görüntüle"
        );
        
        // İlgili önbellekleri temizle
        this.invalidateCacheByPrefix(`surveyResponses:survey:${response.surveyId}`);
        if (response.studentId) {
          this.invalidateCacheByPrefix(`surveyResponses:student:${response.studentId}`);
        }
        
        return newResponse;
      }, "createSurveyResponse");
    }, "Anket yanıtı oluşturulurken bir hata oluştu");
  }

  /**
   * Excel dosyasından anket yanıtlarını içe aktar
   * @param surveyId Anket ID
   * @param filePath Dosya yolu
   * @param processedBy İşlemi yapan kullanıcı ID
   * @returns İçe aktarma bilgisi
   */
  async importSurveyResponsesFromExcel(surveyId: number, filePath: string, processedBy: number): Promise<SurveyImport> {
    return this.executeWithErrorHandling(async () => {
      return this.measurePerformance(async () => {
        // İçe aktarma işlemi başlat
        const result = await this.storage.importSurveyResponsesFromExcel(surveyId, filePath, processedBy);
        
        // Anket bilgilerini getir - önbellekten gelir
        const survey = await this.getOrSetCache(`surveys:${surveyId}`, async () => {
          return this.storage.getSurvey(surveyId);
        });
        
        const surveyTitle = survey ? survey.title : `Anket ID: ${surveyId}`;
        
        // Aktivite kaydı oluştur - BaseService yardımcı metodu
        await this.createActivity(
          'Anket yanıtı içe aktarma',
          `"${surveyTitle}" anketine Excel dosyasından yanıtlar içe aktarıldı.`,
          result.id
        );
        
        // Bildirim gönder - BaseService yardımcı metodu
        this.sendNotification(
          "success",
          "Anket Yanıtları İçe Aktarıldı",
          `"${surveyTitle}" anketine ait yanıtlar Excel dosyasından başarıyla içe aktarıldı.`,
          "system",
          `/anketler/${surveyId}/yanitlar`,
          "Yanıtları Görüntüle"
        );
        
        // İlgili önbellekleri temizle
        this.invalidateCacheByPrefix(`surveyResponses:survey:${surveyId}`);
        this.invalidateCacheByPrefix(`surveyImports:survey:${surveyId}`);
        
        return result;
      }, "importSurveyResponsesFromExcel");
    }, "Anket yanıtlarını içe aktarırken bir hata oluştu");
  }

  /**
   * Bir ankete ait tüm içe aktarma işlemlerini getir
   * @param surveyId Anket ID
   * @returns İçe aktarma işlemleri listesi
   */
  async getSurveyImports(surveyId: number): Promise<SurveyImport[]> {
    return this.getOrSetCache(`surveyImports:survey:${surveyId}`, async () => {
      return this.storage.getSurveyImports(surveyId);
    }, 30000); // 30 saniyelik önbellek
  }
  
  /**
   * ID'ye göre içe aktarma işlemini getir
   * @param id İçe aktarma ID
   * @returns İçe aktarma işlemi nesnesi veya undefined
   */
  async getSurveyImport(id: number): Promise<SurveyImport | undefined> {
    return this.getOrSetCache(`surveyImports:${id}`, async () => {
      return this.storage.getSurveyImport(id);
    }, 60000); // 1 dakikalık önbellek
  }

  /**
   * Anket içe aktarma işlemini güncelle
   * @param id İçe aktarma ID
   * @param status Yeni durum
   * @param errorMessage Hata mesajı (opsiyonel)
   * @returns Güncellenmiş içe aktarma bilgisi veya undefined
   */
  async updateSurveyImportStatus(id: number, status: string, errorMessage?: string): Promise<SurveyImport | undefined> {
    return this.executeWithErrorHandling(async () => {
      return this.measurePerformance(async () => {
        // Mevcut içe aktarma bilgisini kontrol et
        const importInfo = await this.getSurveyImport(id);
        if (!importInfo) {
          throw new ServiceError(`ID: ${id} ile anket içe aktarma bilgisi bulunamadı`, 404);
        }
        
        // Durumu güncelle
        const updatedImport = await this.storage.updateSurveyImportStatus(id, status, errorMessage);
        
        if (updatedImport) {
          // Anket bilgilerini getir - önbellekten gelir
          const survey = await this.getOrSetCache(`surveys:${updatedImport.surveyId}`, async () => {
            return this.storage.getSurvey(updatedImport.surveyId);
          });
          
          const surveyTitle = survey ? survey.title : `Anket ID: ${updatedImport.surveyId}`;
          
          // Aktivite kaydı oluştur - BaseService yardımcı metodu
          await this.createActivity(
            'Anket içe aktarma durumu',
            `"${surveyTitle}" anketine ait içe aktarma işlemi durumu "${status}" olarak güncellendi.`,
            id
          );
          
          // Durum değişikliğine göre bildirim gönder - BaseService yardımcı metodu
          if (status === 'completed') {
            this.sendNotification(
              "success",
              "İçe Aktarma Tamamlandı",
              `"${surveyTitle}" anketine ait yanıtların içe aktarılması başarıyla tamamlandı.`,
              "system",
              `/anketler/${updatedImport.surveyId}/yanitlar`,
              "Yanıtları Görüntüle"
            );
          } else if (status === 'failed') {
            this.sendNotification(
              "error",
              "İçe Aktarma Başarısız",
              `"${surveyTitle}" anketine ait yanıtların içe aktarılması başarısız oldu. Hata: ${errorMessage || 'Bilinmeyen hata'}`,
              "system"
            );
          }
          
          // İlgili önbellekleri temizle
          this.invalidateCache(`surveyImports:${id}`);
          this.invalidateCacheByPrefix(`surveyImports:survey:${updatedImport.surveyId}`);
          
          // Yanıt önbelleğini de temizle (başarılı içe aktarma durumunda)
          if (status === 'completed') {
            this.invalidateCacheByPrefix(`surveyResponses:survey:${updatedImport.surveyId}`);
          }
        }
        
        return updatedImport;
      }, "updateSurveyImportStatus");
    }, "Anket içe aktarma durumu güncellenirken bir hata oluştu");
  }
}