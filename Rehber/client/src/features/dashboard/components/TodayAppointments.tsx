import React from "react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { 
  Plus, 
  ChevronRight,
  Calendar as CalendarIcon,
} from "lucide-react";
import { Appointment } from "@shared/schema";
import { 
  Dialog,
  DialogTrigger,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import NewAppointmentModal from "@/components/modals/NewAppointmentModal";

// Artık hook'ları ve bileşenleri features klasöründen import ediyoruz
import { useTodayAppointments } from "@/features/appointments/hooks/useAppointmentApi";
import { AppointmentItem } from "@/features/appointments/components/AppointmentItem";

const TodayAppointments = () => {
  const { data: appointments, isLoading } = useTodayAppointments();
  
  // Tarih bilgisi
  const today = new Date();
  const formattedDate = format(today, 'd MMMM yyyy', { locale: tr });
  
  // Tarih bilgisini daha güzel formatta
  const dayName = format(today, 'EEEE', { locale: tr });
  const dayNumber = format(today, 'd', { locale: tr });
  const month = format(today, 'MMMM', { locale: tr });

  return (
    <div className="bg-white/95 dark:bg-gray-800/20 backdrop-blur-sm 
                  rounded-xl p-5 sm:p-6 overflow-hidden
                  shadow-[0_2px_20px_rgba(0,0,0,0.04)] dark:shadow-gray-900/10
                  hover:shadow-[0_5px_30px_rgba(0,0,0,0.07)] dark:hover:shadow-gray-900/20
                  border border-white/50 dark:border-gray-800/30 
                  transition-all duration-500 ease-out
                  relative group">
      {/* Premium dekoratif arka plan elementleri */}
      <div className="absolute -top-20 -right-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl opacity-60 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-10 -left-20 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl opacity-60 animate-blob animation-delay-4000"></div>
      <div className="absolute bottom-40 right-40 w-32 h-32 bg-teal-500/5 rounded-full blur-2xl opacity-50 animate-blob animation-delay-3000"></div>
      
      {/* Hover efekti */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 dark:from-gray-800/20 dark:via-transparent dark:to-transparent"></div>
      
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-8 relative z-10">
        <div className="flex items-start space-x-4">
          <div className="bg-gradient-to-br from-primary/20 to-primary/5 
                       text-primary p-3.5 rounded-xl 
                       flex flex-col items-center 
                       border border-primary/10 
                       shadow-lg shadow-primary/5
                       transform transition-all duration-300 ease-out
                       group-hover:scale-105 group-hover:rotate-1 group-hover:shadow-xl group-hover:shadow-primary/10">
            <span className="text-xs font-semibold uppercase tracking-wider">{dayName.substring(0, 3)}</span>
            <span className="text-2xl font-extrabold tracking-tighter">{dayNumber}</span>
          </div>
          
          <div className="group-hover:-translate-y-0.5 transition-transform duration-300">
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 tracking-tight">Bugünkü Randevular</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1 flex items-center">
              <CalendarIcon className="w-3.5 h-3.5 mr-1.5 text-gray-400 dark:text-gray-500" />
              {dayName}, {dayNumber} {month}
            </p>
          </div>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-primary to-primary/90 
                            text-white 
                            rounded-xl px-4 py-2.5 
                            font-medium 
                            shadow-lg shadow-primary/20 
                            hover:shadow-xl hover:shadow-primary/30 
                            hover:-translate-y-1 hover:scale-[1.02]
                            active:scale-[0.98]
                            transition-all duration-300 ease-out">
              <Plus className="w-4 h-4 mr-1.5" />
              Yeni Randevu
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md rounded-xl border-gray-100/80 dark:border-gray-800/30">
            <NewAppointmentModal />
          </DialogContent>
        </Dialog>
      </div>
      
      {isLoading ? (
        // Yükleme durumu
        <div className="space-y-5">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-xl p-5 border border-gray-100/80 bg-white/80 shadow-lg">
              {/* Top gradient line */}
              <div className="h-1.5 w-full bg-gradient-to-r from-gray-200 to-gray-100 rounded-t-xl mb-4"></div>
              
              <div className="flex justify-between mb-5">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-14 w-14 rounded-2xl" />
                  <div>
                    <Skeleton className="h-6 w-40 mb-2.5" />
                    <div className="flex gap-2">
                      <Skeleton className="h-4 w-20 rounded-md" />
                      <Skeleton className="h-4 w-28 rounded-md" />
                    </div>
                  </div>
                </div>
                <Skeleton className="h-9 w-9 rounded-lg" />
              </div>
              
              <Skeleton className="h-px w-full my-5" />
              
              <div className="flex justify-between items-center">
                <Skeleton className="h-9 w-28 rounded-lg" />
                <Skeleton className="h-9 w-24 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : appointments && appointments.length > 0 ? (
        // Randevuları listele
        <div className="space-y-5">
          {appointments.map((appointment) => (
            <AppointmentItem key={appointment.id} appointment={appointment} />
          ))}
        </div>
      ) : (
        // Randevu yoksa
        <div className="text-center py-10 px-6 rounded-xl bg-gray-50/70 dark:bg-gray-800/10 border border-gray-100 dark:border-gray-800/30">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3 font-display tracking-tight">
            Bugün için randevu bulunmuyor
          </h3>
          
          <p className="text-gray-500 text-sm mb-8 max-w-sm mx-auto leading-relaxed">
            Günlük programınızı yönetmek için yeni randevular oluşturabilirsiniz. Öğrencilerinizle görüşmelerinizi kolayca takip edin.
          </p>
          
          <Button className="bg-gradient-to-r from-primary to-primary/80 text-white rounded-xl px-5 py-2.5 font-medium shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-300 mx-auto">
            <Plus className="w-4 h-4 mr-1.5" />
            Randevu Oluştur
          </Button>
        </div>
      )}
      
      {appointments && appointments.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-100 flex justify-center">
          <Button 
            variant="ghost" 
            className="text-primary hover:bg-primary/5 font-medium text-sm"
          >
            <span>Tüm randevuları görüntüle</span>
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default TodayAppointments;