import { useState } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import {
  Survey,
  Student,
  SurveyResponse,
  Question,
  Answer,
  SurveyAnalysis,
  QuestionStat,
  QuestionChartData
} from "../types";

export const useSurveyResponses = (id: number) => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("ozet");
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);

  // Anket bilgilerini çek
  const { data: survey, isLoading: surveyLoading } = useQuery<Survey>({
    queryKey: [`/api/surveys/${id}`],
    staleTime: 10 * 1000,
  });

  // Öğrencileri çek
  const { data: students } = useQuery<Student[]>({
    queryKey: ['/api/students'],
    staleTime: 10 * 1000,
  });

  // Anket yanıtlarını çek
  const { data: responses, isLoading: responsesLoading } = useQuery<SurveyResponse[]>({
    queryKey: [`/api/survey-responses?surveyId=${id}`],
    staleTime: 10 * 1000,
  });

  // Anket Soruları
  const questions: Question[] = survey ? JSON.parse(survey.questions || '[]') : [];
  
  // Anket yanıtları için öğrenci isimleri
  const getStudentName = (studentId: number) => {
    if (!students) return "Bilinmeyen Öğrenci";
    const student = students.find(s => s.id === studentId);
    return student ? `${student.firstName} ${student.lastName}` : "Bilinmeyen Öğrenci";
  };

  // Anket yanıtlarını analiz et
  const analyzeResponses = (): SurveyAnalysis => {
    if (!responses || responses.length === 0 || !questions || questions.length === 0) {
      return {
        totalResponses: 0,
        questionStats: [],
        chartData: []
      };
    }

    const totalResponses = responses.length;
    
    const questionStats: QuestionStat[] = questions.map(question => {
      let answerCounts: Record<string, number> = {};
      let textAnswers: string[] = [];
      
      responses.forEach(response => {
        try {
          const parsedAnswers: Answer[] = JSON.parse(response.answers);
          const answer = parsedAnswers.find(a => a.questionId === question.id);
          
          if (answer) {
            if (question.type === 'text' || question.type === 'textarea') {
              textAnswers.push(answer.value as string);
            } else if (question.type === 'radio' || question.type === 'select') {
              const answerValue = answer.value as string;
              answerCounts[answerValue] = (answerCounts[answerValue] || 0) + 1;
            } else if (question.type === 'checkbox') {
              (answer.value as string[]).forEach(option => {
                answerCounts[option] = (answerCounts[option] || 0) + 1;
              });
            }
          }
        } catch (error) {
          console.error("Yanıt analiz edilirken hata:", error);
        }
      });
      
      return {
        question,
        answerCounts,
        textAnswers
      };
    });
    
    // Çoktan seçmeli sorular için grafik verisi
    const chartData: QuestionChartData[] = questions
      .filter(q => q.type === 'radio' || q.type === 'select' || q.type === 'checkbox')
      .map((question, index) => {
        const stats = questionStats[questions.findIndex(q => q.id === question.id)];
        const optionLabels = question.options || [];
        
        const dataValues = optionLabels.map(option => stats.answerCounts[option] || 0);
        
        // Rastgele renkler oluştur
        const colors = [
          'rgba(75, 192, 192, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ];
        
        return {
          question,
          chartData: {
            labels: optionLabels,
            datasets: [{
              label: 'Yanıtlar',
              data: dataValues,
              backgroundColor: colors.slice(0, optionLabels.length),
            }]
          }
        };
      });
    
    return {
      totalResponses,
      questionStats,
      chartData
    };
  };
  
  // Excel olarak indir
  const exportToExcel = () => {
    // Bu çok temel bir CSV dışa aktarımı
    if (!responses || responses.length === 0) {
      toast({
        title: "Dışa aktarılamadı",
        description: "Henüz yanıt bulunmuyor.",
        variant: "destructive"
      });
      return;
    }
    
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Başlık satırını oluştur
    let headers = ["Öğrenci"];
    questions.forEach(q => {
      headers.push(q.text);
    });
    headers.push("Tarih");
    
    csvContent += headers.join(",") + "\r\n";
    
    // Yanıtları işle
    responses.forEach(response => {
      try {
        const row = [];
        row.push(getStudentName(response.studentId));
        
        const parsedAnswers: Answer[] = JSON.parse(response.answers);
        
        questions.forEach(question => {
          const answer = parsedAnswers.find(a => a.questionId === question.id);
          if (answer) {
            if (Array.isArray(answer.value)) {
              row.push(`"${answer.value.join(', ')}"`);
            } else {
              row.push(`"${answer.value}"`);
            }
          } else {
            row.push('');
          }
        });
        
        row.push(new Date(response.submittedAt).toLocaleDateString());
        
        csvContent += row.join(",") + "\r\n";
      } catch (error) {
        console.error("Yanıt işlenirken hata:", error);
      }
    });
    
    // CSV'yi indir
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${survey?.title}_yanıtlar.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Dışa aktarıldı",
      description: "Yanıtlar CSV dosyası olarak indirildi.",
    });
  };

  const analysis = analyzeResponses();

  return {
    survey,
    students,
    responses,
    questions,
    analysis,
    activeTab,
    setActiveTab,
    selectedQuestionIndex,
    setSelectedQuestionIndex,
    getStudentName,
    exportToExcel,
    navigate,
    surveyLoading,
    responsesLoading
  };
};