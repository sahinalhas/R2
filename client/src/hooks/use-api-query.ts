import { useQuery, useMutation, UseQueryResult, UseMutationResult, QueryKey } from "@tanstack/react-query";
import { queryClient, apiRequest, getQueryFn } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Type tanımlamaları
type ApiHookConfig = {
  staleTime?: number;
  gcTime?: number;
  refetchOnWindowFocus?: boolean;
  retry?: number | false;
};

export type InvalidateConfig = {
  exact?: boolean; // Tam eşleşme mi yapılacak
  additionalKeys?: QueryKey[]; // İlave geçersiz kılınacak queryKey'ler
};

const DEFAULT_STALE_TIME = 60 * 1000; // 60 saniye
const DEFAULT_GC_TIME = 5 * 60 * 1000; // 5 dakika

/**
 * Geliştirilmiş API veri çekme hook'u
 * Bu hook, uygulama genelinde API çağrılarını standardize eder
 * 
 * @param endpoint API endpoint'i
 * @param config Hook yapılandırması
 * @param enabled Sorgunun etkinleştirilip etkinleştirilmeyeceği
 * @param select İsteğe bağlı transformasyon fonksiyonu
 * @returns UseQueryResult
 */
export function useApiQuery<T>(
  endpoint: string | null,
  config: ApiHookConfig = {},
  enabled: boolean = true,
  select?: (data: any) => T
): UseQueryResult<T> {
  // Parametreler
  const {
    staleTime = DEFAULT_STALE_TIME,
    gcTime = DEFAULT_GC_TIME,
    refetchOnWindowFocus = true,
    retry = 1,
  } = config;

  return useQuery({
    queryKey: endpoint ? [endpoint] : [],
    staleTime,
    gcTime,
    refetchOnWindowFocus,
    queryFn: endpoint ? getQueryFn({ on401: "returnNull" }) : undefined,
    enabled: !!endpoint && enabled,
    select,
    retry
  });
}

/**
 * Geliştirilmiş API mutasyon hook'u
 * 
 * @param endpoint API endpoint'i veya endpoint oluşturacak fonksiyon
 * @param method HTTP metodu
 * @param invalidateQueries Geçersiz kılınacak sorguların listesi
 * @param invalidateConfig Geçersiz kılma yapılandırması
 * @param successMessage Başarı mesajı (opsiyonel)
 * @param errorMessage Hata mesajı (opsiyonel)
 * @returns UseMutationResult
 */
export function useApiMutation<T, V = unknown>(
  endpoint: string | ((data: V) => string),
  method: "POST" | "PUT" | "DELETE" = "POST",
  invalidateQueries: string[] = [],
  invalidateConfig: InvalidateConfig = {},
  successMessage?: string,
  errorMessage?: string
): UseMutationResult<T, Error, V> {
  const { toast } = useToast();
  const { exact = false, additionalKeys = [] } = invalidateConfig;

  return useMutation({
    mutationFn: async (data: V) => {
      try {
        // Endpoint bir string veya veri parametresi alan bir fonksiyon olabilir
        const finalEndpoint = typeof endpoint === 'function' 
          ? endpoint(data) 
          : endpoint;
          
        const response = await apiRequest(finalEndpoint, method, data);
        return await response.json();
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : 'İşlem sırasında bir hata oluştu');
      }
    },
    onSuccess: (data, variables) => {
      // İlgili sorguları geçersiz kıl
      invalidateQueries.forEach((query) => {
        queryClient.invalidateQueries({ 
          queryKey: [query], 
          exact 
        });
      });
      
      // Ek sorguları geçersiz kıl - simplify the logic for now
      if (Array.isArray(additionalKeys)) {
        // Array tipindeyse doğrudan kullan
        additionalKeys.forEach((key) => {
          queryClient.invalidateQueries({ 
            queryKey: key, 
            exact 
          });
        });
      }
      
      // Başarı mesajı göster
      if (successMessage) {
        toast({
          title: "Başarılı",
          description: successMessage,
          variant: "default"
        });
      }
      
      return data;
    },
    onError: (error: Error) => {
      // Hata mesajı göster
      toast({
        title: "Hata",
        description: errorMessage || error.message || 'İşlem sırasında bir hata oluştu',
        variant: "destructive"
      });
    }
  });
}

/**
 * Öğrencileri getir
 */
export function useStudents() {
  return useApiQuery<any[]>('/api/students');
}

/**
 * Tek bir öğrenciyi getir
 */
export function useStudent(id: number) {
  return useApiQuery<any>(`/api/students/${id}`, {
    staleTime: 5 * 60 * 1000, // 5 dakika
  }, !!id);
}

/**
 * Tüm randevuları getir
 */
export function useAppointments() {
  return useApiQuery<any[]>('/api/appointments');
}

/**
 * Öğrenciye ait randevuları getir
 */
export function useStudentAppointments(studentId: number) {
  return useApiQuery<any[]>(
    `/api/appointments?studentId=${studentId}`, 
    {}, 
    !!studentId
  );
}

/**
 * Bugünkü randevuları getir
 */
export function useTodayAppointments() {
  const today = new Date().toISOString().split('T')[0];
  return useApiQuery<any[]>(`/api/appointments?date=${today}`);
}

/**
 * Bekleyen randevuları getir (in-memory filtreleme yaparak)
 */
export function usePendingAppointments() {
  return useApiQuery<any[]>(
    '/api/appointments', 
    {},
    true,
    (data: any[]) => data.filter(a => a.status === "Bekliyor")
  );
}

/**
 * Yeni randevu oluştur
 */
export function useCreateAppointment() {
  return useApiMutation<any, any>(
    '/api/appointments', 
    'POST',
    ['/api/appointments']
  );
}

/**
 * Randevu güncelle
 */
export function useUpdateAppointment(id: number) {
  return useApiMutation<any, any>(
    `/api/appointments/${id}`,
    'PUT',
    ['/api/appointments', `/api/appointments/${id}`]
  );
}

/**
 * Randevu sil
 */
export function useDeleteAppointment(id: number) {
  return useApiMutation<any, any>(
    `/api/appointments/${id}`,
    'DELETE',
    ['/api/appointments']
  );
}

/**
 * Görüşmeleri getir
 */
export function useSessions() {
  return useApiQuery<any[]>('/api/sessions');
}

/**
 * Öğrencinin görüşmelerini getir
 */
export function useStudentSessions(studentId: number) {
  return useApiQuery<any[]>(
    `/api/sessions?studentId=${studentId}`,
    {},
    !!studentId
  );
}

/**
 * Raporları getir
 */
export function useReports() {
  return useApiQuery<any[]>('/api/reports');
}

/**
 * Öğrencinin raporlarını getir
 */
export function useStudentReports(studentId: number) {
  return useApiQuery<any[]>(
    `/api/reports?studentId=${studentId}`,
    {},
    !!studentId
  );
}

/**
 * Tüm aktiviteleri getir
 */
export function useActivities() {
  return useApiQuery<any[]>('/api/activities');
}

/**
 * Öğrenciyi sil
 */
export function useDeleteStudent() {
  return useApiMutation<any, number>(
    `/api/students`,
    'DELETE',
    ['/api/students']
  );
}