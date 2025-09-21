import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, Download, BarChart3, PieChart, Table } from "lucide-react";

import { useSurveyResponses } from "@/features/surveys/hooks/useSurveyResponses";
import { LoadingState } from "./components/LoadingState";
import { ErrorState } from "./components/ErrorState";
import { SummaryTab } from "./tabs/SummaryTab";
import { ResponsesTab } from "./tabs/ResponsesTab";
import { ChartsTab } from "./tabs/ChartsTab";

import { useParams } from "wouter";

interface SurveyResponsesParams {
  id: string;
}

interface SurveyResponsesProps {
  id?: number;
}

function SurveyResponses({ id: propId }: SurveyResponsesProps = {}) {
  // URL'den anket ID'sini çıkar (eğer direkt özellik olarak verilmemişse)
  const params = useParams<SurveyResponsesParams>();
  const id = propId !== undefined ? propId : (params?.id ? parseInt(params.id) : 0);
  const {
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
  } = useSurveyResponses(id);

  if (surveyLoading) {
    return <LoadingState />;
  }

  if (!survey) {
    return <ErrorState onNavigateBack={() => navigate("/anketler")} />;
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            onClick={() => navigate(`/anketler/${id}`)}
            className="rounded-full h-9 w-9 p-0"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{survey.title} - Yanıtlar</h1>
            <p className="text-gray-500 mt-1">
              Anket yanıtlarını görüntüleyin ve analiz edin.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={exportToExcel}
            className="gap-2"
            disabled={!responses || responses.length === 0}
          >
            <Download className="h-4 w-4" />
            CSV İndir
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="ozet" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Özet</span>
          </TabsTrigger>
          <TabsTrigger value="yanitlar" className="gap-2">
            <Table className="h-4 w-4" />
            <span className="hidden sm:inline">Tüm Yanıtlar</span>
          </TabsTrigger>
          {analysis.chartData.length > 0 && (
            <TabsTrigger value="grafikler" className="gap-2">
              <PieChart className="h-4 w-4" />
              <span className="hidden sm:inline">Grafikler</span>
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="ozet">
          <SummaryTab 
            analysis={analysis} 
            questions={questions} 
            responses={responses} 
            responsesLoading={responsesLoading} 
          />
        </TabsContent>

        <TabsContent value="yanitlar">
          <ResponsesTab 
            responses={responses} 
            questions={questions} 
            getStudentName={getStudentName} 
          />
        </TabsContent>

        {analysis.chartData.length > 0 && (
          <TabsContent value="grafikler">
            <ChartsTab 
              chartData={analysis.chartData} 
              selectedQuestionIndex={selectedQuestionIndex} 
              setSelectedQuestionIndex={setSelectedQuestionIndex} 
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export { SurveyResponses };