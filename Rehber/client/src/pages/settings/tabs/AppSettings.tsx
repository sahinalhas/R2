import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Save, Settings as SettingsIcon } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";

const AppSettings = () => {
  // Durum bildirimi için kullanılacak toast hook'u
  const { toast } = useToast();
  
  // Uygulama ayarları için state yönetimi
  const [appSettings, setAppSettings] = useState({
    notifications: false,
    emailNotifications: false,
    remindersBeforeAppointments: false,
    reminderTime: "30",
    defaultAppointmentDuration: "60"
  });
  
  // Ayarları getiren fonksiyon
  const fetchSettings = async () => {
    try {
      const response = await fetch(`/api/users/1/settings/app`);
      
      if (response.ok) {
        const data = await response.json();
        
        // Uygulama ayarlarını güncelle
        const newAppSettings = { ...appSettings };
        
        data.forEach((setting: any) => {
          const key = setting.settingKey;
          const value = setting.settingValue;
          
          if (key === "notifications") newAppSettings.notifications = value === "true";
          if (key === "emailNotifications") newAppSettings.emailNotifications = value === "true";
          if (key === "remindersBeforeAppointments") newAppSettings.remindersBeforeAppointments = value === "true";
          if (key === "reminderTime") newAppSettings.reminderTime = value;
          if (key === "defaultAppointmentDuration") newAppSettings.defaultAppointmentDuration = value;
        });
        
        setAppSettings(newAppSettings);
      }
    } catch (error) {
      console.error(`Uygulama ayarları getirilirken hata:`, error);
    }
  };
  
  // Sayfa yüklendiğinde ayarları getir
  useEffect(() => {
    fetchSettings();
  }, []);
  
  const handleSaveAppSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form verisini al
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const formValues = Object.fromEntries(formData.entries());
    console.log("Uygulama ayarları kaydediliyor:", formValues);
    
    try {
      // Switch değerlerini boolean olarak dönüştür
      const notifications = formValues.notifications === "on";
      const emailNotifications = formValues.emailNotifications === "on";
      const remindersBeforeAppointments = formValues.remindersBeforeAppointments === "on";
      
      // Veritabanına kaydetmek için ayarları hazırla
      const settings = [
        { key: "notifications", value: String(notifications) },
        { key: "emailNotifications", value: String(emailNotifications) },
        { key: "remindersBeforeAppointments", value: String(remindersBeforeAppointments) },
        { key: "reminderTime", value: formValues.reminderTime as string },
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
          title: "Uygulama ayarları kaydedildi",
          description: "Ayarlarınız başarıyla güncellendi ve veritabanına kaydedildi.",
          variant: "default",
        });
      } else {
        throw new Error("Ayarlar kaydedilemedi");
      }
    } catch (error) {
      console.error("Uygulama ayarları kaydedilirken hata:", error);
      toast({
        title: "Hata!",
        description: "Uygulama ayarlarınız kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm border border-white/20 shadow-md rounded-xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-indigo-500/5 to-transparent border-b border-gray-100">
        <div className="flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-indigo-500/80" />
          <CardTitle>Uygulama Ayarları</CardTitle>
        </div>
        <CardDescription>
          Uygulama tercihlerinizi özelleştirin
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSaveAppSettings} className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notifications">Bildirimler</Label>
                <p className="text-sm text-neutral-500">
                  Uygulama bildirimlerini göster
                </p>
              </div>
              <Switch 
                id="notifications" 
                name="notifications"
                checked={appSettings.notifications} 
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="emailNotifications">E-posta Bildirimleri</Label>
                <p className="text-sm text-neutral-500">
                  Randevu bildirimleri için e-posta gönder
                </p>
              </div>
              <Switch 
                id="emailNotifications" 
                name="emailNotifications"
                checked={appSettings.emailNotifications} 
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="remindersBeforeAppointments">Randevu Hatırlatıcıları</Label>
                <p className="text-sm text-neutral-500">
                  Randevulardan önce hatırlatma göster
                </p>
              </div>
              <Switch 
                id="remindersBeforeAppointments" 
                name="remindersBeforeAppointments"
                checked={appSettings.remindersBeforeAppointments} 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reminderTime">Hatırlatıcı Süresi (dakika)</Label>
              <Input 
                id="reminderTime" 
                name="reminderTime" 
                type="number" 
                value={appSettings.reminderTime} 
                min="5" max="60" step="5" 
                onChange={(e) => setAppSettings({...appSettings, reminderTime: e.target.value})}
              />
              <p className="text-sm text-neutral-500">
                Randevudan kaç dakika önce hatırlatma yapılacağını belirler
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="defaultAppointmentDuration">Varsayılan Randevu Süresi (dakika)</Label>
              <Input 
                id="defaultAppointmentDuration" 
                name="defaultAppointmentDuration" 
                type="number" 
                value={appSettings.defaultAppointmentDuration} 
                min="15" max="120" step="15" 
                onChange={(e) => setAppSettings({...appSettings, defaultAppointmentDuration: e.target.value})}
              />
              <p className="text-sm text-neutral-500">
                Yeni bir randevu oluşturduğunuzda varsayılan süre
              </p>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
              <Save className="w-4 h-4 mr-2" />
              Ayarları Kaydet
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AppSettings;