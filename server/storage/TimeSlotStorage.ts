import { BaseStorage } from './BaseStorage';
import { appointments } from '@shared/schema';
import { eq } from 'drizzle-orm';

// TimeSlot arayüzü
export interface TimeSlot {
  startTime: string;
  endTime: string;
}

/**
 * TimeSlotStorage class for managing available time slots
 */
export class TimeSlotStorage extends BaseStorage {
  /**
   * Get available time slots for a specific date
   * @param date Date in YYYY-MM-DD format
   * @returns List of available time slots
   */
  async getAvailableTimeSlots(date: string): Promise<{ startTime: string, endTime: string }[]> {
    const db = await this.getDB();
    
    // Sabit saat dilimlerini kullan (Çalışma saatleri artık kullanılmadığı için sabit saatler kullanıyoruz)
    // Sabah 9:00'dan akşam 17:00'a kadar, 30'ar dakikalık dilimler
    const defaultStartTime = 9 * 60; // 9:00 (dakika cinsinden)
    const defaultEndTime = 17 * 60;  // 17:00 (dakika cinsinden)
    const slotDuration = 30;         // 30 dakika
    
    // Get appointments for the requested date
    const appointmentsForDate = await db.select()
      .from(appointments)
      .where(eq(appointments.date, date));
    
    // Calculate booked slots
    const bookedSlots: { start: number, end: number }[] = appointmentsForDate.map(appointment => {
      const startTime = appointment.time;
      
      // Convert start time to minutes
      const [startHour, startMinute] = startTime.split(':').map(Number);
      const startInMinutes = startHour * 60 + startMinute;
      
      // Calculate end time in minutes based on duration
      const endInMinutes = startInMinutes + appointment.duration;
      
      return { start: startInMinutes, end: endInMinutes };
    });
    
    // Generate available slots
    const availableSlots: { startTime: string, endTime: string }[] = [];
    
    // Generate standard slots between 9:00-17:00
    for (let slotStart = defaultStartTime; slotStart < defaultEndTime; slotStart += slotDuration) {
      const slotEnd = Math.min(slotStart + slotDuration, defaultEndTime);
      
      // Format times
      const startTime = `${Math.floor(slotStart / 60).toString().padStart(2, '0')}:${(slotStart % 60).toString().padStart(2, '0')}`;
      const endTime = `${Math.floor(slotEnd / 60).toString().padStart(2, '0')}:${(slotEnd % 60).toString().padStart(2, '0')}`;
      
      // Check if slot is available (not overlapping with any booked slot)
      const isAvailable = !bookedSlots.some(bookedSlot => {
        // Check for overlap
        return (
          (slotStart < bookedSlot.end && slotEnd > bookedSlot.start) ||
          (bookedSlot.start < slotEnd && bookedSlot.end > slotStart)
        );
      });
      
      if (isAvailable) {
        availableSlots.push({ startTime, endTime });
      }
    }
    
    return availableSlots;
  }
}