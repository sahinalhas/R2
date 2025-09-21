import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO, getMonth, getYear, compareDesc, addMonths, startOfMonth, endOfMonth, getDate, isSameDay } from "date-fns";
import { tr } from "date-fns/locale";
import { useLocation, useRoute } from "wouter";
import SessionForm from "@/components/sessions/SessionForm";
import { 
  MessageSquare, Search, Plus, Edit, Trash2, FileText, 
  Calendar, LayoutGrid, ChevronLeft, ChevronRight, 
  User, Bookmark, Clock, CalendarDays, Calendar as CalendarIcon
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Tüm görüşmeleri getir
const useSessions = () => {
  return useQuery({
    queryKey: ['/api/sessions'],
    staleTime: 60 * 1000, // 1 dakika
  });
};

// Öğrenciyi getir
const useStudent = (studentId: number) => {
  return useQuery({
    queryKey: [`/api/students/${studentId}`],
    enabled: !!studentId,
    staleTime: 5 * 60 * 1000, // 5 dakika
  });
};

// Randevuyu getir
const useAppointment = (appointmentId: number) => {
  return useQuery({
    queryKey: [`/api/appointments/${appointmentId}`],
    enabled: !!appointmentId,
    staleTime: 5 * 60 * 1000, // 5 dakika
  });
};

// Görüşme türüne göre renk ve simge getir
const getSessionTypeProps = (sessionType: string) => {
  switch (sessionType) {
    case "Akademik Danışmanlık":
      return {
        bg: "bg-emerald-100 text-emerald-800",
        borderColor: "border-emerald-200",
        hoverBg: "hover:bg-emerald-50",
        icon: <Bookmark className="h-4 w-4 text-emerald-600" />,
        lightBg: "bg-emerald-50"
      };
    case "Kariyer Danışmanlığı":
      return {
        bg: "bg-indigo-100 text-indigo-800",
        borderColor: "border-indigo-200",
        hoverBg: "hover:bg-indigo-50",
        icon: <Bookmark className="h-4 w-4 text-indigo-600" />,
        lightBg: "bg-indigo-50"
      };
    case "Psikolojik Danışmanlık":
      return {
        bg: "bg-amber-100 text-amber-800",
        borderColor: "border-amber-200",
        hoverBg: "hover:bg-amber-50",
        icon: <Bookmark className="h-4 w-4 text-amber-600" />,
        lightBg: "bg-amber-50"
      };
    case "Aile Görüşmesi":
      return {
        bg: "bg-blue-100 text-blue-800",
        borderColor: "border-blue-200",
        hoverBg: "hover:bg-blue-50",
        icon: <Bookmark className="h-4 w-4 text-blue-600" />,
        lightBg: "bg-blue-50"
      };
    default:
      return {
        bg: "bg-gray-100 text-gray-800",
        borderColor: "border-gray-200",
        hoverBg: "hover:bg-gray-50",
        icon: <Bookmark className="h-4 w-4 text-gray-600" />,
        lightBg: "bg-gray-50"
      };
  }
};

// Ay içindeki görüşmeleri grupla
const groupSessionsByDate = (sessions: any[] = []) => {
  const sessionsByDate: { [key: string]: any[] } = {};
  
  sessions.forEach(session => {
    if (!session || !session.date) return;
    
    const dateStr = session.date.split('T')[0]; // ISO formatından YYYY-MM-DD kısmını al
    if (!sessionsByDate[dateStr]) {
      sessionsByDate[dateStr] = [];
    }
    sessionsByDate[dateStr].push(session);
  });
  
  return sessionsByDate;
};

const Sessions = () => {
  const [location] = useLocation();
  const [, params] = useRoute("/gorusmeler/duzenle/:id");
  const [newMode, setNewMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("grid");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [sessionTypeFilter, setSessionTypeFilter] = useState<string>("all");
  const { data: sessions, isLoading } = useSessions();
  const { data: students } = useQuery({
    queryKey: ['/api/students'],
    staleTime: 5 * 60 * 1000, // 5 dakika
  });
  
  // URL'deki new parametresini yakala
  useEffect(() => {
    // URL'deki "new" parametresini yakala
    try {
      const url = new URL(window.location.href);
      const hasNewParam = url.searchParams.has("new");
      console.log("New parameter detected in Sessions:", hasNewParam);
      setNewMode(hasNewParam);
    } catch (error) {
      console.error("URL parsing error:", error);
    }
  }, [location]);
  
  // Düzenleme modunda görüşme ID'si
  const sessionId = params?.id ? parseInt(params.id) : undefined;
  
  // Ay adını ve yılı formatla
  const formattedMonthYear = format(currentMonth, 'MMMM yyyy', { locale: tr });
  
  // Arama ve filtrelere göre görüşmeleri filtrele
  const filteredSessions = useMemo(() => {
    if (!sessions || !Array.isArray(sessions)) return [];
    
    return sessions.filter((session: any) => {
      // Tür filtreleme
      if (sessionTypeFilter && sessionTypeFilter !== "all" && session.sessionType !== sessionTypeFilter) {
        return false;
      }
      
      // Arama filtresi
      if (searchTerm === "") return true;
      
      const studentMatch = students && Array.isArray(students) && 
        students.some((student: any) => 
          session.studentId === student.id && 
          (student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) || 
           student.lastName.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      
      return (
        session.sessionType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        studentMatch
      );
    }).sort((a: any, b: any) => compareDesc(parseISO(a.date), parseISO(b.date)));
  }, [sessions, students, searchTerm, sessionTypeFilter]);
  
  // Zaman çizelgesi görünümü için ay içindeki günler ve görüşmeler
  const monthSessions = useMemo(() => {
    if (!filteredSessions) return [];
    
    // Ay başı ve sonu
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    
    // Bu aya ait görüşmeleri filtrele
    return filteredSessions.filter((session: any) => {
      const sessionDate = parseISO(session.date);
      return sessionDate >= monthStart && sessionDate <= monthEnd;
    });
  }, [filteredSessions, currentMonth]);
  
  // Görüşmeleri tarihe göre grupla
  const sessionsByDate = useMemo(() => {
    return groupSessionsByDate(monthSessions);
  }, [monthSessions]);
  
  // Önceki aya git
  const handlePreviousMonth = () => {
    setCurrentMonth(prev => addMonths(prev, -1));
  };
  
  // Sonraki aya git
  const handleNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1));
  };
  
  // Görüşme türü seçenekleri
  const sessionTypeOptions = [
    { value: "all", label: "Tüm Türler" },
    { value: "Akademik Danışmanlık", label: "Akademik Danışmanlık" },
    { value: "Kariyer Danışmanlığı", label: "Kariyer Danışmanlığı" },
    { value: "Psikolojik Danışmanlık", label: "Psikolojik Danışmanlık" },
    { value: "Aile Görüşmesi", label: "Aile Görüşmesi" }
  ];

  if (newMode) {
    return (
      <Container>
        <div className="py-6">
          {/* Yeni görüşme ekleme formu - Bu bileşeni oluşturacağız */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-neutral-800 mb-6">
              Yeni Görüşme Ekle
            </h2>
            <p className="text-gray-500 mb-4">Öğrencilerinizle yaptığınız görüşme bilgilerini kaydedebilirsiniz.</p>
            <Button 
              variant="ghost" 
              className="mb-6" 
              onClick={() => window.location.href = "/gorusmeler"}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Görüşmelere Dön
            </Button>
            <SessionForm />
          </div>
        </div>
      </Container>
    );
  } else if (sessionId) {
    return (
      <Container>
        <div className="py-6">
          {/* Görüşme düzenleme formu */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-neutral-800 mb-6">
              Görüşme Düzenle
            </h2>
            <Button 
              variant="ghost" 
              className="mb-6" 
              onClick={() => window.location.href = "/gorusmeler"}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Görüşmelere Dön
            </Button>
            <SessionForm sessionId={sessionId} />
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
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 relative z-10">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
              Görüşme Kayıtları
            </h2>
            <p className="text-gray-500 text-sm md:text-base mt-1">
              Öğrencilerle yapılan tüm görüşmeleri yönetin ve takip edin
            </p>
          </div>
          <Button 
            className="bg-gradient-to-r from-primary to-primary/80 text-white rounded-xl px-5 py-6 font-medium shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-300"
            onClick={() => window.location.href = "/gorusmeler?new=true"}
          >
            <Plus className="w-5 h-5 mr-1.5" />
            Yeni Görüşme Ekle
          </Button>
        </div>
        
        {/* Arama ve Filtreler */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <Input
              placeholder="Görüşme veya öğrenci ara..."
              className="pl-10 bg-white/80 backdrop-blur-sm border-white/20 shadow-sm hover:shadow-md transition-all duration-300 rounded-xl focus-visible:ring-primary/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select value={sessionTypeFilter} onValueChange={setSessionTypeFilter}>
            <SelectTrigger className="w-full md:w-[220px] bg-white/80 backdrop-blur-sm border-white/20 shadow-sm hover:shadow-md transition-all duration-300 rounded-xl focus:ring-primary/20">
              <SelectValue placeholder="Tüm Görüşme Türleri" />
            </SelectTrigger>
            <SelectContent>
              {sessionTypeOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Görünüm Seçenekleri */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="bg-white/75 backdrop-blur-sm w-full justify-start p-1 rounded-xl shadow-sm border border-gray-100">
            <TabsTrigger value="grid" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
              <LayoutGrid className="w-4 h-4 mr-2" />
              Kart Görünümü
            </TabsTrigger>
            <TabsTrigger value="timeline" className="data-[state=active]:bg-blue-500/10 data-[state=active]:text-blue-500">
              <Calendar className="w-4 h-4 mr-2" />
              Zaman Çizelgesi
            </TabsTrigger>
          </TabsList>
          
          {/* Kart Görünümü İçeriği */}
          <TabsContent value="grid">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map(i => (
                  <Card key={i} className="bg-white/80 backdrop-blur-sm border-white/20 shadow-md">
                    <CardHeader className="pb-2">
                      <div className="space-y-3">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-4/5" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredSessions && filteredSessions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredSessions.map((session: any) => (
                  <SessionCard key={session.id} session={session} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
                <div className="relative w-20 h-20 mx-auto mb-4">
                  <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl animate-pulse"></div>
                  <div className="relative h-full w-full flex items-center justify-center">
                    <MessageSquare className="w-10 h-10 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {searchTerm || sessionTypeFilter !== "all"
                    ? "Arama kriterlerine uygun görüşme bulunamadı."
                    : "Henüz görüşme kaydı bulunmuyor."}
                </h3>
                <p className="text-gray-500 max-w-md mx-auto mb-6">
                  {searchTerm || sessionTypeFilter !== "all" 
                    ? "Lütfen farklı bir anahtar kelime veya filtre kullanarak tekrar deneyin."
                    : "İlk görüşme kaydınızı oluşturarak öğrencilerinizle yaptığınız görüşmeleri takip edebilirsiniz."}
                </p>
                <Button 
                  className="bg-gradient-to-r from-primary to-primary/80 text-white rounded-xl px-5 py-6 font-medium shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-300"
                  onClick={() => window.location.href = "/gorusmeler?new=true"}
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  İlk Görüşmeyi Ekle
                </Button>
              </div>
            )}
          </TabsContent>
          
          {/* Zaman Çizelgesi İçeriği */}
          <TabsContent value="timeline">
            {isLoading ? (
              <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-8 w-48" />
                    <div className="flex items-center space-x-2">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <Skeleton className="h-10 w-10 rounded-full" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-white/90 backdrop-blur-sm border-white/20 shadow-xl overflow-hidden">
                <CardHeader className="pb-4 border-b">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-xl font-semibold text-gray-800">
                      <CalendarIcon className="mr-2 h-5 w-5 text-primary" />
                      {formattedMonthYear}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={handlePreviousMonth}
                        className="rounded-full h-9 w-9 border-gray-200 hover:bg-gray-100 hover:text-primary transition-colors"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={handleNextMonth}
                        className="rounded-full h-9 w-9 border-gray-200 hover:bg-gray-100 hover:text-primary transition-colors"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {monthSessions.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                      {Object.entries(sessionsByDate)
                        .sort(([dateA], [dateB]) => {
                          return new Date(dateB).getTime() - new Date(dateA).getTime();
                        })
                        .map(([dateStr, dateSessions]) => {
                          // Tarih formatını alıp, gün kısmını öne çıkararak göster
                          const sessionDate = parseISO(dateStr);
                          const dayOfMonth = getDate(sessionDate);
                          const formattedDate = format(sessionDate, 'd MMMM yyyy', { locale: tr });
                          const isToday = isSameDay(sessionDate, new Date());
                          
                          return (
                            <div key={dateStr} className="relative">
                              {/* Tarih başlığı */}
                              <div className={`sticky top-0 p-4 flex items-center ${isToday ? 'bg-blue-50/90' : 'bg-white/95'} backdrop-blur-sm z-10`}>
                                <div className={`
                                  flex items-center justify-center rounded-full w-10 h-10 mr-3
                                  ${isToday ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}
                                `}>
                                  <span className="text-sm font-medium">{dayOfMonth}</span>
                                </div>
                                <div className="flex flex-col">
                                  <span className={`font-medium ${isToday ? 'text-blue-700' : 'text-gray-800'}`}>
                                    {formattedDate}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {dateSessions.length} görüşme
                                  </span>
                                </div>
                              </div>
                              
                              {/* O günün görüşmeleri */}
                              <div className="divide-y divide-gray-50">
                                {dateSessions.map((session: any) => {
                                  const typeProps = getSessionTypeProps(session.sessionType);
                                  const student = students && Array.isArray(students) 
                                    ? students.find((s: any) => s.id === session.studentId) 
                                    : null;
                                  
                                  return (
                                    <div key={session.id} className={`p-4 hover:bg-gray-50 transition-colors flex items-start gap-4 relative`}>
                                      {/* Tip renk çizgisi */}
                                      <div className={`absolute left-0 top-0 bottom-0 w-1 ${typeProps.lightBg}`}></div>
                                      
                                      {/* Görüşme içeriği */}
                                      <div className="flex-1 ml-1">
                                        <div className="flex items-start justify-between mb-1">
                                          <div className="flex items-center">
                                            <Badge variant="outline" className={`${typeProps.bg} border-none mr-2 flex items-center`}>
                                              {typeProps.icon}
                                              <span className="ml-1">{session.sessionType}</span>
                                            </Badge>
                                            {session.followUp && (
                                              <Badge variant="outline" className="bg-blue-100 text-blue-800 border-none flex items-center">
                                                <CalendarDays className="h-3 w-3 mr-1" />
                                                <span>Takip Gerekli</span>
                                              </Badge>
                                            )}
                                          </div>
                                          <div className="text-xs text-gray-500 flex items-center">
                                            <Clock className="h-3 w-3 mr-1" />
                                            {format(parseISO(session.createdAt), 'HH:mm', { locale: tr })}
                                          </div>
                                        </div>
                                        
                                        <div className="flex items-center mb-2">
                                          <User className="h-4 w-4 text-gray-400 mr-1.5" />
                                          <span className="font-medium text-gray-800">
                                            {student && typeof student === 'object' && 'firstName' in student && 'lastName' in student
                                              ? `${student.firstName} ${student.lastName}` 
                                              : "Yükleniyor..."}
                                          </span>
                                          {student && typeof student === 'object' && 'studentClass' in student && student.studentClass && (
                                            <span className="ml-2 text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                                              {student.studentClass}
                                            </span>
                                          )}
                                        </div>
                                        
                                        <p className="text-sm text-gray-600 line-clamp-2">{session.summary}</p>
                                        
                                        <div className="flex justify-end mt-2">
                                          <Button variant="ghost" size="sm" className="h-8 text-xs text-primary hover:text-primary/90 hover:bg-primary/5">
                                            Detayları Gör
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <CalendarIcon className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium text-gray-700 mb-1">Bu ay için görüşme bulunamadı</h3>
                      <p className="text-sm text-gray-500 mb-4">
                        {sessionTypeFilter !== "all" 
                          ? `Seçili görüşme türü için bu ayda kayıtlı görüşme yok.` 
                          : `${format(currentMonth, 'MMMM yyyy', { locale: tr })} ayı için kayıtlı görüşme bulunmuyor.`}
                      </p>
                      <Button 
                        className="bg-primary/90 hover:bg-primary text-white"
                        onClick={() => window.location.href = "/gorusmeler?new=true"}
                      >
                        <Plus className="w-4 h-4 mr-1.5" />
                        Yeni Görüşme Ekle
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Container>
  );
};

interface SessionCardProps {
  session: any; // API'den gelen görüşme verisi
}

const SessionCard: React.FC<SessionCardProps> = ({ session }) => {
  const { data: student } = useStudent(session?.studentId || 0);
  const { data: appointment } = useAppointment(session?.appointmentId || 0);
  
  // Görüşme türüne göre renk ve simge getir
  const typeProps = getSessionTypeProps(session?.sessionType || "");
  
  // Tarih formatı
  const formattedDate = session?.date ? format(parseISO(session.date), 'd MMMM yyyy', { locale: tr }) : "";
  
  // Öğrenci bilgilerini güvenli bir şekilde al
  const studentFirstName = student && typeof student === 'object' && 'firstName' in student ? student.firstName : '';
  const studentLastName = student && typeof student === 'object' && 'lastName' in student ? student.lastName : '';
  const studentClass = student && typeof student === 'object' && 'studentClass' in student ? student.studentClass : '';
  
  return (
    <Card className="group relative bg-white/90 backdrop-blur-sm border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
      {/* Renk şeridi */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${typeProps.borderColor.replace('border', 'bg')}`}></div>
      
      {/* Dekoratif arka plan elementi */}
      <div className="absolute -top-20 -right-20 w-32 h-32 bg-gradient-to-br opacity-0 group-hover:opacity-5 rounded-full blur-xl transition-opacity duration-500"></div>
      
      <CardHeader className="pb-2 relative">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-gray-800 group-hover:text-primary transition-colors duration-300">
              {studentFirstName || studentLastName ? `${studentFirstName} ${studentLastName}` : "Yükleniyor..."}
            </CardTitle>
            <CardDescription className="flex items-center text-gray-500">
              {studentClass && (
                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full mr-2">
                  {studentClass}
                </span>
              )}
              <span>{formattedDate}</span>
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-800 hover:bg-gray-100/80 rounded-full">
                <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white/95 backdrop-blur-sm border-white/20 shadow-lg">
              <DropdownMenuItem className="hover:bg-gray-100/80 cursor-pointer">
                <Edit className="mr-2 h-4 w-4 text-blue-500" />
                <span>Düzenle</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-gray-100/80 cursor-pointer">
                <FileText className="mr-2 h-4 w-4 text-indigo-500" />
                <span>Rapor Oluştur</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-500 hover:bg-red-50/80 hover:text-red-600 cursor-pointer">
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Sil</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="pb-2 relative">
        <div className="mb-3 flex flex-wrap gap-2">
          <Badge variant="outline" className={`flex items-center px-2 py-0.5 ${typeProps.bg} border-none`}>
            {typeProps.icon}
            <span className="ml-1">{session?.sessionType}</span>
          </Badge>
          
          {session?.appointmentId && appointment && (
            <Badge variant="outline" className="bg-blue-100/80 text-blue-700 border-none flex items-center">
              <CalendarDays className="w-3 h-3 mr-1 text-blue-500" />
              <span>Randevu ile ilişkili</span>
            </Badge>
          )}
          
          {session?.followUp && (
            <Badge variant="outline" className="bg-purple-100/80 text-purple-700 border-none flex items-center">
              <CalendarDays className="w-3 h-3 mr-1 text-purple-500" />
              <span>Takip Gerekli</span>
            </Badge>
          )}
        </div>
        
        <div className="space-y-3 mb-4">
          <div>
            <div className="flex items-center mb-1">
              <h4 className="text-sm font-medium text-gray-700 flex items-center">
                <MessageSquare className="w-3.5 h-3.5 mr-1.5 text-primary/70" />
                Görüşme Özeti
              </h4>
            </div>
            <p className="text-sm text-gray-600 mt-1 leading-relaxed">{session?.summary}</p>
          </div>
          
          {session?.problems && (
            <div>
              <div className="flex items-center mb-1">
                <h4 className="text-sm font-medium text-gray-700 flex items-center">
                  <Bookmark className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
                  Belirlenen Problemler
                </h4>
              </div>
              <p className="text-sm text-gray-600 mt-1 leading-relaxed">{session.problems}</p>
            </div>
          )}
          
          {session?.actions && (
            <div>
              <div className="flex items-center mb-1">
                <h4 className="text-sm font-medium text-gray-700 flex items-center">
                  <Bookmark className="w-3.5 h-3.5 mr-1.5 text-emerald-500" />
                  Önerilen Aksiyonlar
                </h4>
              </div>
              <p className="text-sm text-gray-600 mt-1 leading-relaxed">{session.actions}</p>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="text-xs text-gray-500 border-t border-gray-100 pt-3 flex justify-between items-center">
        <div className="flex items-center">
          <CalendarDays className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
          {session?.followUp && session?.followUpDate ? (
            <span className="flex items-center">
              <span className="mr-1">Takip Tarihi:</span>
              <span className="font-medium text-primary">
                {format(parseISO(session.followUpDate), 'd MMM yyyy', { locale: tr })}
              </span>
            </span>
          ) : (
            <span>
              {session?.createdAt ? format(parseISO(session.createdAt), 'd MMM yyyy HH:mm', { locale: tr }) : ''}
            </span>
          )}
        </div>
        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-primary hover:text-primary/90 hover:bg-primary/5 -mr-2">
          Detay <ChevronRight className="w-3.5 h-3.5 ml-1" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default Sessions;
