import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export interface Survey {
  id: number;
  title: string;
  description: string | null;
  type: string;
  targetAudience: string;
  questions: string;
  isActive: boolean;
  anonymous: boolean;
  startDate: string | null;
  endDate: string | null;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

export const useSurveyDetail = (id: number) => {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Anket bilgilerini çek
  const { data: survey, isLoading, isError, refetch } = useQuery<Survey>({
    queryKey: [`/api/surveys/${id}`],
    staleTime: 10 * 1000,
  });

  // Anket aktifliğini değiştir
  const toggleActiveMutation = useMutation({
    mutationFn: (isActive: boolean) => {
      return apiRequest(`/api/surveys/${id}`, "PUT", { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/surveys/${id}`] });
      toast({
        title: "Anket durumu güncellendi",
        description: "Anket aktiflik durumu başarıyla güncellendi.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Hata",
        description: `Anket durumu güncellenirken bir hata oluştu: ${error}`,
      });
    },
  });

  // Anketi sil
  const deleteSurveyMutation = useMutation({
    mutationFn: () => {
      return apiRequest(`/api/surveys/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/surveys'] });
      toast({
        title: "Anket silindi",
        description: "Anket başarıyla silindi.",
      });
      navigate("/anketler");
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Hata",
        description: `Anket silinirken bir hata oluştu: ${error}`,
      });
    },
  });

  return {
    survey,
    isLoading,
    isError,
    refetch,
    toggleActive: toggleActiveMutation.mutate,
    deleteSurvey: deleteSurveyMutation.mutate,
    isDeleting: deleteSurveyMutation.isPending
  };
};