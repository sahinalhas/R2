import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Report, InsertReport } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

/**
 * Tüm raporları getiren hook
 */
export const useReports = () => {
  return useQuery<Report[]>({
    queryKey: ['/api/reports'],
    staleTime: 60 * 1000, // 1 dakika
  });
};

/**
 * Belirli bir raporu ID'sine göre getiren hook
 */
export const useReport = (id: number) => {
  return useQuery<Report>({
    queryKey: [`/api/reports/${id}`],
    staleTime: 5 * 60 * 1000, // 5 dakika
    enabled: !!id
  });
};

/**
 * Belirli bir öğrencinin tüm raporlarını getiren hook
 */
export const useStudentReports = (studentId: number) => {
  return useQuery<Report[]>({
    queryKey: [`/api/students/${studentId}/reports`],
    staleTime: 60 * 1000, // 1 dakika
    enabled: !!studentId
  });
};

/**
 * Yeni rapor oluşturmak için mutation hook'u
 */
export const useCreateReport = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (newReport: InsertReport) => {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newReport),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Rapor oluşturulurken bir hata oluştu');
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/reports'] });
      
      // Öğrenci raporlarını da invalidate et
      if (data.studentId) {
        queryClient.invalidateQueries({ queryKey: [`/api/students/${data.studentId}/reports`] });
      }
      
      toast({
        title: "Başarılı",
        description: "Rapor başarıyla oluşturuldu",
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
 * Rapor güncellemek için mutation hook'u
 */
export const useUpdateReport = (id: number) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (updatedReport: Partial<InsertReport>) => {
      const response = await fetch(`/api/reports/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedReport),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Rapor güncellenirken bir hata oluştu');
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/reports'] });
      queryClient.invalidateQueries({ queryKey: [`/api/reports/${id}`] });
      
      // Öğrenci raporlarını da invalidate et
      if (data.studentId) {
        queryClient.invalidateQueries({ queryKey: [`/api/students/${data.studentId}/reports`] });
      }
      
      toast({
        title: "Başarılı",
        description: "Rapor başarıyla güncellendi",
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
 * Rapor silmek için mutation hook'u
 */
export const useDeleteReport = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (report: { id: number, studentId?: number }) => {
      const response = await fetch(`/api/reports/${report.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Rapor silinirken bir hata oluştu');
      }
      
      return report;
    },
    onSuccess: (report) => {
      queryClient.invalidateQueries({ queryKey: ['/api/reports'] });
      
      // Öğrenci raporlarını da invalidate et
      if (report.studentId) {
        queryClient.invalidateQueries({ queryKey: [`/api/students/${report.studentId}/reports`] });
      }
      
      toast({
        title: "Başarılı",
        description: "Rapor başarıyla silindi",
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