import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Reminder, InsertReminder } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

/**
 * Tüm hatırlatıcıları getiren hook
 */
export const useReminders = () => {
  return useQuery<Reminder[]>({
    queryKey: ['/api/reminders'],
    staleTime: 60 * 1000, // 1 dakika
  });
};

/**
 * Belirli bir randevunun hatırlatıcılarını getiren hook
 */
export const useAppointmentReminders = (appointmentId: number) => {
  return useQuery<Reminder[]>({
    queryKey: [`/api/reminders/appointment/${appointmentId}`],
    staleTime: 60 * 1000, // 1 dakika
    enabled: !!appointmentId
  });
};

/**
 * Yeni hatırlatıcı oluşturmak için mutation hook'u
 */
export const useCreateReminder = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (newReminder: InsertReminder) => {
      const response = await fetch('/api/reminders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newReminder),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Hatırlatıcı oluşturulurken bir hata oluştu');
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      // Tüm hatırlatıcıları invalidate et
      queryClient.invalidateQueries({ queryKey: ['/api/reminders'] });
      
      // Randevu hatırlatıcılarını da invalidate et
      if (data.appointmentId) {
        queryClient.invalidateQueries({ queryKey: [`/api/reminders/appointment/${data.appointmentId}`] });
      }
      
      toast({
        title: "Başarılı",
        description: "Hatırlatıcı başarıyla oluşturuldu",
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
 * Hatırlatıcı durumunu güncellemek için mutation hook'u
 */
export const useUpdateReminderStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ id, status }: { id: number, status: string }) => {
      const response = await fetch(`/api/reminders/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Hatırlatıcı durumu güncellenirken bir hata oluştu');
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      // Tüm hatırlatıcıları invalidate et
      queryClient.invalidateQueries({ queryKey: ['/api/reminders'] });
      
      // Randevu hatırlatıcılarını da invalidate et
      if (data.appointmentId) {
        queryClient.invalidateQueries({ queryKey: [`/api/reminders/appointment/${data.appointmentId}`] });
      }
      
      toast({
        title: "Başarılı",
        description: "Hatırlatıcı durumu güncellendi",
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
 * Hatırlatıcı silmek için mutation hook'u
 */
export const useDeleteReminder = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (reminder: { id: number, appointmentId?: number }) => {
      const response = await fetch(`/api/reminders/${reminder.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Hatırlatıcı silinirken bir hata oluştu');
      }
      
      return reminder;
    },
    onSuccess: (reminder) => {
      // Tüm hatırlatıcıları invalidate et
      queryClient.invalidateQueries({ queryKey: ['/api/reminders'] });
      
      // Randevu hatırlatıcılarını da invalidate et
      if (reminder.appointmentId) {
        queryClient.invalidateQueries({ queryKey: [`/api/reminders/appointment/${reminder.appointmentId}`] });
      }
      
      toast({
        title: "Başarılı",
        description: "Hatırlatıcı başarıyla silindi",
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