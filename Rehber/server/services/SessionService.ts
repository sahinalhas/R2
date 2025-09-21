import { BaseService, ICrudOperations } from './BaseService';
import { Session, InsertSession } from '@shared/schema';
import { createAndSendNotification } from '../websocket';
import { NotFoundError, ValidationError } from '../utils/errors';
import { Logger, LogSource } from '../utils/logger';

/**
 * Görüşme işlemlerini yöneten servis sınıfı
 */
export class SessionService extends BaseService implements ICrudOperations<Session, InsertSession> {
  /**
   * Tüm görüşmeleri getir
   * @returns Görüşme listesi
   */
  async getAll(): Promise<Session[]> {
    return this.executeWithErrorHandling(async () => {
      return this.getOrSetCache('sessions:all', async () => {
        Logger.debug(LogSource.SERVICE, 'Tüm görüşmeler getiriliyor');
        return this.storage.getSessions();
      });
    }, "Görüşme listesi alınırken bir hata oluştu");
  }
  
  // Eski API için uyumluluk metodu
  async getSessions(): Promise<Session[]> {
    return this.getAll();
  }

  /**
   * ID'ye göre görüşmeyi getir
   * @param id Görüşme ID
   * @returns Görüşme nesnesi veya undefined
   */
  async getById(id: number): Promise<Session | undefined> {
    return this.executeWithErrorHandling(async () => {
      return this.getOrSetCache(`sessions:${id}`, async () => {
        Logger.debug(LogSource.SERVICE, `ID: ${id} ile görüşme getiriliyor`);
        return this.storage.getSession(id);
      });
    }, "Görüşme bilgisi alınırken bir hata oluştu");
  }
  
  // Eski API için uyumluluk metodu
  async getSession(id: number): Promise<Session | undefined> {
    return this.getById(id);
  }

  /**
   * Öğrenci ID'sine göre görüşmeleri getir
   * @param studentId Öğrenci ID
   * @returns Görüşme listesi
   */
  async getSessionsByStudentId(studentId: number): Promise<Session[]> {
    return this.storage.getSessionsByStudentId(studentId);
  }

  /**
   * Yeni görüşme oluştur
   * @param session Görüşme bilgileri
   * @returns Oluşturulan görüşme
   */
  async create(session: InsertSession): Promise<Session> {
    return this.executeWithErrorHandling(async () => {
      return this.measurePerformance(async () => {
        // Görüşme oluştur
        const newSession = await this.storage.createSession(session);
        
        // Öğrenci bilgilerini getir
        const student = await this.storage.getStudent(session.studentId);
        const studentName = student 
          ? `${student.firstName} ${student.lastName}` 
          : `ID: ${session.studentId}`;
        
        // Aktivite kaydı oluştur
        await this.createActivity(
          'Yeni görüşme',
          `${studentName} adlı öğrenci ile ${session.date} tarihinde görüşme gerçekleştirildi.`,
          newSession.id
        );
        
        // Bildirim gönder
        if (student) {
          this.sendNotification(
            "success",
            "Yeni Görüşme Kaydı",
            `${student.firstName} ${student.lastName} ile yeni bir görüşme kaydı oluşturuldu.`,
            "session",
            `/gorusmeler/${newSession.id}`,
            "Görüşmeyi Görüntüle"
          );
        }
        
        // Önbelleği temizle
        this.invalidateCacheByPrefix('sessions');
        
        return newSession;
      }, "createSession");
    }, "Görüşme kaydı oluşturulurken bir hata oluştu");
  }
  
  // Eski API için uyumluluk metodu
  async createSession(session: InsertSession): Promise<Session> {
    return this.create(session);
  }

