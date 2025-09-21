import { 
  User, Phone, FileText, BarChart4, Calendar, MessageSquare
} from "lucide-react";
import { 
  Card, CardContent, CardHeader, CardTitle 
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Student, Appointment, Session, Report } from "@shared/schema";
import { formatDate, getStatusColor } from "../utils";

interface OverviewTabProps {
  student: Student;
  appointments: Appointment[];
  sessions: Session[];
  reports: Report[];
}

const OverviewTab = ({ student, appointments, sessions, reports }: OverviewTabProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Kişisel Bilgiler */}
      <Card className="shadow-lg border-gray-100 bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
            <User className="w-5 h-5 mr-2 text-primary" />
            Kişisel Bilgiler
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pt-2">
          <div className="grid grid-cols-[100px_1fr] items-center">
            <span className="text-sm font-medium text-gray-500">Ad Soyad:</span>
            <span className="text-sm text-gray-700">{student?.firstName} {student?.lastName}</span>
          </div>
          <Separator className="my-1" />
          <div className="grid grid-cols-[100px_1fr] items-center">
            <span className="text-sm font-medium text-gray-500">Sınıf:</span>
            <span className="text-sm text-gray-700">{student?.studentClass}</span>
          </div>
          <Separator className="my-1" />
          <div className="grid grid-cols-[100px_1fr] items-center">
            <span className="text-sm font-medium text-gray-500">Öğrenci No:</span>
            <span className="text-sm text-gray-700">{student?.studentNumber}</span>
          </div>
          <Separator className="my-1" />
          <div className="grid grid-cols-[100px_1fr] items-center">
            <span className="text-sm font-medium text-gray-500">Doğum Tarihi:</span>
            <span className="text-sm text-gray-700">{formatDate(student?.birthDate)}</span>
          </div>
          <Separator className="my-1" />
          <div className="grid grid-cols-[100px_1fr] items-center">
            <span className="text-sm font-medium text-gray-500">Cinsiyet:</span>
            <span className="text-sm text-gray-700">{student?.gender || "-"}</span>
          </div>
        </CardContent>
      </Card>
      
      {/* Veli Bilgileri */}
      <Card className="shadow-lg border-gray-100 bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
            <Phone className="w-5 h-5 mr-2 text-blue-500" />
            Veli Bilgileri
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pt-2">
          <div className="grid grid-cols-[100px_1fr] items-center">
            <span className="text-sm font-medium text-gray-500">Veli Adı:</span>
            <span className="text-sm text-gray-700">{student?.parentName || "-"}</span>
          </div>
          <Separator className="my-1" />
          <div className="grid grid-cols-[100px_1fr] items-center">
            <span className="text-sm font-medium text-gray-500">Telefon:</span>
            <span className="text-sm text-gray-700">{student?.parentPhone || "-"}</span>
          </div>
        </CardContent>
      </Card>
      
      {/* Notlar */}
      <Card className="shadow-lg border-gray-100 bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-emerald-500" />
            Notlar
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <p className="text-sm text-gray-700 whitespace-pre-wrap">
            {student?.notes || "Bu öğrenci için henüz not girilmemiş."}
          </p>
        </CardContent>
      </Card>
      
      {/* Özet Aktivite Bilgileri */}
      <Card className="shadow-lg border-gray-100 bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300 md:col-span-3">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
            <BarChart4 className="w-5 h-5 mr-2 text-purple-500" />
            Özet İstatistikler
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-2">
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-4 rounded-xl border border-primary/5 hover:border-primary/10 hover:shadow-md hover:shadow-primary/5 transition-all duration-300 group">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-600">Toplam Randevu</p>
                <div className="p-2 bg-primary/20 rounded-lg transform transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2 group-hover:translate-x-1 transition-transform duration-300">{appointments.length}</p>
              <div className="mt-1 text-xs font-medium text-gray-500">
                {appointments.filter(a => a.status === "Tamamlandı").length} tamamlandı, {appointments.filter(a => a.status === "Bekliyor").length} bekliyor
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 p-4 rounded-xl border border-blue-500/5 hover:border-blue-500/10 hover:shadow-md hover:shadow-blue-500/5 transition-all duration-300 group">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-600">Toplam Görüşme</p>
                <div className="p-2 bg-blue-500/20 rounded-lg transform transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                  <MessageSquare className="h-4 w-4 text-blue-500" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2 group-hover:translate-x-1 transition-transform duration-300">{sessions.length}</p>
              <div className="mt-1 text-xs font-medium text-gray-500">
                Son 30 gün: {sessions.filter(s => new Date(s.date).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000).length}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 p-4 rounded-xl border border-emerald-500/5 hover:border-emerald-500/10 hover:shadow-md hover:shadow-emerald-500/5 transition-all duration-300 group">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-600">Toplam Rapor</p>
                <div className="p-2 bg-emerald-500/20 rounded-lg transform transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                  <BarChart4 className="h-4 w-4 text-emerald-500" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2 group-hover:translate-x-1 transition-transform duration-300">{reports.length}</p>
              <div className="mt-1 text-xs font-medium text-gray-500">
                Son eklenen: {reports.length > 0 ? formatDate(reports[0].createdAt) : "-"}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 p-4 rounded-xl border border-amber-500/5 hover:border-amber-500/10 hover:shadow-md hover:shadow-amber-500/5 transition-all duration-300 group">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-600">Kayıt Tarihi</p>
                <div className="p-2 bg-amber-500/20 rounded-lg transform transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                  <Calendar className="h-4 w-4 text-amber-500" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2 group-hover:translate-x-1 transition-transform duration-300">{formatDate(student?.createdAt)}</p>
              <div className="mt-1 text-xs font-medium text-gray-500">
                {student?.createdAt && new Date(student.createdAt).getTime() > 0 ? `${Math.floor((Date.now() - new Date(student.createdAt).getTime()) / (1000 * 60 * 60 * 24))} gün önce` : "-"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OverviewTab;