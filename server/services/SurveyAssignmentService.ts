import { BaseService, ServiceError } from './BaseService';
import { SurveyAssignment, InsertSurveyAssignment } from '@shared/schema';

/**
 * Anket atama işlemlerini yöneten servis sınıfı
 */
export class SurveyAssignmentService extends BaseService {
  /**
   * Bir ankete ait tüm atamaları getir
   * @param surveyId Anket ID
   * @returns Anket atama listesi
   */
  async getSurveyAssignments(surveyId: number): Promise<SurveyAssignment[]> {
    return this.getOrSetCache(`surveyAssignments:survey:${surveyId}`, async () => {
      return this.storage.getSurveyAssignments(surveyId);
    }, 30000); // 30 saniyelik önbellek
  }

  /**
   * ID'ye göre anket atamasını getir
   * @param id Atama ID
   * @returns Anket atama nesnesi veya undefined
   */
  async getSurveyAssignment(id: number): Promise<SurveyAssignment | undefined> {
    return this.getOrSetCache(`surveyAssignments:${id}`, async () => {
      return this.storage.getSurveyAssignment(id);
    }, 60000); // 1 dakikalık önbellek
  }

  /**
   * Öğrenci ID'sine göre anket atamalarını getir
   * @param studentId Öğrenci ID
   * @returns Anket atama listesi
   */
  async getSurveyAssignmentsByStudentId(studentId: number): Promise<SurveyAssignment[]> {
    return this.getOrSetCache(`surveyAssignments:student:${studentId}`, async () => {
      return this.storage.getSurveyAssignmentsByStudentId(studentId);
    }, 30000); // 30 saniyelik önbellek
  }

  /**
   * Bir öğrenciye anket ata
   * @param assignment Atama bilgileri
   * @returns Oluşturulan atama
   */
  async assignSurveyToStudent(assignment: InsertSurveyAssignment): Promise<SurveyAssignment> {
    return this.executeWithErrorHandling(async () => {
      return this.measurePerformance(async () => {
        // Anket ataması oluştur
        const newAssignment = await this.storage.assignSurveyToStudent(assignment);
        
        // Anket ve öğrenci bilgilerini getir - BaseService ile getCache kullanımı
        const survey = await this.getOrSetCache(`surveys:${newAssignment.surveyId}`, async () => {
          return this.storage.getSurvey(newAssignment.surveyId);
        });
        
        const studentName = await this.getStudentName(newAssignment.studentId);
        const surveyTitle = survey ? survey.title : `Anket ID: ${newAssignment.surveyId}`;
        
        // Aktivite kaydı oluştur - BaseService yardımcı metodu
        await this.createActivity(
          'Anket atama',
          `"${surveyTitle}" anketi ${studentName} adlı öğrenciye atandı.`,
          newAssignment.id
        );
        
        // Bildirim gönder - BaseService yardımcı metodu
        if (survey) {
          this.sendNotification(
            "info",
            "Anket Atandı",
            `"${surveyTitle}" anketi ${studentName} adlı öğrenciye atandı.`,
            "system",
            `/anketler/${newAssignment.surveyId}/atamalar`,
            "Atamaları Görüntüle"
          );
        }
        
        // İlgili önbellekleri temizle
        this.invalidateCacheByPrefix(`surveyAssignments:survey:${newAssignment.surveyId}`);
        this.invalidateCacheByPrefix(`surveyAssignments:student:${newAssignment.studentId}`);
        
        return newAssignment;
      }, "assignSurveyToStudent");
    }, "Anket atama işlemi sırasında bir hata oluştu");
  }

  /**
   * Bir anketi birden fazla öğrenciye ata
   * @param surveyId Anket ID
   * @param studentIds Öğrenci ID listesi
   * @returns Oluşturulan atama listesi
   */
  async assignSurveyToMultipleStudents(surveyId: number, studentIds: number[]): Promise<SurveyAssignment[]> {
    return this.executeWithErrorHandling(async () => {
      return this.measurePerformance(async () => {
        // Anketleri ata
        const assignments = await this.storage.assignSurveyToMultipleStudents(surveyId, studentIds);
        
        // Anket bilgilerini getir - BaseService ile getCache kullanımı
        const survey = await this.getOrSetCache(`surveys:${surveyId}`, async () => {
          return this.storage.getSurvey(surveyId);
        });
        
        const surveyTitle = survey ? survey.title : `Anket ID: ${surveyId}`;
        
        // Aktivite kaydı oluştur - BaseService yardımcı metodu
        await this.createActivity(
          'Toplu anket atama',
          `"${surveyTitle}" anketi ${studentIds.length} öğrenciye toplu olarak atandı.`,
          surveyId
        );
        
        // Bildirim gönder - BaseService yardımcı metodu
        if (survey && studentIds.length > 0) {
          this.sendNotification(
            "info",
            "Toplu Anket Atama",
            `"${surveyTitle}" anketi ${studentIds.length} öğrenciye başarıyla atandı.`,
            "system",
            `/anketler/${surveyId}/atamalar`,
            "Atamaları Görüntüle"
          );
        }
        
        // İlgili önbellekleri temizle
        this.invalidateCacheByPrefix(`surveyAssignments:survey:${surveyId}`);
        
        // Öğrenci önbelleklerini de temizle
        studentIds.forEach(studentId => {
          this.invalidateCacheByPrefix(`surveyAssignments:student:${studentId}`);
        });
        
        return assignments;
      }, "assignSurveyToMultipleStudents");
    }, "Toplu anket atama işlemi sırasında bir hata oluştu");
  }

