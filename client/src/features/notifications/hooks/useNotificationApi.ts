import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

/**
 * Yeni bildirim göndermek için mutation hook'u
 */
export const useSendNotification = () => {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ title, message, type }: { title: string, message: string, type?: string }) => {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, message, type }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Bildirim gönderilirken bir hata oluştu');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Başarılı",
        description: "Bildirim başarıyla gönderildi",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};