  /**
   * Görüşme bilgilerini güncelle
   * @param id Görüşme ID
   * @param session Güncellenecek görüşme bilgileri
   * @returns Güncellenmiş görüşme veya undefined
   */
  async update(id: number, session: Partial<InsertSession>): Promise<Session | undefined> {
    return this.executeWithErrorHandling(async () => {
      return this.measurePerformance(async () => {
        // Mevcut görüşmeyi kontrol et
        const existingSession = await this.getById(id);
        if (!existingSession) {
          Logger.warn(LogSource.SERVICE, `ID: ${id} ile görüşme bulunamadı`);
          throw new NotFoundError(`ID: ${id} ile görüşme bulunamadı`, {
            entityId: id,
            entityType: 'Session'
          });
        }
        
        // Görüşmeyi güncelle
        const updatedSession = await this.storage.updateSession(id, session);
        
        if (updatedSession) {
          // Öğrenci bilgilerini getir
          const studentId = session.studentId || updatedSession.studentId;
          const student = await this.storage.getStudent(studentId);
          const studentName = student 
            ? `${student.firstName} ${student.lastName}` 
            : `ID: ${studentId}`;
          
          // Aktivite kaydı oluştur
          await this.createActivity(
            'Görüşme güncelleme',
            `${studentName} adlı öğrencinin ${updatedSession.date} tarihli görüşme kaydı güncellendi.`,
            updatedSession.id
          );
          
          // Bildirim gönder
          if (student) {
            this.sendNotification(
              "warning",
              "Görüşme Kaydı Güncellendi",
              `${student.firstName} ${student.lastName} ile gerçekleştirilen görüşme kaydı güncellendi.`,
              "session",
              `/gorusmeler/${updatedSession.id}`,
              "Görüşmeyi Görüntüle"
            );
          }
          
          // Önbelleği temizle
          this.invalidateCacheByPrefix('sessions');
          this.invalidateCache(`sessions:${id}`);
          this.invalidateCache(`sessions:student:${studentId}`);
        }
        
        return updatedSession;
      }, "updateSession");
    }, "Görüşme kaydı güncellenirken bir hata oluştu");
  }
  
  // Eski API için uyumluluk metodu
  async updateSession(id: number, session: Partial<InsertSession>): Promise<Session | undefined> {
    return this.update(id, session);
  }

  /**
   * Görüşmeyi sil
   * @param id Görüşme ID
   * @returns İşlem başarılı ise true, değilse false
   */
  async delete(id: number): Promise<boolean> {
    return this.executeWithErrorHandling(async () => {
      return this.measurePerformance(async () => {
        // Mevcut görüşmeyi kontrol et
        const session = await this.getById(id);
        if (!session) {
          Logger.warn(LogSource.SERVICE, `ID: ${id} ile görüşme bulunamadı`);
          throw new NotFoundError(`ID: ${id} ile görüşme bulunamadı`, {
            entityId: id,
            entityType: 'Session'
          });
        }
        
        // Öğrenci bilgilerini getir
        const student = await this.storage.getStudent(session.studentId);
        const studentName = student 
          ? `${student.firstName} ${student.lastName}` 
          : `ID: ${session.studentId}`;
        
        // Görüşmeyi sil
        const result = await this.storage.deleteSession(id);
        
        if (result) {
          // Aktivite kaydı oluştur
          await this.createActivity(
            'Görüşme silme',
            `${studentName} adlı öğrencinin ${session.date} tarihli görüşme kaydı silindi.`,
            id
          );
          
          // Bildirim gönder
          if (student) {
            this.sendNotification(
              "error",
              "Görüşme Kaydı Silindi",
              `${student.firstName} ${student.lastName} ile gerçekleştirilen görüşme kaydı silindi.`,
              "session"
            );
          }
          
          // Önbelleği temizle
          this.invalidateCacheByPrefix('sessions');
          this.invalidateCache(`sessions:student:${session.studentId}`);
        }
        
        return result;
      }, "deleteSession");
    }, "Görüşme kaydı silinirken bir hata oluştu");
  }
  
  // Eski API için uyumluluk metodu
  async deleteSession(id: number): Promise<boolean> {
    return this.delete(id);
  }
}