  /**
   * Anket atama durumunu güncelle
   * @param id Atama ID
   * @param status Yeni durum
   * @returns Güncellenmiş atama veya undefined
   */
  async updateSurveyAssignmentStatus(id: number, status: string): Promise<SurveyAssignment | undefined> {
    return this.executeWithErrorHandling(async () => {
      return this.measurePerformance(async () => {
        // Mevcut atamayı al - önbellekten gelir
        const assignment = await this.getSurveyAssignment(id);
        if (!assignment) {
          throw new ServiceError(`ID: ${id} ile anket ataması bulunamadı`, 404);
        }
        
        // Atama durumunu güncelle
        const updatedAssignment = await this.storage.updateSurveyAssignmentStatus(id, status);
        
        if (updatedAssignment) {
          // Anket ve öğrenci bilgilerini getir - önbellekten gelir
          const survey = await this.getOrSetCache(`surveys:${updatedAssignment.surveyId}`, async () => {
            return this.storage.getSurvey(updatedAssignment.surveyId);
          });
          
          const studentName = await this.getStudentName(updatedAssignment.studentId);
          const surveyTitle = survey ? survey.title : `Anket ID: ${updatedAssignment.surveyId}`;
          
          // Aktivite kaydı oluştur - BaseService yardımcı metodu
          await this.createActivity(
            'Anket durumu güncelleme',
            `${studentName} adlı öğrenciye atanan "${surveyTitle}" anketinin durumu "${status}" olarak güncellendi.`,
            updatedAssignment.id
          );
          
          // Durum değişikliğine göre bildirim bilgileri
          let notificationType = "info";
          let notificationTitle = "Anket Durumu Güncellendi";
          let notificationMessage = `${studentName} adlı öğrenciye atanan "${surveyTitle}" anketinin durumu "${status}" olarak güncellendi.`;
          
          if (status === 'completed') {
            notificationType = "success";
            notificationTitle = "Anket Tamamlandı";
            notificationMessage = `${studentName} adlı öğrenci "${surveyTitle}" anketini tamamladı.`;
          }
          
          // Bildirim gönder - BaseService yardımcı metodu
          if (survey) {
            this.sendNotification(
              notificationType as any,
              notificationTitle,
              notificationMessage,
              "system",
              `/anketler/${updatedAssignment.surveyId}/atamalar`,
              "Atamaları Görüntüle"
            );
          }
          
          // İlgili önbellekleri temizle
          this.invalidateCache(`surveyAssignments:${id}`);
          this.invalidateCacheByPrefix(`surveyAssignments:survey:${updatedAssignment.surveyId}`);
          this.invalidateCacheByPrefix(`surveyAssignments:student:${updatedAssignment.studentId}`);
        }
        
        return updatedAssignment;
      }, "updateSurveyAssignmentStatus");
    }, "Anket atama durumu güncellenirken bir hata oluştu");
  }

  /**
   * Anket atamasını sil
   * @param id Atama ID
   * @returns İşlem başarılı ise true, değilse false
   */
  async deleteSurveyAssignment(id: number): Promise<boolean> {
    return this.executeWithErrorHandling(async () => {
      return this.measurePerformance(async () => {
        // Mevcut atamayı al - önbellekten gelir
        const assignment = await this.getSurveyAssignment(id);
        if (!assignment) {
          throw new ServiceError(`ID: ${id} ile anket ataması bulunamadı`, 404);
        }
        
        // Anket ve öğrenci bilgilerini getir - önbellekten gelir
        const survey = await this.getOrSetCache(`surveys:${assignment.surveyId}`, async () => {
          return this.storage.getSurvey(assignment.surveyId);
        });
        
        const studentName = await this.getStudentName(assignment.studentId);
        const surveyTitle = survey ? survey.title : `Anket ID: ${assignment.surveyId}`;
        
        // Atamayı sil
        const result = await this.storage.deleteSurveyAssignment(id);
        
        if (result) {
          // Aktivite kaydı oluştur - BaseService yardımcı metodu
          await this.createActivity(
            'Anket atama silme',
            `${studentName} adlı öğrenciye atanan "${surveyTitle}" anketi silindi.`,
            id
          );
          
          // Bildirim gönder - BaseService yardımcı metodu
          if (survey) {
            this.sendNotification(
              "error",
              "Anket Ataması Silindi",
              `${studentName} adlı öğrenciye atanan "${surveyTitle}" anketi silindi.`,
              "system"
            );
          }
          
          // İlgili önbellekleri temizle
          this.invalidateCache(`surveyAssignments:${id}`);
          this.invalidateCacheByPrefix(`surveyAssignments:survey:${assignment.surveyId}`);
          this.invalidateCacheByPrefix(`surveyAssignments:student:${assignment.studentId}`);
        }
        
        return result;
      }, "deleteSurveyAssignment");
    }, "Anket ataması silinirken bir hata oluştu");
  }
}