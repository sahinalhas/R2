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
import { getQueryFn } from "@/lib/queryClient";

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
    queryFn: getQueryFn({ on401: 'returnNull' }),
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