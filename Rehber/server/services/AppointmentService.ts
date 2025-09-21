import { BaseService, ICrudOperations } from './BaseService';
import { Appointment, InsertAppointment } from '@shared/schema';
import { TimeSlot } from '../storage/TimeSlotStorage';
import { NotFoundError, ValidationError } from '../utils/errors';
import { Logger, LogSource } from '../utils/logger';

/**
 * Randevu işlemlerini yöneten servis sınıfı
 */
export class AppointmentService extends BaseService implements ICrudOperations<Appointment, InsertAppointment> {
  /**
   * Tüm randevuları getir
   * @returns Randevu listesi
   */
  async getAll(): Promise<Appointment[]> {
    return this.getOrSetCache('appointments:all', async () => {
      return this.storage.getAppointments();
    }, 30000); // 30 saniyelik önbellek - sık güncellenen veri
  }

  /**
   * ID'ye göre randevuyu getir
   * @param id Randevu ID
   * @returns Randevu nesnesi veya undefined
   */
  async getById(id: number): Promise<Appointment | undefined> {
    return this.getOrSetCache(`appointments:${id}`, async () => {
      return this.storage.getAppointment(id);
    }, 60000); // 1 dakikalık önbellek
  }

  /**
   * Öğrenci ID'sine göre randevuları getir
   * @param studentId Öğrenci ID
   * @returns Randevu listesi
   */
  async getAppointmentsByStudentId(studentId: number): Promise<Appointment[]> {
    return this.getOrSetCache(`appointments:student:${studentId}`, async () => {
      return this.storage.getAppointmentsByStudentId(studentId);
    }, 30000); // 30 saniyelik önbellek
  }

  /**
   * Tarihe göre randevuları getir
   * @param date Tarih
   * @returns Randevu listesi
   */
  async getAppointmentsByDate(date: string): Promise<Appointment[]> {
    return this.getOrSetCache(`appointments:date:${date}`, async () => {
      return this.storage.getAppointmentsByDate(date);
    }, 30000); // 30 saniyelik önbellek
  }

  /**
   * Yeni randevu oluştur
   * @param appointment Randevu bilgileri
   * @returns Oluşturulan randevu
   */
  async create(appointment: InsertAppointment): Promise<Appointment> {
    return this.executeWithErrorHandling(async () => {
      // Performans ölçümü başlat
      return this.measurePerformance(async () => {
        // Randevu oluştur
        const newAppointment = await this.storage.createAppointment(appointment);
        
        // Öğrenci adını getir (BaseService'den gelen yardımcı metot)
        const studentName = await this.getStudentName(appointment.studentId);
        
        // Aktivite kaydı oluştur (BaseService'den gelen yardımcı metot)
        await this.createActivity(
          'Yeni randevu',
          `${studentName} adlı öğrenci için ${appointment.date} tarihinde ${appointment.appointmentType} türünde randevu oluşturuldu.`,
          newAppointment.id
        );
        
        // Bildirim gönder (BaseService'den gelen yardımcı metot)
        const student = await this.storage.getStudent(appointment.studentId);
        if (student) {
          this.sendNotification(
            "info",
            "Yeni Randevu",
            `${student.firstName} ${student.lastName} için ${newAppointment.date} tarihinde ${newAppointment.time} saatinde bir randevu oluşturuldu.`,
            "appointment",
            `/randevular/${newAppointment.id}`,
            "Randevuyu Görüntüle"
          );
        }
        
        // Randevularla ilgili önbellekleri temizle
        this.invalidateCacheByPrefix('appointments');
        
        return newAppointment;
      }, "createAppointment");
    }, "Randevu oluşturulurken bir hata oluştu");
  }

