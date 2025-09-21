import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { insertSessionSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

// Form şeması
const formSchema = insertSessionSchema
  .extend({
    studentId: z.number().min(1, { message: "Öğrenci seçilmelidir" }),
    sessionType: z.string().min(1, { message: "Görüşme türü belirtilmelidir" }),
    date: z.string().min(1, { message: "Tarih belirtilmelidir" }),
    summary: z.string().min(5, { message: "Özet en az 5 karakter olmalıdır" }),
  });

type SessionFormProps = {
  sessionId?: number;
};

const SessionForm = ({ sessionId }: SessionFormProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditMode = !!sessionId;
  
  // Tüm öğrencileri getir (dropdown için)
  const { data: students, isLoading: studentsLoading } = useQuery({
    queryKey: ['/api/students'],
    staleTime: 5 * 60 * 1000, // 5 dakika
  });
  
  // Düzenleme modunda görüşme verilerini getir
  const { data: session, isLoading: sessionLoading } = useQuery({
    queryKey: [`/api/sessions/${sessionId}`],
    enabled: isEditMode,
    staleTime: 5 * 60 * 1000, // 5 dakika
  });
  
  // Form tanımı
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentId: 0,
      sessionType: "",
      date: new Date().toISOString().split('T')[0], // Bugünün tarihi
      summary: "",
      problems: "",
      actions: "",
      notes: "",
      followUp: false,
      followUpDate: "",
      appointmentId: null,
    },
  });
  
  // Düzenleme modunda form verilerini doldur
  useEffect(() => {
    if (session) {
      form.reset({
        studentId: session.studentId,
        sessionType: session.sessionType,
        date: session.date.split('T')[0], // ISO formatından YYYY-MM-DD kısmını al
        summary: session.summary,
        problems: session.problems || "",
        actions: session.actions || "",
        notes: session.notes || "",
        followUp: session.followUp || false,
        followUpDate: session.followUpDate ? session.followUpDate.split('T')[0] : "",
        appointmentId: session.appointmentId,
      });
    }
  }, [session, form]);
  
  // Görüşme oluşturma
  const createMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const res = await apiRequest("/api/sessions", "POST", values);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Görüşme kaydedildi",
        description: "Yeni görüşme başarıyla oluşturuldu.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/sessions'] });
      window.location.href = "/gorusmeler";
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: `Görüşme oluşturulurken bir hata oluştu: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Görüşme güncelleme
  const updateMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const res = await apiRequest(`/api/sessions/${sessionId}`, "PUT", values);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Görüşme güncellendi",
        description: "Görüşme bilgileri başarıyla güncellendi.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/sessions/${sessionId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/sessions'] });
      window.location.href = "/gorusmeler";
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: `Görüşme güncellenirken bir hata oluştu: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (isEditMode) {
      updateMutation.mutate(values);
    } else {
      createMutation.mutate(values);
    }
  };
  
  const isFollowUpEnabled = form.watch("followUp");

  // Görüşme türü seçenekleri
  const sessionTypeOptions = [
    { value: "Akademik Danışmanlık", label: "Akademik Danışmanlık" },
    { value: "Kariyer Danışmanlığı", label: "Kariyer Danışmanlığı" },
    { value: "Psikolojik Danışmanlık", label: "Psikolojik Danışmanlık" },
    { value: "Aile Görüşmesi", label: "Aile Görüşmesi" },
    { value: "Diğer", label: "Diğer" }
  ];

  if ((isEditMode && sessionLoading) || studentsLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="studentId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Öğrenci</FormLabel>
                <Select 
                  onValueChange={(value) => field.onChange(parseInt(value))}
                  value={field.value ? field.value.toString() : ""}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Öğrenci seçin" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {students && Array.isArray(students) ? (
                      students.map((student: any) => (
                        <SelectItem key={student.id} value={student.id.toString()}>
                          {student.firstName} {student.lastName} ({student.studentClass})
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="0" disabled>Öğrenci bulunamadı</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="sessionType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Görüşme Türü</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Görüşme türü seçin" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {sessionTypeOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tarih</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex items-end gap-4">
            <FormField
              control={form.control}
              name="followUp"
              render={({ field }) => (
                <FormItem className="flex flex-row items-end space-x-2 space-y-0">
                  <FormControl>
                    <Checkbox 
                      checked={field.value} 
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="font-normal text-sm">Takip gerekiyor</FormLabel>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {isFollowUpEnabled && (
              <FormField
                control={form.control}
                name="followUpDate"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Takip Tarihi</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        </div>
        
        <FormField
          control={form.control}
          name="summary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Görüşme Özeti</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Görüşme sırasında konuşulan konuların özeti..."
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="problems"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Belirlenen Problemler</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Görüşme sırasında belirlenen sorunlar..."
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="actions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Önerilen Aksiyonlar</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Görüşme sonucunda önerilen aksiyonlar..."
                  rows={3}
                  {...field}
                />
              </FormControl>
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
                <Textarea 
                  placeholder="Ekstra notlar ve yorumlar..."
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Görüşme ile ilgili eklemek istediğiniz ek bilgiler
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end gap-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => window.location.href = "/gorusmeler"}
          >
            İptal
          </Button>
          <Button 
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {createMutation.isPending || updateMutation.isPending 
              ? "Kaydediliyor..." 
              : isEditMode ? "Güncelle" : "Kaydet"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default SessionForm;