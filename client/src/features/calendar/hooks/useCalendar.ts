import { useState } from 'react';
import { 
  format, 
  addDays, 
  isToday, 
  isSameDay, 
  addMonths,
  isAfter,
  isBefore,
  isSameMonth
} from "date-fns";
import { useQuery } from "@tanstack/react-query";

// Tür tanımlamaları
export interface TimeSlot {
  startTime: string;
  endTime: string;
}

/**
 * Takvim ile ilgili özellikleri sağlayan hook
 */
export const useCalendar = () => {
  // Bugünden başlayarak 3 ay sonrasını görüntüleyebilir
  const maxDate = addMonths(new Date(), 3);
  
  // State
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  
  // Seçilen güne ait uygun zaman aralıklarını getir
  const { 
    data: availableSlots, 
    isLoading: loadingSlots,
    refetch: refetchSlots
  } = useQuery({
    queryKey: ['/api/available-slots', format(selectedDate, 'yyyy-MM-dd')],
    queryFn: async ({ queryKey }) => {
      const date = queryKey[1] as string;
      const res = await fetch(`/api/available-slots?date=${encodeURIComponent(date)}`, { credentials: 'include' });
      if (res.status === 401) {
        return null as any;
      }
      if (!res.ok) {
        try {
          const errorJson = await res.json();
          if (errorJson && errorJson.success === false && 'error' in errorJson) {
            throw new Error(errorJson.error.message || `${res.status}: İşlem başarısız oldu`);
          }
          if (errorJson.message) {
            throw new Error(errorJson.message);
          } else if (errorJson.error) {
            throw new Error(typeof errorJson.error === 'string' ? errorJson.error : JSON.stringify(errorJson.error));
          }
        } catch (e) {
          if (e instanceof Error && e.message !== 'Unexpected end of JSON input') {
            throw e;
          }
          throw new Error(`${res.status}: ${res.statusText || 'İşlem başarısız oldu'}`);
        }
      }
      const json = await res.json();
      if (json && typeof json === 'object' && 'data' in json && json.success === true) {
        return json.data;
      }
      return json;
    },
    enabled: !!selectedDate,
  });
  
  // Basitleştirilmiş randevu mantığı: Geçmiş günler hariç tüm günler randevu alınabilir
  const hasWorkingHours = (day: Date) => {
    // Geçmiş günler hariç tüm günler randevu alınabilir
    return !isBefore(day, new Date());
  };
  
  // Uygun gün mu kontrol et
  const isAvailableDay = (day: Date) => {
    // Sadece geçmiş günler uygun değil
    return !isBefore(day, new Date());
  };
  
  return {
    selectedDate,
    setSelectedDate,
    selectedSlot,
    setSelectedSlot,
    maxDate,
    availableSlots,
    loadingSlots,
    loadingHours: false, // Artık çalışma saatleri yüklenmediği için false döndürüyoruz
    refetchSlots,
    hasWorkingHours,
    isAvailableDay
  };
};

/**
 * Belirli bir ay için uygun günleri getiren hook
 */
export const useAvailableDates = (year: number, month: number) => {
  // Basitleştirilmiş: Geçmiş günler hariç tüm günler randevu alınabilir
  const hasWorkingHours = (day: Date) => {
    // Geçmiş günler hariç tüm günler randevu alınabilir
    return !isBefore(day, new Date());
  };
  
  return {
    workingHours: [], // Boş dizi döndür, çalışma saatleri özelliği kaldırıldı
    hasWorkingHours
  };
};
