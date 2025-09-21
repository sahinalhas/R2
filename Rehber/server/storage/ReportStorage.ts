import { Report, InsertReport, reports } from '@shared/schema';
import { BaseStorage } from './BaseStorage';
import { eq } from 'drizzle-orm';

/**
 * ReportStorage class for report-related database operations
 */
export class ReportStorage extends BaseStorage {
  /**
   * Get all reports
   * @returns List of all reports
   */
  async getReports(): Promise<Report[]> {
    const db = await this.getDB();
    return db.select().from(reports);
  }

  /**
   * Get a report by ID
   * @param id Report ID
   * @returns Report or undefined if not found
   */
  async getReport(id: number): Promise<Report | undefined> {
    const db = await this.getDB();
    const results = await db.select().from(reports).where(eq(reports.id, id));
    return results.length > 0 ? results[0] : undefined;
  }

  /**
   * Get reports by student ID
   * @param studentId Student ID
   * @returns List of reports for the specified student
   */
  async getReportsByStudentId(studentId: number): Promise<Report[]> {
    const db = await this.getDB();
    return db.select().from(reports).where(eq(reports.studentId, studentId));
  }

  /**
   * Create a new report
   * @param report Report data
   * @returns Created report
   */
  async createReport(report: InsertReport): Promise<Report> {
    const db = await this.getDB();
    const [newReport] = await db.insert(reports).values(report).returning();
    return newReport;
  }

  /**
   * Update a report
   * @param id Report ID
   * @param report Report data to update
   * @returns Updated report or undefined if not found
   */
  async updateReport(id: number, report: Partial<InsertReport>): Promise<Report | undefined> {
    const db = await this.getDB();
    const currentReport = await this.getReport(id);
    
    if (!currentReport) return undefined;
    
    const [updatedReport] = await db.update(reports)
      .set(report)
      .where(eq(reports.id, id))
      .returning();
    
    return updatedReport;
  }

  /**
   * Delete a report
   * @param id Report ID
   * @returns true if deleted, false if not found
   */
  async deleteReport(id: number): Promise<boolean> {
    const db = await this.getDB();
    const report = await this.getReport(id);
    
    if (!report) return false;
    
    await db.delete(reports).where(eq(reports.id, id));
    return true;
  }
}