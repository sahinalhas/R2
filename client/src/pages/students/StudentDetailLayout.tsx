import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { 
  User, Phone, Mail, CalendarDays, MapPin, School, 
  BookOpen, Calendar, ArrowLeft,
  BarChart4, MessageSquare, Edit, Trash2
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

// Sekme bileşenleri
import OverviewTab from "./tabs/OverviewTab";
import AppointmentsTab from "./tabs/AppointmentsTab";
import SessionsTab from "./tabs/SessionsTab";
import ReportsTab from "./tabs/ReportsTab";
import StudyProgramTab from "./tabs/StudyProgramTab";

// Utility fonksiyonları ve hook'ları
import { 
  useStudentDetail, 
  useStudentAppointments, 
  useStudentSessions, 
  useStudentReports,
  getInitials,
  formatDate
} from "./utils";

// Tab konfigürasyonu
const TAB_CONFIG = [
  { value: "overview", label: "Genel Bakış", icon: BookOpen, color: "primary" },
  { value: "appointments", label: "Randevular", icon: Calendar, color: "blue-500" },
  { value: "sessions", label: "Görüşmeler", icon: MessageSquare, color: "purple-500" },
  { value: "study", label: "Çalışma Programı", icon: BookOpen, color: "amber-500" },
  { value: "reports", label: "Raporlar", icon: BarChart4, color: "emerald-500" }
];

interface StudentDetailLayoutProps {
  id: number;
  activeTab?: string;
}

const StudentDetailLayout = ({ id, activeTab: initialTab = "overview" }: StudentDetailLayoutProps) => {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState(initialTab);
  
  // URL parametresini güncelle
  useEffect(() => {
    if (activeTab && activeTab !== initialTab) {
      navigate(`/ogrenciler/detay/${id}/${activeTab}`);
    }
  }, [activeTab, id, initialTab, navigate]);
  
  const { 
    data: student, 
    isLoading: loadingStudent 
  } = useStudentDetail(id);
  
  const { 
    data: appointments = [], 
    isLoading: loadingAppointments 
  } = useStudentAppointments(id);
  
  const { 
    data: sessions = [], 
    isLoading: loadingSessions 
  } = useStudentSessions(id);
  
  const { 
    data: reports = [], 
    isLoading: loadingReports 
  } = useStudentReports(id);
  
  if (loadingStudent) {
    return (
      <Container>
        <div className="py-8 space-y-6">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-56" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-40 rounded-xl" />
            <Skeleton className="h-40 rounded-xl" />
            <Skeleton className="h-40 rounded-xl" />
          </div>
        </div>
      </Container>
    );
  }
  
  return (
    <Container>
      <div className="py-6 relative">
        {/* Dekoratif arka plan elementleri */}
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl opacity-70"></div>
        <div className="absolute bottom-20 left-40 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute top-60 right-1/3 w-36 h-36 bg-purple-500/5 rounded-full blur-2xl opacity-60"></div>
        
        {/* Üst bölüm - Geri dön ve işlemler */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 relative z-10">
          <Button 
            variant="ghost" 
            className="mb-4 sm:mb-0" 
            onClick={() => navigate("/ogrenciler")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Öğrenci Listesine Dön
          </Button>
          
          <div className="flex space-x-2 self-end sm:self-auto">
            <Button 
              variant="outline" 
              className="border-primary/20 hover:border-primary/50 text-primary hover:text-primary bg-white"
              onClick={() => navigate(`/ogrenciler/duzenle/${id}`)}
            >
              <Edit className="w-4 h-4 mr-2" />
              Düzenle
            </Button>
            
            <Button 
              variant="outline" 
              className="border-red-500/30 hover:border-red-500/50 text-red-500 hover:text-red-600 bg-white"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Sil
            </Button>
          </div>
        </div>
        
        {/* Öğrenci özet bilgi kartı */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-xl p-6 mb-8 relative overflow-hidden">
          {/* Dekoratif kart arka planı */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary via-blue-500 to-purple-500"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-primary/2 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="flex-shrink-0">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/40 to-blue-500/40 animate-pulse blur-xl opacity-50"></div>
                <Avatar className="h-20 w-20 border-2 border-white bg-gradient-to-br from-primary/20 to-blue-500/20 relative">
                  <AvatarFallback className="text-2xl font-semibold text-primary bg-gradient-to-br from-primary/10 to-blue-400/10">
                    {getInitials(student?.firstName, student?.lastName)}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
            
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  {student?.firstName} {student?.lastName}
                  <Badge className="ml-3 bg-primary/10 text-primary hover:bg-primary/20 border-none">
                    {student?.studentClass}
                  </Badge>
                </h1>
                <p className="text-gray-500 flex items-center gap-2 mt-1">
                  <School className="h-4 w-4" />
                  Öğrenci No: <span className="font-medium text-gray-600">{student?.studentNumber}</span>
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="flex items-center text-gray-600">
                  <CalendarDays className="h-4 w-4 mr-2 text-primary" />
                  <span className="text-sm">Doğum: {formatDate(student?.birthDate)}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <User className="h-4 w-4 mr-2 text-blue-500" />
                  <span className="text-sm">Cinsiyet: {student?.gender || "-"}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Phone className="h-4 w-4 mr-2 text-emerald-500" />
                  <span className="text-sm">Veli Tel: {student?.parentPhone || "-"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tab bölümü */}
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="relative z-10"
        >
          <div className="mb-6">
            <TabsList className="bg-white/75 backdrop-blur-sm">
              {TAB_CONFIG.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <TabsTrigger 
                    key={tab.value}
                    value={tab.value} 
                    className={`data-[state=active]:bg-${tab.color}/5 data-[state=active]:text-${tab.color}`}
                  >
                    <IconComponent className="w-4 h-4 mr-2" />
                    {tab.label}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>
          
          {/* Sekme içerikleri */}
          <TabsContent value="overview">
            <OverviewTab 
              student={student!} 
              appointments={appointments} 
              sessions={sessions} 
              reports={reports} 
            />
          </TabsContent>
          
          <TabsContent value="appointments">
            <AppointmentsTab 
              appointments={appointments} 
              studentId={id} 
            />
          </TabsContent>
          
          <TabsContent value="sessions">
            <SessionsTab 
              sessions={sessions} 
              studentId={id} 
            />
          </TabsContent>
          
          <TabsContent value="study">
            <StudyProgramTab studentId={id} />
          </TabsContent>

          <TabsContent value="reports">
            <ReportsTab
              reports={reports}
              studentId={id}
            />
          </TabsContent>
        </Tabs>
      </div>
    </Container>
  );
};

export default StudentDetailLayout;
