import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QuestionChartData } from "@/features/surveys/types";

interface ChartsTabProps {
  chartData: QuestionChartData[];
  selectedQuestionIndex: number;
  setSelectedQuestionIndex: (index: number) => void;
}

export const ChartsTab = ({ 
  chartData, 
  selectedQuestionIndex, 
  setSelectedQuestionIndex 
}: ChartsTabProps) => {
  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Grafikler</CardTitle>
          <CardDescription>
            Çoktan seçmeli sorular için grafikler.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-10">
            <p className="text-gray-500">Grafik oluşturacak soru bulunamadı.</p>
            <p className="text-gray-400 text-sm mt-1">
              Çoktan seçmeli sorular (radio, checkbox, select) için grafikler oluşturulur.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Grafikler</CardTitle>
        <CardDescription>
          Çoktan seçmeli sorular için grafikler.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-8">
          <Select
            value={selectedQuestionIndex.toString()}
            onValueChange={(value) => setSelectedQuestionIndex(parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Soru seçin" />
            </SelectTrigger>
            <SelectContent>
              {chartData.map((item, index) => (
                <SelectItem key={item.question.id} value={index.toString()}>
                  {index + 1}. {item.question.text}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col items-center justify-center">
          <h3 className="text-center mb-4 text-lg font-medium">
            {chartData[selectedQuestionIndex]?.question.text}
          </h3>
          
          {/* Buraya normalde Recharts veya başka bir grafik kütüphanesi ile grafik gelecek */}
          {/* Basit bir temsili grafik gösterimi */}
          <div className="w-full max-w-lg space-y-4">
            {chartData[selectedQuestionIndex]?.chartData.labels.map((label, idx) => {
              const value = chartData[selectedQuestionIndex]?.chartData.datasets[0].data[idx] || 0;
              const total = chartData[selectedQuestionIndex]?.chartData.datasets[0].data.reduce((sum, val) => sum + val, 0) || 1;
              const percentage = Math.round((value / total) * 100);
              const bgColor = chartData[selectedQuestionIndex]?.chartData.datasets[0].backgroundColor[idx];
              
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">{label}</span>
                    <span className="text-sm font-medium">{percentage}% ({value} yanıt)</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-4">
                    <div 
                      className="h-4 rounded-full" 
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: bgColor
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};