  /**
   * Randevu bilgilerini güncelle
   * @param id Randevu ID
   * @param appointment Güncellenecek randevu bilgileri
   * @returns Güncellenmiş randevu veya undefined
   */
  async update(id: number, appointment: Partial<InsertAppointment>): Promise<Appointment | undefined> {
    return this.executeWithErrorHandling(async () => {
      // Performans ölçümü başlat
      return this.measurePerformance(async () => {
        // Mevcut randevuyu kontrol et
        const existingAppointment = await this.getById(id);
        if (!existingAppointment) {
          Logger.warn(LogSource.SERVICE, `ID: ${id} ile randevu bulunamadı`);
          throw new NotFoundError(`ID: ${id} ile randevu bulunamadı`, {
            entityId: id,
            entityType: 'Appointment'
          });
        }
        
        // Randevuyu güncelle
        const updatedAppointment = await this.storage.updateAppointment(id, appointment);
        
        if (updatedAppointment) {
          // Öğrenci ID'sini belirle
          const studentId = appointment.studentId || existingAppointment.studentId;
          
          // Öğrenci adını getir (BaseService'den gelen yardımcı metot)
          const studentName = await this.getStudentName(studentId);
          
          // Aktivite kaydı oluştur (BaseService'den gelen yardımcı metot)
          await this.createActivity(
            'Randevu güncelleme',
            `${studentName} adlı öğrencinin ${updatedAppointment.date} tarihli randevusu güncellendi.`,
            updatedAppointment.id
          );
          
          // Bildirim gönder (BaseService'den gelen yardımcı metot)
          const student = await this.storage.getStudent(studentId);
          if (student) {
            this.sendNotification(
              "warning",
              "Randevu Güncellendi",
              `${student.firstName} ${student.lastName} için randevu bilgileri güncellendi.`,
              "appointment",
              `/randevular/${updatedAppointment.id}`,
              "Randevuyu Görüntüle"
            );
          }
          
          // Randevularla ilgili önbellekleri temizle
          this.invalidateCacheByPrefix('appointments');
          
          // Spesifik önbellekleri temizle
          this.invalidateCache(`appointments:${id}`);
          this.invalidateCache(`appointments:student:${studentId}`);
          this.invalidateCache(`appointments:date:${updatedAppointment.date}`);
        }
        
        return updatedAppointment;
      }, "updateAppointment");
    }, "Randevu güncellenirken bir hata oluştu");
  }

  /**
   * Randevuyu sil
   * @param id Randevu ID
   * @returns İşlem başarılı ise true, değilse false
   */
  async delete(id: number): Promise<boolean> {
    return this.executeWithErrorHandling(async () => {
      // Performans ölçümü başlat
      return this.measurePerformance(async () => {
        // Mevcut randevuyu bul
        const appointment = await this.getById(id);
        if (!appointment) {
          Logger.warn(LogSource.SERVICE, `ID: ${id} ile randevu bulunamadı`);
          throw new NotFoundError(`ID: ${id} ile randevu bulunamadı`, {
            entityId: id,
            entityType: 'Appointment'
          });
        }
        
        // Öğrenci adını getir (BaseService'den gelen yardımcı metot)
        const studentName = await this.getStudentName(appointment.studentId);
        
        // Randevuyu sil
        const result = await this.storage.deleteAppointment(id);
        
        if (result) {
          // Aktivite kaydı oluştur (BaseService'den gelen yardımcı metot)
          await this.createActivity(
            'Randevu silme',
            `${studentName} adlı öğrencinin ${appointment.date} tarihli randevusu silindi.`,
            id
          );
          
          // Bildirim gönder (BaseService'den gelen yardımcı metot)
          const student = await this.storage.getStudent(appointment.studentId);
          if (student) {
            this.sendNotification(
              "error",
              "Randevu İptal Edildi",
              `${student.firstName} ${student.lastName} için ${appointment.date} tarihindeki randevu iptal edildi.`,
              "appointment"
            );
          }
          
          // Randevularla ilgili önbellekleri temizle
          this.invalidateCacheByPrefix('appointments');
        }
        
        return result;
      }, "deleteAppointment");
    }, "Randevu silinirken bir hata oluştu");
  }
  
  /**
   * Belirli bir tarih için uygun zaman aralıklarını getir
   * @param date YYYY-MM-DD formatında tarih
   * @returns Uygun zaman aralıkları listesi
   */
  async getAvailableTimeSlots(date: string): Promise<{ startTime: string, endTime: string }[]> {
    return this.getOrSetCache(`timeSlots:${date}`, async () => {
      return this.storage.getAvailableTimeSlots(date);
    }, 30000); // 30 saniyelik önbellek
  }
  
  /**
   * Eski API uyumluluğu için metotlar
   */
  async getAppointments(): Promise<Appointment[]> {
    return this.getAll();
  }
  
  async getAppointment(id: number): Promise<Appointment | undefined> {
    return this.getById(id);
  }
  
  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    return this.create(appointment);
  }
  
  async updateAppointment(id: number, appointment: Partial<InsertAppointment>): Promise<Appointment | undefined> {
    return this.update(id, appointment);
  }
  
  async deleteAppointment(id: number): Promise<boolean> {
    return this.delete(id);
  }
}