import { 
  Survey, InsertSurvey, surveys,
  SurveyAssignment, InsertSurveyAssignment, surveyAssignments,
  SurveyResponse, InsertSurveyResponse, surveyResponses,
  SurveyImport, surveyImports
} from '@shared/schema';
import { BaseStorage } from './BaseStorage';
import { eq } from 'drizzle-orm';

/**
 * SurveyStorage sınıfı - Anketlerle ilgili işlemleri yönetir
 */
export class SurveyStorage extends BaseStorage {
  /**
   * Get all surveys
   * @returns List of all surveys
   */
  async getSurveys(): Promise<Survey[]> {
    const db = await this.getDB();
    return db.select().from(surveys);
  }

  /**
   * Get a survey by ID
   * @param id Survey ID
   * @returns Survey or undefined if not found
   */
  async getSurvey(id: number): Promise<Survey | undefined> {
    const db = await this.getDB();
    const results = await db.select().from(surveys).where(eq(surveys.id, id));
    return results.length > 0 ? results[0] : undefined;
  }

  /**
   * Get surveys by type
   * @param type Survey type
   * @returns List of surveys of the specified type
   */
  async getSurveysByType(type: string): Promise<Survey[]> {
    const db = await this.getDB();
    return db.select().from(surveys).where(eq(surveys.type, type));
  }

  /**
   * Create a new survey
   * @param survey Survey data
   * @returns Created survey
   */
  async createSurvey(survey: InsertSurvey): Promise<Survey> {
    const db = await this.getDB();
    const [newSurvey] = await db.insert(surveys).values(survey).returning();
    return newSurvey;
  }

  /**
   * Update a survey
   * @param id Survey ID
   * @param survey Survey data to update
   * @returns Updated survey or undefined if not found
   */
  async updateSurvey(id: number, survey: Partial<InsertSurvey>): Promise<Survey | undefined> {
    const db = await this.getDB();
    const currentSurvey = await this.getSurvey(id);
    
    if (!currentSurvey) return undefined;
    
    const [updatedSurvey] = await db.update(surveys)
      .set(survey)
      .where(eq(surveys.id, id))
      .returning();
    
    return updatedSurvey;
  }

  /**
   * Delete a survey
   * @param id Survey ID
   * @returns true if deleted, false if not found
   */
  async deleteSurvey(id: number): Promise<boolean> {
    const db = await this.getDB();
    const survey = await this.getSurvey(id);
    
    if (!survey) return false;
    
    await db.delete(surveys).where(eq(surveys.id, id));
    return true;
  }

  /**
   * Get survey assignments for a survey
   * @param surveyId Survey ID
   * @returns List of survey assignments
   */
  async getSurveyAssignments(surveyId: number): Promise<SurveyAssignment[]> {
    const db = await this.getDB();
    return db.select().from(surveyAssignments).where(eq(surveyAssignments.surveyId, surveyId));
  }

  /**
   * Get a survey assignment by ID
   * @param id Assignment ID
   * @returns Survey assignment or undefined if not found
   */
  async getSurveyAssignment(id: number): Promise<SurveyAssignment | undefined> {
    const db = await this.getDB();
    const results = await db.select().from(surveyAssignments).where(eq(surveyAssignments.id, id));
    return results.length > 0 ? results[0] : undefined;
  }

  /**
   * Get survey assignments for a student
   * @param studentId Student ID
   * @returns List of survey assignments for the specified student
   */
  async getSurveyAssignmentsByStudentId(studentId: number): Promise<SurveyAssignment[]> {
    const db = await this.getDB();
    return db.select().from(surveyAssignments).where(eq(surveyAssignments.studentId, studentId));
  }

  /**
   * Assign a survey to a student
   * @param assignment Survey assignment data
   * @returns Created survey assignment
   */
  async assignSurveyToStudent(assignment: InsertSurveyAssignment): Promise<SurveyAssignment> {
    const db = await this.getDB();
    
    // Explicitly providing all fields to avoid DrizzleORM type errors
    const [newAssignment] = await db.insert(surveyAssignments).values({
      surveyId: assignment.surveyId,
      studentId: assignment.studentId,
      status: assignment.status || 'Atandı',
      assignedAt: assignment.assignedAt || new Date().toISOString(),
      dueDate: assignment.dueDate
    }).returning();
    
    return newAssignment;
  }

  /**
   * Assign a survey to multiple students
   * @param surveyId Survey ID
   * @param studentIds Array of student IDs
   * @returns Array of created survey assignments
   */
  async assignSurveyToMultipleStudents(surveyId: number, studentIds: number[]): Promise<SurveyAssignment[]> {
    const db = await this.getDB();
    
    // Insert records one by one to ensure all properties are properly handled
    const results: SurveyAssignment[] = [];
    
    for (const studentId of studentIds) {
      const [result] = await db.insert(surveyAssignments).values({
        surveyId,
        studentId,
        status: 'Atandı',
        assignedAt: new Date().toISOString()
      }).returning();
      
      results.push(result);
    }
    
    return results;
  }

