import React, { useState } from "react";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { 
  add, 
  format, 
  getDay, 
  isToday, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth,
  isSameDay,
  isWithinInterval,
  subDays,
  addDays
} from "date-fns";
import { tr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Appointment } from "@shared/schema";

// Yeni modüler yapı hook'larını kullanıyoruz
import { useAppointmentsByMonth } from "@/features/appointments/hooks/useAppointmentApi";

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Yeni hook'ları kullanıyoruz
  const { data: monthAppointments } = useAppointmentsByMonth(
    currentDate.getFullYear(),
    currentDate.getMonth()
  );
  
  // Ay içindeki tüm günleri oluştur
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Ayın ilk gününün haftanın kaçıncı günü olduğunu belirle (Pazartesi: 0, Pazar: 6)
  const startDay = getDay(monthStart);
  
  // Kısa gün isimleri (Pazartesi'den başlayarak)
  const weekDays = ['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pa'];
  
  // Önceki aya git
  const prevMonth = () => {
    setCurrentDate(prev => add(prev, { months: -1 }));
  };
  
  // Sonraki aya git
  const nextMonth = () => {
    setCurrentDate(prev => add(prev, { months: 1 }));
  };
  
  // Belirli bir günde randevu olup olmadığını kontrol et
  const hasAppointment = (day: Date) => {
    return monthAppointments?.some((appointment: Appointment) => 
      isSameDay(new Date(appointment.date), day)
    );
  };
  
  // Belirli bir gündeki randevu sayısını bul
  const getAppointmentCount = (day: Date) => {
    return monthAppointments?.filter((appointment: Appointment) => 
      isSameDay(new Date(appointment.date), day)
    ).length || 0;
  };

  // Bugün - 3 ile bugün + 3 arasındaki tarih aralığını belirle (haftalık görünüm için)
  const today = new Date();
  const weekStart = subDays(today, 3);
  const weekEnd = addDays(today, 3);
  const isWithinWeek = (day: Date) => isWithinInterval(day, { start: weekStart, end: weekEnd });

  return (
    <div className="overflow-hidden relative">
      {/* Dekoratif arka plan elementleri */}
      <div className="absolute -top-10 -right-10 w-48 h-48 bg-sky-500/5 rounded-full blur-3xl opacity-70 animate-blob animation-delay-3000"></div>
      <div className="absolute bottom-20 -left-20 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
      
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 capitalize dark:from-white dark:to-gray-300">
            {format(currentDate, 'MMMM yyyy', { locale: tr })}
          </h2>
          <div className="text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary font-medium ring-1 ring-primary/20 flex items-center shadow-sm">
            <CalendarDays className="w-3 h-3 mr-1" />
            {monthAppointments?.length || 0} randevu
          </div>
        </div>
        
        <div className="flex items-center bg-white/80 p-1 rounded-xl backdrop-blur-sm shadow-sm border border-gray-100/80">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={prevMonth}
            className="rounded-lg hover:bg-gray-50 hover:shadow-sm text-gray-600 transition-all duration-300"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="mx-1 rounded-lg bg-primary/10 text-primary font-medium text-xs px-3 hover:bg-primary/20 transition-all duration-300"
            onClick={() => setCurrentDate(new Date())}
          >
            Bugün
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={nextMonth}
            className="rounded-lg hover:bg-gray-50 hover:shadow-sm text-gray-600 transition-all duration-300"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      {/* Haftalık hızlı bakış - mobil ve tablet cihazlar için */}
      <div className="overflow-x-auto pb-6 -mx-1 px-1 mb-5 md:hidden">
        <div className="flex space-x-3">
          {eachDayOfInterval({ start: weekStart, end: weekEnd }).map(day => {
            const isActiveDay = isToday(day);
            const hasAppt = hasAppointment(day);
            const appointmentCount = getAppointmentCount(day);
            
            return (
              <div key={day.toString()} className="flex flex-col items-center min-w-[4.25rem]">
                <div className="text-xs text-gray-500 font-medium mb-1.5 uppercase">
                  {format(day, 'E', { locale: tr })}
                </div>
                <div 
                  className={`
                    w-14 h-14 rounded-2xl flex flex-col items-center justify-center 
                    transition-all duration-300 transform hover:scale-105 group
                    backdrop-blur-sm border
                    ${isActiveDay 
                      ? 'bg-gradient-to-br from-primary to-primary/80 text-white shadow-lg shadow-primary/20 border-primary/20' 
                      : hasAppt 
                        ? 'bg-gradient-to-br from-emerald-50 to-white/80 text-emerald-700 shadow-md border-emerald-200/70' 
                        : 'bg-white/80 hover:bg-white border-gray-100 hover:shadow-sm'
                    }
                  `}
                >
                  <span className={`text-lg ${isActiveDay ? 'font-bold' : hasAppt ? 'font-semibold' : ''}`}>
                    {format(day, 'd')}
                  </span>
                  {appointmentCount > 0 && (
                    <span className={`text-[10px] mt-0.5 flex items-center ${isActiveDay ? 'text-white/90' : 'text-emerald-700'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full mr-0.5 ${isActiveDay ? 'bg-white' : 'bg-emerald-500'} animate-pulse`}></span>
                      {appointmentCount} randevu
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Tam ay görünümü */}
      <div className="rounded-2xl bg-white/90 backdrop-blur-sm p-5 shadow-lg border border-gray-100/80 transition-all duration-300 hover:shadow-xl">
        <div className="grid grid-cols-7 gap-2 text-center">
          {/* Gün isimleri */}
          {weekDays.map(day => (
            <div key={day} className="text-gray-500 text-xs font-semibold py-2 uppercase tracking-wider">
              {day}
            </div>
          ))}
          
          {/* Boş günler (ay başlangıcından önceki) */}
          {Array.from({ length: startDay }).map((_, index) => (
            <div key={`empty-${index}`} className="p-1" />
          ))}
          
          {/* Ayın günleri */}
          {daysInMonth.map(day => {
            const isCurrentDay = isToday(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const hasAppt = hasAppointment(day);
            const appointmentCount = getAppointmentCount(day);
            const isInWeekView = isWithinWeek(day);
            
            return (
              <div 
                key={day.toString()} 
                className={`relative group ${!isCurrentMonth ? 'opacity-40' : ''}`}
              >
                <div 
                  className={`
                    flex flex-col items-center justify-center rounded-xl aspect-square p-1
                    transition-all duration-300 cursor-pointer hover:-translate-y-0.5
                    ${isCurrentDay 
                      ? 'bg-gradient-to-br from-primary to-primary/80 text-white shadow-lg ring-1 ring-primary/30' 
                      : hasAppt 
                        ? 'bg-gradient-to-br from-emerald-50/80 to-white backdrop-blur-sm border border-emerald-200/70 hover:border-emerald-300 hover:shadow-md' 
                        : 'bg-white/50 hover:bg-white border border-transparent hover:border-gray-200/80 hover:shadow-sm'
                    }
                    ${isInWeekView && !isCurrentDay && !hasAppt ? 'bg-gray-50/60 border-gray-100/80 border shadow-sm' : ''}
                  `}
                >
                  <span className={`text-sm ${isCurrentDay ? 'font-bold' : hasAppt ? 'font-medium' : ''}`}>
                    {format(day, 'd')}
                  </span>
                  
                  {appointmentCount > 0 && (
                    <div 
                      className={`
                        text-[10px] font-medium mt-1 flex items-center gap-0.5
                        ${isCurrentDay ? 'text-white/90' : 'text-emerald-600'}
                      `}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isCurrentDay ? 'bg-white' : 'bg-emerald-400'} animate-pulse`}></span>
                      <span>{appointmentCount}</span>
                    </div>
                  )}
                </div>
                
                {/* Tooltip on hover */}
                {appointmentCount > 0 && (
                  <div className="absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-44 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none scale-0 group-hover:scale-100 origin-bottom">
                    <div className="bg-gray-900/90 text-white text-xs rounded-lg p-2.5 shadow-xl backdrop-blur-sm">
                      <p className="font-medium">{format(day, 'd MMMM', { locale: tr })}</p>
                      <p className="text-gray-300 mt-1">{appointmentCount} randevu</p>
                    </div>
                    <div className="h-2 w-2 bg-gray-900/90 transform rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Calendar;