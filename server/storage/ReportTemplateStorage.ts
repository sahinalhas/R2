import { ReportTemplate, InsertReportTemplate, reportTemplates } from '@shared/schema';
import { BaseStorage } from './BaseStorage';
import { eq, like, and, desc, sql } from 'drizzle-orm';

/**
 * ReportTemplateStorage class for report template-related database operations
 */
export class ReportTemplateStorage extends BaseStorage {
  /**
   * Get all report templates
   * @returns List of all report templates
   */
  async getReportTemplates(): Promise<ReportTemplate[]> {
    const db = await this.getDB();
    return db.select().from(reportTemplates).orderBy(desc(reportTemplates.createdAt));
  }

  /**
   * Get active report templates
   * @returns List of active report templates
   */
  async getActiveReportTemplates(): Promise<ReportTemplate[]> {
    const db = await this.getDB();
    return db.select()
      .from(reportTemplates)
      .where(eq(reportTemplates.isActive, true))
      .orderBy(desc(reportTemplates.createdAt));
  }

  /**
   * Get report templates by type
   * @param type Template type
   * @returns List of report templates of the specified type
   */
  async getReportTemplatesByType(type: string): Promise<ReportTemplate[]> {
    const db = await this.getDB();
    return db.select()
      .from(reportTemplates)
      .where(and(
        eq(reportTemplates.type, type),
        eq(reportTemplates.isActive, true)
      ))
      .orderBy(desc(reportTemplates.createdAt));
  }

  /**
   * Get report templates by category
   * @param category Template category
   * @returns List of report templates in the specified category
   */
  async getReportTemplatesByCategory(category: string): Promise<ReportTemplate[]> {
    const db = await this.getDB();
    return db.select()
      .from(reportTemplates)
      .where(and(
        eq(reportTemplates.category, category),
        eq(reportTemplates.isActive, true)
      ))
      .orderBy(desc(reportTemplates.createdAt));
  }

  /**
   * Search report templates
   * @param query Search query
   * @returns List of matching report templates
   */
  async searchReportTemplates(query: string): Promise<ReportTemplate[]> {
    const db = await this.getDB();
    const searchPattern = `%${query}%`;
    
    return db.select()
      .from(reportTemplates)
      .where(
        and(
          eq(reportTemplates.isActive, true),
          sql`(
            ${reportTemplates.name} LIKE ${searchPattern} OR
            ${reportTemplates.description} LIKE ${searchPattern} OR
            ${reportTemplates.type} LIKE ${searchPattern} OR
            ${reportTemplates.category} LIKE ${searchPattern}
          )`
        )
      )
      .orderBy(desc(reportTemplates.createdAt));
  }

  /**
   * Get a report template by ID
   * @param id Template ID
   * @returns Report template or undefined if not found
   */
  async getReportTemplate(id: number): Promise<ReportTemplate | undefined> {
    const db = await this.getDB();
    const results = await db.select().from(reportTemplates).where(eq(reportTemplates.id, id));
    return results.length > 0 ? results[0] : undefined;
  }

  /**
   * Create a new report template
   * @param template Template data
   * @returns Created template
   */
  async createReportTemplate(template: InsertReportTemplate): Promise<ReportTemplate> {
    const db = await this.getDB();
    const [newTemplate] = await db.insert(reportTemplates).values(template).returning();
    return newTemplate;
  }

  /**
   * Update a report template
   * @param id Template ID
   * @param template Template data to update
   * @returns Updated template or undefined if not found
   */
  async updateReportTemplate(id: number, template: Partial<InsertReportTemplate>): Promise<ReportTemplate | undefined> {
    const db = await this.getDB();
    const currentTemplate = await this.getReportTemplate(id);
    
    if (!currentTemplate) return undefined;
    
    // Always update the updatedAt timestamp
    const updatedTemplate = {
      ...template,
      updatedAt: sql`CURRENT_TIMESTAMP`
    };
    
    const [result] = await db.update(reportTemplates)
      .set(updatedTemplate)
      .where(eq(reportTemplates.id, id))
      .returning();
    
    return result;
  }

  /**
   * Update template active status
   * @param id Template ID
   * @param isActive New active status
   * @returns Updated template or undefined if not found
   */
  async updateTemplateStatus(id: number, isActive: boolean): Promise<ReportTemplate | undefined> {
    return this.updateReportTemplate(id, { isActive });
  }

  /**
   * Delete a report template
   * @param id Template ID
   * @returns true if deleted, false if not found
   */
  async deleteReportTemplate(id: number): Promise<boolean> {
    const db = await this.getDB();
    const template = await this.getReportTemplate(id);
    
    if (!template) return false;
    
    await db.delete(reportTemplates).where(eq(reportTemplates.id, id));
    return true;
  }
}