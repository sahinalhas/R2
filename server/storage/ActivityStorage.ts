import { Activity, InsertActivity, activities } from '@shared/schema';
import { BaseStorage } from './BaseStorage';

/**
 * ActivityStorage class for activity-related database operations
 */
export class ActivityStorage extends BaseStorage {
  /**
   * Get all activities
   * @returns List of all activities
   */
  async getActivities(): Promise<Activity[]> {
    const db = await this.getDB();
    return db.select().from(activities).orderBy(activities.id);
  }

  /**
   * Create a new activity
   * @param activity Activity data
   * @returns Created activity
   */
  async createActivity(activity: InsertActivity): Promise<Activity> {
    const db = await this.getDB();
    const [newActivity] = await db.insert(activities)
      .values({
        ...activity,
        createdAt: new Date().toISOString()
      })
      .returning();
    
    return newActivity;
  }
}