import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { tr } from 'date-fns/locale';
import { apiRequest } from "@/lib/queryClient";
import { insertAppointmentSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useNotifications } from "@/context/NotificationContext";
import {
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AvailabilityCalendar } from "@/features/calendar";
import ReminderManager from "@/components/appointments/ReminderManager";
import { Calendar, Clock, BellRing, CalendarCheck } from "lucide-react";

// Tür tanımları
interface TimeSlot {
  startTime: string;
  endTime: string;
}

// Öğrencileri getir
const useStudents = () => {
  return useQuery({
    queryKey: ['/api/students'],
    staleTime: 60 * 1000, // 1 dakika
  });
};

// Form şeması
const formSchema = insertAppointmentSchema
  .extend({
    date: z.string().min(1, { message: "Tarih seçmelisiniz" }),
    time: z.string().min(1, { message: "Saat seçmelisiniz" }),
  })
  .refine(data => Number(data.studentId) > 0, {
    message: "Öğrenci seçmelisiniz",
    path: ["studentId"],
  });

const NewAppointmentModal = () => {
  // State
  const [step, setStep] = useState(1);
  const [createdAppointmentId, setCreatedAppointmentId] = useState<number | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  // Hooks
  const { toast } = useToast();
  const { addNotification } = useNotifications();
  const queryClient = useQueryClient();
  const { data: students, isLoading: studentsLoading } = useStudents();
  
  // Bugünün tarihi
  const today = format(new Date(), 'yyyy-MM-dd');
  
  // Form tanımı
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentId: "",
      appointmentType: "",
      date: today,
      time: "09:00",
      duration: 30,
      status: "Bekliyor",
      notes: "",
    },
  });
  
  // Kullanılabilir slotu form değerlerine ata
  useEffect(() => {
    if (selectedSlot && selectedDate) {
      form.setValue('date', format(selectedDate, 'yyyy-MM-dd'));
      form.setValue('time', selectedSlot.startTime);
    }
  }, [selectedSlot, selectedDate, form]);
  
  // Slot seçimi
  const handleSlotSelect = (date: Date, slot: TimeSlot) => {
    setSelectedDate(date);
    setSelectedSlot(slot);
  };
  
  // Randevu oluşturma
  const mutation = useMutation({
    mutationFn: async (data: any) => {
      console.log("Randevu oluşturuluyor:", data);
      return await apiRequest('/api/appointments', {
        method: 'POST',
        data
      });
    },
    onSuccess: (data: any) => {
      // Başarı bildirimi
      toast({
        title: "Randevu oluşturuldu",
        description: "Yeni randevu başarıyla oluşturuldu.",
      });
      
      // Veriyi yenile
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/activities'] });
      queryClient.invalidateQueries({ queryKey: ['/api/available-slots'] });
      
      // Kaydedilen randevunun ID'sini sakla
      setCreatedAppointmentId(data.id);
      
      // Hatırlatıcı ekleme ekranına geç
      setStep(3);
      
      // Bildirim
      const formValues = form.getValues();
      addNotification({
        type: "success",
        title: "Randevu Oluşturuldu",
        message: `${format(new Date(formValues.date), 'd MMMM yyyy', { locale: tr })} tarihinde ${formValues.time} saatinde randevu oluşturuldu.`,
        category: "appointment"
      });
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: "Randevu oluşturulurken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });
  
  // Form gönderimi
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // Formdaki değerlerin doğru formatta olduğundan emin ol
    try {
      const formattedValues = {
        ...values,
        studentId: Number(values.studentId),
        duration: Number(values.duration)
      };
      
      console.log("Form gönderiliyor:", formattedValues);
      // Endpointin istediği parametreleri doğru formatta içeren bir nesne oluştur
      mutation.mutate({
        studentId: formattedValues.studentId, 
        appointmentType: formattedValues.appointmentType,
        date: formattedValues.date,
        time: formattedValues.time,
        duration: formattedValues.duration,
        status: formattedValues.status,
        notes: formattedValues.notes
      });
    } catch (error) {
      console.error("Form gönderiminde hata:", error);
      toast({
        title: "Hata",
        description: "Form verileri hazırlanırken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };
  
  // Başka bir adıma geç
  const goToStep = (nextStep: number) => {
    setStep(nextStep);
  };
  
  // Adıma göre ilerleme durumu
  const getProgressText = () => {
    switch (step) {
      case 1: return "Adım 1: Öğrenci ve Randevu Tipi";
      case 2: return "Adım 2: Tarih ve Saat Seçimi";
      case 3: return "Adım 3: Hatırlatıcı Ayarları";
      default: return "Yeni Randevu";
    }
  };
  
  // Randevu oluşturma formunu göster
  const renderAppointmentForm = () => (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="studentId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Öğrenci</FormLabel>
            <Select disabled={studentsLoading} onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Öğrenci seçin" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="placeholder" disabled>Öğrenci seçin</SelectItem>
                {students?.map(student => (
                  <SelectItem key={student.id} value={student.id.toString()}>
                    {student.firstName} {student.lastName} - {student.studentClass}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="appointmentType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Randevu Tipi</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Randevu tipi seçin" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="placeholder" disabled>Randevu tipi seçin</SelectItem>
                <SelectItem value="Akademik Danışmanlık">Akademik Danışmanlık</SelectItem>
                <SelectItem value="Kariyer Danışmanlığı">Kariyer Danışmanlığı</SelectItem>
                <SelectItem value="Psikolojik Danışmanlık">Psikolojik Danışmanlık</SelectItem>
                <SelectItem value="Aile Görüşmesi">Aile Görüşmesi</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Notlar</FormLabel>
            <FormControl>
              <Textarea rows={3} placeholder="Randevu ile ilgili notlar..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
  
  // Tarih ve saat seçimi ekranını göster
  const renderDateTimeSelection = () => (
    <div className="space-y-4">
      <AvailabilityCalendar onSelectSlot={handleSlotSelect} />
      
      {selectedSlot && selectedDate && (
        <div className="bg-secondary p-4 rounded-md mt-4 flex items-center justify-between">
          <div>
            <h3 className="font-medium">Seçilen zaman:</h3>
            <p className="text-muted-foreground">
              {format(selectedDate, 'd MMMM yyyy', { locale: tr })}, {selectedSlot.startTime} - {selectedSlot.endTime}
            </p>
          </div>
          <Badge variant="outline" className="ml-2">
            <Clock className="mr-1 h-3 w-3" />
            {form.getValues('duration')} dakika
          </Badge>
        </div>
      )}
      
      <div>
        <FormField
          control={form.control}
          name="duration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Süre (dakika)</FormLabel>
              <Select 
                onValueChange={(value) => {
                  // String değeri sayıya çevir ve ayarla
                  const durationValue = parseInt(value, 10);
                  field.onChange(durationValue);
                  
                  // Seçili slot varsa, yeni süreye göre bitiş saatini güncelle
                  if (selectedSlot && selectedDate) {
                    // Başlangıç zamanını dakikaya çevir
                    const [startHour, startMinute] = selectedSlot.startTime.split(':').map(Number);
                    const startMinutes = startHour * 60 + startMinute;
                    
                    // Yeni bitiş zamanını hesapla
                    const endMinutes = startMinutes + durationValue;
                    const endHour = Math.floor(endMinutes / 60);
                    const endMinute = endMinutes % 60;
                    
                    // Bitiş zamanını formatla
                    const endTime = `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;
                    
                    // Güncellenmiş slotu ayarla
                    setSelectedSlot({
                      startTime: selectedSlot.startTime,
                      endTime: endTime
                    });
                  }
                }} 
                value={field.value.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Süre seçin" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="30">30 dakika</SelectItem>
                  <SelectItem value="45">45 dakika</SelectItem>
                  <SelectItem value="60">60 dakika</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <div className="hidden">
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input type="hidden" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="time"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input type="hidden" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
  
  // Hatırlatıcı ayarları ekranını göster
  const renderReminderSetup = () => {
    if (!createdAppointmentId || !form.getValues('date') || !form.getValues('time')) {
      return (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Randevu oluşturulurken bir sorun oluştu.</p>
        </div>
      );
    }
    
    const studentId = Number(form.getValues('studentId'));
    const appointmentDate = form.getValues('date');
    const appointmentTime = form.getValues('time');
    
    return (
      <div className="space-y-4">
        <div className="bg-secondary p-4 rounded-md mb-4">
          <h3 className="font-medium flex items-center">
            <CalendarCheck className="mr-2 h-5 w-5" />
            Randevu Bilgileri
          </h3>
          <p className="text-sm text-muted-foreground">
            {format(new Date(appointmentDate), 'd MMMM yyyy', { locale: tr })} tarihi, {appointmentTime} saatinde {form.getValues('duration')} dakikalık randevu oluşturuldu.
          </p>
        </div>
        
        <ReminderManager 
          appointmentId={createdAppointmentId}
          appointmentDate={appointmentDate}
          appointmentTime={appointmentTime}
          studentId={studentId}
        />
      </div>
    );
  };
  
  // Adıma göre içeriği göster
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return renderAppointmentForm();
      case 2:
        return renderDateTimeSelection();
      case 3:
        return renderReminderSetup();
      default:
        return renderAppointmentForm();
    }
  };
  
  // Adıma göre butonları göster
  const renderStepButtons = () => {
    switch (step) {
      case 1:
        return (
          <>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => form.reset()}
            >
              Temizle
            </Button>
            <Button 
              type="button" 
              disabled={!form.getValues('studentId') || !form.getValues('appointmentType')}
              onClick={() => goToStep(2)}
            >
              İleri
            </Button>
          </>
        );
      case 2:
        return (
          <>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => goToStep(1)}
            >
              Geri
            </Button>
            <Button 
              type="submit" 
              disabled={mutation.isPending || !selectedSlot}
            >
              {mutation.isPending ? "Oluşturuluyor..." : "Randevu Oluştur"}
            </Button>
          </>
        );
      case 3:
        return (
          <Button 
            type="button" 
            variant="default" 
            onClick={() => {
              setStep(1);
              form.reset();
              setCreatedAppointmentId(null);
              setSelectedSlot(null);
              setSelectedDate(null);
            }}
          >
            Tamamla ve Kapat
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center">
          <Calendar className="mr-2 h-5 w-5" />
          {getProgressText()}
        </DialogTitle>
        <DialogDescription>
          {step === 1 && "Lütfen önce öğrenci ve randevu tipini seçin"}
          {step === 2 && "Randevu için uygun bir tarih ve saat seçin"}
          {step === 3 && "Randevu için hatırlatıcılar ayarlayın (isteğe bağlı)"}
        </DialogDescription>
      </DialogHeader>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          {renderStepContent()}
          
          <DialogFooter>
            {renderStepButtons()}
          </DialogFooter>
        </form>
      </Form>
    </>
  );
};

export default NewAppointmentModal;
