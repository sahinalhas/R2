import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { insertStudentSchema } from "@shared/schema";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";

// Form şeması
const formSchema = insertStudentSchema
  .extend({
    firstName: z.string().min(2, { message: "İsim en az 2 karakter olmalıdır" }),
    lastName: z.string().min(2, { message: "Soyisim en az 2 karakter olmalıdır" }),
    studentClass: z.string().min(1, { message: "Sınıf belirtilmelidir" }),
    studentNumber: z.string().min(1, { message: "Öğrenci numarası belirtilmelidir" }),
  });

type StudentFormProps = {
  studentId?: number;
};

const StudentForm = ({ studentId }: StudentFormProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const isEditMode = !!studentId;
  
  // Düzenleme modunda öğrenci verilerini getir
  const { data: student, isLoading } = useQuery({
    queryKey: [`/api/students/${studentId}`],
    enabled: isEditMode,
    staleTime: 5 * 60 * 1000, // 5 dakika
  });
  
  // Form tanımı
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      studentClass: "",
      studentNumber: "",
      birthDate: "",
      gender: "",
      parentName: "",
      parentPhone: "",
      notes: "",
    },
  });
  
  // Düzenleme modunda form verilerini doldur
  useEffect(() => {
    if (student) {
      form.reset({
        firstName: student.firstName,
        lastName: student.lastName,
        studentClass: student.studentClass,
        studentNumber: student.studentNumber,
        birthDate: student.birthDate || "",
        gender: student.gender || "",
        parentName: student.parentName || "",
        parentPhone: student.parentPhone || "",
        notes: student.notes || "",
      });
    }
  }, [student, form]);
  
  // Öğrenci oluşturma
  const createMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const res = await apiRequest("/api/students", "POST", values);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Öğrenci kaydedildi",
        description: "Yeni öğrenci başarıyla oluşturuldu.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/students'] });
      navigate("/ogrenciler");
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: `Öğrenci oluşturulurken bir hata oluştu: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Öğrenci güncelleme
  const updateMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const res = await apiRequest(`/api/students/${studentId}`, "PUT", values);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Öğrenci güncellendi",
        description: "Öğrenci bilgileri başarıyla güncellendi.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/students/${studentId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/students'] });
      navigate("/ogrenciler");
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: `Öğrenci güncellenirken bir hata oluştu: ${error.message}`,
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

  if (isEditMode && isLoading) {
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
    <div>
      <Button 
        variant="ghost" 
        className="mb-6" 
        onClick={() => navigate("/ogrenciler")}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Geri Dön
      </Button>
      
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold text-neutral-800 mb-6">
          {isEditMode ? "Öğrenci Düzenle" : "Yeni Öğrenci Ekle"}
        </h2>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ad</FormLabel>
                    <FormControl>
                      <Input placeholder="Öğrencinin adı" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Soyad</FormLabel>
                    <FormControl>
                      <Input placeholder="Öğrencinin soyadı" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="studentClass"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sınıf</FormLabel>
                    <FormControl>
                      <Input placeholder="Örn: 10-A" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="studentNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Öğrenci Numarası</FormLabel>
                    <FormControl>
                      <Input placeholder="Öğrenci numarası" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="birthDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Doğum Tarihi</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cinsiyet</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Cinsiyet seçin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Erkek">Erkek</SelectItem>
                        <SelectItem value="Kadın">Kadın</SelectItem>
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
                name="parentName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Veli Adı</FormLabel>
                    <FormControl>
                      <Input placeholder="Veli adı soyadı" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="parentPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Veli Telefon</FormLabel>
                    <FormControl>
                      <Input placeholder="Örn: 05XX XXX XX XX" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notlar</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Öğrenci hakkında ekstra bilgiler..."
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Öğrenci hakkında eklemek istediğiniz notlar
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end gap-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate("/ogrenciler")}
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
      </div>
    </div>
  );
};

export default StudentForm;
