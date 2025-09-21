import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText } from "lucide-react";
import { SurveyAnalysis, Question, SurveyResponse } from "@/features/surveys/types";

interface SummaryTabProps {
  analysis: SurveyAnalysis;
  questions: Question[];
  responses?: SurveyResponse[];
  responsesLoading: boolean;
}

export const SummaryTab = ({ analysis, questions, responses, responsesLoading }: SummaryTabProps) => {
  return (
    <div className="grid grid-cols-1 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Genel Bakış</CardTitle>
          <CardDescription>
            Anket yanıtlarının genel durumu.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-primary-50 border-primary-100">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <span className="text-primary-700">Toplam Yanıt</span>
                  <Badge className="bg-primary-100 text-primary-700">
                    {responses?.length || 0}
                  </Badge>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-blue-50 border-blue-100">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <span className="text-blue-700">Toplam Soru</span>
                  <Badge className="bg-blue-100 text-blue-700">
                    {questions.length}
                  </Badge>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-amber-50 border-amber-100">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <span className="text-amber-700">Yanıt Oranı</span>
                  <span className="text-amber-700 font-medium">
                    {responses && responses.length > 0 ? "100%" : "0%"}
                  </span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-emerald-50 border-emerald-100">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <span className="text-emerald-700">Son Yanıt</span>
                  <span className="text-emerald-700 text-sm">
                    {responses && responses.length > 0 
                      ? new Date(
                          Math.max(...responses.map(r => new Date(r.submittedAt).getTime()))
                        ).toLocaleDateString()
                      : "—"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {responsesLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ))}
            </div>
          ) : !responses || responses.length === 0 ? (
            <div className="text-center py-10 border border-dashed rounded-lg">
              <FileText className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Henüz yanıt bulunmuyor</p>
              <p className="text-gray-400 text-sm mt-1">
                Bu ankete henüz yanıt verilmemiş
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {analysis.questionStats.slice(0, 5).map((stat, index) => (
                <div key={stat.question.id} className="space-y-3">
                  <h3 className="font-medium flex items-start gap-2">
                    <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-sm font-semibold flex-shrink-0">
                      {index + 1}
                    </span>
                    <span>{stat.question.text}</span>
                  </h3>

                  {stat.question.type === 'text' || stat.question.type === 'textarea' ? (
                    <div className="space-y-2 ml-8">
                      {stat.textAnswers.slice(0, 3).map((answer, i) => (
                        <div key={i} className="p-3 bg-gray-50 rounded-md text-sm">
                          {answer}
                        </div>
                      ))}
                      {stat.textAnswers.length > 3 && (
                        <p className="text-xs text-gray-500">
                          +{stat.textAnswers.length - 3} daha fazla yanıt...
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="ml-8">
                      <div className="space-y-2">
                        {stat.question.options?.map((option, i) => (
                          <div key={i} className="flex flex-col">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm">{option}</span>
                              <span className="text-sm font-medium">
                                {stat.answerCounts[option] || 0} yanıt
                              </span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2.5">
                              <div 
                                className="bg-primary h-2.5 rounded-full" 
                                style={{ 
                                  width: `${responses.length > 0 
                                    ? ((stat.answerCounts[option] || 0) / responses.length) * 100 
                                    : 0}%` 
                                }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {analysis.questionStats.length > 5 && (
                <p className="text-center text-sm text-gray-500">
                  +{analysis.questionStats.length - 5} daha fazla soru için tüm yanıtları görüntüleyin.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};