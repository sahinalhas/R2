import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  Plus, 
  Trash2, 
  X, 
  GripVertical 
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { QuestionType, SurveyQuestion } from "@/features/surveys/hooks/useSurveyForm";
import { UseFormReturn } from "react-hook-form";

interface QuestionsTabProps {
  questions: SurveyQuestion[];
  addQuestion: (type: QuestionType) => void;
  deleteQuestion: (id: string) => void;
  updateQuestion: (id: string, updates: Partial<SurveyQuestion>) => void;
  addOptionToQuestion: (id: string) => void;
  updateQuestionOption: (id: string, index: number, value: string) => void;
  deleteQuestionOption: (id: string, index: number) => void;
  onBack: () => void;
  onSubmit: () => void;
  isPending: boolean;
}

export const QuestionsTab = ({ 
  questions, 
  addQuestion, 
  deleteQuestion, 
  updateQuestion, 
  addOptionToQuestion, 
  updateQuestionOption, 
  deleteQuestionOption,
  onBack, 
  onSubmit, 
  isPending 
}: QuestionsTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Anket Soruları</CardTitle>
        <CardDescription>
          Anket için sorular ekleyin ve düzenleyin.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 flex flex-wrap gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Soru Ekle
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => addQuestion("text")}>
                Kısa Yanıt
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => addQuestion("textarea")}>
                Uzun Yanıt
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => addQuestion("radio")}>
                Tekli Seçim
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => addQuestion("checkbox")}>
                Çoklu Seçim
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => addQuestion("select")}>
                Açılır Liste
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-4">
          {questions.length === 0 ? (
            <div className="text-center py-8 rounded-lg border-2 border-dashed">
              <p className="text-gray-500">Henüz soru yok.</p>
              <p className="text-gray-400 text-sm">Yukarıdaki "Soru Ekle" butonunu kullanarak soru ekleyebilirsiniz.</p>
            </div>
          ) : (
            questions.map((question, index) => (
              <div 
                key={question.id} 
                className="border rounded-md p-4 bg-white"
              >
                <div className="flex justify-between items-center gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-5 w-5 text-gray-400" />
                    <div className="font-medium">{index + 1}. Soru</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteQuestion(question.id)}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="mb-4">
                  <Input
                    value={question.text}
                    onChange={(e) => updateQuestion(question.id, { text: e.target.value })}
                    placeholder="Soru metni"
                    className="font-medium"
                  />
                </div>

                {/* Soru tipi bilgisi */}
                <div className="mb-4 text-sm">
                  <span className="bg-gray-100 px-2 py-1 rounded text-gray-600">
                    {question.type === "text" && "Kısa Yanıt"}
                    {question.type === "textarea" && "Uzun Yanıt"}
                    {question.type === "radio" && "Tekli Seçim"}
                    {question.type === "checkbox" && "Çoklu Seçim"}
                    {question.type === "select" && "Açılır Liste"}
                  </span>
                </div>

                {/* Çoktan seçmeli sorular için seçenekler */}
                {(question.type === "radio" || question.type === "checkbox" || question.type === "select") && (
                  <div className="ml-4 mb-4">
                    <div className="font-medium mb-2">Seçenekler</div>
                    <div className="space-y-2">
                      {question.options?.map((option, optIndex) => (
                        <div key={optIndex} className="flex items-center gap-2">
                          <Input
                            value={option}
                            onChange={(e) => updateQuestionOption(question.id, optIndex, e.target.value)}
                            placeholder={`Seçenek ${optIndex + 1}`}
                            className="flex-1"
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteQuestionOption(question.id, optIndex)}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                            disabled={question.options?.length === 1}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addOptionToQuestion(question.id)}
                        className="mt-2"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Seçenek Ekle
                      </Button>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 mt-2">
                  <Switch
                    checked={question.required}
                    onCheckedChange={(checked) => updateQuestion(question.id, { required: checked })}
                    id={`required-${question.id}`}
                  />
                  <Label htmlFor={`required-${question.id}`} className="text-sm">
                    Zorunlu soru
                  </Label>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
        >
          Geri
        </Button>
        <Button 
          type="submit" 
          disabled={questions.length === 0 || isPending}
          onClick={onSubmit}
        >
          {isPending ? "Kaydediliyor..." : "Anketi Kaydet"}
        </Button>
      </CardFooter>
    </Card>
  );
};