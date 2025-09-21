import { Session, InsertSession, sessions } from '@shared/schema';
import { BaseStorage } from './BaseStorage';
import { eq } from 'drizzle-orm';

/**
 * SessionStorage class for session-related database operations
 */
export class SessionStorage extends BaseStorage {
  /**
   * Get all sessions
   * @returns List of all sessions
   */
  async getSessions(): Promise<Session[]> {
    const db = await this.getDB();
    return db.select().from(sessions);
  }

  /**
   * Get a session by ID
   * @param id Session ID
   * @returns Session or undefined if not found
   */
  async getSession(id: number): Promise<Session | undefined> {
    const db = await this.getDB();
    const results = await db.select().from(sessions).where(eq(sessions.id, id));
    return results.length > 0 ? results[0] : undefined;
  }

  /**
   * Get sessions by student ID
   * @param studentId Student ID
   * @returns List of sessions for the specified student
   */
  async getSessionsByStudentId(studentId: number): Promise<Session[]> {
    const db = await this.getDB();
    return db.select().from(sessions).where(eq(sessions.studentId, studentId));
  }

  /**
   * Create a new session
   * @param session Session data
   * @returns Created session
   */
  async createSession(session: InsertSession): Promise<Session> {
    const db = await this.getDB();
    const [newSession] = await db.insert(sessions).values(session).returning();
    return newSession;
  }

  /**
   * Update a session
   * @param id Session ID
   * @param session Session data to update
   * @returns Updated session or undefined if not found
   */
  async updateSession(id: number, session: Partial<InsertSession>): Promise<Session | undefined> {
    const db = await this.getDB();
    const currentSession = await this.getSession(id);
    
    if (!currentSession) return undefined;
    
    const [updatedSession] = await db.update(sessions)
      .set(session)
      .where(eq(sessions.id, id))
      .returning();
    
    return updatedSession;
  }

  /**
   * Delete a session
   * @param id Session ID
   * @returns true if deleted, false if not found
   */
  async deleteSession(id: number): Promise<boolean> {
    const db = await this.getDB();
    const session = await this.getSession(id);
    
    if (!session) return false;
    
    await db.delete(sessions).where(eq(sessions.id, id));
    return true;
  }
}