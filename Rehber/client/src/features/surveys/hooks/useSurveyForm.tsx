import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";

// Form validation schema
export const surveyFormSchema = z.object({
  title: z.string().min(3, { message: "Anket başlığı en az 3 karakter olmalıdır." }),
  description: z.string().optional(),
  type: z.string().min(1, { message: "Anket türü seçmelisiniz." }),
  targetAudience: z.string().min(1, { message: "Hedef kitle seçmelisiniz." }),
  questions: z.string().min(10, { message: "En az bir soru eklemelisiniz." }),
  isActive: z.boolean().default(true),
  anonymous: z.boolean().default(false),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  createdBy: z.number().default(1), // demo için
});

export type SurveyFormValues = z.infer<typeof surveyFormSchema>;

// Anket soru tipi
export type QuestionType = "text" | "radio" | "checkbox" | "select" | "textarea";

// Anket sorusu arayüzü
export interface SurveyQuestion {
  id: string; // uuid benzeri
  type: QuestionType;
  text: string;
  required: boolean;
  options?: string[]; // çoktan seçmeli sorular için
}

export const useSurveyForm = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("genel");
  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
  const [previewMode, setPreviewMode] = useState(false);

  // Form
  const form = useForm<SurveyFormValues>({
    resolver: zodResolver(surveyFormSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "ÖğrenciAnketi",
      targetAudience: "Öğrenci",
      questions: "[]",
      isActive: true,
      anonymous: false,
      startDate: new Date().toISOString().split("T")[0],
      createdBy: 1, // Varsayılan olarak admin kullanıcısı
    },
  });

  // Anket oluşturma
  const createSurveyMutation = useMutation({
    mutationFn: async (data: SurveyFormValues) => {
      // Soruları JSON stringine çevir
      data.questions = JSON.stringify(questions);
      console.log("İstek gönderiliyor:", data);
      const response = await apiRequest("/api/surveys", "POST", data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Anket oluşturuldu",
        description: "Anket başarıyla oluşturuldu.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/surveys'] });
      navigate("/anketler");
    },
    onError: (error) => {
      console.error("Anket oluşturma hatası:", error);
      toast({
        variant: "destructive",
        title: "Hata",
        description: `Anket oluşturulurken bir hata oluştu: ${error}`,
      });
    },
  });

  // Form gönderimi
  const onSubmit = (data: SurveyFormValues) => {
    if (questions.length === 0) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "En az bir soru eklemelisiniz.",
      });
      setActiveTab("sorular");
      return;
    }
    
    createSurveyMutation.mutate(data);
  };

  // Yeni soru ekleme
  const addQuestion = (type: QuestionType) => {
    const newQuestion: SurveyQuestion = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      text: "Yeni Soru",
      required: true,
      options: type === "radio" || type === "checkbox" || type === "select" ? ["Seçenek 1", "Seçenek 2"] : undefined,
    };
    setQuestions([...questions, newQuestion]);
  };

  // Soru silme
  const deleteQuestion = (questionId: string) => {
    setQuestions(questions.filter(q => q.id !== questionId));
  };

  // Soru güncelleme
  const updateQuestion = (questionId: string, updates: Partial<SurveyQuestion>) => {
    setQuestions(questions.map(q => q.id === questionId ? { ...q, ...updates } : q));
  };

  // Soru için seçenek ekleme
  const addOptionToQuestion = (questionId: string) => {
    setQuestions(
      questions.map(q => {
        if (q.id === questionId && q.options) {
          return {
            ...q,
            options: [...q.options, `Seçenek ${q.options.length + 1}`],
          };
        }
        return q;
      })
    );
  };

  // Soru seçeneğini güncelleme
  const updateQuestionOption = (questionId: string, optionIndex: number, value: string) => {
    setQuestions(
      questions.map(q => {
        if (q.id === questionId && q.options) {
          const newOptions = [...q.options];
          newOptions[optionIndex] = value;
          return { ...q, options: newOptions };
        }
        return q;
      })
    );
  };

  // Soru seçeneğini silme
  const deleteQuestionOption = (questionId: string, optionIndex: number) => {
    setQuestions(
      questions.map(q => {
        if (q.id === questionId && q.options && q.options.length > 1) {
          return {
            ...q,
            options: q.options.filter((_, idx) => idx !== optionIndex),
          };
        }
        return q;
      })
    );
  };

  return {
    form,
    questions,
    activeTab,
    setActiveTab,
    previewMode,
    setPreviewMode,
    onSubmit,
    addQuestion,
    deleteQuestion,
    updateQuestion,
    addOptionToQuestion,
    updateQuestionOption,
    deleteQuestionOption,
    isPending: createSurveyMutation.isPending
  };
};