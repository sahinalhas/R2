import React from "react";
import { 
  User, 
  Edit, 
  Trash2, 
  Clock, 
  ArrowUpRight,
  MoreHorizontal
} from "lucide-react";
import { Appointment } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Özellik bazlı hook'ları kullanıyoruz
import { useStudent } from "@/features/students/hooks/useStudentApi";
import { calculateEndTime, appointmentTypeConfig, appointmentStatusConfig } from "@/features/appointments/utils/appointment-utils";

interface AppointmentItemProps {
  appointment: Appointment;
}

export const AppointmentItem: React.FC<AppointmentItemProps> = ({ appointment }) => {
  const { data: student, isLoading } = useStudent(appointment.studentId);
  
  // Varsayılan türü kullan ya da "Akademik Danışmanlık" geri dön
  const type = appointment.appointmentType in appointmentTypeConfig 
    ? appointment.appointmentType 
    : "Akademik Danışmanlık";
  
  // Türe göre konfigürasyonu al  
  const typeConfig = appointmentTypeConfig[type as keyof typeof appointmentTypeConfig];
  
  // Randevu durumuna göre konfigürasyon
  const status = appointment.status in appointmentStatusConfig 
    ? appointment.status 
    : "Bekliyor";
    
  const statusConfig = appointmentStatusConfig[status as keyof typeof appointmentStatusConfig];

  return (
    <div className="group relative overflow-hidden backdrop-blur-sm rounded-xl
                    transition-all duration-500 ease-out
                    hover:-translate-y-1.5 hover:scale-[1.02]
                    border border-gray-100/80 dark:border-gray-800/20
                    bg-white/95 dark:bg-gray-800/30
                    shadow-[0_0_15px_rgba(0,0,0,0.05)] hover:shadow-[0_10px_25px_rgba(0,0,0,0.08)]
                    dark:shadow-gray-900/10 dark:hover:shadow-gray-900/20">
      {/* Premium gradient indicator */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${typeConfig.gradient}`}></div>
      
      {/* Elegant background decoration */}
      <div className={`absolute -right-20 -bottom-20 w-48 h-48 rounded-full 
                      bg-gradient-to-r ${typeConfig.gradient} opacity-[0.03] blur-3xl 
                      transform transition-all duration-700 ease-out 
                      group-hover:scale-125 group-hover:opacity-[0.06] group-hover:rotate-12`}></div>
      
      {/* Additional subtle gradient decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent 
                      dark:from-gray-800/30 dark:via-transparent dark:to-transparent 
                      opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div className="p-5 relative z-10">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            {isLoading ? (
              <Skeleton className="h-14 w-14 rounded-xl" />
            ) : (
              <div className={`h-14 w-14 rounded-xl ${typeConfig.bgColor} 
                            border border-${typeConfig.color}-200
                            flex items-center justify-center 
                            shadow-md transform 
                            transition-all duration-300 ease-out
                            group-hover:scale-110 group-hover:rotate-2 group-hover:shadow-lg`}>
                <User className={`w-6 h-6 ${typeConfig.textColor}`} />
              </div>
            )}
            
            <div>
              {isLoading ? (
                <Skeleton className="h-5 w-36" />
              ) : (
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center text-lg tracking-tight group-hover:-translate-y-0.5 transition-transform duration-300">
                  {student?.firstName} {student?.lastName}
                  <span className={`ml-2 inline-flex items-center text-[10px] px-2 py-0.5 rounded-full 
                                ${statusConfig.bgColor} ${statusConfig.textColor} 
                                ring-1 ring-inset
                                shadow-sm`}>
                    {React.createElement(statusConfig.icon, { className: "w-3 h-3" })}
                    <span className="ml-1 font-medium">{status}</span>
                  </span>
                </h3>
              )}
              
              {isLoading ? (
                <Skeleton className="h-4 w-28 mt-1" />
              ) : (
                <div className="flex flex-wrap gap-2 mt-1.5">
                  <span className="text-xs text-gray-500 dark:text-gray-400 
                               bg-gray-100/80 dark:bg-gray-700/50 
                               px-2 py-0.5 rounded-md shadow-sm">
                    {student?.studentClass || 'Sınıf bilgisi yok'}
                  </span>
                  <span className={`text-xs font-medium ${typeConfig.textColor} 
                                inline-flex items-center ${typeConfig.bgColor} 
                                px-2 py-0.5 rounded-md 
                                border border-${typeConfig.color}-200 shadow-sm`}>
                    {React.createElement(typeConfig.icon as React.ElementType, { className: "w-4 h-4 mr-1" })}
                    <span>{type}</span>
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-9 w-9 rounded-lg text-gray-500 dark:text-gray-400 
                        hover:bg-gray-100 dark:hover:bg-gray-800 
                        opacity-0 group-hover:opacity-100 
                        transition-all duration-300 
                        shadow-sm hover:shadow ring-1 ring-gray-200/50 dark:ring-gray-700/30"
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-lg border-gray-100/80 dark:border-gray-800/30">
              <DropdownMenuItem className="flex items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg my-0.5 mx-0.5 py-2 transition-colors duration-150">
                <Edit className="w-4 h-4 mr-2" />
                <span>Düzenle</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center cursor-pointer text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 focus:text-red-700 focus:bg-red-50 rounded-lg my-0.5 mx-0.5 py-2 transition-colors duration-150">
                <Trash2 className="w-4 h-4 mr-2" />
                <span>Sil</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100 dark:border-gray-800/30">
          <div className="flex items-center 
                      bg-gray-50/80 dark:bg-gray-800/30 
                      px-3 py-1.5 rounded-lg 
                      shadow-sm ring-1 ring-gray-200/50 dark:ring-gray-700/30
                      group-hover:shadow-md transition-shadow duration-300">
            <Clock className="text-primary w-4 h-4 mr-1.5" /> 
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {appointment.time.substring(0, 5)} - {calculateEndTime(appointment.time, appointment.duration)}
            </span>
          </div>
          
          <Button variant="outline" size="sm" 
                className="h-9 rounded-lg 
                         text-primary 
                         border-primary/20 hover:border-primary/40 
                         hover:bg-primary/5 dark:hover:bg-primary/10 
                         transition-all duration-300
                         shadow-sm hover:shadow-md
                         group-hover:-translate-y-0.5">
            <span className="font-medium">Detaylar</span>
            <ArrowUpRight className="ml-1 w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
          </Button>
        </div>
      </div>
    </div>
  );
};