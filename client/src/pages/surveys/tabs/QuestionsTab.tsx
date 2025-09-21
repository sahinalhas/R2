import React from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Survey } from "@/features/surveys/hooks/useSurveyDetail";

interface QuestionsTabProps {
  survey: Survey;
}

interface Question {
  id: string;
  question: string;
  type: string;
  required: boolean;
  options?: string[];
}

export const QuestionsTab = ({ survey }: QuestionsTabProps) => {
  const parsedQuestions: Question[] = JSON.parse(survey.questions || '[]');
  
  // Soru tipine göre özelleştirilmiş badge
  const getQuestionTypeBadge = (type: string) => {
    switch (type) {
      case "text":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Metin</Badge>;
      case "radio":
        return <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">Tekli Seçim</Badge>;
      case "checkbox":
        return <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">Çoklu Seçim</Badge>;
      case "select":
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Açılır Liste</Badge>;
      case "scale":
        return <Badge variant="outline" className="bg-pink-100 text-pink-800 border-pink-200">Ölçek</Badge>;
      default:
        return <Badge variant="outline">Bilinmeyen</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Anket Soruları</CardTitle>
        <CardDescription>
          Bu ankette yer alan tüm soruların detayları.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {parsedQuestions.length === 0 ? (
          <div className="text-center py-8">
            <div className="rounded-full bg-gray-100 w-12 h-12 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">Henüz Soru Bulunamadı</h3>
            <p className="text-gray-500 mt-1">
              Bu ankette henüz soru bulunmuyor. Düzenle butonunu kullanarak soru ekleyebilirsiniz.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {parsedQuestions.map((question, index) => (
              <div key={question.id || index} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-gray-100 text-gray-800">
                      {index + 1}
                    </Badge>
                    {getQuestionTypeBadge(question.type)}
                    {question.required && (
                      <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                        Zorunlu
                      </Badge>
                    )}
                  </div>
                </div>
                
                <h3 className="text-base font-medium mb-3">{question.question}</h3>
                
                {question.options && question.options.length > 0 && (
                  <div className="mt-2">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Cevap Seçenekleri:</h4>
                    <div className="flex flex-wrap gap-2">
                      {question.options.map((option, i) => (
                        <Badge key={i} variant="outline" className="bg-gray-50">
                          {option}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};