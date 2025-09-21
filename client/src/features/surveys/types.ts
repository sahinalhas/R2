// Survey interfaces
export interface Survey {
  id: number;
  title: string;
  description: string | null;
  type: string;
  targetAudience: string;
  questions: string;
  isActive: boolean;
  anonymous: boolean;
  startDate: string | null;
  endDate: string | null;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

export interface Student {
  id: number;
  firstName: string;
  lastName: string;
  studentNumber: string;
  grade: string;
  class: string;
  schoolId: number;
  photoUrl: string | null;
  createdAt: string;
}

export interface SurveyResponse {
  id: number;
  surveyId: number;
  studentId: number;
  assignmentId: number;
  answers: string;
  submittedAt: string;
  ipAddress: string | null;
}

export interface Question {
  id: string;
  type: "text" | "textarea" | "radio" | "checkbox" | "select";
  text: string;
  required: boolean;
  options?: string[];
}

export interface Answer {
  questionId: string;
  value: string | string[];
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string[];
  }[];
}

export interface QuestionStat {
  question: Question;
  answerCounts: Record<string, number>;
  textAnswers: string[];
}

export interface QuestionChartData {
  question: Question;
  chartData: ChartData;
}

export interface SurveyAnalysis {
  totalResponses: number;
  questionStats: QuestionStat[];
  chartData: QuestionChartData[];
}