  /**
   * Update survey assignment status
   * @param id Assignment ID
   * @param status New status
   * @returns Updated survey assignment or undefined if not found
   */
  async updateSurveyAssignmentStatus(id: number, status: string): Promise<SurveyAssignment | undefined> {
    const db = await this.getDB();
    const currentAssignment = await this.getSurveyAssignment(id);
    
    if (!currentAssignment) return undefined;
    
    const [updatedAssignment] = await db.update(surveyAssignments)
      .set({ status })
      .where(eq(surveyAssignments.id, id))
      .returning();
    
    return updatedAssignment;
  }

  /**
   * Delete a survey assignment
   * @param id Assignment ID
   * @returns true if deleted, false if not found
   */
  async deleteSurveyAssignment(id: number): Promise<boolean> {
    const db = await this.getDB();
    const assignment = await this.getSurveyAssignment(id);
    
    if (!assignment) return false;
    
    await db.delete(surveyAssignments).where(eq(surveyAssignments.id, id));
    return true;
  }

  /**
   * Get survey responses for a survey
   * @param surveyId Survey ID
   * @returns List of survey responses
   */
  async getSurveyResponses(surveyId: number): Promise<SurveyResponse[]> {
    const db = await this.getDB();
    return db.select().from(surveyResponses).where(eq(surveyResponses.surveyId, surveyId));
  }

  /**
   * Get a survey response by ID
   * @param id Response ID
   * @returns Survey response or undefined if not found
   */
  async getSurveyResponse(id: number): Promise<SurveyResponse | undefined> {
    const db = await this.getDB();
    const results = await db.select().from(surveyResponses).where(eq(surveyResponses.id, id));
    return results.length > 0 ? results[0] : undefined;
  }

  /**
   * Get survey responses for a student
   * @param studentId Student ID
   * @returns List of survey responses for the specified student
   */
  async getSurveyResponsesByStudentId(studentId: number): Promise<SurveyResponse[]> {
    const db = await this.getDB();
    return db.select().from(surveyResponses).where(eq(surveyResponses.studentId, studentId));
  }

  /**
   * Create a new survey response
   * @param response Survey response data
   * @returns Created survey response
   */
  async createSurveyResponse(response: InsertSurveyResponse): Promise<SurveyResponse> {
    const db = await this.getDB();
    const [newResponse] = await db.insert(surveyResponses).values(response).returning();
    return newResponse;
  }

  /**
   * Import survey responses from Excel
   * @param surveyId Survey ID
   * @param filePath Path to Excel file
   * @param processedBy User ID who processed the import
   * @returns Created survey import
   */
  async importSurveyResponsesFromExcel(surveyId: number, filePath: string, processedBy: number): Promise<SurveyImport> {
    const db = await this.getDB();
    
    // Create an import record with correct field names from the schema
    const [newImport] = await db.insert(surveyImports)
      .values({
        surveyId: surveyId,
        fileName: filePath, // 'fileName' in schema, not 'filePath'
        processedBy: processedBy,
        status: 'İşleniyor',
        recordCount: 0,
        importedAt: new Date().toISOString()
      })
      .returning();
    
    return newImport;
  }

  /**
   * Get survey imports for a survey
   * @param surveyId Survey ID
   * @returns List of survey imports
   */
  async getSurveyImports(surveyId: number): Promise<SurveyImport[]> {
    const db = await this.getDB();
    return db.select().from(surveyImports).where(eq(surveyImports.surveyId, surveyId));
  }

  /**
   * Get a survey import by ID
   * @param id Import ID
   * @returns Survey import or undefined if not found
   */
  async getSurveyImport(id: number): Promise<SurveyImport | undefined> {
    const db = await this.getDB();
    const results = await db.select().from(surveyImports).where(eq(surveyImports.id, id));
    return results.length > 0 ? results[0] : undefined;
  }

  /**
   * Update survey import status
   * @param id Import ID
   * @param status New status
   * @param errorMessage Optional error message
   * @returns Updated survey import or undefined if not found
   */
  async updateSurveyImportStatus(id: number, status: string, errorMessage?: string): Promise<SurveyImport | undefined> {
    const db = await this.getDB();
    const currentImport = await this.getSurveyImport(id);
    
    if (!currentImport) return undefined;
    
    const [updatedImport] = await db.update(surveyImports)
      .set({ 
        status,
        errorMessage: errorMessage || currentImport.errorMessage 
      })
      .where(eq(surveyImports.id, id))
      .returning();
    
    return updatedImport;
  }
}