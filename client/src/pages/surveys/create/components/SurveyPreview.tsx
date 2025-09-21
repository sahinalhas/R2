import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { SurveyFormValues, SurveyQuestion } from "@/features/surveys/hooks/useSurveyForm";
import { UseFormReturn } from "react-hook-form";

interface SurveyPreviewProps {
  form: UseFormReturn<SurveyFormValues>;
  questions: SurveyQuestion[];
}

export const SurveyPreview = ({ form, questions }: SurveyPreviewProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">{form.watch('title') || 'Anket Başlığı'}</CardTitle>
        <CardDescription>
          {form.watch('description') || 'Anket açıklaması burada görünecek.'}
        </CardDescription>
        <div className="flex flex-wrap gap-2 mt-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            {form.watch('targetAudience')}
          </Badge>
          <Badge variant="outline" className="bg-amber-50 text-amber-700">
            {form.watch('type')}
          </Badge>
          {form.watch('anonymous') && (
            <Badge variant="outline" className="bg-green-50 text-green-700">
              İsimsiz
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {questions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Henüz soru eklenmemiş
            </div>
          ) : (
            questions.map((question, index) => (
              <div key={question.id} className="border p-4 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-medium text-gray-800">
                    {index + 1}. {question.text}
                    {question.required && <span className="text-red-500 ml-1">*</span>}
                  </div>
                </div>

                {question.type === "text" && (
                  <Input disabled placeholder="Yazılı yanıt" className="mt-2" />
                )}

                {question.type === "textarea" && (
                  <Textarea disabled placeholder="Uzun yanıt" className="mt-2" />
                )}

                {question.type === "radio" && question.options && (
                  <RadioGroup className="mt-3 space-y-2">
                    {question.options.map((option, i) => (
                      <div key={i} className="flex items-center space-x-2">
                        <RadioGroupItem value={`${i}`} id={`q${question.id}-option-${i}`} disabled />
                        <Label htmlFor={`q${question.id}-option-${i}`}>{option}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}

                {question.type === "checkbox" && question.options && (
                  <div className="mt-3 space-y-2">
                    {question.options.map((option, i) => (
                      <div key={i} className="flex items-center space-x-2">
                        <Checkbox id={`q${question.id}-option-${i}`} disabled />
                        <Label htmlFor={`q${question.id}-option-${i}`}>{option}</Label>
                      </div>
                    ))}
                  </div>
                )}

                {question.type === "select" && question.options && (
                  <Select disabled>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Seçiniz" />
                    </SelectTrigger>
                    <SelectContent>
                      {question.options.map((option, i) => (
                        <SelectItem key={i} value={`${i}`}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};