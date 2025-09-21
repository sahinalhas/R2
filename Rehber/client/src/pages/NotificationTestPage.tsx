import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, CheckCircle, AlertTriangle, Info, AlertCircle } from "lucide-react";
import { 
  useNotifications, 
  createSuccessNotification, 
  createErrorNotification, 
  createWarningNotification, 
  createInfoNotification 
} from "@/context/NotificationContext";

const NotificationTestPage: React.FC = () => {
  const { addNotification, clearAllNotifications } = useNotifications();

  const handleAddSuccess = () => {
    addNotification(
      createSuccessNotification(
        "İşlem Başarılı", 
        "Başarıyla tamamlandı. Tüm değişiklikler kaydedildi.",
        "student"
      )
    );
  };

  const handleAddError = () => {
    addNotification(
      createErrorNotification(
        "Hata Oluştu", 
        "İşlem sırasında beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.",
        "report"
      )
    );
  };

  const handleAddWarning = () => {
    addNotification(
      createWarningNotification(
        "Dikkat", 
        "Bazı alanlar eksik doldurulmuş olabilir. Lütfen kontrol edin.",
        "appointment"
      )
    );
  };

  const handleAddInfo = () => {
    addNotification(
      createInfoNotification(
        "Bilgi", 
        "Sistem bakımı nedeniyle yarın 02:00-04:00 arası hizmet verilmeyecektir.",
        "system"
      )
    );
  };

  const handleAddWithAction = () => {
    addNotification({
      type: "success",
      title: "Öğrenci Eklendi",
      message: "Yeni öğrenci başarıyla sisteme eklendi.",
      category: "student",
      actionText: "Öğrenci Detayı",
      actionLink: "/ogrenciler/detay/1",
    });
  };

  const handleClearAll = () => {
    clearAllNotifications();
  };

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-2xl mx-auto bg-white/90 backdrop-blur-sm shadow-xl border border-white/20 rounded-xl overflow-hidden">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold flex items-center">
            <Bell className="mr-2 h-5 w-5 text-primary" />
            Bildirim Test Sayfası
          </CardTitle>
          <CardDescription>
            Farklı türde bildirimler oluşturmak için düğmeleri kullanın.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={handleAddSuccess}
              className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              Başarı Bildirimi
            </Button>
            
            <Button
              onClick={handleAddError}
              className="bg-red-500 hover:bg-red-600 text-white flex items-center gap-2"
            >
              <AlertCircle className="h-4 w-4" />
              Hata Bildirimi
            </Button>
            
            <Button
              onClick={handleAddWarning}
              className="bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-2"
            >
              <AlertTriangle className="h-4 w-4" />
              Uyarı Bildirimi
            </Button>
            
            <Button
              onClick={handleAddInfo}
              className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2"
            >
              <Info className="h-4 w-4" />
              Bilgi Bildirimi
            </Button>
            
            <Button
              onClick={handleAddWithAction}
              className="bg-purple-500 hover:bg-purple-600 text-white flex items-center gap-2"
            >
              <Bell className="h-4 w-4" />
              Eylemli Bildirim
            </Button>
            
            <Button
              onClick={handleClearAll}
              variant="outline"
              className="text-gray-700 border border-gray-300 hover:bg-gray-100"
            >
              Tüm Bildirimleri Temizle
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationTestPage;