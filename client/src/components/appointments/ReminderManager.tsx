import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest, getQueryFn } from "@/lib/queryClient";
import { useNotifications } from "@/context/NotificationContext";
import { Bell, Mail, Phone, Plus, Trash2, Clock, Calendar, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { format, addDays, addHours, addMinutes, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';

// Tür tanımları
interface Reminder {
  id?: number;
  appointmentId: number;
  type: string; // SMS, Email
  scheduledTime: string;
  status: string; // Bekliyor, Gönderildi, Başarısız
  recipientInfo: string; // Telefon, e-posta
  content: string;
}

interface Appointment {
  id: number;
  studentId: number;
  appointmentType: string;
  date: string;
  time: string;
  duration: number;
  status: string;
  notes?: string;
}

interface Student {
  id: number;
  firstName: string;
  lastName: string;
  parentPhone?: string;
}

// Form şeması
const reminderSchema = z.object({
  type: z.string().min(1, { message: "Hatırlatıcı tipi gerekli" }),
  scheduledTime: z.string(), // ISO 8601 formatında tarih/saat
  recipientInfo: z.string().min(1, { message: "Alıcı bilgisi gerekli" }),
  content: z.string().min(3, { message: "İçerik en az 3 karakter olmalı" }).max(160, { message: "İçerik en fazla 160 karakter olabilir" })
});

// Zamanlamalar için önceden tanımlanmış seçenekler
const timeOptions = [
  { value: '1-day', label: '1 gün önce' },
  { value: '2-days', label: '2 gün önce' },
  { value: '1-hour', label: '1 saat önce' },
  { value: '30-min', label: '30 dakika önce' },
  { value: '15-min', label: '15 dakika önce' },
  { value: 'custom', label: 'Özel zaman' }
];

const ReminderManager = ({ 
  appointmentId, 
  appointmentDate,
  appointmentTime,
  studentId,
  readOnly = false
}: { 
  appointmentId: number;
  appointmentDate: string;
  appointmentTime: string;
  studentId: number;
  readOnly?: boolean;
}) => {
  // State
  const [timeOption, setTimeOption] = useState('1-day');
  const [customTime, setCustomTime] = useState<string>('');
  const [recipientType, setRecipientType] = useState<'student' | 'parent'>('student');
  
  // Bildirimler ve cache
  const { addNotification } = useNotifications();
  const queryClient = useQueryClient();
  
  // Mevcut hatırlatıcıları getir
  const { 
    data: reminders, 
    isLoading: loadingReminders 
  } = useQuery({
    queryKey: ['/api/reminders/appointment', appointmentId],
    queryFn: getQueryFn({ on401: 'returnNull' }),
    enabled: !!appointmentId
  });
  
  // Öğrenci bilgilerini getir
  const {
    data: student,
    isLoading: loadingStudent
  } = useQuery({
    queryKey: ['/api/students', studentId],
    queryFn: getQueryFn({ on401: 'returnNull' }),
    enabled: !!studentId
  });
  
  // Form
  const form = useForm({
    resolver: zodResolver(reminderSchema),
    defaultValues: {
      type: 'SMS',
      scheduledTime: '',
      recipientInfo: '',
      content: ''
    }
  });
  
  // Öğrenci veya veli bilgilerini form alanlarına doldur
  useEffect(() => {
    if (student) {
      if (recipientType === 'student') {
        form.setValue('recipientInfo', student.parentPhone || '');
      } else {
        form.setValue('recipientInfo', student.parentPhone || '');
      }
      
      // Önerilen mesaj içeriği
      const suggestedContent = `Sayın ${student.firstName} ${student.lastName}, ${format(parseISO(appointmentDate), 'd MMMM yyyy', { locale: tr })} tarihinde saat ${appointmentTime}'de randevunuz bulunmaktadır. Lütfen zamanında gelmeye özen gösterin.`;
      form.setValue('content', suggestedContent);
    }
  }, [student, recipientType, form, appointmentDate, appointmentTime]);
  
  // Hatırlatıcı zamanını ayarla
  useEffect(() => {
    if (appointmentDate && appointmentTime) {
      const appointmentDateTime = parseISO(`${appointmentDate}T${appointmentTime}`);
      let reminderTime = new Date(appointmentDateTime);
      
      switch (timeOption) {
        case '1-day':
          reminderTime = addDays(appointmentDateTime, -1);
          break;
        case '2-days':
          reminderTime = addDays(appointmentDateTime, -2);
          break;
        case '1-hour':
          reminderTime = addHours(appointmentDateTime, -1);
          break;
        case '30-min':
          reminderTime = addMinutes(appointmentDateTime, -30);
          break;
        case '15-min':
          reminderTime = addMinutes(appointmentDateTime, -15);
          break;
        case 'custom':
          if (customTime) {
            // Özel zaman uygulaması burada gerçekleştirilecek
            // Şimdilik randevu vaktini kullan
            reminderTime = appointmentDateTime;
          }
          break;
        default:
          reminderTime = addDays(appointmentDateTime, -1);
      }
      
      form.setValue('scheduledTime', reminderTime.toISOString());
    }
  }, [timeOption, customTime, appointmentDate, appointmentTime, form]);
  
  // Yeni hatırlatıcı ekle
  const addReminderMutation = useMutation({
    mutationFn: (data: Omit<Reminder, 'id' | 'status'>) => 
      apiRequest('/api/reminders', {
        method: 'POST',
        data: {
          ...data,
          appointmentId,
          status: 'Bekliyor'
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/reminders/appointment', appointmentId] });
      form.reset({
        type: 'SMS',
        scheduledTime: '',
        recipientInfo: student?.parentPhone || '',
        content: ''
      });
      addNotification({
        type: "success",
        title: "Hatırlatıcı Eklendi",
        message: "Yeni hatırlatıcı başarıyla kaydedildi."
      });
      
      // Önerilen mesaj içeriğini yeniden ayarla
      if (student) {
        const suggestedContent = `Sayın ${student.firstName} ${student.lastName}, ${format(parseISO(appointmentDate), 'd MMMM yyyy', { locale: tr })} tarihinde saat ${appointmentTime}'de randevunuz bulunmaktadır. Lütfen zamanında gelmeye özen gösterin.`;
        form.setValue('content', suggestedContent);
      }
    },
    onError: (error) => {
      addNotification({
        type: "error",
        title: "Hata",
        message: "Hatırlatıcı eklenirken bir hata oluştu."
      });
    }
  });
  
  // Hatırlatıcı sil
  const deleteReminderMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequest(`/api/reminders/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/reminders/appointment', appointmentId] });
      addNotification({
        type: "success",
        title: "Hatırlatıcı Silindi",
        message: "Hatırlatıcı başarıyla silindi."
      });
    },
    onError: (error) => {
      addNotification({
        type: "error",
        title: "Hata",
        message: "Hatırlatıcı silinirken bir hata oluştu."
      });
    }
  });
  
  // Form gönderme
  const onSubmit = (values: z.infer<typeof reminderSchema>) => {
    addReminderMutation.mutate(values);
  };
  
  // Durum göstergesini render et
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'Bekliyor':
        return (
          <div className="flex items-center text-yellow-600">
            <Clock className="w-4 h-4 mr-1" />
            <span className="text-xs font-medium">Bekliyor</span>
          </div>
        );
      case 'Gönderildi':
        return (
          <div className="flex items-center text-green-600">
            <CheckCircle className="w-4 h-4 mr-1" />
            <span className="text-xs font-medium">Gönderildi</span>
          </div>
        );
      case 'Başarısız':
        return (
          <div className="flex items-center text-red-600">
            <XCircle className="w-4 h-4 mr-1" />
            <span className="text-xs font-medium">Başarısız</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center text-gray-600">
            <AlertCircle className="w-4 h-4 mr-1" />
            <span className="text-xs font-medium">{status}</span>
          </div>
        );
    }
  };
  
  // İkon göstergesini render et
  const renderTypeIcon = (type: string) => {
    switch (type) {
      case 'SMS':
        return <Phone className="w-4 h-4 mr-1 text-blue-500" />;
      case 'Email':
        return <Mail className="w-4 h-4 mr-1 text-green-500" />;
      default:
        return <Bell className="w-4 h-4 mr-1 text-orange-500" />;
    }
  };
  
  if (loadingStudent) {
    return <div>Öğrenci bilgileri yükleniyor...</div>;
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bell className="mr-2 h-5 w-5" />
          Randevu Hatırlatıcıları
        </CardTitle>
        <CardDescription>
          Randevu için hatırlatıcılar oluşturun ve yönetin
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!readOnly && (
          <>
            <Tabs defaultValue="sms" className="mb-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="sms" onClick={() => form.setValue('type', 'SMS')}>
                  <Phone className="mr-2 h-4 w-4" />
                  SMS
                </TabsTrigger>
                <TabsTrigger value="email" onClick={() => form.setValue('type', 'Email')}>
                  <Mail className="mr-2 h-4 w-4" />
                  E-posta
                </TabsTrigger>
              </TabsList>
              <TabsContent value="sms" className="space-y-4 mt-4">
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <div className="grid gap-4">
                    <div>
                      <Label htmlFor="reminderTime">Hatırlatma Zamanı</Label>
                      <Select 
                        value={timeOption} 
                        onValueChange={setTimeOption}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Zaman seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {timeOption === 'custom' && (
                        <div className="mt-2">
                          <Input
                            type="datetime-local"
                            value={customTime}
                            onChange={(e) => setCustomTime(e.target.value)}
                            className="w-full"
                          />
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground mt-1">
                        Hatırlatıcı {form.watch('scheduledTime') ? 
                          format(parseISO(form.watch('scheduledTime')), 'PPpp', { locale: tr }) : 
                          'belirlenen zamanda'} 
                        gönderilecek.
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="recipientInfo">Telefon Numarası</Label>
                      <div className="flex gap-2 mb-1">
                        <Button 
                          type="button"
                          variant={recipientType === 'student' ? "default" : "outline"} 
                          size="sm"
                          onClick={() => setRecipientType('student')}
                        >
                          Öğrenci
                        </Button>
                        <Button 
                          type="button"
                          variant={recipientType === 'parent' ? "default" : "outline"} 
                          size="sm"
                          onClick={() => setRecipientType('parent')}
                        >
                          Veli
                        </Button>
                      </div>
                      <Input
                        {...form.register('recipientInfo')}
                        id="recipientInfo"
                        placeholder="5XX XXX XX XX"
                      />
                      {form.formState.errors.recipientInfo && (
                        <p className="text-xs text-red-500 mt-1">
                          {form.formState.errors.recipientInfo.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="content">Mesaj İçeriği</Label>
                      <Input
                        {...form.register('content')}
                        id="content"
                        className="h-20"
                      />
                      <div className="flex justify-between mt-1">
                        <p className="text-xs text-muted-foreground">
                          Mesaj uzunluğu: {form.watch('content')?.length || 0}/160
                        </p>
                        {form.formState.errors.content && (
                          <p className="text-xs text-red-500">
                            {form.formState.errors.content.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={addReminderMutation.isPending}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Hatırlatıcı Ekle
                    </Button>
                  </div>
                </form>
              </TabsContent>
              <TabsContent value="email" className="space-y-4 mt-4">
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <div className="grid gap-4">
                    <div>
                      <Label htmlFor="reminderTime">Hatırlatma Zamanı</Label>
                      <Select 
                        value={timeOption} 
                        onValueChange={setTimeOption}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Zaman seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {timeOption === 'custom' && (
                        <div className="mt-2">
                          <Input
                            type="datetime-local"
                            value={customTime}
                            onChange={(e) => setCustomTime(e.target.value)}
                            className="w-full"
                          />
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground mt-1">
                        Hatırlatıcı {form.watch('scheduledTime') ? 
                          format(parseISO(form.watch('scheduledTime')), 'PPpp', { locale: tr }) : 
                          'belirlenen zamanda'} 
                        gönderilecek.
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="recipientInfo">E-posta Adresi</Label>
                      <Input
                        {...form.register('recipientInfo')}
                        id="recipientInfo"
                        placeholder="example@example.com"
                        type="email"
                      />
                      {form.formState.errors.recipientInfo && (
                        <p className="text-xs text-red-500 mt-1">
                          {form.formState.errors.recipientInfo.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="content">Mesaj İçeriği</Label>
                      <Input
                        {...form.register('content')}
                        id="content"
                        className="h-20"
                      />
                      {form.formState.errors.content && (
                        <p className="text-xs text-red-500 mt-1">
                          {form.formState.errors.content.message}
                        </p>
                      )}
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={addReminderMutation.isPending}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Hatırlatıcı Ekle
                    </Button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
            
            <Separator className="my-6" />
          </>
        )}
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium">
            Mevcut Hatırlatıcılar
          </h3>
          
          {loadingReminders ? (
            <div className="text-center py-4">Yükleniyor...</div>
          ) : reminders && reminders.length > 0 ? (
            <div className="space-y-2">
              {reminders.map((reminder: Reminder) => (
                <div 
                  key={reminder.id}
                  className="flex justify-between items-center p-3 bg-muted rounded-lg"
                >
                  <div className="flex items-start">
                    <div className="mt-1">
                      {renderTypeIcon(reminder.type)}
                    </div>
                    <div className="ml-2">
                      <div className="font-medium flex items-center">
                        {reminder.type === 'SMS' ? 'SMS' : 'E-posta'} Hatırlatıcı
                        <span className="ml-2">
                          {renderStatusBadge(reminder.status)}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Alıcı: {reminder.recipientInfo}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center mt-1">
                        <Calendar className="w-3 h-3 mr-1" />
                        {format(parseISO(reminder.scheduledTime), 'PPpp', { locale: tr })}
                      </div>
                      <div className="text-sm mt-2 line-clamp-2">
                        {reminder.content}
                      </div>
                    </div>
                  </div>
                  
                  {!readOnly && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteReminderMutation.mutate(reminder.id!)}
                      disabled={deleteReminderMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              Henüz tanımlanmış hatırlatıcı yok.
              {!readOnly && " Yukarıdaki formu kullanarak hatırlatıcı ekleyebilirsiniz."}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ReminderManager;