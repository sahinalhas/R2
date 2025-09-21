import { Container } from "@/components/ui/container";
import { 
  StatCards,
  Calendar as CalendarComponent, 
  TodayAppointments as AppointmentList,
  QuickActions,
  RecentActivities
} from "@/features/dashboard";
import { 
  ArrowDownToLine, 
  ArrowUpToLine, 
  Sparkles, 
  CalendarDays, 
  Brain,
  Lightbulb,
  Clock,
  Zap,
  ListTodo,
  Users,
  GraduationCap,
  Loader2
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

const Dashboard = () => {
  const [mounted, setMounted] = useState(false);
  const [greeting, setGreeting] = useState("Merhaba");
  const [userName, setUserName] = useState("");
  const [todaysAppointments, setTodaysAppointments] = useState(0);
  const [pendingTasks, setPendingTasks] = useState(0);
  
  // Kullanıcı bilgilerini getir
  const { data: personalInfo, isLoading: personalInfoLoading } = useQuery<any[]>({
    queryKey: ['/api/users/1/settings/personal'],
    staleTime: 5 * 60 * 1000 // 5 dakika
  });
  
  // Bugünkü randevuları getir
  const { data: appointments, isLoading: appointmentsLoading } = useQuery<any[]>({
    queryKey: ['/api/appointments'],
    staleTime: 60 * 1000 // 1 dakika
  });
  
  // Saate göre selamlama mesajını değiştir ve kullanıcı bilgilerini ayarla
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setGreeting("Günaydın");
    } else if (hour >= 12 && hour < 18) {
      setGreeting("İyi günler");
    } else {
      setGreeting("İyi akşamlar");
    }
    
    // Animasyon için mounted state'ini güncelle
    setMounted(true);
    
    // Kullanıcı bilgilerini ayarla
    if (personalInfo && Array.isArray(personalInfo)) {
      const fullName = personalInfo.find((item: any) => item.settingKey === "fullName")?.settingValue;
      if (fullName) {
        // İsmini soyadından ayırma (Ali Has -> Ali)
        const firstName = fullName.split(' ')[0];
        setUserName(firstName);
      }
    }
    
    // Bugünkü randevuları hesapla
    if (appointments && Array.isArray(appointments)) {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD formatında bugünün tarihi
      
      // Bugün olan randevuları filtrele
      const todaysAppts = appointments.filter((appointment: any) => {
        // date alanı YYYY-MM-DD formatında
        return appointment.date === today;
      });
      
      setTodaysAppointments(todaysAppts.length);
      
      // Bekleyen görevleri (hatırlatıcılar, tamamlanmamış görevler vb.) hesapla
      const pendingTasks = appointments.filter((appointment: any) => {
        return appointment.status === "Bekliyor";
      }).length;
      
      setPendingTasks(pendingTasks);
    }
  }, [personalInfo, appointments]);

  return (
    <Container>
      <div className="py-12 relative overflow-hidden">
        {/* Dekoratif arka plan elemanları */}
        <div className="absolute inset-0 overflow-hidden -z-10">
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-60 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-70"></div>
          <div className="absolute top-40 right-20 w-20 h-20 bg-blue-500/10 rounded-full blur-2xl"></div>
          <div className="absolute top-1/3 left-1/3 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl"></div>
          
          <Sparkles className="absolute top-20 right-40 text-primary/20 w-6 h-6 animate-pulse" />
          <ArrowUpToLine className="absolute top-40 right-60 text-emerald-500/20 w-5 h-5 rotate-45 animate-bounce" style={{ animationDuration: '3s' }} />
          <ArrowDownToLine className="absolute top-60 right-20 text-amber-500/20 w-5 h-5 -rotate-12 animate-bounce" style={{ animationDuration: '4s' }} />
          <Brain className="absolute bottom-20 left-40 text-primary/10 w-8 h-8 animate-pulse" style={{ animationDuration: '5s' }} />
          <Lightbulb className="absolute top-80 left-20 text-yellow-500/20 w-5 h-5 animate-pulse" style={{ animationDuration: '4s' }} />
        </div>
        
        {/* Ana başlık - Mobil optimizasyonu */}
        <div className={cn(
          "mb-6 sm:mb-8 md:mb-10 transition-all duration-700 ease-out relative",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
        )}>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-neutral-900 mb-1 flex flex-wrap sm:flex-nowrap items-center">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70 mr-1">{greeting},</span> 
            {personalInfoLoading ? (
              <span className="mr-2 flex items-center">
                <Loader2 className="h-4 w-4 mr-1 animate-spin text-primary" />
                <span className="text-gray-500 text-sm">Yükleniyor...</span>
              </span>
            ) : (
              <span className="mr-2">{userName || "Kullanıcı"}!</span>
            )}
            <span className="relative">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500 animate-pulse" />
              <span className="absolute top-0 right-0 w-1.5 sm:w-2 h-1.5 sm:h-2 bg-amber-500 rounded-full animate-ping"></span>
            </span>
          </h1>
          <p className="text-gray-500 flex flex-wrap items-center text-base sm:text-lg">
            <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-1.5 text-amber-500 flex-shrink-0" />
            {appointmentsLoading ? (
              <span className="flex items-center">
                <Loader2 className="h-3 w-3 mr-1 animate-spin text-primary" />
                <span className="text-sm">Yükleniyor...</span>
              </span>
            ) : (
              <span>Bugün <span className="font-semibold text-primary">{todaysAppointments} randevun</span> ve <span className="font-semibold text-primary">{pendingTasks} bekleyen</span> görevin var</span>
            )}
          </p>
        </div>
        
        {/* İstatistik Kartları */}
        <div className={cn(
          "transition-all duration-1000 ease-out", 
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}>
          <StatCards />
        </div>
        
        <div className={cn(
          "grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 lg:gap-8 mt-6 md:mt-10 transition-all duration-1000 ease-out delay-200",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"  
        )}>
          {/* Sol Bölüm - Takvim ve Randevular */}
          <div className="lg:col-span-7 space-y-4 md:space-y-6 lg:space-y-8">
            <div className="relative">
              {/* Dekoratif arka plan elementleri - mobil ekranlarda boyutunu küçült */}
              <div className="absolute -top-10 -right-10 w-32 sm:w-48 md:w-64 h-32 sm:h-48 md:h-64 bg-primary/5 rounded-full blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-3 sm:p-4 md:p-6 border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-500 group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/2 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <h2 className="text-lg sm:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 mb-3 md:mb-5 flex items-center group-hover:-translate-y-0.5 transition-all duration-300 relative">
                  <span className="bg-gradient-to-br from-primary/20 to-primary/5 p-1.5 md:p-2.5 rounded-lg md:rounded-xl mr-2 md:mr-3 text-primary border border-primary/10 shadow-lg shadow-primary/5 group-hover:shadow-primary/10 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                    <CalendarDays className="w-4 h-4 md:w-5 md:h-5" />
                  </span>
                  Takvim Görünümü
                </h2>
                
                <div className="relative z-10 overflow-x-auto">
                  <CalendarComponent />
                </div>
              </div>
            </div>
            
            <div className="relative">
              {/* Dekoratif arka plan elementleri - mobil için optimize */}
              <div className="absolute -bottom-20 -left-10 w-32 sm:w-48 md:w-64 h-32 sm:h-48 md:h-64 bg-amber-500/5 rounded-full blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-3 sm:p-4 md:p-6 border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-500 group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/2 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <h2 className="text-lg sm:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 mb-3 md:mb-5 flex items-center group-hover:-translate-y-0.5 transition-all duration-300 relative">
                  <span className="bg-gradient-to-br from-amber-500/20 to-amber-500/5 p-1.5 md:p-2.5 rounded-lg md:rounded-xl mr-2 md:mr-3 text-amber-500 border border-amber-500/10 shadow-lg shadow-amber-500/5 group-hover:shadow-amber-500/10 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300">
                    <ListTodo className="w-4 h-4 md:w-5 md:h-5" />
                  </span>
                  Yaklaşan Randevular
                </h2>
                
                <div className="relative z-10">
                  <AppointmentList />
                </div>
              </div>
            </div>
          </div>
          
          {/* Sağ Bölüm - Hızlı İşlemler ve Son Etkinlikler */}
          <div className="lg:col-span-5 space-y-4 md:space-y-6 lg:space-y-8 mt-2 sm:mt-4 md:mt-0">
            <div className="relative">
              {/* Dekoratif arka plan elementleri - mobil için optimize */}
              <div className="absolute top-10 sm:top-20 -right-5 sm:-right-10 w-32 sm:w-48 h-32 sm:h-48 bg-blue-500/5 rounded-full blur-3xl opacity-80 animate-blob animation-delay-3000"></div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-3 sm:p-4 md:p-6 border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-500 group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tl from-blue-500/2 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <h2 className="text-lg sm:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 mb-3 md:mb-5 flex items-center group-hover:-translate-y-0.5 transition-all duration-300 relative">
                  <span className="bg-gradient-to-br from-blue-500/20 to-blue-500/5 p-1.5 md:p-2.5 rounded-lg md:rounded-xl mr-2 md:mr-3 text-blue-500 border border-blue-500/10 shadow-lg shadow-blue-500/5 group-hover:shadow-blue-500/10 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300">
                    <Zap className="w-4 h-4 md:w-5 md:h-5" />
                  </span>
                  <span className="relative">
                    Hızlı İşlemler
                    <span className="absolute -top-1 -right-3 flex h-1.5 md:h-2 w-1.5 md:w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 md:h-2 w-1.5 md:w-2 bg-blue-500"></span>
                    </span>
                  </span>
                </h2>
                
                <div className="relative z-10">
                  <QuickActions />
                </div>
              </div>
            </div>
            
            <div className="relative">
              {/* Dekoratif arka plan elementleri - mobil için optimize*/}
              <div className="absolute bottom-5 sm:bottom-10 left-5 sm:left-10 w-32 sm:w-48 md:w-56 h-32 sm:h-48 md:h-56 bg-emerald-500/5 rounded-full blur-3xl opacity-70 animate-blob animation-delay-5000"></div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-3 sm:p-4 md:p-6 border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-500 group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/2 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <h2 className="text-lg sm:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 mb-3 md:mb-5 flex items-center group-hover:-translate-y-0.5 transition-all duration-300 relative">
                  <span className="bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 p-1.5 md:p-2.5 rounded-lg md:rounded-xl mr-2 md:mr-3 text-emerald-500 border border-emerald-500/10 shadow-lg shadow-emerald-500/5 group-hover:shadow-emerald-500/10 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                    <GraduationCap className="w-4 h-4 md:w-5 md:h-5" />
                  </span>
                  Son Etkinlikler
                </h2>
                
                <div className="relative z-10">
                  <RecentActivities />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default Dashboard;
