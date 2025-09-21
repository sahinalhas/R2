import { useState } from "react";
import { useLocation } from "wouter";
import { 
  ChevronLeft, 
  Save, 
  Eye 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form } from "@/components/ui/form";

import { useSurveyForm } from "@/features/surveys/hooks/useSurveyForm";
import { GeneralTab } from "./tabs/GeneralTab";
import { QuestionsTab } from "./tabs/QuestionsTab";
import { SurveyPreview } from "./components/SurveyPreview";
import { SurveyInfoSidebar } from "./components/SurveyInfoSidebar";

export const SurveyCreate = () => {
  const [, navigate] = useLocation();
  const {
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
    isPending
  } = useSurveyForm();

  const handleNextTab = () => {
    setActiveTab("sorular");
  };

  const handleBackTab = () => {
    setActiveTab("genel");
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/anketler")}
            className="rounded-full h-9 w-9 p-0"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Yeni Anket Oluştur</h1>
            <p className="text-gray-500 mt-1">
              Öğrenci, veli veya öğretmenler için anket oluşturun.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => setPreviewMode(!previewMode)}
            className="gap-2"
          >
            <Eye className="h-4 w-4" />
            {previewMode ? "Düzenleme" : "Önizleme"}
          </Button>
          <Button 
            onClick={form.handleSubmit(onSubmit)} 
            disabled={isPending} 
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {isPending ? "Kaydediliyor..." : "Kaydet"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          {previewMode ? (
            <SurveyPreview form={form} questions={questions} />
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid grid-cols-2 mb-6 w-full sm:w-80">
                    <TabsTrigger value="genel">Genel Bilgiler</TabsTrigger>
                    <TabsTrigger value="sorular">Sorular</TabsTrigger>
                  </TabsList>

                  <TabsContent value="genel">
                    <GeneralTab form={form} onNext={handleNextTab} />
                  </TabsContent>

                  <TabsContent value="sorular">
                    <QuestionsTab 
                      questions={questions}
                      addQuestion={addQuestion}
                      deleteQuestion={deleteQuestion}
                      updateQuestion={updateQuestion}
                      addOptionToQuestion={addOptionToQuestion}
                      updateQuestionOption={updateQuestionOption}
                      deleteQuestionOption={deleteQuestionOption}
                      onBack={handleBackTab}
                      onSubmit={form.handleSubmit(onSubmit)}
                      isPending={isPending}
                    />
                  </TabsContent>
                </Tabs>
              </form>
            </Form>
          )}
        </div>
        <div className="md:block">
          <SurveyInfoSidebar />
        </div>
      </div>
    </div>
  );
};