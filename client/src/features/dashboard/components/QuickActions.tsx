import React from "react";
import { useLocation } from "wouter";
import { 
  UserPlus, 
  Calendar, 
  ClipboardList, 
  BarChart3 
} from "lucide-react";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import NewAppointmentModal from "@/components/modals/NewAppointmentModal";
import ActionCard from "./quick-actions/ActionCard";

// Ana QuickActions bileşeni
const QuickActions = () => {
  const [, setLocation] = useLocation();

  return (
    <div className="mb-8 relative">
      {/* Dekoratif arka plan elementleri */}
      <div className="absolute -bottom-10 -right-20 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl opacity-70 animate-blob animation-delay-3000"></div>
      <div className="absolute -top-20 -left-5 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
      
      {/* Grup animasyonu */}
      <div className="space-y-4 relative transform transition-all duration-500 hover:scale-[1.01]">
        {/* Zigzag dekoratif çizgi */}
        <div className="absolute left-7 top-16 bottom-8 w-0.5 bg-gradient-to-b from-blue-200 via-purple-200 to-emerald-200 z-0 hidden md:block"></div>
        
        <ActionCard 
          icon={<UserPlus className="w-5 h-5" />} 
          title="Öğrenci Ekle"
          description="Yeni öğrenci kaydı oluştur"
          color="blue"
          onClick={() => setLocation("/ogrenciler?new=true")}
        />
        
        <Dialog>
          <DialogTrigger asChild>
            <ActionCard 
              icon={<Calendar className="w-5 h-5" />} 
              title="Randevu Planla"
              description="Öğrenciler için randevu oluştur"
              color="purple"
            />
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <NewAppointmentModal />
          </DialogContent>
        </Dialog>
        
        <ActionCard 
          icon={<ClipboardList className="w-5 h-5" />} 
          title="Görüşme Notu"
          description="Yapılan görüşme bilgilerini kaydet"
          color="amber"
          onClick={() => setLocation("/gorusmeler?new=true")}
        />
        
        <ActionCard 
          icon={<BarChart3 className="w-5 h-5" />} 
          title="Rapor Oluştur"
          description="Öğrenci performans raporu hazırla"
          color="emerald"
          onClick={() => setLocation("/raporlar?new=true")}
        />
      </div>
    </div>
  );
};

export default QuickActions;