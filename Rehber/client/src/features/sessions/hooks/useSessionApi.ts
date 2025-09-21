import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Session, InsertSession } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

/**
 * Tüm görüşmeleri getiren hook
 */
export const useSessions = () => {
  return useQuery<Session[]>({
    queryKey: ['/api/sessions'],
    staleTime: 60 * 1000, // 1 dakika
  });
};

/**
 * Belirli bir görüşmeyi ID'sine göre getiren hook
 */
export const useSession = (id: number) => {
  return useQuery<Session>({
    queryKey: [`/api/sessions/${id}`],
    staleTime: 5 * 60 * 1000, // 5 dakika
    enabled: !!id
  });
};

/**
 * Belirli bir öğrencinin tüm görüşmelerini getiren hook
 */
export const useStudentSessions = (studentId: number) => {
  return useQuery<Session[]>({
    queryKey: [`/api/students/${studentId}/sessions`],
    staleTime: 60 * 1000, // 1 dakika
    enabled: !!studentId
  });
};

/**
 * Yeni görüşme oluşturmak için mutation hook'u
 */
export const useCreateSession = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (newSession: InsertSession) => {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSession),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Görüşme oluşturulurken bir hata oluştu');
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/sessions'] });
      
      // Öğrenci görüşmelerini de invalidate et
      if (data.studentId) {
        queryClient.invalidateQueries({ queryKey: [`/api/students/${data.studentId}/sessions`] });
      }
      
      toast({
        title: "Başarılı",
        description: "Görüşme başarıyla oluşturuldu",
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
 * Görüşme güncellemek için mutation hook'u
 */
export const useUpdateSession = (id: number) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (updatedSession: Partial<InsertSession>) => {
      const response = await fetch(`/api/sessions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedSession),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Görüşme güncellenirken bir hata oluştu');
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/sessions'] });
      queryClient.invalidateQueries({ queryKey: [`/api/sessions/${id}`] });
      
      // Öğrenci görüşmelerini de invalidate et
      if (data.studentId) {
        queryClient.invalidateQueries({ queryKey: [`/api/students/${data.studentId}/sessions`] });
      }
      
      toast({
        title: "Başarılı",
        description: "Görüşme başarıyla güncellendi",
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
 * Görüşme silmek için mutation hook'u
 */
export const useDeleteSession = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (session: { id: number, studentId?: number }) => {
      const response = await fetch(`/api/sessions/${session.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Görüşme silinirken bir hata oluştu');
      }
      
      return session;
    },
    onSuccess: (session) => {
      queryClient.invalidateQueries({ queryKey: ['/api/sessions'] });
      
      // Öğrenci görüşmelerini de invalidate et
      if (session.studentId) {
        queryClient.invalidateQueries({ queryKey: [`/api/students/${session.studentId}/sessions`] });
      }
      
      toast({
        title: "Başarılı",
        description: "Görüşme başarıyla silindi",
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