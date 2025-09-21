import { Reminder, InsertReminder, reminders } from '@shared/schema';
import { BaseStorage } from './BaseStorage';
import { eq } from 'drizzle-orm';

/**
 * ReminderStorage class for reminder-related database operations
 */
export class ReminderStorage extends BaseStorage {
  /**
   * Get all reminders
   * @returns List of all reminders
   */
  async getReminders(): Promise<Reminder[]> {
    const db = await this.getDB();
    return db.select().from(reminders);
  }
  
  /**
   * Get reminders for a specific appointment
   * @param appointmentId Appointment ID
   * @returns List of reminders for the specified appointment
   */
  async getRemindersByAppointment(appointmentId: number): Promise<Reminder[]> {
    const db = await this.getDB();
    return db.select().from(reminders).where(eq(reminders.appointmentId, appointmentId));
  }
  
  /**
   * Create a new reminder
   * @param reminder Reminder data
   * @returns Created reminder
   */
  async createReminder(reminder: InsertReminder): Promise<Reminder> {
    const db = await this.getDB();
    const [newReminder] = await db.insert(reminders).values(reminder).returning();
    return newReminder;
  }
  
  /**
   * Update reminder status
   * @param id Reminder ID
   * @param status New status
   * @returns Updated reminder or undefined if not found
   */
  async updateReminderStatus(id: number, status: string): Promise<Reminder | undefined> {
    const db = await this.getDB();
    const currentReminder = await db.select().from(reminders).where(eq(reminders.id, id));
    
    if (currentReminder.length === 0) return undefined;
    
    const [updatedReminder] = await db.update(reminders)
      .set({ status })
      .where(eq(reminders.id, id))
      .returning();
    
    return updatedReminder;
  }
  
  /**
   * Delete a reminder
   * @param id Reminder ID
   * @returns true if deleted, false if not found
   */
  async deleteReminder(id: number): Promise<boolean> {
    const db = await this.getDB();
    const reminder = await db.select().from(reminders).where(eq(reminders.id, id));
    
    if (reminder.length === 0) return false;
    
    await db.delete(reminders).where(eq(reminders.id, id));
    return true;
  }
}