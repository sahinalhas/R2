import { Calendar, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Appointment } from "@shared/schema";
import { formatDateTime, getStatusColor } from "../utils";

interface AppointmentsTabProps {
  appointments: Appointment[];
  studentId: number;
}

const AppointmentsTab = ({ appointments, studentId }: AppointmentsTabProps) => {
  // Randevuları tarihe göre sırala (en yeniden en eskiye)
  const sortedAppointments = [...appointments].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold">Öğrenci Randevuları</h3>
        <Button className="bg-primary hover:bg-primary/90">
          <Calendar className="w-4 h-4 mr-2" />
          Yeni Randevu Oluştur
        </Button>
      </div>
      
      {sortedAppointments.length === 0 ? (
        <Card className="border-dashed border-gray-200">
          <CardContent className="p-6 text-center">
            <div className="rounded-full bg-gray-100 w-12 h-12 flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-6 h-6 text-gray-400" />
            </div>
            <h4 className="font-semibold text-gray-700 mb-2">Henüz Randevu Yok</h4>
            <p className="text-gray-500 text-sm max-w-md mx-auto">
              Bu öğrenci için kayıtlı randevu bulunmuyor. Yeni bir randevu oluşturmak için "Yeni Randevu Oluştur" butonunu kullanabilirsiniz.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedAppointments.map((appointment) => (
            <Card 
              key={appointment.id}
              className="hover:shadow-lg transition-shadow duration-300 cursor-pointer border border-gray-200/75 hover:border-primary/20"
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base font-semibold text-gray-800 flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-primary" />
                    {appointment.appointmentType || "Genel Randevu"}
                  </CardTitle>
                  <Badge className={getStatusColor(appointment.status)}>
                    {appointment.status || "Bekliyor"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="space-y-3">
                  <div className="flex items-center text-gray-700">
                    <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="text-sm">{formatDateTime(`${appointment.date} ${appointment.time}`)}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Clock className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="text-sm">Süre: {appointment.duration || "30"} dakika</span>
                  </div>
                  {appointment.notes && (
                    <div className="bg-gray-50 rounded-md p-3 mt-2">
                      <div className="text-sm text-gray-600">{appointment.notes}</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AppointmentsTab;