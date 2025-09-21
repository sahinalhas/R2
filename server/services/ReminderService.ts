import { BaseService } from './BaseService';
import { Reminder, InsertReminder } from '@shared/schema';
import { createAndSendNotification } from '../websocket';

/**
 * Hatırlatıcı işlemlerini yöneten servis sınıfı
 */
export class ReminderService extends BaseService {
  /**
   * Tüm hatırlatıcıları getir
   * @returns Hatırlatıcı listesi
   */
  async getReminders(): Promise<Reminder[]> {
    return this.storage.getReminders();
  }

  /**
   * Belirli bir randevu için hatırlatıcıları getir
   * @param appointmentId Randevu ID
   * @returns Hatırlatıcı listesi
   */
  async getRemindersByAppointment(appointmentId: number): Promise<Reminder[]> {
    return this.storage.getRemindersByAppointment(appointmentId);
  }

  /**
   * Yeni hatırlatıcı oluştur
   * @param reminder Hatırlatıcı bilgileri
   * @returns Oluşturulan hatırlatıcı
   */
  async createReminder(reminder: any): Promise<Reminder> {
    // Eğer status belirtilmemişse, 'pending' olarak ata
    const reminderData = {
      ...reminder,
      status: reminder.status || 'pending'
    };

    const newReminder = await this.storage.createReminder(reminderData);
    
    try {
      // Randevu ve öğrenci bilgilerini getir
      const appointment = await this.storage.getAppointment(reminder.appointmentId);
      
      if (appointment) {
        const student = await this.storage.getStudent(appointment.studentId);
        const studentName = student 
          ? `${student.firstName} ${student.lastName}` 
          : `Öğrenci ID: ${appointment.studentId}`;
        
        // Aktivite kaydı oluştur
        await this.storage.createActivity({
          type: 'Yeni hatırlatıcı',
          description: `${studentName} adlı öğrenci için ${appointment.date} tarihli randevuya "${reminder.reminderType || 'Standart'}" tipinde hatırlatıcı eklendi.`,
          relatedId: newReminder.id
        });
        
        // Bildirim gönder
        createAndSendNotification(
          "info",
          "Yeni Hatırlatıcı Eklendi",
          `${studentName} için ${appointment.date} tarihli randevuya hatırlatıcı eklendi.`,
          "appointment" as any,
          `/randevular/${appointment.id}`,
          "Hatırlatıcıyı Görüntüle"
        );
      }
    } catch (error) {
      console.error('Hatırlatıcı aktivitesi oluşturulurken hata:', error);
    }
    
    return newReminder;
  }

  /**
   * Hatırlatıcı durumunu güncelle
   * @param id Hatırlatıcı ID
   * @param status Yeni durum
   * @returns Güncellenmiş hatırlatıcı veya undefined
   */
  async updateReminderStatus(id: number, status: string): Promise<Reminder | undefined> {
    const updatedReminder = await this.storage.updateReminderStatus(id, status);
    
    if (updatedReminder) {
      try {
        // Randevu ve öğrenci bilgilerini getir
        const appointment = await this.storage.getAppointment(updatedReminder.appointmentId);
        
        if (appointment) {
          const student = await this.storage.getStudent(appointment.studentId);
          const studentName = student 
            ? `${student.firstName} ${student.lastName}` 
            : `Öğrenci ID: ${appointment.studentId}`;
          
          // Aktivite kaydı oluştur
          await this.storage.createActivity({
            type: 'Hatırlatıcı güncelleme',
            description: `${studentName} adlı öğrenci için ${appointment.date} tarihli randevunun hatırlatıcı durumu "${status}" olarak güncellendi.`,
            relatedId: updatedReminder.id
          });
          
          // Durum değişikliğine göre bildirim gönder
          let notificationType = "info";
          let notificationTitle = "Hatırlatıcı Durumu Güncellendi";
          let notificationMessage = `${studentName} için ${appointment.date} tarihli randevunun hatırlatıcı durumu "${status}" olarak güncellendi.`;
          
          if (status === 'sent') {
            notificationType = "success";
            notificationTitle = "Hatırlatıcı Gönderildi";
            notificationMessage = `${studentName} için ${appointment.date} tarihli randevunun hatırlatıcısı başarıyla gönderildi.`;
          } else if (status === 'failed') {
            notificationType = "error";
            notificationTitle = "Hatırlatıcı Gönderilemedi";
            notificationMessage = `${studentName} için ${appointment.date} tarihli randevunun hatırlatıcısı gönderilemedi.`;
          }
          
          createAndSendNotification(
            notificationType as any,
            notificationTitle,
            notificationMessage,
            "appointment" as any,
            `/randevular/${appointment.id}`,
            "Hatırlatıcıyı Görüntüle"
          );
        }
      } catch (error) {
        console.error('Hatırlatıcı güncelleme aktivitesi oluşturulurken hata:', error);
      }
    }
    
    return updatedReminder;
  }

  /**
   * Hatırlatıcıyı sil
   * @param id Hatırlatıcı ID
   * @returns İşlem başarılı ise true, değilse false
   */
  async deleteReminder(id: number): Promise<boolean> {
    const reminder = await this.getReminderById(id);
    
    if (!reminder) {
      return false;
    }
    
    try {
      // Randevu ve öğrenci bilgilerini getir
      const appointment = await this.storage.getAppointment(reminder.appointmentId);
      
      if (appointment) {
        const student = await this.storage.getStudent(appointment.studentId);
        const studentName = student 
          ? `${student.firstName} ${student.lastName}` 
          : `Öğrenci ID: ${appointment.studentId}`;
        
        const result = await this.storage.deleteReminder(id);
        
        if (result) {
          // Aktivite kaydı oluştur
          await this.storage.createActivity({
            type: 'Hatırlatıcı silme',
            description: `${studentName} adlı öğrenci için ${appointment.date} tarihli randevunun hatırlatıcısı silindi.`,
            relatedId: id
          });
          
          // Bildirim gönder
          createAndSendNotification(
            "error",
            "Hatırlatıcı Silindi",
            `${studentName} için ${appointment.date} tarihli randevunun hatırlatıcısı silindi.`,
            "appointment" as any
          );
        }
        
        return result;
      }
    } catch (error) {
      console.error('Hatırlatıcı silme aktivitesi oluşturulurken hata:', error);
    }
    
    // Eğer randevu ve öğrenci bilgileri alınamazsa, yine de silmeyi dene
    return await this.storage.deleteReminder(id);
  }
  
  /**
   * ID'ye göre hatırlatıcı getir
   * Bu metot storage'da henüz mevcut olmadığı için 
   * getReminders() metodunu kullanarak hatırlatıcıyı buluyoruz
   * @param id Hatırlatıcı ID
   * @returns Hatırlatıcı nesnesi veya undefined
   */
  async getReminderById(id: number): Promise<Reminder | undefined> {
    // Storage'da doğrudan ID ile hatırlatıcı getirme metodu olmadığı için
    // tüm hatırlatıcıları alıp ID ile filtreliyoruz
    const reminders = await this.storage.getReminders();
    return reminders.find(reminder => reminder.id === id);
  }
}