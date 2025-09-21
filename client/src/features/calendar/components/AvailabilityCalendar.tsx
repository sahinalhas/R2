import React, { useEffect } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format, isAfter } from "date-fns";
import { tr } from "date-fns/locale";
import { useNotifications } from "@/context/NotificationContext";
import { CalendarIcon, Clock, CheckCircle2 } from "lucide-react";
import { useCalendar, TimeSlot } from '../hooks/useCalendar';

const AvailabilityCalendar = ({ 
  onSelectSlot 
}: { 
  onSelectSlot?: (date: Date, slot: TimeSlot) => void 
}) => {
  const { 
    selectedDate, 
    setSelectedDate, 
    selectedSlot, 
    setSelectedSlot, 
    maxDate, 
    availableSlots, 
    loadingSlots, 
    refetchSlots, 
    hasWorkingHours,
    isAvailableDay
  } = useCalendar();
  
  const { addNotification } = useNotifications();
  
  // Tarih değiştiğinde seçili slot'u temizle
  useEffect(() => {
    setSelectedSlot(null);
    refetchSlots();
  }, [selectedDate, refetchSlots]);
  
  // Time slot seçildiğinde
  const handleSlotSelect = (slot: TimeSlot) => {
    // Süreyi al (varsayılan olarak 30 dakika)
    let duration = 30;
    try {
      // Formdaki süre değerini almaya çalış
      const durationFormEl = document.querySelector('select[name="duration"]') as HTMLSelectElement;
      if (durationFormEl && durationFormEl.value) {
        duration = parseInt(durationFormEl.value, 10);
      }
    } catch (error) {
      console.error("Süre değeri alınamadı:", error);
    }
    
    // Başlangıç zamanını dakikaya çevir
    const [startHour, startMinute] = slot.startTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMinute;
    
    // Bitiş zamanını hesapla
    const endMinutes = startMinutes + duration;
    const endHour = Math.floor(endMinutes / 60);
    const endMinute = endMinutes % 60;
    
    // Bitiş zamanını formatla
    const endTime = `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;
    
    // Yeni slot oluştur ve ayarla
    const updatedSlot = {
      startTime: slot.startTime,
      endTime: endTime
    };
    
    setSelectedSlot(updatedSlot);
    
    // Eğer dışarıdan bir callback geldiyse çağır
    if (onSelectSlot && selectedDate) {
      const selectedDateTime = new Date(selectedDate);
      const [hours, minutes] = slot.startTime.split(':').map(Number);
      selectedDateTime.setHours(hours, minutes, 0, 0);
      onSelectSlot(selectedDateTime, updatedSlot);
    }
  };
  
  return (
    <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
      {/* Takvim */}
      <Card className="w-full md:w-1/2">
        <CardHeader>
          <CardTitle className="flex items-center">
            <CalendarIcon className="mr-2 h-5 w-5" />
            Randevu Takvimi
          </CardTitle>
          <CardDescription>
            Uygun bir tarih seçin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(newDate) => newDate && setSelectedDate(newDate)}
            locale={tr}
            className="rounded-md border"
            modifiers={{
              available: (day) => isAvailableDay(day)
            }}
            modifiersClassNames={{
              available: "bg-green-50 text-green-600 font-medium hover:bg-green-100"
            }}
            disabled={(date) => 
              isAfter(new Date(), date) || 
              isAfter(date, maxDate) ||
              !hasWorkingHours(date)
            }
          />
          <div className="flex mt-4 text-sm text-muted-foreground justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-600 mr-2"></div>
              <span>Uygun gün</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-primary mr-2"></div>
              <span>Seçili gün</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Uygun zaman aralıkları */}
      <Card className="w-full md:w-1/2">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="mr-2 h-5 w-5" />
            Uygun Saatler
          </CardTitle>
          <CardDescription>
            {format(selectedDate, "d MMMM yyyy", { locale: tr })} tarihi için uygun saatleri görüntülüyorsunuz
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingSlots ? (
            <div className="flex justify-center py-6">Yükleniyor...</div>
          ) : Array.isArray(availableSlots) && availableSlots.length > 0 ? (
            <ScrollArea className="h-72">
              <div className="grid grid-cols-2 gap-2">
                {availableSlots.map((slot: TimeSlot, idx: number) => (
                  <Button
                    key={idx}
                    variant={selectedSlot && selectedSlot.startTime === slot.startTime ? "default" : "outline"}
                    className="justify-start"
                    onClick={() => handleSlotSelect(slot)}
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    {slot.startTime} - {slot.endTime}
                    {selectedSlot && selectedSlot.startTime === slot.startTime && (
                      <CheckCircle2 className="ml-2 h-4 w-4 text-green-500" />
                    )}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <Clock className="mb-2 h-10 w-10 text-muted-foreground" />
              <h3 className="font-medium">İsterseniz randevu ekleyebilirsiniz</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Bu tarih için standart 30 dakikalık aralıklarla randevu oluşturabilirsiniz.
              </p>
              <div className="grid grid-cols-2 gap-2 mt-4 w-full">
                {[
                  { startTime: "09:00", endTime: "09:30" },
                  { startTime: "09:30", endTime: "10:00" },
                  { startTime: "10:00", endTime: "10:30" },
                  { startTime: "10:30", endTime: "11:00" },
                  { startTime: "11:00", endTime: "11:30" },
                  { startTime: "11:30", endTime: "12:00" },
                  { startTime: "13:00", endTime: "13:30" },
                  { startTime: "13:30", endTime: "14:00" },
                  { startTime: "14:00", endTime: "14:30" },
                  { startTime: "14:30", endTime: "15:00" },
                  { startTime: "15:00", endTime: "15:30" },
                  { startTime: "15:30", endTime: "16:00" },
                  { startTime: "16:00", endTime: "16:30" },
                  { startTime: "16:30", endTime: "17:00" }
                ].map((slot, idx) => (
                  <Button
                    key={idx}
                    variant={selectedSlot && selectedSlot.startTime === slot.startTime ? "default" : "outline"}
                    className="justify-start"
                    onClick={() => handleSlotSelect(slot)}
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    {slot.startTime} - {slot.endTime}
                    {selectedSlot && selectedSlot.startTime === slot.startTime && (
                      <CheckCircle2 className="ml-2 h-4 w-4 text-green-500" />
                    )}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AvailabilityCalendar;