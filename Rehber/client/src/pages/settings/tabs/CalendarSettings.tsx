import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Info, Clock, Save } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const CalendarSettings = () => {
  const { toast } = useToast();
  
  // Uygulama ayarları için state yönetimi
  // Takvim ayarları için state
  const [calendarSettings, setCalendarSettings] = useState({
    defaultAppointmentDuration: "60"
  });
  
  // Ayarları getiren fonksiyon
  const fetchSettings = async () => {
    try {
      const response = await fetch(`/api/users/1/settings/app`);
      
      if (response.ok) {
        const data = await response.json();
        
        // Takvim ayarlarını güncelle
        const newCalendarSettings = { ...calendarSettings };
        
        data.forEach((setting: any) => {
          const key = setting.settingKey;
          const value = setting.settingValue;
          
          if (key === "defaultAppointmentDuration") newCalendarSettings.defaultAppointmentDuration = value;
        });
        
        setCalendarSettings(newCalendarSettings);
      }
    } catch (error) {
      console.error(`Takvim ayarları getirilirken hata:`, error);
    }
  };
  
  // Sayfa yüklendiğinde ayarları getir
  useEffect(() => {
    fetchSettings();
  }, []);
  
  // Takvim ayarlarını kaydet
  const handleSaveCalendarSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form verisini al
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const formValues = Object.fromEntries(formData.entries());
    console.log("Takvim ayarları kaydediliyor:", formValues);
    
    try {
      // Veritabanına kaydetmek için ayarları hazırla
      const settings = [
        { key: "defaultAppointmentDuration", value: formValues.defaultAppointmentDuration as string },
      ];
      
      // API'ye gönder
      const response = await fetch("/api/users/1/settings/app", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
          settings,
          category: "app" 
        })
      });
      
      if (response.ok) {
        // Başarılı kayıt mesajı gösterme
        toast({
          title: "Takvim ayarları kaydedildi",
          description: "Ayarlarınız başarıyla güncellendi ve veritabanına kaydedildi.",
          variant: "default",
        });
      } else {
        throw new Error("Ayarlar kaydedilemedi");
      }
    } catch (error) {
      console.error("Takvim ayarları kaydedilirken hata:", error);
      toast({
        title: "Hata!",
        description: "Takvim ayarlarınız kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm border border-white/20 shadow-md rounded-xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-500/5 to-transparent border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-500/80" />
          <CardTitle>Takvim ve Randevu Ayarları</CardTitle>
        </div>
        <CardDescription>
          Randevu ve takvim ile ilgili ayarlarınızı yapılandırın
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Bilgilendirme mesajı */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-blue-800 mb-1">Çalışma Saatleri Özelliği Kaldırıldı</h4>
                <p className="text-sm text-blue-700">
                  Çalışma saatleri özelliği sistemden kaldırılmıştır. Bundan sonra randevular için
                  standart çalışma saatleri (09:00 - 17:00) kullanılacaktır.
                </p>
              </div>
            </div>
          </div>
          
          {/* Randevu Ayarları */}
          <div className="bg-white border rounded-lg overflow-hidden shadow-sm p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Randevu Varsayılan Ayarları</h3>
            
            <form onSubmit={handleSaveCalendarSettings} className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="default-duration" className="text-sm text-gray-700">
                      Varsayılan Randevu Süresi (dakika)
                    </Label>
                    <div className="relative">
                      <Clock className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input 
                        id="default-duration" 
                        name="defaultAppointmentDuration"
                        type="number" 
                        min="15" 
                        max="120" 
                        step="15" 
                        className="pl-8"
                        value={calendarSettings.defaultAppointmentDuration}
                        onChange={(e) => setCalendarSettings({...calendarSettings, defaultAppointmentDuration: e.target.value})}
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Yeni randevu oluşturduğunuzda kullanılacak varsayılan süre
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Save className="w-4 h-4 mr-2" />
                  Ayarları Kaydet
                </Button>
              </div>
            </form>
          </div>
          
          {/* Takvim Entegrasyonları */}
          <div className="bg-white border rounded-lg overflow-hidden shadow-sm p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-900">Takvim Entegrasyonları</h3>
              <div>
                <Button variant="outline" size="sm" className="text-blue-600 border-blue-200">
                  <Calendar className="h-4 w-4 mr-2" />
                  Takvim Entegrasyonlarını Ayarla
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CalendarSettings;