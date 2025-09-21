import { Appointment, InsertAppointment, appointments } from '@shared/schema';
import { BaseStorage } from './BaseStorage';
import { eq } from 'drizzle-orm';

/**
 * AppointmentStorage class for appointment-related database operations
 */
export class AppointmentStorage extends BaseStorage {
  /**
   * Get all appointments
   * @returns List of all appointments
   */
  async getAppointments(): Promise<Appointment[]> {
    const db = await this.getDB();
    return db.select().from(appointments);
  }

  /**
   * Get an appointment by ID
   * @param id Appointment ID
   * @returns Appointment or undefined if not found
   */
  async getAppointment(id: number): Promise<Appointment | undefined> {
    const db = await this.getDB();
    const results = await db.select().from(appointments).where(eq(appointments.id, id));
    return results.length > 0 ? results[0] : undefined;
  }

  /**
   * Get appointments by student ID
   * @param studentId Student ID
   * @returns List of appointments for the specified student
   */
  async getAppointmentsByStudentId(studentId: number): Promise<Appointment[]> {
    const db = await this.getDB();
    return db.select().from(appointments).where(eq(appointments.studentId, studentId));
  }

  /**
   * Get appointments by date
   * @param date Date in YYYY-MM-DD format
   * @returns List of appointments for the specified date
   */
  async getAppointmentsByDate(date: string): Promise<Appointment[]> {
    const db = await this.getDB();
    return db.select().from(appointments).where(eq(appointments.date, date));
  }

  /**
   * Create a new appointment
   * @param appointment Appointment data
   * @returns Created appointment
   */
  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const db = await this.getDB();
    const [newAppointment] = await db.insert(appointments).values(appointment).returning();
    return newAppointment;
  }

  /**
   * Update an appointment
   * @param id Appointment ID
   * @param appointment Appointment data to update
   * @returns Updated appointment or undefined if not found
   */
  async updateAppointment(id: number, appointment: Partial<InsertAppointment>): Promise<Appointment | undefined> {
    const db = await this.getDB();
    const currentAppointment = await this.getAppointment(id);
    
    if (!currentAppointment) return undefined;
    
    const [updatedAppointment] = await db.update(appointments)
      .set(appointment)
      .where(eq(appointments.id, id))
      .returning();
    
    return updatedAppointment;
  }

  /**
   * Delete an appointment
   * @param id Appointment ID
   * @returns true if deleted, false if not found
   */
  async deleteAppointment(id: number): Promise<boolean> {
    const db = await this.getDB();
    const appointment = await this.getAppointment(id);
    
    if (!appointment) return false;
    
    await db.delete(appointments).where(eq(appointments.id, id));
    return true;
  }
}