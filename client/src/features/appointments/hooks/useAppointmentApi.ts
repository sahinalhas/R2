import { Appointment, InsertAppointment } from "@shared/schema";
import { useApiQuery, useApiMutation, InvalidateConfig } from "@/hooks/use-api-query";

/**
 * Tüm randevuları getiren hook
 */
export const useAppointments = () => {
  return useApiQuery<Appointment[]>('/api/appointments');
};

/**
 * Belirli bir randevuyu ID'sine göre getiren hook
 */
export const useAppointment = (id: number) => {
  return useApiQuery<Appointment>(
    id ? `/api/appointments/${id}` : null,
    { staleTime: 5 * 60 * 1000 } // 5 dakika
  );
};

/**
 * Belirli bir öğrencinin tüm randevularını getiren hook
 */
export const useStudentAppointments = (studentId: number) => {
  return useApiQuery<Appointment[]>(
    studentId ? `/api/appointments?studentId=${studentId}` : null
  );
};

/**
 * Belirli bir tarih için randevuları getiren hook
 */
export const useAppointmentsByDate = (date: string) => {
  return useApiQuery<Appointment[]>(
    date ? `/api/appointments?date=${date}` : null
  );
};

/**
 * Bugünün randevularını getiren hook
 */
export const useTodayAppointments = () => {
  // Bugünün tarihini YYYY-MM-DD formatında al
  const today = new Date().toISOString().split('T')[0];  
  return useApiQuery<Appointment[]>(`/api/appointments?date=${today}`);
};

/**
 * Belirli bir yıl ve ay için randevuları getiren hook
 */
export const useAppointmentsByMonth = (year: number, month: number) => {
  return useApiQuery<Appointment[]>(
    '/api/appointments',
    {},
    true,
    (appointments: Appointment[]) => {
      return appointments.filter((appointment: Appointment) => {
        const appointmentDate = new Date(appointment.date);
        return (
          appointmentDate.getFullYear() === year &&
          appointmentDate.getMonth() === month
        );
      });
    }
  );
};

/**
 * Yeni randevu oluşturmak için mutation hook'u
 */
export const useCreateAppointment = () => {
  return useApiMutation<Appointment, InsertAppointment>(
    '/api/appointments',
    'POST',
    ['/api/appointments'],
    {
      // Daha fazla sorgu geçersiz kıl
      additionalKeys: [
        // Bugünün randevuları da invalidate edilmeli
        [`/api/appointments?date=${new Date().toISOString().split('T')[0]}`]
      ]
    },
    "Randevu başarıyla oluşturuldu",
    "Randevu oluşturulurken bir hata oluştu"
  );
};

/**
 * Randevu güncellemek için mutation hook'u
 */
export const useUpdateAppointment = (id: number) => {
  return useApiMutation<Appointment, Partial<InsertAppointment>>(
    `/api/appointments/${id}`,
    'PUT',
    ['/api/appointments', `/api/appointments/${id}`],
    {
      additionalKeys: [
        // Bugünün randevuları da invalidate edilmeli
        [`/api/appointments?date=${new Date().toISOString().split('T')[0]}`]
      ]
    },
    "Randevu başarıyla güncellendi",
    "Randevu güncellenirken bir hata oluştu"
  );
};

/**
 * Randevu silmek için mutation hook'u
 * Geliştirilmiş: Dinamik endpoint kullanımı
 */
export const useDeleteAppointment = () => {
  return useApiMutation<
    { success: boolean },
    { id: number; date?: string; studentId?: number }
  >(
    // Parametreye göre dinamik endpoint oluştur
    (data) => `/api/appointments/${data.id}`,
    'DELETE',
    ['/api/appointments'],
    {
      // Ek invalidasyon sorguları
      additionalKeys: [
        // Bugünün randevuları da invalidate edilmeli
        [`/api/appointments?date=${new Date().toISOString().split('T')[0]}`]
      ]
    },
    "Randevu başarıyla silindi",
    "Randevu silinirken bir hata oluştu"
  );
};