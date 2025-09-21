import { BookOpen, ClockIcon, CheckCircle2, Trash2 } from "lucide-react";
import React from "react";

/**
 * Başlangıç zamanı ve süreye göre bitiş zamanını hesapla
 */
export const calculateEndTime = (startTime: string, durationMinutes: number) => {
  const [hours, minutes] = startTime.split(':').map(Number);
  
  let endMinutes = minutes + durationMinutes;
  let endHours = hours + Math.floor(endMinutes / 60);
  endMinutes = endMinutes % 60;
  
  return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
};

/**
 * Randevu türlerine göre konfigürasyon
 */
export const appointmentTypeConfig: {
  [key: string]: {
    icon: React.ElementType;
    color: string;
    gradient: string;
    bgColor: string;
    textColor: string;
  }
} = {
  "Akademik Danışmanlık": {
    icon: BookOpen,
    color: "blue",
    gradient: "from-blue-600 to-indigo-600",
    bgColor: "bg-blue-50",
    textColor: "text-blue-700"
  },
  "Kariyer Danışmanlığı": {
    icon: BookOpen,
    color: "purple",
    gradient: "from-purple-600 to-fuchsia-600",
    bgColor: "bg-purple-50",
    textColor: "text-purple-700"
  },
  "Psikolojik Danışmanlık": {
    icon: BookOpen,
    color: "amber",
    gradient: "from-amber-500 to-orange-600",
    bgColor: "bg-amber-50",
    textColor: "text-amber-700"
  },
  "Aile Görüşmesi": {
    icon: BookOpen,
    color: "emerald",
    gradient: "from-emerald-500 to-green-600",
    bgColor: "bg-emerald-50",
    textColor: "text-emerald-700"
  }
};

/**
 * Randevu durumuna göre konfigürasyon
 */
export const appointmentStatusConfig: {
  [key: string]: {
    icon: React.ElementType;
    bgColor: string;
    textColor: string;
  }
} = {
  "Bekliyor": {
    icon: ClockIcon,
    bgColor: "bg-amber-100",
    textColor: "text-amber-800"
  },
  "Tamamlandı": {
    icon: CheckCircle2,
    bgColor: "bg-emerald-100",
    textColor: "text-emerald-800"
  },
  "İptal Edildi": {
    icon: Trash2,
    bgColor: "bg-red-100",
    textColor: "text-red-800"
  }
};