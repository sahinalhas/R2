import React from "react";
import { Users, MessageSquare, Calendar, FileText, TrendingUp, TrendingDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Appointment, Session } from "@shared/schema";

// Yeni modüler yapı hook'larını kullanıyoruz
import { useStudents } from "@/features/students/hooks/useStudentApi";
import { useAppointments, useTodayAppointments } from "@/features/appointments/hooks/useAppointmentApi";
import { useSessions } from "@/features/sessions/hooks/useSessionApi";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  change: {
    value: string;
    label: string;
    isIncrease: boolean;
  };
  loading: boolean;
  gradient: string;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon, 
  change, 
  loading,
  gradient
}) => {
  return (
    <div className="relative overflow-hidden backdrop-blur-sm rounded-xl p-4 sm:p-5 lg:p-6 group 
                hover:-translate-y-1.5 hover:scale-[1.02] transition-all duration-500 cursor-default
                border bg-white/90 hover:bg-white/95 dark:bg-gray-800/40 dark:hover:bg-gray-800/50
                border-white/30 dark:border-gray-700/30
                shadow-[0_0_15px_rgba(0,0,0,0.05)] hover:shadow-[0_10px_25px_rgba(0,0,0,0.07)]
                dark:shadow-gray-900/20 dark:hover:shadow-gray-900/30">
      {/* Premium arka plan efektleri */}
      <div className={`absolute -top-10 -right-10 w-32 md:w-52 h-32 md:h-52 opacity-10 rounded-full ${gradient} blur-3xl transform transition-all duration-700 ease-out group-hover:scale-125 group-hover:opacity-20 group-hover:rotate-12`}></div>
      <div className={`absolute -bottom-8 -left-5 w-24 md:w-40 h-24 md:h-40 opacity-5 rounded-full ${gradient} blur-3xl transform transition-all duration-700 ease-out group-hover:scale-150 group-hover:opacity-15 group-hover:-rotate-12`}></div>
      
      {/* Yarı saydam arka plan dekoru */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-transparent dark:from-gray-800/30 dark:via-transparent dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      {/* Prestijli parıltı efekti */}
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100"></div>
      
      <div className="flex justify-between items-start z-10 relative">
        <div>
          <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider dark:text-gray-400">{title}</p>
          {loading ? (
            <Skeleton className="h-8 sm:h-10 md:h-12 w-16 sm:w-20 md:w-24 mt-2" />
          ) : (
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight mt-1 md:mt-2
                       bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700 
                       dark:from-white dark:to-gray-300
                       transition-all duration-500 group-hover:-translate-y-0.5">
              {value}
            </h3>
          )}
        </div>
        
        <div className={`rounded-xl p-2.5 sm:p-3 
                      shadow-xl ring-1 ring-white/20
                      ${gradient} text-white 
                      transition-all duration-500 ease-out
                      group-hover:shadow-2xl group-hover:shadow-primary/15
                      group-hover:scale-110 group-hover:rotate-3`}>
          <div className="w-5 h-5 sm:w-6 sm:h-6">
            {icon}
          </div>
        </div>
      </div>
      
      <div className="flex flex-wrap items-center mt-3 md:mt-4 z-10 relative">
        <span className={`flex items-center text-xs font-medium px-2.5 py-1.5 rounded-full 
                       transition-all duration-500 group-hover:shadow-sm
                       ${change.isIncrease 
                          ? 'bg-emerald-50/90 text-emerald-600 ring-1 ring-emerald-200/50 dark:bg-emerald-900/40 dark:text-emerald-400 dark:ring-emerald-800/30' 
                          : 'bg-red-50/90 text-red-600 ring-1 ring-red-200/50 dark:bg-red-900/40 dark:text-red-400 dark:ring-red-800/30'
                        }`}>
          {change.isIncrease ? (
            <TrendingUp className="w-3 h-3 mr-1 animate-pulse" />
          ) : (
            <TrendingDown className="w-3 h-3 mr-1 animate-pulse" />
          )}
          {change.value}
        </span>
        <span className="text-gray-500 text-xs ml-2 dark:text-gray-400">{change.label}</span>
      </div>
    </div>
  );
};

const StatCards = () => {
  const { data: students, isLoading: loadingStudents } = useStudents();
  const { data: sessions, isLoading: loadingSessions } = useSessions();
  const { data: appointments, isLoading: loadingAppointments } = useAppointments();
  const { data: todayAppointments, isLoading: loadingTodayAppointments } = useTodayAppointments();
  
  // Tamamlanmamış işler (bekleyen randevular) sayısını hesapla
  const pendingTasks = appointments?.filter((a: Appointment) => a.status === "Bekliyor").length || 0;
  
  // Bu ayki görüşmeleri hesapla
  const currentMonth = new Date().getMonth() + 1; // 0-indexed -> 1-indexed
  const currentYear = new Date().getFullYear();
  const sessionsThisMonth = sessions?.filter((s: Session) => {
    const sessionDate = new Date(s.date);
    return (
      sessionDate.getMonth() + 1 === currentMonth && 
      sessionDate.getFullYear() === currentYear
    );
  }).length || 0;

  return (
    <div className="relative mb-6 sm:mb-8 md:mb-10 pt-1 sm:pt-2 pb-2 sm:pb-4">
      {/* Decorative blobs - mobil için optimize edilmiş */}
      <div className="absolute -top-16 sm:-top-24 md:-top-32 -left-10 sm:-left-20 w-48 sm:w-72 md:w-96 h-48 sm:h-72 md:h-96 bg-primary/10 rounded-full blur-3xl opacity-80 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-16 sm:-bottom-24 md:-bottom-32 -right-10 sm:-right-20 w-48 sm:w-72 md:w-96 h-48 sm:h-72 md:h-96 bg-blue-500/10 rounded-full blur-3xl opacity-80 animate-blob animation-delay-4000"></div>
      <div className="absolute top-1/3 left-1/3 w-36 sm:w-48 md:w-72 h-36 sm:h-48 md:h-72 bg-purple-500/5 rounded-full blur-3xl opacity-60 animate-blob animation-delay-3000"></div>
      
      <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        {/* Toplam Öğrenci - Premium mavi ton */}
        <StatCard 
          title="Toplam Öğrenci"
          value={students?.length || 0}
          icon={<Users className="w-5 h-5 sm:w-6 sm:h-6" />}
          change={{
            value: "4.75%",
            label: "geçen dönemden",
            isIncrease: true
          }}
          loading={loadingStudents}
          gradient="bg-gradient-to-br from-primary to-blue-500/90"
        />
        
        {/* Bu Ay Görüşme - Sofistike mor ton */}
        <StatCard 
          title="Bu Ay Görüşme"
          value={sessionsThisMonth}
          icon={<MessageSquare className="w-5 h-5 sm:w-6 sm:h-6" />}
          change={{
            value: "12.4%",
            label: "geçen aydan",
            isIncrease: true
          }}
          loading={loadingSessions}
          gradient="bg-gradient-to-br from-violet-600 to-purple-500/90"
        />
        
        {/* Bugünkü Randevular - Prestijli turkuaz ton */}
        <StatCard 
          title="Bugünkü Randevular"
          value={todayAppointments?.length || 0}
          icon={<Calendar className="w-5 h-5 sm:w-6 sm:h-6" />}
          change={{
            value: "5.25%",
            label: "geçen haftadan",
            isIncrease: false
          }}
          loading={loadingTodayAppointments}
          gradient="bg-gradient-to-br from-teal-600 to-emerald-500/90"
        />
        
        {/* Tamamlanmamış İşler - Zarif amber ton */}
        <StatCard 
          title="Tamamlanmamış İşler"
          value={pendingTasks}
          icon={<FileText className="w-5 h-5 sm:w-6 sm:h-6" />}
          change={{
            value: "2.5%",
            label: "tamamlama oranı",
            isIncrease: true
          }}
          loading={loadingAppointments}
          gradient="bg-gradient-to-br from-amber-500 to-yellow-400/90"
        />
      </div>
    </div>
  );
};

export default StatCards;