import { BaseService, ServiceError, ICrudOperations } from './BaseService';
import { Report, InsertReport } from '@shared/schema';

/**
 * Rapor işlemlerini yöneten servis sınıfı
 */
export class ReportService extends BaseService implements ICrudOperations<Report, InsertReport> {
  /**
   * Tüm raporları getir
   * @returns Rapor listesi
   */
  async getAll(): Promise<Report[]> {
    return this.getOrSetCache('reports:all', async () => {
      return this.storage.getReports();
    }, 60000); // 1 dakikalık önbellek
  }

  /**
   * ID'ye göre raporu getir
   * @param id Rapor ID
   * @returns Rapor nesnesi veya undefined
   */
  async getById(id: number): Promise<Report | undefined> {
    return this.getOrSetCache(`reports:${id}`, async () => {
      return this.storage.getReport(id);
    }, 120000); // 2 dakikalık önbellek
  }

  /**
   * Öğrenci ID'sine göre raporları getir
   * @param studentId Öğrenci ID
   * @returns Rapor listesi
   */
  async getReportsByStudentId(studentId: number): Promise<Report[]> {
    return this.getOrSetCache(`reports:student:${studentId}`, async () => {
      return this.storage.getReportsByStudentId(studentId);
    }, 60000); // 1 dakikalık önbellek
  }

  /**
   * Yeni rapor oluştur
   * @param report Rapor bilgileri
   * @returns Oluşturulan rapor
   */
  async create(report: InsertReport): Promise<Report> {
    return this.executeWithErrorHandling(async () => {
      return this.measurePerformance(async () => {
        // Raporu oluştur
        const newReport = await this.storage.createReport(report);
        
        // Öğrenci bağlantısı kontrolü ve öğrenci adını alma işlemi
        let studentName = 'Belirtilmemiş';
        let studentObj = null;
        
        if (report.studentId !== undefined && report.studentId !== null) {
          studentName = await this.getStudentName(report.studentId);
          studentObj = await this.getOrSetCache(`students:${report.studentId}`, async () => {
            return this.storage.getStudent(report.studentId!);
          });
        }
        
        // Aktivite kaydı metni
        const activityDescription = report.studentId !== undefined && report.studentId !== null
          ? `${studentName} adlı öğrenci için ${report.type} tipinde yeni bir rapor oluşturuldu.`
          : `${report.type} tipinde yeni bir rapor oluşturuldu.`;
        
        // Aktivite kaydı oluştur
        await this.createActivity('Yeni rapor', activityDescription, newReport.id);
        
        // Bildirim gönder (öğrenci bağlantısı varsa)
        if (studentObj) {
          this.sendNotification(
            "info",
            "Yeni Rapor",
            `${studentObj.firstName} ${studentObj.lastName} için yeni bir ${report.type} raporu oluşturuldu.`,
            "report",
            `/raporlar/${newReport.id}`,
            "Raporu Görüntüle"
          );
        }
        
        // Önbellekleri temizle
        this.invalidateCacheByPrefix('reports');
        if (report.studentId !== undefined && report.studentId !== null) {
          this.invalidateCache(`reports:student:${report.studentId}`);
        }
        
        return newReport;
      }, "createReport");
    }, "Rapor oluşturulurken bir hata oluştu");
  }

  /**
   * Rapor bilgilerini güncelle
   * @param id Rapor ID
   * @param report Güncellenecek rapor bilgileri
   * @returns Güncellenmiş rapor veya undefined
   */
  async update(id: number, report: Partial<InsertReport>): Promise<Report | undefined> {
    return this.executeWithErrorHandling(async () => {
      return this.measurePerformance(async () => {
        // Mevcut raporu kontrol et
        const existingReport = await this.getById(id);
        if (!existingReport) {
          throw new ServiceError(`ID: ${id} ile rapor bulunamadı`, 404);
        }
        
        // Raporu güncelle
        const updatedReport = await this.storage.updateReport(id, report);
        
        if (updatedReport) {
          // Değişiklikleri tespit et
          const changes = this.detectReportChanges(existingReport, report);
          const changesText = changes.length > 0 ? changes.join(', ') : 'Detaylar güncellendi';
          
          // Öğrenci bağlantısı kontrolü - güncellenmiş öğrenci ID'si veya mevcut öğrenci ID'si kullan
          const studentId = report.studentId !== undefined ? report.studentId : existingReport.studentId;
          
          // Aktivite kaydı metni
          let activityDescription = `Rapor güncellendi. ${changesText}`;
          let studentObj = null;
          
          if (studentId !== null && studentId !== undefined) {
            const studentName = await this.getStudentName(studentId);
            activityDescription = `${studentName} adlı öğrencinin raporu güncellendi. ${changesText}`;
            
            studentObj = await this.getOrSetCache(`students:${studentId}`, async () => {
              return this.storage.getStudent(studentId!);
            });
          }
          
          // Aktivite kaydı oluştur
          await this.createActivity('Rapor güncelleme', activityDescription, updatedReport.id);
          
          // Bildirim gönder (öğrenci bağlantısı varsa)
          if (studentObj) {
            this.sendNotification(
              "warning",
              "Rapor Güncellendi",
              `${studentObj.firstName} ${studentObj.lastName} için ${updatedReport.type} raporu güncellendi.`,
              "report",
              `/raporlar/${updatedReport.id}`,
              "Raporu Görüntüle"
            );
          }
          
          // Önbellekleri temizle
          this.invalidateCache(`reports:${id}`);
          this.invalidateCacheByPrefix('reports:all');
          
          // Eğer öğrenci değiştiyse eski ve yeni öğrencinin önbelleğini temizle
          if (report.studentId !== undefined && report.studentId !== existingReport.studentId) {
            if (existingReport.studentId !== null && existingReport.studentId !== undefined) {
              this.invalidateCache(`reports:student:${existingReport.studentId}`);
            }
            if (report.studentId !== null && report.studentId !== undefined) {
              this.invalidateCache(`reports:student:${report.studentId}`);
            }
          } else if (studentId !== null && studentId !== undefined) {
            // Öğrenci aynı kaldıysa, sadece o öğrencinin önbelleğini temizle
            this.invalidateCache(`reports:student:${studentId}`);
          }
        }
        
        return updatedReport;
      }, "updateReport");
    }, "Rapor güncellenirken bir hata oluştu");
  }

