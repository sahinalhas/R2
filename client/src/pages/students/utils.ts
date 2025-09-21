import { useQuery } from "@tanstack/react-query";
import { Student, Appointment, Session, Report } from "@shared/schema";

// Öğrenci detaylarını getirme hook'u
export const useStudentDetail = (id: number) => {
  return useQuery<Student>({
    queryKey: [`/api/students/${id}`],
    staleTime: 60 * 1000, // 1 dakika
  });
};

// Öğrencinin randevularını getirme hook'u
export const useStudentAppointments = (id: number) => {
  return useQuery<Appointment[]>({
    queryKey: [`/api/appointments?studentId=${id}`],
    staleTime: 60 * 1000, // 1 dakika
  });
};

// Öğrencinin görüşmelerini getirme hook'u
export const useStudentSessions = (id: number) => {
  return useQuery<Session[]>({
    queryKey: [`/api/sessions?studentId=${id}`],
    staleTime: 60 * 1000, // 1 dakika
  });
};

// Öğrencinin raporlarını getirme hook'u
export const useStudentReports = (id: number) => {
  return useQuery<Report[]>({
    queryKey: [`/api/reports?studentId=${id}`],
    staleTime: 60 * 1000, // 1 dakika
  });
};

// İsmin baş harflerini alma fonksiyonu (avatar için)
export const getInitials = (firstName?: string, lastName?: string) => {
  if (!firstName || !lastName) return "ÖR";
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

// Randevu durumuna göre renk belirleme
export const getStatusColor = (status?: string) => {
  switch (status) {
    case "Tamamlandı": return "bg-green-100 text-green-800 border-green-200";
    case "Bekliyor": return "bg-amber-100 text-amber-800 border-amber-200";
    case "İptal Edildi": return "bg-red-100 text-red-800 border-red-200";
    default: return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

// Tarih formatlama
export const formatDate = (dateString?: string | null) => {
  if (!dateString) return "-";
  
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(date);
};

// Tarih ve saat formatlama
export const formatDateTime = (dateString?: string | null) => {
  if (!dateString) return "-";
  
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
};