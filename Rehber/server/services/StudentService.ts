import { BaseService, ICrudOperations } from './BaseService';
import { Student, InsertStudent, Appointment, Session, Report } from '@shared/schema';
import { NotFoundError, ValidationError } from '../utils/errors';
import { Logger, LogSource } from '../utils/logger';

/**
 * Öğrenci işlemlerini yöneten servis sınıfı
 */
export class StudentService extends BaseService implements ICrudOperations<Student, InsertStudent> {
  /**
   * Tüm öğrencileri getir
   * @returns Öğrenci listesi
   */
  async getAll(): Promise<Student[]> {
    return this.getOrSetCache('students:all', async () => {
      return this.storage.getStudents();
    }, 120000); // 2 dakikalık önbellek - öğrenci listesi sık değişmez
  }

  /**
   * ID'ye göre öğrenciyi getir
   * @param id Öğrenci ID
   * @returns Öğrenci nesnesi veya undefined
   */
  async getById(id: number): Promise<Student | undefined> {
    return this.getOrSetCache(`students:${id}`, async () => {
      return this.storage.getStudent(id);
    }, 180000); // 3 dakikalık önbellek
  }

  /**
   * Yeni öğrenci oluştur
   * @param student Öğrenci bilgileri
   * @returns Oluşturulan öğrenci
   */
  async create(student: InsertStudent): Promise<Student> {
    return this.executeWithErrorHandling(async () => {
      return this.measurePerformance(async () => {
        // Öğrenciyi veritabanına ekle
        const newStudent = await this.storage.createStudent(student);
        
        // Aktivite kaydı oluştur (BaseService'den gelen yardımcı metot)
        await this.createActivity(
          'Yeni öğrenci',
          `${student.firstName} ${student.lastName} adlı öğrenci sisteme eklendi.`,
          newStudent.id
        );
        
        // Bildirim gönder
        this.sendNotification(
          "success",
          "Yeni Öğrenci",
          `${student.firstName} ${student.lastName} adlı öğrenci başarıyla sisteme eklendi.`,
          "student",
          `/ogrenciler/${newStudent.id}`,
          "Öğrenciyi Görüntüle"
        );
        
        // Öğrenciler önbelleğini temizle
        this.invalidateCacheByPrefix('students');
        
        return newStudent;
      }, "createStudent");
    }, "Öğrenci oluşturulurken bir hata oluştu");
  }

  /**
   * Öğrenci bilgilerini güncelle
   * @param id Öğrenci ID
   * @param student Güncellenecek öğrenci bilgileri
   * @returns Güncellenmiş öğrenci veya undefined
   */
  async update(id: number, student: Partial<InsertStudent>): Promise<Student | undefined> {
    return this.executeWithErrorHandling(async () => {
      return this.measurePerformance(async () => {
        // Mevcut öğrenciyi kontrol et
        const existingStudent = await this.getById(id);
        if (!existingStudent) {
          Logger.warn(LogSource.SERVICE, `ID: ${id} ile öğrenci bulunamadı`);
          throw new NotFoundError(`ID: ${id} ile öğrenci bulunamadı`, {
            entityId: id,
            entityType: 'Student'
          });
        }
        
        // Öğrenciyi güncelle
        const updatedStudent = await this.storage.updateStudent(id, student);
        
        if (updatedStudent) {
          // Aktivite kaydı oluştur (BaseService'den gelen yardımcı metot)
          await this.createActivity(
            'Öğrenci güncelleme',
            `${updatedStudent.firstName} ${updatedStudent.lastName} adlı öğrencinin bilgileri güncellendi.`,
            updatedStudent.id
          );
          
          // Bildirim gönder
          this.sendNotification(
            "info",
            "Öğrenci Güncellendi",
            `${updatedStudent.firstName} ${updatedStudent.lastName} adlı öğrencinin bilgileri güncellendi.`,
            "student",
            `/ogrenciler/${updatedStudent.id}`,
            "Öğrenciyi Görüntüle"
          );
          
          // Öğrenciler önbelleğini temizle
          this.invalidateCacheByPrefix('students');
          
          // Spesifik önbellekleri temizle
          this.invalidateCache(`students:${id}`);
        }
        
        return updatedStudent;
      }, "updateStudent");
    }, "Öğrenci güncellenirken bir hata oluştu");
  }

