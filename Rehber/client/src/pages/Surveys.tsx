import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { PlusCircle, ClipboardCheck, Filter, Search, UserRound, RefreshCw, BarChart3 } from "lucide-react";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

type Survey = {
  id: number;
  title: string;
  description: string | null;
  type: string;
  targetAudience: string;
  questions: string;
  isActive: boolean;
  anonymous: boolean;
  startDate: string | null;
  endDate: string | null;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
};

const Surveys = () => {
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");

  const { data: surveys, isLoading, isError } = useQuery<Survey[]>({
    queryKey: ['/api/surveys'],
    staleTime: 10 * 1000,
  });

  // Filtreleme fonksiyonu
  const filteredSurveys = surveys?.filter(survey => {
    // Arama sorgusu filtrelemesi
    const matchesSearch = survey.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (survey.description?.toLowerCase().includes(searchQuery.toLowerCase()) || false);
    
    // Tür filtrelemesi
    const matchesType = selectedType === "all" || survey.type === selectedType;
    
    return matchesSearch && matchesType;
  });

  // Anket türlerini al
  const surveyTypes: string[] = [];
  if (surveys) {
    const typeSet = new Set<string>();
    surveys.forEach(survey => {
      if (survey.type) typeSet.add(survey.type);
    });
    typeSet.forEach(type => surveyTypes.push(type));
  }

  // Hedef kitle rengini belirle
  const getAudienceBadgeColor = (audience: string) => {
    switch (audience) {
      case "Öğrenci": return "bg-blue-100 text-blue-800";
      case "Veli": return "bg-amber-100 text-amber-800";
      case "Öğretmen": return "bg-emerald-100 text-emerald-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="container py-6 px-5 sm:px-8 md:px-10 lg:px-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Anketler</h1>
          <p className="text-gray-500 mt-1">
            Öğrenci, veli ve öğretmenler için anket oluşturun ve yönetin.
          </p>
        </div>
        <Button onClick={() => navigate("/anketler/olustur")} className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Yeni Anket
        </Button>
      </div>

      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Anket ara..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-full sm:w-48 gap-2">
              <Filter className="h-4 w-4" />
              <SelectValue placeholder="Anket Türü" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Anket Türleri</SelectItem>
              {surveyTypes.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1">
            <RefreshCw className="h-3.5 w-3.5" />
            Yenile
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-3 w-full mb-2" />
                <Skeleton className="h-3 w-2/3" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-9 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : isError ? (
        <Card className="col-span-full border-red-200 bg-red-50">
          <CardContent className="pt-6 text-center">
            <p className="text-red-500">Anketler yüklenirken bir hata oluştu. Lütfen tekrar deneyin.</p>
            <Button onClick={() => window.location.reload()} variant="outline" className="mt-4 mx-auto">
              Yenile
            </Button>
          </CardContent>
        </Card>
      ) : filteredSurveys && filteredSurveys.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSurveys.map((survey) => (
            <Card key={survey.id} className="hover:border-primary/50 hover:shadow-md transition-all">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Badge 
                    className={getAudienceBadgeColor(survey.targetAudience)}
                    variant="outline"
                  >
                    {survey.targetAudience}
                  </Badge>
                  {survey.isActive ? (
                    <Badge className="bg-green-100 text-green-800" variant="outline">Aktif</Badge>
                  ) : (
                    <Badge className="bg-gray-100 text-gray-800" variant="outline">Pasif</Badge>
                  )}
                </div>
                <CardTitle className="text-xl mt-2">{survey.title}</CardTitle>
                <CardDescription>
                  {survey.anonymous && (
                    <span className="flex items-center text-xs text-gray-500 mb-1">
                      <UserRound className="h-3 w-3 mr-1" /> 
                      İsimsiz anket
                    </span>
                  )}
                  Tür: {survey.type}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-gray-600">
                <p className="line-clamp-2">{survey.description || "Açıklama yok"}</p>
                
                <div className="mt-3 text-xs text-gray-500">
                  <p>Oluşturulma: {new Date(survey.createdAt).toLocaleDateString()}</p>
                  {survey.startDate && (
                    <p>Başlangıç: {new Date(survey.startDate).toLocaleDateString()}</p>
                  )}
                  {survey.endDate && (
                    <p>Bitiş: {new Date(survey.endDate).toLocaleDateString()}</p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-2 pt-2">
                <Separator />
                <div className="flex justify-between w-full">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-600 gap-1"
                    onClick={() => navigate(`/anketler/${survey.id}/yanitlar`)}
                  >
                    <BarChart3 className="h-4 w-4" />
                    Yanıtlar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary gap-1"
                    onClick={() => navigate(`/anketler/${survey.id}`)}
                  >
                    <ClipboardCheck className="h-4 w-4" />
                    Görüntüle
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="col-span-full border-amber-200 bg-amber-50">
          <CardContent className="pt-6 text-center">
            <ClipboardCheck className="mx-auto h-12 w-12 text-amber-300" />
            <p className="mt-3 text-amber-800">
              {searchQuery || selectedType !== "all" ? 
                "Arama kriterlerinize uygun anket bulunamadı." : 
                "Henüz oluşturulmuş bir anket bulunmuyor."}
            </p>
            {searchQuery || selectedType !== "all" ? (
              <Button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedType("all");
                }}
                variant="outline"
                className="mt-4 mx-auto"
              >
                Filtreleri Temizle
              </Button>
            ) : (
              <Button
                onClick={() => navigate("/anketler/olustur")}
                variant="outline"
                className="mt-4 mx-auto"
              >
                İlk Anketi Oluştur
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Surveys;