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
import { format, isAfter, addDays } from "date-fns";
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
      <Card className="w-full md:w-1/2 border-0 shadow-md rounded-2xl ring-1 ring-black/5 dark:ring-white/10">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <CalendarIcon className="h-5 w-5" />
              Randevu Takvimi
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="rounded-full" onClick={() => setSelectedDate(new Date())}>Bugün</Button>
              <div className="flex gap-1">
                <Button variant="outline" size="icon" className="rounded-full" onClick={() => setSelectedDate(addDays(selectedDate, -1))} aria-label="Önceki gün">
                  <span className="sr-only">Önceki</span>
                  ‹
                </Button>
                <Button variant="outline" size="icon" className="rounded-full" onClick={() => setSelectedDate(addDays(selectedDate, 1))} aria-label="Sonraki gün">
                  <span className="sr-only">Sonraki</span>
                  ›
                </Button>
              </div>
            </div>
          </div>
          <CardDescription className="text-xs md:text-sm">
            Uygun bir tarih seçin
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="rounded-xl border bg-card p-2">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(newDate) => newDate && setSelectedDate(newDate)}
              locale={tr}
              className="rounded-xl"
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
          </div>
          <div className="flex mt-3 text-xs md:text-sm text-muted-foreground justify-between">
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
      <Card className="w-full md:w-1/2 border-0 shadow-md rounded-2xl ring-1 ring-black/5 dark:ring-white/10">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <Clock className="h-5 w-5" />
            Uygun Saatler
          </CardTitle>
          <CardDescription className="text-xs md:text-sm">
            {format(selectedDate, "d MMMM yyyy", { locale: tr })} için mevcut zaman aralıkları
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          {loadingSlots ? (
            <div className="grid grid-cols-2 gap-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-10 rounded-full bg-muted animate-pulse" />
              ))}
            </div>
          ) : Array.isArray(availableSlots) && availableSlots.length > 0 ? (
            <ScrollArea className="h-72">
              <div className="grid grid-cols-2 gap-2 pr-2">
                {availableSlots.map((slot: TimeSlot, idx: number) => (
                  <Button
                    key={idx}
                    variant={selectedSlot && selectedSlot.startTime === slot.startTime ? "default" : "outline"}
                    className={"justify-center rounded-full h-10 transition-colors data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"}
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
            <div className="rounded-xl border p-4 text-center bg-muted/30">
              <Clock className="mb-2 h-10 w-10 text-muted-foreground mx-auto" />
              <h3 className="font-medium">Ön tanımlı aralıklardan seçim yapın</h3>
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
                    className="justify-center rounded-full h-10"
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
