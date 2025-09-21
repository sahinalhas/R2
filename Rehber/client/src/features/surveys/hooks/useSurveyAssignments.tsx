import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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

export interface SurveyAssignment {
  id: number;
  surveyId: number;
  studentId: number;
  assignedAt: string;
  status: string;
  dueDate: string | null;
  completedAt: string | null;
}

export const useSurveyAssignments = (surveyId: number) => {
  const { toast } = useToast();
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [studentSearchQuery, setStudentSearchQuery] = useState("");
  const [assignmentSortOrder, setAssignmentSortOrder] = useState<'name' | 'status' | 'date'>('date');
  const [assignmentStatusFilter, setAssignmentStatusFilter] = useState<'all' | 'completed' | 'pending'>('all');

  // Öğrencileri çek
  const { data: students, isLoading: studentsLoading } = useQuery<Student[]>({
    queryKey: ['/api/students'],
    staleTime: 10 * 1000,
  });
  
  // Ankete atanan öğrencileri çek
  const { data: assignments, isLoading: assignmentsLoading, refetch: refetchAssignments } = useQuery<SurveyAssignment[]>({
    queryKey: [`/api/survey-assignments?surveyId=${surveyId}`],
    staleTime: 10 * 1000,
  });

  // Öğrencilere anket atama
  const assignSurveyMutation = useMutation({
    mutationFn: (studentIds: number[]) => {
      return apiRequest("/api/survey-assignments/bulk", "POST", { 
        surveyId, 
        studentIds
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/survey-assignments?surveyId=${surveyId}`] });
      toast({
        title: "Anket atandı",
        description: `Anket ${selectedStudents.length} öğrenciye başarıyla atandı.`,
      });
      setSelectedStudents([]);
      refetchAssignments();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Hata",
        description: `Anket atanırken bir hata oluştu: ${error}`,
      });
    },
  });

  // Toplam yanıt sayısı
  const completedAssignments = assignments?.filter(a => a.status === "Tamamlandı") || [];
  const pendingAssignments = assignments?.filter(a => a.status === "Beklemede") || [];

  // Öğrenci seçme işlemleri
  const toggleStudentSelection = (studentId: number) => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(selectedStudents.filter(id => id !== studentId));
    } else {
      setSelectedStudents([...selectedStudents, studentId]);
    }
  };

  const selectAllStudents = () => {
    if (!students) return;
    
    // Zaten atanmış öğrencileri filtrele
    const assignedStudentIds = assignments?.map(a => a.studentId) || [];
    const unassignedStudents = students.filter(s => !assignedStudentIds.includes(s.id));
    
    if (selectedStudents.length === unassignedStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(unassignedStudents.map(s => s.id));
    }
  };

  // Anketi atanabilecek öğrenciler (henüz atanmamış olanlar)
  const getAssignableStudents = () => {
    if (!students || !assignments) return [];
    
    const assignedStudentIds = assignments.map(a => a.studentId);
    return students.filter(s => !assignedStudentIds.includes(s.id));
  };

  // Atanması seçilmiş öğrencileri ata
  const assignSurveyToSelectedStudents = () => {
    if (selectedStudents.length === 0) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Lütfen en az bir öğrenci seçin.",
      });
      return;
    }
    
    assignSurveyMutation.mutate(selectedStudents);
  };

  // Öğrenci listesinde isme göre arama
  const filteredAssignableStudents = useMemo(() => {
    return getAssignableStudents().filter(student =>
      `${student.firstName} ${student.lastName}`.toLowerCase().includes(studentSearchQuery.toLowerCase())
    );
  }, [studentSearchQuery, students, assignments]);

  // Öğrencileri sıralama
  const getSortedAssignments = () => {
    if (!assignments || !students) return [];
    
    const studentsMap = new Map(students.map(s => [s.id, s]));
    
    return [...assignments].sort((a, b) => {
      if (assignmentSortOrder === 'name') {
        const studentA = studentsMap.get(a.studentId);
        const studentB = studentsMap.get(b.studentId);
        if (studentA && studentB) {
          return `${studentA.firstName} ${studentA.lastName}`.localeCompare(`${studentB.firstName} ${studentB.lastName}`);
        }
      } else if (assignmentSortOrder === 'status') {
        return a.status.localeCompare(b.status);
      } else if (assignmentSortOrder === 'date') {
        return new Date(b.assignedAt).getTime() - new Date(a.assignedAt).getTime();
      }
      return 0;
    });
  };
  
  // Atamaları filtrele
  const filteredAssignments = useMemo(() => {
    return getSortedAssignments().filter(assignment => {
      if (assignmentStatusFilter === 'all') return true;
      if (assignmentStatusFilter === 'completed') return assignment.status === "Tamamlandı";
      if (assignmentStatusFilter === 'pending') return assignment.status === "Beklemede";
      return true;
    });
  }, [assignments, students, assignmentSortOrder, assignmentStatusFilter]);

  return {
    students,
    studentsLoading,
    assignments,
    assignmentsLoading,
    completedAssignments,
    pendingAssignments,
    selectedStudents,
    studentSearchQuery,
    setStudentSearchQuery,
    assignmentSortOrder,
    setAssignmentSortOrder,
    assignmentStatusFilter,
    setAssignmentStatusFilter,
    toggleStudentSelection,
    selectAllStudents,
    assignSurveyToSelectedStudents,
    filteredAssignableStudents,
    filteredAssignments,
    isAssigning: assignSurveyMutation.isPending
  };
};