import { useToast } from "@/hooks/use-toast";
import { Download, Database, Trash2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const DataManagementSettings = () => {
  const { toast } = useToast();
  
  const handleExportData = () => {
    // Veri dışa aktarma işlemi bildirimle gösterme
    toast({
      title: "Veriler dışa aktarılıyor",
      description: "Seçtiğiniz veriler hazırlanıyor, indirme otomatik başlayacak.",
      variant: "default",
    });
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm border border-white/20 shadow-md rounded-xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-amber-500/5 to-transparent border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-amber-500/80" />
          <CardTitle>Veri Yönetimi</CardTitle>
        </div>
        <CardDescription>
          Verilerinizi yedekleyin, aktarın veya silin
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-white/90 backdrop-blur-sm border border-white/20 shadow-md rounded-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-amber-500/5 to-transparent border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Download className="w-5 h-5 text-amber-500/80" />
                <CardTitle className="text-lg">Veri Dışa Aktarma</CardTitle>
              </div>
              <CardDescription>
                Verilerinizi CSV veya JSON formatında dışa aktarın
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Verilerinizi dışa aktarmak için aşağıdaki seçenekleri kullanabilirsiniz. Dışa aktarılan veriler bilgisayarınıza indirilecektir.
                </p>
                <div className="grid grid-cols-1 gap-3">
                  <Button variant="outline" className="w-full justify-start" onClick={handleExportData}>
                    <Download className="h-4 w-4 mr-2" />
                    Tüm Öğrenci Verileri (CSV)
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={handleExportData}>
                    <Download className="h-4 w-4 mr-2" />
                    Randevu Kayıtları (CSV)
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={handleExportData}>
                    <Download className="h-4 w-4 mr-2" />
                    Görüşme Raporları (CSV)
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={handleExportData}>
                    <Download className="h-4 w-4 mr-2" />
                    Tüm Sistem Verileri (JSON)
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/90 backdrop-blur-sm border border-white/20 shadow-md rounded-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-red-500/5 to-transparent border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-red-500/80" />
                <CardTitle className="text-lg">Veri Temizleme</CardTitle>
              </div>
              <CardDescription>
                Belirli veri gruplarını sistemden temizleyin
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  <strong>Dikkat:</strong> Veri temizleme işlemi geri alınamaz. Bu işlemden önce verilerinizi yedeklemeniz önerilir.
                </p>
                <div className="grid grid-cols-1 gap-3">
                  <Button variant="outline" className="w-full justify-start border-red-200 text-red-600 hover:text-red-700 hover:bg-red-50">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eski Randevuları Temizle
                  </Button>
                  <Button variant="outline" className="w-full justify-start border-red-200 text-red-600 hover:text-red-700 hover:bg-red-50">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Tamamlanan Görüşmeleri Temizle
                  </Button>
                  <Button variant="outline" className="w-full justify-start border-red-200 text-red-600 hover:text-red-700 hover:bg-red-50">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Tüm Aktivite Loglarını Temizle
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataManagementSettings;