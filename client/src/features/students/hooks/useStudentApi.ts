import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Student, InsertStudent } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

/**
 * Tüm öğrencileri getiren hook
 */
export const useStudents = () => {
  return useQuery<Student[]>({
    queryKey: ['/api/students'],
    staleTime: 60 * 1000, // 1 dakika
  });
};

/**
 * Belirli bir öğrenciyi ID'sine göre getiren hook
 */
export const useStudent = (id: number) => {
  return useQuery<Student>({
    queryKey: [`/api/students/${id}`],
    staleTime: 5 * 60 * 1000, // 5 dakika
    enabled: !!id
  });
};

/**
 * Yeni öğrenci oluşturmak için mutation hook'u
 */
export const useCreateStudent = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (newStudent: InsertStudent) => {
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newStudent),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Öğrenci oluşturulurken bir hata oluştu');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/students'] });
      toast({
        title: "Başarılı",
        description: "Öğrenci başarıyla oluşturuldu",
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
 * Öğrenci güncellemek için mutation hook'u
 */
export const useUpdateStudent = (id: number) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (updatedStudent: Partial<InsertStudent>) => {
      const response = await fetch(`/api/students/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedStudent),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Öğrenci güncellenirken bir hata oluştu');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/students'] });
      queryClient.invalidateQueries({ queryKey: [`/api/students/${id}`] });
      toast({
        title: "Başarılı",
        description: "Öğrenci başarıyla güncellendi",
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
 * Öğrenci silmek için mutation hook'u
 */
export const useDeleteStudent = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/students/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Öğrenci silinirken bir hata oluştu');
      }
      
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/students'] });
      toast({
        title: "Başarılı",
        description: "Öğrenci başarıyla silindi",
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