import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ChevronLeft, Upload, FileSpreadsheet, ClipboardList, Check, X, Clock, FileText, Download, RefreshCw } from "lucide-react";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import { Survey } from "@/features/surveys/types";
import { LoadingState } from "@/pages/surveys/responses/components/LoadingState";
import { ErrorState } from "@/pages/surveys/responses/components/ErrorState";

interface SurveyImportRecord {
  id: number;
  surveyId: number;
  fileName: string;
  recordCount: number;
  status: string;
  errorMessage: string | null;
  processedBy: number;
  importedAt: string;
}

interface SurveyImportProps {
  id: number;
}

const SurveyImport = ({ id }: SurveyImportProps) => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importProgress, setImportProgress] = useState(0);
  const [isImporting, setIsImporting] = useState(false);

  // Anket bilgilerini çek
  const { data: survey, isLoading: surveyLoading } = useQuery<Survey>({
    queryKey: [`/api/surveys/${id}`],
    staleTime: 10 * 1000,
  });

  // Import geçmişini çek
  const { data: imports, isLoading: importsLoading, refetch: refetchImports } = useQuery<SurveyImportRecord[]>({
    queryKey: [`/api/survey-imports?surveyId=${id}`],
    staleTime: 10 * 1000,
  });

  // Dosya yükleme ve import işlemi
  const importMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      setIsImporting(true);
      setImportProgress(10);
      
      // Simüle edilmiş ilerleme
      const progressInterval = setInterval(() => {
        setImportProgress(prev => {
          const newProgress = prev + Math.random() * 5;
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 300);
      
      try {
        // apiRequest fonksiyonu 3 parametre alıyor: url, method, data
        const response = await apiRequest(`/api/survey-imports`, "POST", formData);
        clearInterval(progressInterval);
        setImportProgress(100);
        return response;
      } catch (error) {
        clearInterval(progressInterval);
        throw error;
      } finally {
        setTimeout(() => {
          setIsImporting(false);
          setImportProgress(0);
        }, 1000);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/survey-imports?surveyId=${id}`] });
      toast({
        title: "Import işlemi başarılı",
        description: "Excel dosyası başarıyla içe aktarıldı.",
      });
      setSelectedFile(null);
      refetchImports();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Import hatası",
        description: `Excel dosyası aktarılırken bir hata oluştu: ${error}`,
      });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' && 
          file.type !== 'application/vnd.ms-excel') {
        toast({
          variant: "destructive",
          title: "Geçersiz dosya formatı",
          description: "Lütfen sadece Excel dosyası (.xlsx veya .xls) yükleyin.",
        });
        e.target.value = '';
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const handleImport = () => {
    if (!selectedFile) {
      toast({
        variant: "destructive",
        title: "Dosya seçilmedi",
        description: "Lütfen önce bir Excel dosyası seçin.",
      });
      return;
    }
    
    const formData = new FormData();
    formData.append('excel', selectedFile);
    formData.append('surveyId', id.toString());
    formData.append('processedBy', '1'); // Demo için sabit değer
    
    importMutation.mutate(formData);
  };

  // Template İndir
  const downloadTemplate = () => {
    if (!survey) return;
    
    // Bu, basit bir CSV şablonu oluşturur
    // Gerçek bir uygulamada, Excel formatında daha karmaşık bir şablon oluşturulabilir
    const questions = JSON.parse(survey.questions || '[]');
    
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Başlık satırı
    let headers = ["Öğrenci Adı", "Öğrenci Soyadı", "Sınıf"];
    questions.forEach((q: any) => {
      headers.push(q.text);
    });
    
    csvContent += headers.join(",") + "\r\n";
    
    // Örnek satır
    let exampleRow = ["İsim", "Soyisim", "10-A"];
    questions.forEach((q: any) => {
      if (q.type === 'radio' || q.type === 'select') {
        exampleRow.push(q.options ? q.options[0] : "");
      } else if (q.type === 'checkbox') {
        exampleRow.push(q.options ? q.options.join(';') : "");
      } else {
        exampleRow.push("Örnek yanıt");
      }
    });
    
    csvContent += exampleRow.join(",") + "\r\n";
    
    // CSV'yi indir
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${survey.title}_şablon.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Şablon indirildi",
      description: "Excel import şablonu indirildi.",
    });
  };

  // Status Badge'i
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'Tamamlandı':
        return (
          <Badge className="bg-green-100 text-green-800" variant="outline">
            <Check className="mr-1 h-3 w-3" /> Tamamlandı
          </Badge>
        );
      case 'Hata':
        return (
          <Badge className="bg-red-100 text-red-800" variant="outline">
            <X className="mr-1 h-3 w-3" /> Hata
          </Badge>
        );
      case 'İşleniyor':
        return (
          <Badge className="bg-amber-100 text-amber-800" variant="outline">
            <Clock className="mr-1 h-3 w-3 animate-spin" /> İşleniyor
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800" variant="outline">
            {status}
          </Badge>
        );
    }
  };
  
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
            <h1 className="text-3xl font-bold tracking-tight">{survey.title} - Excel İçe Aktarım</h1>
            <p className="text-gray-500 mt-1">
              Excel dosyalarından anket yanıtlarını içe aktarın.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Excel ile Anket Yanıtları İçe Aktar</CardTitle>
              <CardDescription>
                Kağıt form olarak doldurulmuş anketleri Excel dosyasından toplu olarak aktarın.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert className="mb-6">
                <FileSpreadsheet className="h-4 w-4" />
                <AlertTitle>Excel Formatı Hakkında</AlertTitle>
                <AlertDescription>
                  Excel dosyanızın doğru formatta olduğundan emin olun. Her sütun bir soruyu, her satır bir öğrenci yanıtını temsil etmelidir.
                  İlk satır başlık satırıdır ve soru metinlerini içermelidir.
                </AlertDescription>
              </Alert>

              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="space-y-6">
                <div
                  className={`border-2 border-dashed rounded-lg p-10 text-center ${
                    selectedFile ? 'border-green-300 bg-green-50' : 'border-gray-300 hover:border-primary/50'
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {selectedFile ? (
                    <div className="flex flex-col items-center">
                      <FileSpreadsheet className="h-10 w-10 text-green-500 mb-2" />
                      <p className="font-medium text-green-700">{selectedFile.name}</p>
                      <p className="text-sm text-gray-500">
                        {(selectedFile.size / 1024).toFixed(1)} KB - Yüklemek için hazır
                      </p>
                      <Button 
                        variant="outline" 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(null);
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        className="mt-2 text-xs h-7"
                      >
                        Dosyayı Kaldır
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center cursor-pointer">
                      <Upload className="h-10 w-10 text-gray-400 mb-2" />
                      <p className="font-medium">Excel dosyasını buraya sürükleyin</p>
                      <p className="text-sm text-gray-500">veya dosya seçmek için tıklayın</p>
                      <p className="text-xs text-gray-400 mt-2">Desteklenen formatlar: .xlsx, .xls</p>
                    </div>
                  )}
                </div>

                {isImporting && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">İçe aktarılıyor...</span>
                      <span className="text-xs text-gray-500">{Math.round(importProgress)}%</span>
                    </div>
                    <Progress value={importProgress} className="h-2" />
                  </div>
                )}

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={downloadTemplate}
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Şablon İndir
                  </Button>

                  <Button
                    onClick={handleImport}
                    disabled={!selectedFile || importMutation.isPending || isImporting}
                    className="gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    {importMutation.isPending || isImporting
                      ? "İçe Aktarılıyor..."
                      : "Excel'den İçe Aktar"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>İçe Aktarım Geçmişi</CardTitle>
                  <CardDescription>
                    Önceki Excel içe aktarım işlemlerinin listesi.
                  </CardDescription>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => refetchImports()}
                  className="h-8 w-8"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {importsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : !imports || imports.length === 0 ? (
                <div className="text-center py-10 border border-dashed rounded-lg">
                  <FileText className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Henüz içe aktarım kaydı bulunmuyor</p>
                  <p className="text-gray-400 text-sm mt-1">
                    Excel dosyası yükleyerek içe aktarım yapabilirsiniz
                  </p>
                </div>
              ) : (
                <Table>
                  <TableCaption>Son {imports.length} içe aktarım işlemi</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Dosya Adı</TableHead>
                      <TableHead>Tarih</TableHead>
                      <TableHead>Kayıt Sayısı</TableHead>
                      <TableHead>Durum</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {imports.map((importRecord) => (
                      <TableRow key={importRecord.id}>
                        <TableCell className="font-medium truncate max-w-[150px]">
                          {importRecord.fileName}
                        </TableCell>
                        <TableCell>
                          {new Date(importRecord.importedAt).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {importRecord.recordCount}
                        </TableCell>
                        <TableCell>
                          {renderStatusBadge(importRecord.status)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Excel İçe Aktarım Hakkında</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium text-sm">Nasıl Çalışır?</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Excel ile toplu anket yanıtı içe aktarımı şu adımlarla çalışır:
                </p>
                <ol className="text-sm text-gray-500 mt-2 space-y-1 list-decimal list-inside">
                  <li>Excel şablonunu indirin (opsiyonel)</li>
                  <li>Öğrenci yanıtlarını Excel dosyasına girin</li>
                  <li>Dosyayı sisteme yükleyin</li>
                  <li>Sistem otomatik olarak yanıtları işler</li>
                </ol>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium text-sm">Excel Format Kuralları</h3>
                <ul className="text-sm text-gray-500 mt-1 space-y-1">
                  <li className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                    <span>İlk satır başlık olmalıdır (soru metinleri)</span>
                  </li>
                  <li className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                    <span>Her sütun bir soruyu temsil etmelidir</span>
                  </li>
                  <li className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                    <span>Her satır bir öğrenci yanıtı olmalıdır</span>
                  </li>
                  <li className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                    <span>Çoklu seçimler noktalı virgül ile ayrılmalıdır</span>
                  </li>
                </ul>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium text-sm">Öğrenci Eşleştirmesi</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Sistem, Excel dosyasındaki öğrenci bilgileriyle sistemdeki öğrencileri eşleştirir. 
                  Her öğrencinin adı, soyadı ve sınıf bilgisi ile doğru şekilde eşleştirildiğinden emin olun.
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <div className="flex items-center">
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarFallback className="bg-amber-100 text-amber-800 text-xs">
                    ?
                  </AvatarFallback>
                </Avatar>
                <div className="text-sm">
                  <p>Yardıma mı ihtiyacınız var?</p>
                  <p className="text-muted-foreground text-xs">Rehberlik servisine başvurabilirsiniz.</p>
                </div>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SurveyImport;