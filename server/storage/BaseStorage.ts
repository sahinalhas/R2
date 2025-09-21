import { getDB } from '../db';
import { eq, and, gte, lte, isNull, not, sql } from 'drizzle-orm';

/**
 * BaseStorage class that provides common functionality for all storage classes
 */
export class BaseStorage {
  /**
   * Get database connection
   * @returns Database connection
   */
  protected async getDB() {
    return await getDB();
  }

  /**
   * Helper function to get day name from day of week
   * @param dayOfWeek Day of week (0-6, where 0 is Sunday)
   * @returns Day name in Turkish
   */
  protected getDayName(dayOfWeek: number): string {
    const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
    return days[dayOfWeek % 7];
  }
}