  /**
   * Raporu sil
   * @param id Rapor ID
   * @returns İşlem başarılı ise true, değilse false
   */
  async delete(id: number): Promise<boolean> {
    return this.executeWithErrorHandling(async () => {
      return this.measurePerformance(async () => {
        // Mevcut raporu kontrol et
        const report = await this.getById(id);
        if (!report) {
          throw new ServiceError(`ID: ${id} ile rapor bulunamadı`, 404);
        }
        
        // Öğrenci bağlantısı kontrolü
        let activityDescription = `"${report.title}" başlıklı rapor silindi.`;
        let studentObj = null;
        
        if (report.studentId !== null && report.studentId !== undefined) {
          const studentName = await this.getStudentName(report.studentId);
          activityDescription = `${studentName} adlı öğrencinin "${report.title}" başlıklı raporu silindi.`;
          
          studentObj = await this.getOrSetCache(`students:${report.studentId}`, async () => {
            return this.storage.getStudent(report.studentId!);
          });
        }
        
        // Önce aktivite kaydı oluştur (silmeden önce)
        await this.createActivity('Rapor silme', activityDescription, id);
        
        // Bildirim gönder (öğrenci bağlantısı varsa)
        if (studentObj) {
          this.sendNotification(
            "error",
            "Rapor Silindi",
            `${studentObj.firstName} ${studentObj.lastName} için oluşturulan ${report.type} raporu silindi.`,
            "report"
          );
        }
        
        // Raporu sil
        const result = await this.storage.deleteReport(id);
        
        // Önbellekleri temizle
        if (result) {
          this.invalidateCache(`reports:${id}`);
          this.invalidateCacheByPrefix('reports:all');
          
          if (report.studentId !== null && report.studentId !== undefined) {
            this.invalidateCache(`reports:student:${report.studentId}`);
          }
        }
        
        return result;
      }, "deleteReport");
    }, "Rapor silinirken bir hata oluştu");
  }
  
  /**
   * Rapordaki değişiklikleri tespit et
   * @param existingReport Mevcut rapor
   * @param updatedData Güncellenmiş veriler
   * @returns Değişikliklerin açıklaması
   */
  private detectReportChanges(existingReport: Report, updatedData: Partial<InsertReport>): string[] {
    const changes = [];
    
    if (updatedData.title !== undefined && updatedData.title !== existingReport.title) {
      changes.push(`Başlık: "${existingReport.title}" -> "${updatedData.title}"`);
    }
    
    if (updatedData.type !== undefined && updatedData.type !== existingReport.type) {
      changes.push(`Tür: "${existingReport.type}" -> "${updatedData.type}"`);
    }
    
    if (updatedData.content !== undefined && updatedData.content !== existingReport.content) {
      changes.push(`İçerik güncellendi`);
    }
    
    if (updatedData.studentId !== undefined && updatedData.studentId !== existingReport.studentId) {
      const oldStudentPromise = existingReport.studentId !== null && existingReport.studentId !== undefined
        ? this.getStudentName(existingReport.studentId) 
        : Promise.resolve("Öğrenci bağlantısı yok");
      
      const newStudentPromise = updatedData.studentId !== null && updatedData.studentId !== undefined
        ? this.getStudentName(updatedData.studentId)
        : Promise.resolve("Öğrenci bağlantısı yok");
      
      Promise.all([oldStudentPromise, newStudentPromise])
        .then(([oldStudentName, newStudentName]) => {
          changes.push(`Öğrenci: "${oldStudentName}" -> "${newStudentName}"`);
        })
        .catch(error => {
          console.error('Öğrenci adları alınırken hata:', error);
          changes.push('Öğrenci değiştirildi');
        });
    }
    
    return changes;
  }
  
  /**
   * Eski API uyumluluğu için metotlar
   */
  async getReports(): Promise<Report[]> {
    return this.getAll();
  }
  
  async getReport(id: number): Promise<Report | undefined> {
    return this.getById(id);
  }
  
  async createReport(report: InsertReport): Promise<Report> {
    return this.create(report);
  }
  
  async updateReport(id: number, report: Partial<InsertReport>): Promise<Report | undefined> {
    return this.update(id, report);
  }
  
  async deleteReport(id: number): Promise<boolean> {
    return this.delete(id);
  }
}