import { Switch, Route, useLocation } from "wouter";
import { TooltipProvider } from "@/components/ui/tooltip";
import { NotificationProvider } from "@/context/NotificationContext";
import { Toaster } from "@/components/ui/toaster";
import { useState, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";
import { 
  Home, 
  Users, 
  Calendar, 
  MessageSquare, 
  BarChart, 
  ClipboardCheck, 
  Settings as SettingsIcon,
  Menu,
  X
} from "lucide-react";

import Sidebar from "@/components/layout/Sidebar";
import MobileNav from "@/components/layout/MobileNav";
import Header from "@/components/layout/Header";
import { NotificationToaster } from "@/components/layout/NotificationCenter";

import Dashboard from "@/pages/Dashboard";
import Students from "@/pages/Students";
import StudentDetailLayout from "@/pages/students/StudentDetailLayout";
import Appointments from "@/pages/Appointments";
import Sessions from "@/pages/Sessions";
import Reports from "@/pages/Reports";
import Statistics from "@/pages/Statistics";
import Settings from "@/pages/Settings";
import NotificationTestPage from "@/pages/NotificationTestPage";
import NotFound from "@/pages/not-found";
import Profile from "@/pages/Profile";
// Ders saatleri modülü kaldırıldı

// Anket Sayfaları
import Surveys from "@/pages/Surveys";
// Modüler yapıdan içe aktarma
import { SurveyDetail } from "@/pages/surveys"; 
import SurveyCreate from "@/pages/SurveyCreate";
import SurveyResponses from "@/pages/SurveyResponses";
import SurveyImport from "@/pages/SurveyImport";

function App() {
  const [location, setLocation] = useLocation();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { theme } = useTheme();

  // Aydınlık/karanlık mod ayarını HTML elementine uygula
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Aydınlık/karanlık mod sınıfını güncelle
    if (theme.appearance === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // Sayfa köşe yuvarlaklığını güncelle
    root.style.setProperty('--radius', `${theme.radius}rem`);
  }, [theme.appearance, theme.radius]);

  // Menü öğeleri
  const menuItems = [
    { icon: <Home className="w-5 h-5" />, label: "Ana Sayfa", path: "/" },
    { icon: <Users className="w-5 h-5" />, label: "Öğrenciler", path: "/ogrenciler" },
    { icon: <Calendar className="w-5 h-5" />, label: "Randevular", path: "/randevular" },
    { icon: <MessageSquare className="w-5 h-5" />, label: "Görüşmeler", path: "/gorusmeler" },
    // Ders saatleri menü öğesi kaldırıldı
    { icon: <BarChart className="w-5 h-5" />, label: "Raporlar", path: "/raporlar" },
    { icon: <ClipboardCheck className="w-5 h-5" />, label: "Anketler", path: "/anketler" },
    { icon: <SettingsIcon className="w-5 h-5" />, label: "Ayarlar", path: "/ayarlar" },
  ];

  // Rota değiştiğinde mobil menüyü kapat
  const navigateTo = (path: string) => {
    setLocation(path);
    setShowMobileMenu(false);
  };

  return (
    <NotificationProvider>
      <TooltipProvider>
        <div className={cn(
          "flex h-screen overflow-hidden",
          "bg-background text-foreground",
          theme.appearance === 'dark' ? 'dark' : ''
        )}>
          <Sidebar />
          
          <div className="flex flex-col flex-1 overflow-hidden">

            <Header />
            
            <main className={cn(
              "flex-1 overflow-y-auto pb-16 md:pb-0",
              theme.appearance === 'dark' ? 'bg-gray-900' : 'bg-neutral-50'
            )}>
              <Switch>
                <Route path="/" component={Dashboard} />
                <Route path="/ogrenciler" component={Students} />
                <Route path="/ogrenciler/detay/:id/:tab?">
                  {(params) => <StudentDetailLayout id={parseInt(params.id)} activeTab={params.tab} />}
                </Route>
                <Route path="/ogrenciler/duzenle/:id" component={Students} />
                <Route path="/randevular" component={Appointments} />
                <Route path="/gorusmeler" component={Sessions} />
                {/* Ders saatleri sayfası kaldırıldı */}
                <Route path="/raporlar" component={Reports} />
                
                {/* Anket Sayfaları */}
                <Route path="/anketler" component={Surveys} />
                <Route path="/anketler/olustur" component={SurveyCreate} />
                <Route path="/anketler/:id">
                  {(params) => <SurveyDetail id={parseInt(params.id)} />}
                </Route>
                <Route path="/anketler/:id/yanitlar">
                  {(params) => <SurveyResponses id={parseInt(params.id)} />}
                </Route>
                <Route path="/anketler/:id/import">
                  {(params) => <SurveyImport id={parseInt(params.id)} />}
                </Route>
                
                <Route path="/profilim" component={Profile} />
                
                {/* Ayarlar Sayfaları */}
                <Route path="/ayarlar" component={Settings} />
                <Route path="/ayarlar/:tab" component={Settings} />
                
                <Route path="/bildirim-test" component={NotificationTestPage} />
                <Route component={NotFound} />
              </Switch>
            </main>
          </div>
        </div>
        
        {/* Mobil Tab Bar */}
        <MobileNav />
        
        {/* Bildirim sistemi bileşenleri */}
        <NotificationToaster />
        <Toaster />
      </TooltipProvider>
    </NotificationProvider>
  );
}

export default App;
