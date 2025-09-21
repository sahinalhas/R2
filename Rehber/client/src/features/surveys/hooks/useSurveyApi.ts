import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Survey, InsertSurvey, SurveyAssignment, InsertSurveyAssignment, SurveyResponse, InsertSurveyResponse, SurveyImport } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

/**
 * Tüm anketleri getiren hook
 */
export const useSurveys = () => {
  return useQuery<Survey[]>({
    queryKey: ['/api/surveys'],
    staleTime: 60 * 1000, // 1 dakika
  });
};

/**
 * Belirli bir türdeki anketleri getiren hook
 */
export const useSurveysByType = (type: string) => {
  return useQuery<Survey[]>({
    queryKey: [`/api/surveys/type/${type}`],
    staleTime: 60 * 1000, // 1 dakika
    enabled: !!type
  });
};

/**
 * Belirli bir anketi ID'sine göre getiren hook
 */
export const useSurvey = (id: number) => {
  return useQuery<Survey>({
    queryKey: [`/api/surveys/${id}`],
    staleTime: 5 * 60 * 1000, // 5 dakika
    enabled: !!id
  });
};

/**
 * Yeni anket oluşturmak için mutation hook'u
 */
export const useCreateSurvey = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (newSurvey: InsertSurvey) => {
      const response = await fetch('/api/surveys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSurvey),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Anket oluşturulurken bir hata oluştu');
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/surveys'] });
      
      // Türe göre anketleri de invalidate et
      if (data.type) {
        queryClient.invalidateQueries({ queryKey: [`/api/surveys/type/${data.type}`] });
      }
      
      toast({
        title: "Başarılı",
        description: "Anket başarıyla oluşturuldu",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

/**
 * Anket güncellemek için mutation hook'u
 */
export const useUpdateSurvey = (id: number) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (updatedSurvey: Partial<InsertSurvey>) => {
      const response = await fetch(`/api/surveys/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedSurvey),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Anket güncellenirken bir hata oluştu');
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/surveys'] });
      queryClient.invalidateQueries({ queryKey: [`/api/surveys/${id}`] });
      
      // Türe göre anketleri de invalidate et
      if (data.type) {
        queryClient.invalidateQueries({ queryKey: [`/api/surveys/type/${data.type}`] });
      }
      
      toast({
        title: "Başarılı",
        description: "Anket başarıyla güncellendi",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

/**
 * Anket silmek için mutation hook'u
 */
export const useDeleteSurvey = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (survey: { id: number, type?: string }) => {
      const response = await fetch(`/api/surveys/${survey.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Anket silinirken bir hata oluştu');
      }
      
      return survey;
    },
    onSuccess: (survey) => {
      queryClient.invalidateQueries({ queryKey: ['/api/surveys'] });
      
      // Türe göre anketleri de invalidate et
      if (survey.type) {
        queryClient.invalidateQueries({ queryKey: [`/api/surveys/type/${survey.type}`] });
      }
      
      toast({
        title: "Başarılı",
        description: "Anket başarıyla silindi",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

/**
 * Belirli bir anketin atamalarını getiren hook
 */
export const useSurveyAssignments = (surveyId: number) => {
  return useQuery<SurveyAssignment[]>({
    queryKey: [`/api/survey-assignments?surveyId=${surveyId}`],
    staleTime: 60 * 1000, // 1 dakika
    enabled: !!surveyId
  });
};

/**
 * Belirli bir öğrencinin anket atamalarını getiren hook
 */
export const useStudentSurveyAssignments = (studentId: number) => {
  return useQuery<SurveyAssignment[]>({
    queryKey: [`/api/survey-assignments?studentId=${studentId}`],
    staleTime: 60 * 1000, // 1 dakika
    enabled: !!studentId
  });
};

/**
 * Anket atama oluşturmak için mutation hook'u
 */
export const useCreateSurveyAssignment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (newAssignment: InsertSurveyAssignment) => {
      const response = await fetch('/api/survey-assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newAssignment),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Anket ataması oluşturulurken bir hata oluştu');
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      // İlgili anket atamalarını invalidate et
      queryClient.invalidateQueries({ queryKey: [`/api/survey-assignments?surveyId=${data.surveyId}`] });
      
      // Öğrenci atamalarını da invalidate et
      if (data.studentId) {
        queryClient.invalidateQueries({ queryKey: [`/api/survey-assignments?studentId=${data.studentId}`] });
      }
      
      toast({
        title: "Başarılı",
        description: "Anket ataması başarıyla oluşturuldu",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

/**
 * Toplu anket atama oluşturmak için mutation hook'u
 */
export const useCreateBulkSurveyAssignments = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ surveyId, studentIds }: { surveyId: number, studentIds: number[] }) => {
      const response = await fetch('/api/survey-assignments/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ surveyId, studentIds }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Toplu anket ataması oluşturulurken bir hata oluştu');
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      // İlgili anket atamalarını invalidate et
      if (data.length > 0) {
        const surveyId = data[0].surveyId;
        queryClient.invalidateQueries({ queryKey: [`/api/survey-assignments?surveyId=${surveyId}`] });
        
        // Öğrenci atamalarını da invalidate et
        data.forEach((assignment: SurveyAssignment) => {
          queryClient.invalidateQueries({ queryKey: [`/api/survey-assignments?studentId=${assignment.studentId}`] });
        });
      }
      
      toast({
        title: "Başarılı",
        description: `${data.length} öğrenciye anket ataması yapıldı`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

/**
 * Anket atama durumunu güncellemek için mutation hook'u
 */
export const useUpdateSurveyAssignmentStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ id, status }: { id: number, status: string }) => {
      const response = await fetch(`/api/survey-assignments/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Anket atama durumu güncellenirken bir hata oluştu');
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      // İlgili anket atamalarını invalidate et
      queryClient.invalidateQueries({ queryKey: [`/api/survey-assignments?surveyId=${data.surveyId}`] });
      
      // Öğrenci atamalarını da invalidate et
      if (data.studentId) {
        queryClient.invalidateQueries({ queryKey: [`/api/survey-assignments?studentId=${data.studentId}`] });
      }
      
      toast({
        title: "Başarılı",
        description: "Anket atama durumu güncellendi",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

/**
 * Belirli bir anketin yanıtlarını getiren hook
 */
export const useSurveyResponses = (surveyId: number) => {
  return useQuery<SurveyResponse[]>({
    queryKey: [`/api/survey-responses?surveyId=${surveyId}`],
    staleTime: 60 * 1000, // 1 dakika
    enabled: !!surveyId
  });
};

/**
 * Anket yanıtı oluşturmak için mutation hook'u
 */
export const useCreateSurveyResponse = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (newResponse: InsertSurveyResponse) => {
      const response = await fetch('/api/survey-responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newResponse),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Anket yanıtı oluşturulurken bir hata oluştu');
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      // İlgili anket yanıtlarını invalidate et
      queryClient.invalidateQueries({ queryKey: [`/api/survey-responses?surveyId=${data.surveyId}`] });
      
      // İlgili atamayı da güncelle
      queryClient.invalidateQueries({ queryKey: [`/api/survey-assignments?surveyId=${data.surveyId}`] });
      
      // Öğrenci atamalarını da invalidate et
      if (data.studentId) {
        queryClient.invalidateQueries({ queryKey: [`/api/survey-assignments?studentId=${data.studentId}`] });
      }
      
      toast({
        title: "Başarılı",
        description: "Anket yanıtı başarıyla kaydedildi",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

/**
 * Anket import işlemlerini getiren hook
 */
export const useSurveyImports = (surveyId: number) => {
  return useQuery<SurveyImport[]>({
    queryKey: [`/api/survey-imports?surveyId=${surveyId}`],
    staleTime: 60 * 1000, // 1 dakika
    enabled: !!surveyId
  });
};

/**
 * Excel'den anket yanıtlarını içeri aktarmak için mutation hook'u
 */
export const useImportSurveyResponses = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/survey-imports', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Anket yanıtları içeri aktarılırken bir hata oluştu');
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      // İlgili anket import işlemlerini invalidate et
      queryClient.invalidateQueries({ queryKey: [`/api/survey-imports?surveyId=${data.surveyId}`] });
      
      // İlgili anket yanıtlarını da invalidate et
      queryClient.invalidateQueries({ queryKey: [`/api/survey-responses?surveyId=${data.surveyId}`] });
      
      toast({
        title: "Başarılı",
        description: "Anket yanıtları başarıyla içeri aktarıldı",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};