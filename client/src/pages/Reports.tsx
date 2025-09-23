import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, subMonths, addDays, parseISO } from "date-fns";
import { tr } from "date-fns/locale";
import {
  FileText, Search, Plus, Download, Printer,
  BarChart4, PieChart, LineChart,
  Users, School, CalendarDays, GraduationCap, ChevronRight, Trash2
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart as RechartsPieChart, Pie, Cell, LineChart as RechartsLineChart, Line
} from 'recharts';

// Tüm raporları getir
const useReports = () => {
  return useQuery({
    queryKey: ['/api/reports'],
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

// Demo verileri için yardımcı hook
const useDashboardData = () => {
  const [data, setData] = useState<any>(null);
  const { data: realReports, isLoading } = useReports();
  const { data: students } = useQuery({
    queryKey: ['/api/students'],
    staleTime: 60 * 1000, // 1 dakika
  });
  
  // API verilerinden grafik verileri oluştur
  useEffect(() => {
    if (!isLoading && students && Array.isArray(students)) {
      // Gerçek verilerden grafikleri hazırla
      
      // Sınıf dağılımı verileri
      const classDistribution: Array<{name: string, value: number}> = [];
      const classMap = new Map<string, number>();
      
      students.forEach((student: any) => {
        if (student.studentClass) {
          if (classMap.has(student.studentClass)) {
            classMap.set(student.studentClass, classMap.get(student.studentClass)! + 1);
          } else {
            classMap.set(student.studentClass, 1);
          }
        }
      });
      
      classMap.forEach((value, key) => {
        classDistribution.push({
          name: key,
          value: value
        });
      });
      
      // Öğrenci cinsiyet dağılımı
      const genderDistribution = [
        { name: 'Erkek', value: Array.isArray(students) ? students.filter((s: any) => s.gender === 'Erkek').length : 0 },
        { name: 'Kadın', value: Array.isArray(students) ? students.filter((s: any) => s.gender === 'Kadın').length : 0 }
      ];
      
      // Aylar bazında rapor sayıları - 6 aylık trend
      const months: string[] = [];
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const date = subMonths(now, i);
        months.push(format(date, 'MMM', { locale: tr }));
      }
      
      // Haftalık aktivite raporu
      const weeklyData: Array<{name: string, görüşme: number, randevu: number}> = [];
      for (let i = 6; i >= 0; i--) {
        const date = addDays(new Date(), -i);
        const formattedDate = format(date, 'EEE', { locale: tr });
        weeklyData.push({
          name: formattedDate,
          görüşme: Math.floor(Math.random() * 8),
          randevu: Math.floor(Math.random() * 6)
        });
      }
      
      setData({
        classDistribution,
        genderDistribution,
        weeklyData,
        studentCount: Array.isArray(students) ? students.length : 0,
        reportCount: Array.isArray(realReports) ? realReports.length : 0,
        pendingCount: 3, // Gerçek veri bulunmadığında örnek değer
        classCount: classMap.size
      });
    }
  }, [isLoading, students, realReports]);
  
  return { data, isLoading };
};

const Reports = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("");
  const { data: reports, isLoading: reportsLoading } = useReports();
  const [activeTab, setActiveTab] = useState("reports");
  const { data: dashboardData, isLoading: dashboardLoading } = useDashboardData();
  const { toast } = useToast();

  // Modal state
  const [openTemplateModal, setOpenTemplateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [customTitle, setCustomTitle] = useState<string>("");

  const { data: activeTemplates } = useQuery({ queryKey: ['/api/report-templates/active'], staleTime: 60_000 });
  const { data: students } = useQuery({ queryKey: ['/api/students'], staleTime: 60_000 });

  // Filtrelere göre raporları filtrele
  const filteredReports = useMemo(() => (reports ? reports.filter((report: any) => {
    // Tür filtreleme
    if (filterType && filterType !== "all" && report.type !== filterType) {
      return false;
    }
    
    // Arama filtresi
    if (searchTerm === "") return true;
    
    return (
      report.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.type?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }) : []), [reports, searchTerm, filterType]);

  // CSV export
  const exportCSV = () => {
    const rows = (filteredReports || []).map((r: any) => ({
      id: r.id,
      baslik: r.title,
      tur: r.type,
      ogrenciId: r.studentId ?? "",
      sinif: r.studentClass ?? "",
      durum: r.status ?? "",
      olusturulma: r.createdAt,
    }));
    const headers = Object.keys(rows[0] || { id: '', baslik: '', tur: '', ogrenciId: '', sinif: '', durum: '', olusturulma: '' });
    const csv = [headers.join(';'), ...rows.map(r => headers.map(h => String((r as any)[h]).replaceAll("\n"," ").replaceAll(";",",")).join(';'))].join('\n');
    const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `raporlar-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Create from template
  const createFromTemplate = async () => {
    try {
      if (!selectedTemplate || !selectedStudent) {
        toast({ title: 'Eksik bilgi', description: 'Şablon ve öğrenci seçiniz', variant: 'destructive' });
        return;
      }
      const res = await fetch('/api/reports/from-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId: selectedTemplate, studentId: selectedStudent, title: customTitle || undefined }),
      });
      if (!res.ok) throw new Error('Rapor oluşturulamadı');
      setOpenTemplateModal(false);
      setSelectedTemplate("");
      setSelectedStudent("");
      setCustomTitle("");
      toast({ title: 'Başarılı', description: 'Şablondan rapor oluşturuldu' });
    } catch (e: any) {
      toast({ title: 'Hata', description: e.message || 'İşlem başarısız', variant: 'destructive' });
    }
  };

  // Grafik renkleri
  const COLORS = ['#8b5cf6', '#6366f1', '#3b82f6', '#0ea5e9', '#06b6d4', '#14b8a6', '#10b981'];
  
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
              Raporlar ve Analizler
            </h2>
            <p className="text-gray-500 text-sm md:text-base mt-1">
              Öğrenci ve sınıf performans istatistikleri, raporlar ve analizler
            </p>
          </div>
          <Dialog open={openTemplateModal} onOpenChange={setOpenTemplateModal}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-primary to-primary/80 text-white rounded-xl px-5 py-6 font-medium shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-300">
                <Plus className="w-5 h-5 mr-1.5" />
                Yeni Rapor Oluştur
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Şablondan Rapor Oluştur</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-gray-600">Şablon</label>
                    <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                      <SelectTrigger>
                        <SelectValue placeholder="Şablon seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {(activeTemplates || []).map((t: any) => (
                          <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Öğrenci</label>
                    <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                      <SelectTrigger>
                        <SelectValue placeholder="Öğrenci seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {(students || []).map((s: any) => (
                          <SelectItem key={s.id} value={String(s.id)}>{s.firstName} {s.lastName}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Başlık (opsiyonel)</label>
                  <Input value={customTitle} onChange={e => setCustomTitle(e.target.value)} placeholder="Rapor başlığı" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenTemplateModal(false)}>İptal</Button>
                <Button onClick={createFromTemplate}>Oluştur</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Dışa Aktar */}
        <div className="flex justify-end mb-4 gap-2">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="w-4 h-4 mr-1" /> Yazdır/PDF
          </Button>
          <Button variant="secondary" onClick={exportCSV} disabled={!filteredReports?.length}>
            <Download className="w-4 h-4 mr-1" /> CSV
          </Button>
        </div>
        {/* Tab Navigasyonu */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="bg-white/75 backdrop-blur-sm w-full justify-start p-1 rounded-xl shadow-sm border border-gray-100">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
              <BarChart4 className="w-4 h-4 mr-2" />
              Özet Panel
            </TabsTrigger>
            <TabsTrigger value="reports" className="data-[state=active]:bg-blue-500/10 data-[state=active]:text-blue-500">
              <FileText className="w-4 h-4 mr-2" />
              Raporlar
            </TabsTrigger>
          </TabsList>
          
          {/* Özet Panel İçeriği */}
          <TabsContent value="dashboard">
            {dashboardLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <Skeleton className="h-28 w-full rounded-xl" />
                <Skeleton className="h-28 w-full rounded-xl" />
                <Skeleton className="h-28 w-full rounded-xl" />
                <Skeleton className="h-28 w-full rounded-xl" />
              </div>
            ) : (
              <>
                {/* İstatistik Kartları */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  {/* Toplam Öğrenci */}
                  <div className="bg-white/90 backdrop-blur-sm rounded-xl p-5 border border-white/20 shadow-xl relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/2 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="absolute -top-10 -right-10 w-48 h-48 bg-primary/5 rounded-full blur-3xl transform transition-all duration-700 ease-out group-hover:scale-150 group-hover:opacity-70"></div>
                    
                    <div className="flex justify-between items-start mb-4 relative z-10">
                      <p className="text-sm font-medium text-gray-500">Toplam Öğrenci</p>
                      <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        <Users className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="relative z-10">
                      <p className="text-3xl font-bold text-gray-800">{dashboardData?.studentCount || 0}</p>
                    </div>
                  </div>
                  
                  {/* Toplam Sınıf */}
                  <div className="bg-white/90 backdrop-blur-sm rounded-xl p-5 border border-white/20 shadow-xl relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/2 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="absolute -top-10 -right-10 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl transform transition-all duration-700 ease-out group-hover:scale-150 group-hover:opacity-70"></div>
                    
                    <div className="flex justify-between items-start mb-4 relative z-10">
                      <p className="text-sm font-medium text-gray-500">Toplam Sınıf</p>
                      <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                        <School className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="relative z-10">
                      <p className="text-3xl font-bold text-gray-800">{dashboardData?.classCount || 0}</p>
                    </div>
                  </div>
                  
                  {/* Bekleyen Randevular */}
                  <div className="bg-white/90 backdrop-blur-sm rounded-xl p-5 border border-white/20 shadow-xl relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/2 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="absolute -top-10 -right-10 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl transform transition-all duration-700 ease-out group-hover:scale-150 group-hover:opacity-70"></div>
                    
                    <div className="flex justify-between items-start mb-4 relative z-10">
                      <p className="text-sm font-medium text-gray-500">Bekleyen Randevular</p>
                      <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
                        <CalendarDays className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="relative z-10">
                      <p className="text-3xl font-bold text-gray-800">{dashboardData?.pendingCount || 0}</p>
                    </div>
                  </div>
                  
                  {/* Toplam Rapor */}
                  <div className="bg-white/90 backdrop-blur-sm rounded-xl p-5 border border-white/20 shadow-xl relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/2 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="absolute -top-10 -right-10 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl transform transition-all duration-700 ease-out group-hover:scale-150 group-hover:opacity-70"></div>
                    
                    <div className="flex justify-between items-start mb-4 relative z-10">
                      <p className="text-sm font-medium text-gray-500">Toplam Rapor</p>
                      <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                        <GraduationCap className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="relative z-10">
                      <p className="text-3xl font-bold text-gray-800">{dashboardData?.reportCount || 0}</p>
                    </div>
                  </div>
                </div>
                
                {/* Grafik Kartları */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
                  {/* Haftalık Aktivite Analizi */}
                  <Card className="bg-white/90 backdrop-blur-sm border-white/20 shadow-xl overflow-hidden group hover:shadow-2xl transition-all duration-500">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center text-lg">
                        <LineChart className="mr-2 h-5 w-5 text-primary" />
                        Haftalık Aktivite Analizi
                      </CardTitle>
                      <CardDescription>Son 7 gündeki görüşme ve randevu sayıları</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-4 pt-0">
                      <div className="h-[300px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsLineChart
                            data={dashboardData?.weeklyData || []}
                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                border: 'none',
                                borderRadius: '0.5rem',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                padding: '0.75rem'
                              }}
                            />
                            <Legend verticalAlign="top" height={36} />
                            <Line 
                              type="monotone" 
                              dataKey="görüşme" 
                              stroke="#8b5cf6" 
                              activeDot={{ r: 8 }} 
                              strokeWidth={3}
                              dot={{ strokeWidth: 2 }}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="randevu" 
                              stroke="#3b82f6" 
                              strokeWidth={3}
                              dot={{ strokeWidth: 2 }}
                            />
                          </RechartsLineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Sınıf Dağılımı Grafiği */}
                  <div className="grid grid-cols-1 gap-6">
                    {/* Sınıf Dağılımı */}
                    <Card className="bg-white/90 backdrop-blur-sm border-white/20 shadow-xl overflow-hidden group hover:shadow-2xl transition-all duration-500">
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center text-lg">
                          <PieChart className="mr-2 h-5 w-5 text-blue-500" />
                          Sınıf Dağılımı
                        </CardTitle>
                        <CardDescription>Sınıflara göre öğrenci sayıları</CardDescription>
                      </CardHeader>
                      <CardContent className="pb-4 pt-0">
                        <div className="h-[200px] w-full mt-4 flex justify-center">
                          <ResponsiveContainer width="100%" height="100%">
                            <RechartsPieChart>
                              <Pie
                                data={dashboardData?.classDistribution || []}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                              >
                                {dashboardData?.classDistribution?.map((entry: any, index: number) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip 
                                contentStyle={{ 
                                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                  border: 'none',
                                  borderRadius: '0.5rem',
                                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                  padding: '0.75rem'
                                }}
                              />
                            </RechartsPieChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                    
                    {/* Cinsiyet Dağılımı */}
                    <Card className="bg-white/90 backdrop-blur-sm border-white/20 shadow-xl overflow-hidden group hover:shadow-2xl transition-all duration-500">
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center text-lg">
                          <Users className="mr-2 h-5 w-5 text-purple-500" />
                          Cinsiyet Dağılımı
                        </CardTitle>
                        <CardDescription>Cinsiyet bazında öğrenci dağılım��</CardDescription>
                      </CardHeader>
                      <CardContent className="pb-4 pt-0">
                        <div className="flex items-center mt-4">
                          <div className="w-32 md:w-48">
                            <ResponsiveContainer width="100%" height={100}>
                              <RechartsPieChart>
                                <Pie
                                  data={dashboardData?.genderDistribution || []}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={25}
                                  outerRadius={40}
                                  fill="#8884d8"
                                  dataKey="value"
                                  paddingAngle={5}
                                >
                                  <Cell fill="#8b5cf6" /> {/* Erkek */}
                                  <Cell fill="#ec4899" /> {/* Kadın */}
                                </Pie>
                              </RechartsPieChart>
                            </ResponsiveContainer>
                          </div>
                          
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center">
                              <div className="w-3 h-3 rounded-full bg-[#8b5cf6] mr-2"></div>
                              <div className="flex justify-between w-full">
                                <span className="text-sm font-medium">Erkek</span>
                                <span className="text-sm text-gray-500">{dashboardData?.genderDistribution?.[0]?.value || 0}</span>
                              </div>
                            </div>
                            <div className="flex items-center">
                              <div className="w-3 h-3 rounded-full bg-[#ec4899] mr-2"></div>
                              <div className="flex justify-between w-full">
                                <span className="text-sm font-medium">Kadın</span>
                                <span className="text-sm text-gray-500">{dashboardData?.genderDistribution?.[1]?.value || 0}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </>
            )}
          </TabsContent>
          
          {/* Raporlar İçeriği */}
          <TabsContent value="reports">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                <Input
                  placeholder="Rapor ara..."
                  className="pl-10 bg-white/80 backdrop-blur-sm border-white/20 shadow-sm hover:shadow-md transition-all duration-300 rounded-xl focus-visible:ring-primary/20"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full md:w-[200px] bg-white/80 backdrop-blur-sm border-white/20 shadow-sm hover:shadow-md transition-all duration-300 rounded-xl focus:ring-primary/20">
                  <SelectValue placeholder="Tüm Rapor Tipleri" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Rapor Tipleri</SelectItem>
                  <SelectItem value="Öğrenci">Öğrenci</SelectItem>
                  <SelectItem value="Sınıf">Sınıf</SelectItem>
                  <SelectItem value="Genel">Genel</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {reportsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="bg-white/80 backdrop-blur-sm border-white/20 shadow-md hover:shadow-lg transition-all duration-300">
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
            ) : filteredReports && filteredReports.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredReports.map((report: any) => (
                  <ReportCard key={report.id} report={report} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
                <div className="relative w-20 h-20 mx-auto mb-4">
                  <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl animate-pulse"></div>
                  <div className="relative h-full w-full flex items-center justify-center">
                    <FileText className="w-10 h-10 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {searchTerm || filterType ? "Arama kriterlerine uygun rapor bulunamadı." : "Henüz rapor bulunmuyor."}
                </h3>
                <p className="text-gray-500 max-w-md mx-auto mb-6">
                  {searchTerm || filterType 
                    ? "Lütfen farklı bir anahtar kelime veya filtre kullanarak tekrar deneyin."
                    : "İlk raporunuzu oluşturarak öğrenci ve sınıf performansı hakkında detaylı bilgi alabilirsiniz."}
                </p>
                <Button className="bg-gradient-to-r from-primary to-primary/80 text-white rounded-xl px-5 py-6 font-medium shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-300">
                  <Plus className="w-4 h-4 mr-1.5" />
                  İlk Raporu Oluştur
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Container>
  );
};

interface ReportCardProps {
  report: any; // API'den gelen rapor verisi
}

const ReportCard: React.FC<ReportCardProps> = ({ report }) => {
  const { data: student } = useStudent(report && report.studentId ? report.studentId : 0);
  
  // Rapor türüne göre renk belirle
  const getTypeColor = () => {
    switch (report.type) {
      case "Öğrenci":
        return {
          bg: "bg-indigo-100 text-indigo-800",
          icon: <Users className="w-3.5 h-3.5 mr-1" />,
          gradient: "from-indigo-500 to-blue-500"
        };
      case "Sınıf":
        return {
          bg: "bg-amber-100 text-amber-800",
          icon: <School className="w-3.5 h-3.5 mr-1" />,
          gradient: "from-amber-500 to-orange-500"
        };
      case "Genel":
        return {
          bg: "bg-emerald-100 text-emerald-800",
          icon: <GraduationCap className="w-3.5 h-3.5 mr-1" />,
          gradient: "from-emerald-500 to-green-500"
        };
      default:
        return {
          bg: "bg-neutral-100 text-neutral-800",
          icon: <FileText className="w-3.5 h-3.5 mr-1" />,
          gradient: "from-gray-500 to-gray-600"
        };
    }
  };
  
  // Tarih formatı
  const formattedDate = report.createdAt ? 
    format(parseISO(report.createdAt), 'd MMMM yyyy', { locale: tr }) : '';
  
  // İçerik kısaltma
  const truncateContent = (content: string, maxLength: number = 150) => {
    if (!content) return '';
    if (content.length <= maxLength) return content;
    return `${content.substring(0, maxLength)}...`;
  };

  const typeColor = getTypeColor();

  return (
    <Card className="group relative bg-white/90 backdrop-blur-sm border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
      {/* Dekoratif arka plan elementi */}
      <div className="absolute -top-20 -right-20 w-32 h-32 bg-gradient-to-br opacity-0 group-hover:opacity-5 rounded-full blur-xl transition-opacity duration-500"></div>
      
      {/* Renk şeridi */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${typeColor.gradient}`}></div>
      
      <CardHeader className="pb-2 relative">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-gray-800 group-hover:text-primary transition-colors duration-300">{report.title}</CardTitle>
            <CardDescription className="text-gray-500">{formattedDate}</CardDescription>
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
                <Download className="mr-2 h-4 w-4 text-blue-500" />
                <span>PDF İndir</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-gray-100/80 cursor-pointer">
                <Printer className="mr-2 h-4 w-4 text-gray-500" />
                <span>Yazdır</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-500 hover:bg-red-50/80 hover:text-red-600 cursor-pointer">
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Sil</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="relative">
        <div className="mb-3 flex flex-wrap gap-2">
          <Badge variant="outline" className={`flex items-center px-2 py-0.5 ${typeColor.bg} border-none`}>
            {typeColor.icon}
            {report.type}
          </Badge>
          
          {report.studentId && student && (
            <Badge variant="outline" className="bg-gray-100/80 text-gray-700 hover:bg-gray-200/80 transition-colors border-none flex items-center">
              <Users className="w-3 h-3 mr-1 text-gray-500" />
              {student.firstName} {student.lastName}
            </Badge>
          )}
          
          {report.studentClass && (
            <Badge variant="outline" className="bg-blue-100/80 text-blue-700 hover:bg-blue-200/80 transition-colors border-none flex items-center">
              <School className="w-3 h-3 mr-1 text-blue-500" />
              {report.studentClass}
            </Badge>
          )}
        </div>
        
        <p className="text-sm text-gray-600 leading-relaxed">
          {truncateContent(report.content)}
        </p>
      </CardContent>
      
      <CardFooter className="text-xs text-gray-500 border-t border-gray-100 pt-4 flex justify-between items-center">
        <div className="flex items-center">
          <CalendarDays className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
          {report.createdAt ? format(parseISO(report.createdAt), 'd MMM yyyy HH:mm', { locale: tr }) : ''}
        </div>
        <Button variant="ghost" size="sm" className="h-8 px-2 text-xs text-primary hover:text-primary/90 hover:bg-primary/5">
          <ChevronRight className="w-4 h-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default Reports;
