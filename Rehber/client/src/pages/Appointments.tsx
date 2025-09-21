import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Edit, Trash2, Search, Plus, Calendar, CalendarDays, Clock, Bookmark, MessageSquare } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Container } from "@/components/ui/container";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NewAppointmentModal from "@/components/modals/NewAppointmentModal";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  useAppointments, 
  useStudentAppointments, 
  useStudent, 
  useTodayAppointments,
  usePendingAppointments
} from "@/hooks/use-api-query";

// Ana Appointments bileşeni
const Appointments = () => {
  const [location] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [studentId, setStudentId] = useState<number | null>(null);
  
  // URL'den studentId parametresini al
  useEffect(() => {
    const url = new URL(window.location.href);
    const id = url.searchParams.get("studentId");
    if (id) {
      setStudentId(parseInt(id));
    } else {
      setStudentId(null);
    }
  }, [location]);
  
  // Öğrenci bilgilerini getir
  const { data: student } = useStudent(studentId || 0);
  
  // Randevuları getir (filtreye göre)
  const { data: todayAppointments = [] } = useTodayAppointments();
  const { data: pendingAppointments = [] } = usePendingAppointments();
  const { data: allAppointments = [] } = useAppointments();
  const { data: studentAppointments = [] } = useStudentAppointments(studentId || 0);
  
  // Hangi randevu listesini göstereceğimizi belirle
  const appointments = studentId 
    ? studentAppointments 
    : allAppointments;
  
  // Arama filtresine göre randevuları filtrele
  const filteredAppointments = appointments?.filter((appointment: any) => {
    if (searchTerm === "") return true;
    
    // API'den öğrenci bilgisini alıp filtreleme yapmak gerekiyor
    // Burada sadece basit bir kontrol yapıyoruz
    return appointment.appointmentType.toLowerCase().includes(searchTerm.toLowerCase());
  }) || [];
  
  // Öğrenci detay sayfası
  if (studentId && student) {
    return (
      <Container>
        <div className="py-6">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-neutral-800">
                {student.firstName} {student.lastName} - Randevular
              </h2>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-5 h-5 mr-1" />
                    Yeni Randevu
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <NewAppointmentModal />
                </DialogContent>
              </Dialog>
            </div>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Öğrenci Bilgileri</CardTitle>
                <CardDescription>
                  {student.studentClass} - {student.studentNumber}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-neutral-500">Veli Adı</p>
                    <p className="text-neutral-800">{student.parentName || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-500">Veli Telefonu</p>
                    <p className="text-neutral-800">{student.parentPhone || "-"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Öğrencinin randevuları */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6">
              <h3 className="text-lg font-medium text-neutral-800 mb-4">
                Randevular ({filteredAppointments.length})
              </h3>
              
              {filteredAppointments.length > 0 ? (
                <div className="space-y-4">
                  {filteredAppointments.map((appointment: any) => (
                    <AppointmentItem key={appointment.id} appointment={appointment} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-neutral-600">
                    Bu öğrenci için randevu bulunmuyor.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </Container>
    );
  }
  
  // Randevular ana sayfası
  return (
    <Container>
      <div className="py-6 relative">
        {/* Dekoratif arka plan elementleri */}
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl opacity-70"></div>
        <div className="absolute bottom-20 left-40 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute top-60 right-1/3 w-36 h-36 bg-purple-500/5 rounded-full blur-2xl opacity-60"></div>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 relative z-10">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
              Randevular
            </h2>
            <p className="text-gray-500 text-sm md:text-base mt-1">
              Öğrenciler için planlanan tüm randevuları yönetin ve takip edin
            </p>
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-primary to-primary/80 text-white rounded-xl px-5 py-6 font-medium shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-300">
                <Plus className="w-5 h-5 mr-1.5" />
                Yeni Randevu
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <NewAppointmentModal />
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Arama */}
        <div className="mb-6">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <Input
              placeholder="Randevu ara..."
              className="pl-10 bg-white/80 backdrop-blur-sm border-white/20 shadow-sm hover:shadow-md transition-all duration-300 rounded-xl focus-visible:ring-primary/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="bg-white/75 backdrop-blur-sm w-full justify-start p-1 rounded-xl shadow-sm border border-gray-100">
            <TabsTrigger value="all" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
              <CalendarDays className="w-4 h-4 mr-2" />
              Tüm Randevular
            </TabsTrigger>
            <TabsTrigger value="today" className="data-[state=active]:bg-blue-500/10 data-[state=active]:text-blue-500">
              <Calendar className="w-4 h-4 mr-2" />
              Bugünkü ({todayAppointments.length})
            </TabsTrigger>
            <TabsTrigger value="pending" className="data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-500">
              <Clock className="w-4 h-4 mr-2" />
              Bekleyen ({pendingAppointments.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-4">
            {filteredAppointments.length > 0 ? (
              <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-md border border-white/20">
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                    <CalendarDays className="w-5 h-5 mr-2 text-primary/70" />
                    Tüm Randevular ({filteredAppointments.length})
                  </h3>
                  
                  <div className="space-y-4">
                    {filteredAppointments.map((appointment: any) => (
                      <AppointmentItem key={appointment.id} appointment={appointment} />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
                <div className="relative w-20 h-20 mx-auto mb-4">
                  <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl animate-pulse"></div>
                  <div className="relative h-full w-full flex items-center justify-center">
                    <CalendarDays className="w-10 h-10 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {searchTerm
                    ? "Arama kriterlerine uygun randevu bulunamadı."
                    : "Henüz randevu bulunmuyor."}
                </h3>
                <p className="text-gray-500 max-w-md mx-auto mb-6">
                  {searchTerm 
                    ? "Lütfen farklı bir anahtar kelime kullanarak tekrar deneyin."
                    : "İlk randevunuzu oluşturarak öğrencileriniz ile planladığınız görüşmeleri takip edebilirsiniz."}
                </p>
                <Button className="bg-gradient-to-r from-primary to-primary/80 text-white rounded-xl px-5 py-6 font-medium shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-300">
                  <Plus className="w-4 h-4 mr-1.5" />
                  İlk Randevuyu Ekle
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="today" className="space-y-4">
            {todayAppointments.length > 0 ? (
              <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-md border border-white/20">
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-blue-500/70" />
                    Bugünkü Randevular ({todayAppointments.length})
                  </h3>
                  
                  <div className="space-y-4">
                    {todayAppointments.map((appointment: any) => (
                      <AppointmentItem key={appointment.id} appointment={appointment} />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
                <div className="relative w-20 h-20 mx-auto mb-4">
                  <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-xl animate-pulse"></div>
                  <div className="relative h-full w-full flex items-center justify-center">
                    <Calendar className="w-10 h-10 text-blue-500" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Bugün için planlanmış randevu bulunmuyor
                </h3>
                <p className="text-gray-500 max-w-md mx-auto mb-6">
                  Bugüne özel bir randevu ekleyebilir veya diğer günlerdeki randevuları görüntüleyebilirsiniz
                </p>
                <Button className="bg-gradient-to-r from-blue-500 to-blue-500/80 text-white rounded-xl px-5 py-6 font-medium shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all duration-300">
                  <Plus className="w-4 h-4 mr-1.5" />
                  Bugün İçin Randevu Ekle
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="pending" className="space-y-4">
            {pendingAppointments.length > 0 ? (
              <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-md border border-white/20">
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-amber-500/70" />
                    Bekleyen Randevular ({pendingAppointments.length})
                  </h3>
                  
                  <div className="space-y-4">
                    {pendingAppointments.map((appointment: any) => (
                      <AppointmentItem key={appointment.id} appointment={appointment} />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
                <div className="relative w-20 h-20 mx-auto mb-4">
                  <div className="absolute inset-0 bg-amber-500/10 rounded-full blur-xl animate-pulse"></div>
                  <div className="relative h-full w-full flex items-center justify-center">
                    <Clock className="w-10 h-10 text-amber-500" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Bekleyen randevu bulunmuyor
                </h3>
                <p className="text-gray-500 max-w-md mx-auto mb-6">
                  Tüm randevularınız tamamlanmış görünüyor. Yeni bir randevu oluşturabilirsiniz.
                </p>
                <Button className="bg-gradient-to-r from-amber-500 to-amber-500/80 text-white rounded-xl px-5 py-6 font-medium shadow-lg shadow-amber-500/20 hover:shadow-xl hover:shadow-amber-500/30 hover:-translate-y-0.5 transition-all duration-300">
                  <Plus className="w-4 h-4 mr-1.5" />
                  Yeni Randevu Ekle
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Container>
  );
};

// Randevu öğesi bileşeni
interface AppointmentItemProps {
  appointment: any;
}

const AppointmentItem: React.FC<AppointmentItemProps> = ({ appointment }) => {
  // Öğrenci bilgilerini getir
  const { data: student } = useStudent(appointment.studentId);
  
  // Randevu türüne göre renk belirle
  const getBorderColorClass = () => {
    switch (appointment.appointmentType) {
      case "Akademik Danışmanlık":
        return "border-emerald-500 bg-emerald-50";
      case "Kariyer Danışmanlığı":
        return "border-indigo-500 bg-indigo-50";
      case "Psikolojik Danışmanlık":
        return "border-amber-500 bg-amber-50";
      case "Aile Görüşmesi":
        return "border-blue-500 bg-blue-50";
      default:
        return "border-indigo-500 bg-indigo-50";
    }
  };
  
  // Durum etiketi için renk belirle
  const getStatusColorClass = () => {
    switch (appointment.status) {
      case "Tamamlandı":
        return "bg-emerald-100 text-emerald-800";
      case "İptal Edildi":
        return "bg-red-100 text-red-800";
      case "Bekliyor":
      default:
        return "bg-amber-100 text-amber-800";
    }
  };
  
  // Tarih formatı
  const formattedDate = format(new Date(appointment.date), 'd MMMM yyyy', { locale: tr });
  
  // Bitiş zamanını hesapla
  const calculateEndTime = (startTime: string, durationMinutes: number) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    
    let endMinutes = minutes + durationMinutes;
    let endHours = hours + Math.floor(endMinutes / 60);
    endMinutes = endMinutes % 60;
    
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  };

  // Randevu türüne göre özellikler belirle
  const typeProps = (() => {
    switch (appointment.appointmentType) {
      case "Akademik Danışmanlık":
        return {
          bg: "bg-emerald-100/40",
          borderColor: "border-emerald-500",
          hoverBg: "hover:bg-emerald-50",
          icon: <Bookmark className="h-4 w-4 text-emerald-600" />,
          lightBg: "bg-emerald-50"
        };
      case "Kariyer Danışmanlığı":
        return {
          bg: "bg-indigo-100/40",
          borderColor: "border-indigo-500",
          hoverBg: "hover:bg-indigo-50",
          icon: <Bookmark className="h-4 w-4 text-indigo-600" />,
          lightBg: "bg-indigo-50"
        };
      case "Psikolojik Danışmanlık":
        return {
          bg: "bg-amber-100/40",
          borderColor: "border-amber-500",
          hoverBg: "hover:bg-amber-50",
          icon: <Bookmark className="h-4 w-4 text-amber-600" />,
          lightBg: "bg-amber-50"
        };
      case "Aile Görüşmesi":
        return {
          bg: "bg-blue-100/40",
          borderColor: "border-blue-500",
          hoverBg: "hover:bg-blue-50",
          icon: <Bookmark className="h-4 w-4 text-blue-600" />,
          lightBg: "bg-blue-50"
        };
      default:
        return {
          bg: "bg-gray-100/40",
          borderColor: "border-gray-300",
          hoverBg: "hover:bg-gray-50",
          icon: <Bookmark className="h-4 w-4 text-gray-600" />,
          lightBg: "bg-gray-50"
        };
    }
  })();

  return (
    <div className={`group relative rounded-xl border ${typeProps.borderColor} p-4 shadow-sm ${typeProps.bg} ${typeProps.hoverBg} transition-all duration-200 hover:shadow-md`}>
      <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${typeProps.borderColor.replace('border', 'bg')}`}></div>
      
      <div className="absolute -top-20 -right-20 w-32 h-32 bg-gradient-to-br opacity-0 group-hover:opacity-5 rounded-full blur-xl transition-opacity duration-500"></div>
      
      <div className="flex flex-col md:flex-row justify-between md:items-start relative z-10">
        <div>
          <div className="flex items-center mb-2">
            <div className="flex items-center">
              {typeProps.icon}
              <h4 className="font-medium text-gray-800 ml-2">
                {student ? `${student.firstName} ${student.lastName}` : "Yükleniyor..."}
              </h4>
            </div>
            <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${getStatusColorClass()}`}>
              {appointment.status}
            </span>
          </div>
          
          <p className="text-sm text-gray-600">
            {student?.studentClass} - {appointment.appointmentType}
          </p>
          
          <div className="flex items-center mt-2 text-sm text-gray-600">
            <CalendarDays className="h-4 w-4 mr-2 text-gray-400" />
            <span className="mr-2">{formattedDate}</span>
            <span>
              {appointment.time.substring(0, 5)} - {calculateEndTime(appointment.time, appointment.duration)}
            </span>
          </div>
          
          {appointment.notes && (
            <p className="mt-3 text-sm text-gray-500 italic border-t border-gray-100 pt-2">
              "{appointment.notes}"
            </p>
          )}
        </div>
        
        <div className="flex items-center mt-3 md:mt-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
                <svg className="w-5 h-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" />
                <span>Düzenle</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <MessageSquare className="mr-2 h-4 w-4" />
                <span>Görüşme Ekle</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Sil</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default Appointments;