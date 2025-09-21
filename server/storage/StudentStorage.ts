import { Student, InsertStudent, students } from '@shared/schema';
import { BaseStorage } from './BaseStorage';
import { eq } from 'drizzle-orm';

/**
 * StudentStorage class for student-related database operations
 */
export class StudentStorage extends BaseStorage {
  /**
   * Get all students
   * @returns List of all students
   */
  async getStudents(): Promise<Student[]> {
    const db = await this.getDB();
    return db.select().from(students);
  }

  /**
   * Get a student by ID
   * @param id Student ID
   * @returns Student or undefined if not found
   */
  async getStudent(id: number): Promise<Student | undefined> {
    const db = await this.getDB();
    const results = await db.select().from(students).where(eq(students.id, id));
    return results.length > 0 ? results[0] : undefined;
  }

  /**
   * Create a new student
   * @param student Student data
   * @returns Created student
   */
  async createStudent(student: InsertStudent): Promise<Student> {
    const db = await this.getDB();
    const [newStudent] = await db.insert(students).values(student).returning();
    return newStudent;
  }

  /**
   * Update a student
   * @param id Student ID
   * @param student Student data to update
   * @returns Updated student or undefined if not found
   */
  async updateStudent(id: number, student: Partial<InsertStudent>): Promise<Student | undefined> {
    const db = await this.getDB();
    const currentStudent = await this.getStudent(id);
    
    if (!currentStudent) return undefined;
    
    const [updatedStudent] = await db.update(students)
      .set(student)
      .where(eq(students.id, id))
      .returning();
    
    return updatedStudent;
  }

  /**
   * Delete a student
   * @param id Student ID
   * @returns true if deleted, false if not found
   */
  async deleteStudent(id: number): Promise<boolean> {
    const db = await this.getDB();
    const student = await this.getStudent(id);
    
    if (!student) return false;
    
    await db.delete(students).where(eq(students.id, id));
    return true;
  }
}