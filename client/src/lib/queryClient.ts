import { QueryClient, QueryFunction } from "@tanstack/react-query";

export async function apiRequest(
  url: string,
  method: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  // Hata işleme
  if (!res.ok) {
    // JSON olarak hata yanıtını almaya çalış
    try {
      const errorJson = await res.json();
      // Yeni hata formatı: { success: false, error: { code, type, message, details } }
      if (errorJson && 'success' in errorJson && errorJson.success === false && 'error' in errorJson) {
        throw new Error(errorJson.error.message || `${res.status}: İşlem başarısız oldu`);
      }
      // Eski format kullanılmış olabilir: { message } veya { error }
      if (errorJson.message) {
        throw new Error(errorJson.message);
      } else if (errorJson.error) {
        throw new Error(typeof errorJson.error === 'string' ? errorJson.error : JSON.stringify(errorJson.error));
      }
    } catch (e) {
      // JSON olarak işlenemiyorsa, orijinal hatayı kullan
      if (e instanceof Error && e.message !== 'Unexpected end of JSON input') {
        throw e;
      }
      throw new Error(`${res.status}: ${res.statusText || 'İşlem başarısız oldu'}`);
    }
  }

  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    // Hata işleme
    if (!res.ok) {
      // JSON olarak hata yanıtını almaya çalış
      try {
        const errorJson = await res.json();
        // Yeni hata formatı: { success: false, error: { code, type, message, details } }
        if (errorJson && 'success' in errorJson && errorJson.success === false && 'error' in errorJson) {
          throw new Error(errorJson.error.message || `${res.status}: İşlem başarısız oldu`);
        }
        // Eski format kullanılmış olabilir: { message } veya { error }
        if (errorJson.message) {
          throw new Error(errorJson.message);
        } else if (errorJson.error) {
          throw new Error(typeof errorJson.error === 'string' ? errorJson.error : JSON.stringify(errorJson.error));
        }
      } catch (e) {
        // JSON olarak işlenemiyorsa, orijinal hatayı kullan
        if (e instanceof Error && e.message !== 'Unexpected end of JSON input') {
          throw e;
        }
        throw new Error(`${res.status}: ${res.statusText || 'İşlem başarısız oldu'}`);
      }
    }
    
    const jsonResponse = await res.json();
    
    // API yanıtlarımız artık standardize edilmiş formatta
    // { success: boolean, message: string, data: T }
    if (jsonResponse && typeof jsonResponse === 'object' && 'data' in jsonResponse && jsonResponse.success === true) {
      return jsonResponse.data;
    }
    
    // Eğer data yoksa, tüm yanıtı döndür (geriye dönük uyumluluk için)
    return jsonResponse;
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: true,
      staleTime: 30 * 1000, // 30 saniye - sayfa arası geçişlerde sürekli veri yenilenmesini önlemek için
      gcTime: 5 * 60 * 1000, // 5 dakika - bellekte gereksiz veri tutmayı önlemek için (TanStack Query v5'te cacheTime yerine gcTime kullanılıyor)
      retry: 1, // Hata durumunda 1 kez tekrar dene
    },
    mutations: {
      retry: false,
    },
  },
});
