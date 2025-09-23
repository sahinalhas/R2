import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, subDays } from "date-fns";
import { tr } from "date-fns/locale";
import { Users, CalendarDays, MessageSquare, FileText, ClipboardCheck, LineChart } from "lucide-react";

import { Container } from "@/components/ui/container";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  BarChart as RechartsBarChart,
  Bar
} from "recharts";
import { RecentActivities } from "@/features/dashboard";

const COLORS = ["#8b5cf6", "#6366f1", "#3b82f6", "#0ea5e9", "#06b6d4", "#14b8a6", "#10b981"]; 

const Statistics = () => {
  // Fetch core datasets
  const { data: students, isLoading: loadingStudents } = useQuery<any[]>({ queryKey: ["/api/students"], staleTime: 60_000 });
  const { data: appointments, isLoading: loadingAppointments } = useQuery<any[]>({ queryKey: ["/api/appointments"], staleTime: 60_000 });
  const { data: sessions, isLoading: loadingSessions } = useQuery<any[]>({ queryKey: ["/api/sessions"], staleTime: 60_000 });
  const { data: reports, isLoading: loadingReports } = useQuery<any[]>({ queryKey: ["/api/reports"], staleTime: 60_000 });
  const { data: surveys, isLoading: loadingSurveys } = useQuery<any[]>({ queryKey: ["/api/surveys"], staleTime: 60_000 });

  const loading = loadingStudents || loadingAppointments || loadingSessions || loadingReports || loadingSurveys;

  // Derived metrics
  const metrics = useMemo(() => {
    const totalStudents = Array.isArray(students) ? students.length : 0;
    const totalAppointments = Array.isArray(appointments) ? appointments.length : 0;
    const totalSessions = Array.isArray(sessions) ? sessions.length : 0;
    const totalReports = Array.isArray(reports) ? reports.length : 0;
    const totalSurveys = Array.isArray(surveys) ? surveys.length : 0;

    // Upcoming appointments (today or future)
    const today = new Date().toISOString().split("T")[0];
    const upcomingAppointments = (appointments || []).filter((a: any) => a.date >= today).length;

    return { totalStudents, totalAppointments, totalSessions, totalReports, totalSurveys, upcomingAppointments };
  }, [students, appointments, sessions, reports, surveys]);

  // Weekly line data (last 7 days) for appointments and sessions
  const weeklyData = useMemo(() => {
    const days: { name: string; randevu: number; gorusme: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = subDays(new Date(), i);
      const key = format(d, "yyyy-MM-dd");
      const label = format(d, "EEE", { locale: tr });
      const randevu = (appointments || []).filter((a: any) => a.date === key).length;
      const gorusme = (sessions || []).filter((s: any) => s.date === key).length;
      days.push({ name: label, randevu, gorusme });
    }
    return days;
  }, [appointments, sessions]);

  // Reports by type bar data
  const reportsByType = useMemo(() => {
    const counts: Record<string, number> = { "Öğrenci": 0, "Sınıf": 0, "Genel": 0 };
    (reports || []).forEach((r: any) => {
      if (counts[r.type] != null) counts[r.type]++;
    });
    return Object.keys(counts).map((k, idx) => ({ name: k, adet: counts[k], fill: COLORS[idx % COLORS.length] }));
  }, [reports]);

  // Surveys active vs inactive pie data
  const surveyStatus = useMemo(() => {
    const aktif = (surveys || []).filter((s: any) => !!s.isActive).length;
    const pasif = (surveys || []).length - aktif;
    return [
      { name: "Aktif", value: aktif, color: "#10b981" },
      { name: "Pasif", value: pasif, color: "#f59e0b" },
    ];
  }, [surveys]);

  return (
    <Container>
      <div className="py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">İstatistikler</h1>
            <p className="text-gray-500">Uygulamanın genel durumu için özet metrikler ve grafikler</p>
          </div>
        </div>

        {/* Stat cards */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center gap-2"><Users className="w-4 h-4"/>Öğrenci</CardTitle><CardDescription>Toplam</CardDescription></CardHeader>
              <CardContent><div className="text-2xl font-bold">{metrics.totalStudents}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center gap-2"><CalendarDays className="w-4 h-4"/>Randevu</CardTitle><CardDescription>Toplam / Yaklaşan</CardDescription></CardHeader>
              <CardContent><div className="text-2xl font-bold">{metrics.totalAppointments} <span className="text-sm text-gray-500">/ {metrics.upcomingAppointments}</span></div></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center gap-2"><MessageSquare className="w-4 h-4"/>Görüşme</CardTitle><CardDescription>Toplam</CardDescription></CardHeader>
              <CardContent><div className="text-2xl font-bold">{metrics.totalSessions}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center gap-2"><FileText className="w-4 h-4"/>Rapor</CardTitle><CardDescription>Toplam</CardDescription></CardHeader>
              <CardContent><div className="text-2xl font-bold">{metrics.totalReports}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center gap-2"><ClipboardCheck className="w-4 h-4"/>Anket</CardTitle><CardDescription>Toplam</CardDescription></CardHeader>
              <CardContent><div className="text-2xl font-bold">{metrics.totalSurveys}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center gap-2"><LineChart className="w-4 h-4"/>Genel</CardTitle><CardDescription>Modül sayısı</CardDescription></CardHeader>
              <CardContent><div className="text-2xl font-bold">5</div></CardContent>
            </Card>
          </div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="bg-white/90 backdrop-blur-sm border-white/20 shadow-xl overflow-hidden">
            <CardHeader className="pb-1">
              <CardTitle className="text-lg">Son 7 Gün: Randevu vs Görüşme</CardTitle>
              <CardDescription>Günlük toplamlar</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-[280px] w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart data={weeklyData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="randevu" stroke="#3b82f6" strokeWidth={3} dot={{ r: 2 }} />
                    <Line type="monotone" dataKey="gorusme" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 2 }} />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm border-white/20 shadow-xl overflow-hidden">
            <CardHeader className="pb-1">
              <CardTitle className="text-lg">Rapor Türleri Dağılımı</CardTitle>
              <CardDescription>Öğrenci / Sınıf / Genel</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              {loadingReports ? (
                <Skeleton className="h-[240px] w-full rounded-xl" />
              ) : (
                <div className="h-[280px] w-full mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={reportsByType}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="adet">
                        {reportsByType.map((d, i) => (
                          <Cell key={i} fill={d.fill} />
                        ))}
                      </Bar>
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white/90 backdrop-blur-sm border-white/20 shadow-xl overflow-hidden">
            <CardHeader className="pb-1">
              <CardTitle className="text-lg">Anket Durumu</CardTitle>
              <CardDescription>Aktif / Pasif</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              {loadingSurveys ? (
                <Skeleton className="h-[240px] w-full rounded-xl" />
              ) : (
                <div className="h-[260px] w-full mt-2 flex justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie data={surveyStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                        {surveyStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm border-white/20 shadow-xl overflow-hidden">
            <CardHeader className="pb-1">
              <CardTitle className="text-lg">Son Etkinlikler</CardTitle>
              <CardDescription>Uygulamada gerçekleşen son hareketler</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <RecentActivities />
            </CardContent>
          </Card>
        </div>
      </div>
    </Container>
  );
};

export default Statistics;
