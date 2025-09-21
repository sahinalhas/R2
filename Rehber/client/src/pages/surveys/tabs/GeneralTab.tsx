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
import { Button } from "@/components/ui/button";
import { Users, BarChart3, FileSpreadsheet } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { SurveyAssignment } from "@/features/surveys/hooks/useSurveyAssignments";

interface GeneralTabProps {
  survey: Survey;
  onTabChange?: (tab: string) => void;
}

export const GeneralTab = ({ survey, onTabChange }: GeneralTabProps) => {
  const [, navigate] = useLocation();
  const parsedQuestions = JSON.parse(survey.questions || '[]');
  
  // Ankete atanan öğrencileri çekelim
  const { data: assignments } = useQuery<SurveyAssignment[]>({
    queryKey: [`/api/survey-assignments?surveyId=${survey.id}`],
    staleTime: 10 * 1000,
  });
  
  // Tamamlanan atamaları ve oranları hesaplayalım
  const completedAssignments = assignments?.filter(a => a.status === "Tamamlandı") || [];
  const completionRate = assignments && assignments.length > 0
    ? Math.round((completedAssignments.length / assignments.length) * 100)
    : 0;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Anket Bilgileri</CardTitle>
        <CardDescription>
          Anket ile ilgili detaylı bilgiler.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge className="bg-blue-100 text-blue-800" variant="outline">
            {survey.targetAudience}
          </Badge>
          <Badge className="bg-amber-100 text-amber-800" variant="outline">
            {survey.type}
          </Badge>
          {survey.anonymous && (
            <Badge className="bg-green-100 text-green-800" variant="outline">
              İsimsiz Anket
            </Badge>
          )}
          {survey.isActive ? (
            <Badge className="bg-emerald-100 text-emerald-800" variant="outline">
              Aktif
            </Badge>
          ) : (
            <Badge className="bg-red-100 text-red-800" variant="outline">
              Pasif
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Oluşturulma Tarihi</h3>
            <p className="mt-1">{new Date(survey.createdAt).toLocaleDateString()}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Son Güncelleme</h3>
            <p className="mt-1">{new Date(survey.updatedAt).toLocaleDateString()}</p>
          </div>
          {survey.startDate && (
            <div>
              <h3 className="text-sm font-medium text-gray-500">Başlangıç Tarihi</h3>
              <p className="mt-1">{new Date(survey.startDate).toLocaleDateString()}</p>
            </div>
          )}
          {survey.endDate && (
            <div>
              <h3 className="text-sm font-medium text-gray-500">Bitiş Tarihi</h3>
              <p className="mt-1">{new Date(survey.endDate).toLocaleDateString()}</p>
            </div>
          )}
        </div>

        <Separator />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-blue-50 border-blue-100">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <span className="text-blue-700">Toplam Soru</span>
                <Badge className="bg-blue-100 text-blue-700">
                  {parsedQuestions.length}
                </Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-amber-50 border-amber-100">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <span className="text-amber-700">Toplam Atama</span>
                <Badge className="bg-amber-100 text-amber-700">
                  {assignments?.length || 0}
                </Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-emerald-50 border-emerald-100">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <span className="text-emerald-700">Tamamlanma Oranı</span>
                <Badge className="bg-emerald-100 text-emerald-700">
                  {completionRate}%
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex gap-3 mt-4">
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={() => onTabChange && onTabChange("atama")}
          >
            <Users className="h-4 w-4" />
            Öğrencilere Ata
          </Button>
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={() => navigate(`/anketler/${survey.id}/import`)}
          >
            <FileSpreadsheet className="h-4 w-4" />
            Excel İle İçe Aktar
          </Button>
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={() => navigate(`/anketler/${survey.id}/yanitlar`)}
          >
            <BarChart3 className="h-4 w-4" />
            Yanıtları Görüntüle
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};