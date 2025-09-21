import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Clock, PlusCircle, Save, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LessonHour {
  id: number;
  name: string;
  startTime: string;
  endTime: string;
}

const LessonHoursSettings = () => {
  const { toast } = useToast();
  const [lessonHours, setLessonHours] = useState<LessonHour[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Ayarları getiren fonksiyon
  const fetchLessonHours = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/users/1/settings/lessonHours`);

      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          // Setting değerini JSON olarak ayrıştır
          const lessonHoursData = data.find((setting: any) => setting.settingKey === "lessonHours");
          
          if (lessonHoursData && lessonHoursData.settingValue) {
            const parsedHours = JSON.parse(lessonHoursData.settingValue);
            setLessonHours(parsedHours);
          } else {
            // Varsayılan ders saatleri (2 ders)
            setLessonHours([
              { id: 1, name: "1. Ders", startTime: "09:00", endTime: "09:40" },
              { id: 2, name: "2. Ders", startTime: "09:50", endTime: "10:30" }
            ]);
          }
        } else {
          // Varsayılan ders saatleri (2 ders)
          setLessonHours([
            { id: 1, name: "1. Ders", startTime: "09:00", endTime: "09:40" },
            { id: 2, name: "2. Ders", startTime: "09:50", endTime: "10:30" }
          ]);
        }
      }
    } catch (error) {
      console.error("Ders saatleri ayarları getirilirken hata:", error);
      // Hata durumunda varsayılan ders saatleri
      setLessonHours([
        { id: 1, name: "1. Ders", startTime: "09:00", endTime: "09:40" },
        { id: 2, name: "2. Ders", startTime: "09:50", endTime: "10:30" }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Sayfa yüklendiğinde ayarları getir
  useEffect(() => {
    fetchLessonHours();
  }, []);

  // Yeni ders saati ekle
  const addLessonHour = () => {
    const newId = lessonHours.length > 0 ? Math.max(...lessonHours.map(lh => lh.id)) + 1 : 1;
    const newLessonHour = {
      id: newId,
      name: `${newId}. Ders`,
      startTime: "",
      endTime: ""
    };
    setLessonHours([...lessonHours, newLessonHour]);
  };

  // Ders saati sil
  const removeLessonHour = (id: number) => {
    const updatedLessonHours = lessonHours.filter(lh => lh.id !== id);
    
    // Ders isimlerini yeniden sırala (1. Ders, 2. Ders, ...)
    const renamedLessonHours = updatedLessonHours.map((lh, index) => ({
      ...lh,
      id: index + 1,
      name: `${index + 1}. Ders`
    }));
    
    setLessonHours(renamedLessonHours);
  };

  // Ders saati bilgilerini güncelle
  const updateLessonHour = (id: number, field: 'startTime' | 'endTime', value: string) => {
    const updatedLessonHours = lessonHours.map(lh => {
      if (lh.id === id) {
        return { ...lh, [field]: value };
      }
      return lh;
    });
    setLessonHours(updatedLessonHours);
  };

  // Ders saati ayarlarını kaydet
  const saveLessonHours = async () => {
    try {
      setIsLoading(true);
      
      // Veri doğrulama - boş alanlar var mı kontrol et
      const hasEmptyFields = lessonHours.some(lh => !lh.startTime || !lh.endTime);
      if (hasEmptyFields) {
        toast({
          title: "Eksik Bilgi",
          description: "Lütfen tüm başlangıç ve bitiş saatlerini doldurun.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      // API'ye gönderilecek ayarları hazırla
      const settings = [
        { key: "lessonHours", value: JSON.stringify(lessonHours) }
      ];
      
      // API'ye gönder
      const response = await fetch("/api/users/1/settings/lessonHours", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
          settings,
          category: "lessonHours" 
        })
      });
      
      if (response.ok) {
        toast({
          title: "Ders Saatleri Kaydedildi",
          description: "Ders saati ayarlarınız başarıyla güncellendi.",
          variant: "default",
        });
      } else {
        throw new Error("Ayarlar kaydedilemedi");
      }
    } catch (error) {
      console.error("Ders saati ayarları kaydedilirken hata:", error);
      toast({
        title: "Hata!",
        description: "Ders saati ayarlarınız kaydedilirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Dersler sağlı sollu sırayla dağıtılacak
  const leftColumnLessons = lessonHours.filter((_, index) => index % 2 === 0); // 0, 2, 4, 6, ...
  const rightColumnLessons = lessonHours.filter((_, index) => index % 2 === 1); // 1, 3, 5, 7, ...

  return (
    <div className="space-y-6">
      <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Okul Ders Saatleri</h3>
          <p className="text-sm text-gray-500 mt-1">
            Okuldaki ders saatlerini belirleyin. Tek numaralı dersler sol tarafta, çift numaralı dersler sağ tarafta görüntülenir. En fazla 20 ders ekleyebilirsiniz. Başlangıç ve bitiş saatlerini 24 saat formatında girin (08:30 gibi).
          </p>
        </div>
        
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Sol Kolon - tek sayılı dersler (1, 3, 5, ...) */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-gray-700 mb-2">Tek Numaralı Dersler</h4>
              {leftColumnLessons.map((lessonHour) => (
                <Card key={lessonHour.id} className="p-3 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="font-medium">{lessonHour.name}</Label>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => removeLessonHour(lessonHour.id)} 
                      className="h-8 w-8 text-gray-500 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor={`start-${lessonHour.id}`} className="text-xs">Başlangıç Saati</Label>
                      <div className="relative">
                        <Clock className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id={`start-${lessonHour.id}`}
                          type="time"
                          value={lessonHour.startTime}
                          onChange={(e) => updateLessonHour(lessonHour.id, 'startTime', e.target.value)}
                          className="pl-8"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`end-${lessonHour.id}`} className="text-xs">Bitiş Saati</Label>
                      <div className="relative">
                        <Clock className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id={`end-${lessonHour.id}`}
                          type="time"
                          value={lessonHour.endTime}
                          onChange={(e) => updateLessonHour(lessonHour.id, 'endTime', e.target.value)}
                          className="pl-8"
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            
            {/* Sağ Kolon - çift sayılı dersler (2, 4, 6, ...) */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-gray-700 mb-2">Çift Numaralı Dersler</h4>
              {rightColumnLessons.map((lessonHour) => (
                <Card key={lessonHour.id} className="p-3 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="font-medium">{lessonHour.name}</Label>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => removeLessonHour(lessonHour.id)} 
                      className="h-8 w-8 text-gray-500 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor={`start-${lessonHour.id}`} className="text-xs">Başlangıç Saati</Label>
                      <div className="relative">
                        <Clock className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id={`start-${lessonHour.id}`}
                          type="time"
                          value={lessonHour.startTime}
                          onChange={(e) => updateLessonHour(lessonHour.id, 'startTime', e.target.value)}
                          className="pl-8"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`end-${lessonHour.id}`} className="text-xs">Bitiş Saati</Label>
                      <div className="relative">
                        <Clock className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id={`end-${lessonHour.id}`}
                          type="time"
                          value={lessonHour.endTime}
                          onChange={(e) => updateLessonHour(lessonHour.id, 'endTime', e.target.value)}
                          className="pl-8"
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
              
              {/* Sağ kolonda eğer hiç ders yoksa bilgi mesajı */}
              {rightColumnLessons.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>Daha fazla ders saati ekleyin</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Yeni ders saati ekleme ve kaydetme butonları */}
          <div className="flex flex-wrap justify-between mt-6 gap-2">
            <Button 
              variant="outline" 
              onClick={addLessonHour} 
              disabled={lessonHours.length >= 20 || isLoading} 
              className="border-dashed"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Ders Saati Ekle
            </Button>
            
            <Button 
              onClick={saveLessonHours} 
              disabled={isLoading} 
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonHoursSettings;