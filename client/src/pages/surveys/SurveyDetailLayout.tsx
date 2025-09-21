import { useState } from "react";
import { useLocation } from "wouter";
import {
  ChevronLeft,
  Edit,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent } from "@/components/ui/card";

import { useSurveyDetail } from "@/features/surveys/hooks/useSurveyDetail";
import { GeneralTab } from "./tabs/GeneralTab";
import { AssignmentTab } from "./tabs/AssignmentTab";
import { QuestionsTab } from "./tabs/QuestionsTab";

interface SurveyDetailLayoutProps {
  id: number;
}

export const SurveyDetailLayout = ({ id }: SurveyDetailLayoutProps) => {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("genel");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const {
    survey,
    isLoading,
    isError,
    toggleActive,
    deleteSurvey,
    isDeleting
  } = useSurveyDetail(id);

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center gap-3 mb-6">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div>
            <Skeleton className="h-8 w-80 mb-2" />
            <Skeleton className="h-4 w-60" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          <div>
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !survey) {
    return (
      <div className="container mx-auto py-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6 text-center">
            <p className="text-red-500">Anket bilgileri yüklenirken bir hata oluştu. Lütfen tekrar deneyin.</p>
            <Button onClick={() => navigate("/anketler")} variant="outline" className="mt-4 mx-auto">
              Anketlere Dön
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-6 px-5 sm:px-8 md:px-10 lg:px-12">
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
            <h1 className="text-3xl font-bold tracking-tight">{survey.title}</h1>
            <p className="text-gray-500 mt-1">
              {survey.description || "Anket detayları ve yönetimi"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setIsDeleteDialogOpen(true)}
            className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 gap-2"
          >
            <Trash2 className="h-4 w-4" />
            <span className="hidden sm:inline">Sil</span>
          </Button>
          <Button 
            onClick={() => navigate(`/anketler/${id}/edit`)}
            variant="outline"
            className="gap-2"
          >
            <Edit className="h-4 w-4" />
            <span className="hidden sm:inline">Düzenle</span>
          </Button>
          <div className="flex items-center gap-2 border rounded-md px-3 py-1">
            <Label htmlFor="active-switch" className="text-sm font-medium whitespace-nowrap">
              {survey.isActive ? "Aktif" : "Pasif"}
            </Label>
            <Switch
              id="active-switch"
              checked={survey.isActive}
              onCheckedChange={(checked) => toggleActive(checked)}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 mb-6 w-full sm:w-80">
              <TabsTrigger value="genel">Genel</TabsTrigger>
              <TabsTrigger value="atama">
                Atamalar
              </TabsTrigger>
              <TabsTrigger value="sorular">Sorular</TabsTrigger>
            </TabsList>

            <TabsContent value="genel">
              <GeneralTab survey={survey} onTabChange={setActiveTab} />
            </TabsContent>

            <TabsContent value="atama">
              <AssignmentTab surveyId={id} />
            </TabsContent>

            <TabsContent value="sorular">
              <QuestionsTab survey={survey} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Anketi silmek istediğinize emin misiniz?</AlertDialogTitle>
            <AlertDialogDescription>
              Bu işlem geri alınamaz ve tüm anket verileri silinecektir. Devam etmek istiyor musunuz?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteSurvey()}
              className="bg-red-500 hover:bg-red-600"
            >
              {isDeleting ? "Siliniyor..." : "Evet, Sil"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};