  /**
   * Öğrenciyi sil
   * @param id Öğrenci ID
   * @returns İşlem başarılı ise true, değilse false
   */
  async delete(id: number): Promise<boolean> {
    return this.executeWithErrorHandling(async () => {
      return this.measurePerformance(async () => {
        // Mevcut öğrenciyi kontrol et
        const student = await this.getById(id);
        if (!student) {
          Logger.warn(LogSource.SERVICE, `ID: ${id} ile öğrenci bulunamadı`);
          throw new NotFoundError(`ID: ${id} ile öğrenci bulunamadı`, {
            entityId: id,
            entityType: 'Student'
          });
        }
        
        // Öğrenciyi sil
        const result = await this.storage.deleteStudent(id);
        
        if (result) {
          // Aktivite kaydı oluştur (BaseService'den gelen yardımcı metot)
          await this.createActivity(
            'Öğrenci silme',
            `${student.firstName} ${student.lastName} adlı öğrenci sistemden silindi.`,
            id
          );
          
          // Bildirim gönder
          this.sendNotification(
            "error",
            "Öğrenci Silindi",
            `${student.firstName} ${student.lastName} adlı öğrenci sistemden silindi.`,
            "student"
          );
          
          // Öğrenciler önbelleğini temizle
          this.invalidateCacheByPrefix('students');
          
          // İlgili öğrencinin randevuları, görüşmeleri ve raporları önbelleğini temizle
          this.invalidateCacheByPrefix(`appointments:student:${id}`);
          this.invalidateCacheByPrefix(`sessions:student:${id}`);
          this.invalidateCacheByPrefix(`reports:student:${id}`);
        }
        
        return result;
      }, "deleteStudent");
    }, "Öğrenci silinirken bir hata oluştu");
  }

  /**
   * Belirli bir öğrencinin tüm randevularını getir
   * @param studentId Öğrenci ID
   * @returns Randevu listesi
   */
  async getStudentAppointments(studentId: number): Promise<Appointment[]> {
    return this.getOrSetCache(`appointments:student:${studentId}`, async () => {
      return this.storage.getAppointmentsByStudentId(studentId);
    }, 30000); // 30 saniyelik önbellek - sık güncellenen veri
  }

  /**
   * Belirli bir öğrencinin tüm görüşmelerini getir
   * @param studentId Öğrenci ID
   * @returns Görüşme listesi
   */
  async getStudentSessions(studentId: number): Promise<Session[]> {
    return this.getOrSetCache(`sessions:student:${studentId}`, async () => {
      return this.storage.getSessionsByStudentId(studentId);
    }, 60000); // 1 dakikalık önbellek
  }

  /**
   * Belirli bir öğrencinin tüm raporlarını getir
   * @param studentId Öğrenci ID
   * @returns Rapor listesi
   */
  async getStudentReports(studentId: number): Promise<Report[]> {
    return this.getOrSetCache(`reports:student:${studentId}`, async () => {
      return this.storage.getReportsByStudentId(studentId);
    }, 120000); // 2 dakikalık önbellek - raporlar sık değişmez
  }
  
  /**
   * Eski API uyumluluğu için metotlar
   */
  async getStudents(): Promise<Student[]> {
    return this.getAll();
  }
  
  async getStudent(id: number): Promise<Student | undefined> {
    return this.getById(id);
  }
  
  async createStudent(student: InsertStudent): Promise<Student> {
    return this.create(student);
  }
  
  async updateStudent(id: number, student: Partial<InsertStudent>): Promise<Student | undefined> {
    return this.update(id, student);
  }
  
  async deleteStudent(id: number): Promise<boolean> {
    return this.delete(id);
  }
}