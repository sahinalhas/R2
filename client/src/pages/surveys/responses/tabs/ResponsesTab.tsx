import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, User } from "lucide-react";
import { SurveyResponse, Question, Answer } from "@/features/surveys/types";

interface ResponsesTabProps {
  responses?: SurveyResponse[];
  questions: Question[];
  getStudentName: (studentId: number) => string;
}

export const ResponsesTab = ({ responses, questions, getStudentName }: ResponsesTabProps) => {
  if (!responses || responses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tüm Yanıtlar</CardTitle>
          <CardDescription>
            Anket için tüm yanıtları görüntüleyin.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-10 border border-dashed rounded-lg">
            <FileText className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Henüz yanıt bulunmuyor</p>
            <p className="text-gray-400 text-sm mt-1">
              Bu ankete henüz yanıt verilmemiş
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Tüm Yanıtlar</CardTitle>
          <CardDescription>
            Anket için tüm yanıtları görüntüleyin.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {responses.map((response) => {
              // Yanıtları ayrıştır
              const parsedAnswers: Answer[] = JSON.parse(response.answers);
              
              return (
                <div key={response.id} className="border rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar>
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        <User className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">
                        {getStudentName(response.studentId)}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {new Date(response.submittedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-4 ml-2">
                    {questions.map((question) => {
                      const answer = parsedAnswers.find(a => a.questionId === question.id);
                      
                      if (!answer) return null;
                      
                      return (
                        <div key={question.id} className="space-y-1">
                          <p className="text-sm font-medium">{question.text}</p>
                          
                          {question.type === 'text' || question.type === 'textarea' ? (
                            <p className="p-2 bg-gray-50 rounded text-sm">
                              {answer.value as string}
                            </p>
                          ) : question.type === 'checkbox' ? (
                            <div className="flex flex-wrap gap-2">
                              {(answer.value as string[]).map((option, i) => (
                                <span 
                                  key={i} 
                                  className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs"
                                >
                                  {option}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="p-2 bg-gray-50 rounded text-sm">
                              {answer.value as string}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};