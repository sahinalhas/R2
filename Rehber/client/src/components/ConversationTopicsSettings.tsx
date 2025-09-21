import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Tag, Plus, Save, X, FileText, Upload, Download, Trash2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface ConversationTopic {
  id: number;
  title: string;
}

const ConversationTopicsSettings = () => {
  const { toast } = useToast();
  const [topics, setTopics] = useState<ConversationTopic[]>([]);
  const [newTopic, setNewTopic] = useState("");
  const [bulkTopics, setBulkTopics] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Konuşma konularını getir
  const fetchConversationTopics = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/users/1/settings/conversationTopics");
      
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          // Setting değerini JSON olarak ayrıştır
          const topicsData = data.find((setting: any) => setting.settingKey === "conversationTopics");
          
          if (topicsData && topicsData.settingValue) {
            try {
              console.log("Alınan veri:", topicsData.settingValue);
              const parsedTopics = JSON.parse(topicsData.settingValue);
              console.log("Çözümlenmiş konular:", parsedTopics);
              setTopics(parsedTopics);
            } catch (parseError) {
              console.error("JSON ayrıştırma hatası:", parseError);
              setTopics([]);
            }
          } else {
            // Varsayılan boş liste
            setTopics([]);
          }
        } else {
          // Varsayılan boş liste
          setTopics([]);
        }
      }
    } catch (error) {
      console.error("Konuşma konuları getirilirken hata:", error);
      setTopics([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Sayfa yüklendiğinde konuları getir
  useEffect(() => {
    fetchConversationTopics();
  }, []);

  // Yeni konu ekle
  const addTopic = async () => {
    if (!newTopic.trim()) {
      toast({
        title: "Hata",
        description: "Konu başlığı boş olamaz.",
        variant: "destructive",
      });
      return;
    }

    const newId = topics.length > 0 ? Math.max(...topics.map(t => t.id)) + 1 : 1;
    const topic = {
      id: newId,
      title: newTopic.trim()
    };

    const updatedTopics = [...topics, topic];
    setTopics(updatedTopics);
    setNewTopic("");
    
    // Otomatik kaydet
    try {
      setIsLoading(true);
      
      // API'ye gönderilecek ayarları hazırla
      const settings = [
        { key: "conversationTopics", value: JSON.stringify(updatedTopics) }
      ];
      
      // API'ye gönder
      const response = await fetch("/api/users/1/settings/conversationTopics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
          settings,
          category: "conversationTopics" 
        })
      });
      
      if (response.ok) {
        toast({
          title: "Konu Eklendi",
          description: "Yeni konu başarıyla eklendi ve kaydedildi.",
          variant: "default",
        });
      } else {
        throw new Error("Konu kaydedilemedi");
      }
    } catch (error) {
      console.error("Konu kaydedilirken hata:", error);
      toast({
        title: "Uyarı",
        description: "Konu eklendi fakat kaydedilemedi. Lütfen 'Değişiklikleri Kaydet' butonunu kullanın.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Toplu konu ekle
  const addBulkTopics = async () => {
    if (!bulkTopics.trim()) {
      toast({
        title: "Hata",
        description: "Toplu konular boş olamaz.",
        variant: "destructive",
      });
      return;
    }

    // Satır satır böl ve boş satırları filtrele
    const topicLines = bulkTopics
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    if (topicLines.length === 0) {
      toast({
        title: "Hata",
        description: "Geçerli konular bulunamadı.",
        variant: "destructive",
      });
      return;
    }

    // Yeni konuları oluştur
    let maxId = topics.length > 0 ? Math.max(...topics.map(t => t.id)) : 0;
    const newTopics = topicLines.map(title => ({
      id: ++maxId,
      title
    }));

    const updatedTopics = [...topics, ...newTopics];
    setTopics(updatedTopics);
    setBulkTopics("");
    
    // Otomatik kaydet
    try {
      setIsLoading(true);
      
      // API'ye gönderilecek ayarları hazırla
      const settings = [
        { key: "conversationTopics", value: JSON.stringify(updatedTopics) }
      ];
      
      // API'ye gönder
      const response = await fetch("/api/users/1/settings/conversationTopics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
          settings,
          category: "conversationTopics" 
        })
      });
      
      if (response.ok) {
        toast({
          title: "Konular Kaydedildi",
          description: `${newTopics.length} adet konu başarıyla eklendi ve kaydedildi.`,
          variant: "default",
        });
      } else {
        throw new Error("Konular kaydedilemedi");
      }
    } catch (error) {
      console.error("Konular kaydedilirken hata:", error);
      toast({
        title: "Uyarı",
        description: "Konular eklendi fakat kaydedilemedi. Lütfen 'Değişiklikleri Kaydet' butonunu kullanın.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Konuyu sil
  const removeTopic = async (id: number) => {
    const updatedTopics = topics.filter(topic => topic.id !== id);
    setTopics(updatedTopics);
    
    // Otomatik kaydet
    try {
      setIsLoading(true);
      
      // API'ye gönderilecek ayarları hazırla
      const settings = [
        { key: "conversationTopics", value: JSON.stringify(updatedTopics) }
      ];
      
      // API'ye gönder
      const response = await fetch("/api/users/1/settings/conversationTopics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
          settings,
          category: "conversationTopics" 
        })
      });
      
      if (!response.ok) {
        throw new Error("Değişiklikler kaydedilemedi");
      }
    } catch (error) {
      console.error("Konular kaydedilirken hata:", error);
      toast({
        title: "Uyarı",
        description: "Konu silindi fakat değişiklikler kaydedilemedi. Lütfen 'Değişiklikleri Kaydet' butonunu kullanın.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Konuları kaydet
  const saveTopics = async () => {
    try {
      setIsLoading(true);
      
      // API'ye gönderilecek ayarları hazırla
      const settings = [
        { key: "conversationTopics", value: JSON.stringify(topics) }
      ];
      
      // API'ye gönder
      const response = await fetch("/api/users/1/settings/conversationTopics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
          settings,
          category: "conversationTopics" 
        })
      });
      
      if (response.ok) {
        toast({
          title: "Konular Kaydedildi",
          description: `${topics.length} adet konuşma konusu başarıyla kaydedildi.`,
          variant: "default",
        });
      } else {
        throw new Error("Ayarlar kaydedilemedi");
      }
    } catch (error) {
      console.error("Konular kaydedilirken hata:", error);
      toast({
        title: "Hata!",
        description: "Konuşma konuları kaydedilirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // CSV dosyasından toplu içe aktar
  const importFromCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result as string;
      const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      
      if (lines.length === 0) {
        toast({
          title: "Hata",
          description: "İçe aktarılacak konu başlığı bulunamadı.",
          variant: "destructive",
        });
        return;
      }

      // Yeni konuları oluştur
      let maxId = topics.length > 0 ? Math.max(...topics.map(t => t.id)) : 0;
      const newTopics = lines.map(title => ({
        id: ++maxId,
        title
      }));

      const updatedTopics = [...topics, ...newTopics];
      setTopics(updatedTopics);
      
      // Otomatik kaydet
      try {
        setIsLoading(true);
        
        // API'ye gönderilecek ayarları hazırla
        const settings = [
          { key: "conversationTopics", value: JSON.stringify(updatedTopics) }
        ];
        
        // API'ye gönder
        const response = await fetch("/api/users/1/settings/conversationTopics", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ 
            settings,
            category: "conversationTopics" 
          })
        });
        
        if (response.ok) {
          toast({
            title: "İçe Aktarma Başarılı",
            description: `${newTopics.length} adet konu başlığı içe aktarıldı ve kaydedildi.`,
            variant: "default",
          });
        } else {
          throw new Error("Konular kaydedilemedi");
        }
      } catch (error) {
        console.error("Konular kaydedilirken hata:", error);
        toast({
          title: "Uyarı",
          description: "Konular içe aktarıldı fakat kaydedilemedi. Lütfen 'Değişiklikleri Kaydet' butonunu kullanın.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    reader.readAsText(file);
    
    // Dosya seçiciyi sıfırla
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // CSV olarak dışa aktar
  const exportToCSV = () => {
    if (topics.length === 0) {
      toast({
        title: "Hata",
        description: "Dışa aktarılacak konu bulunamadı.",
        variant: "destructive",
      });
      return;
    }

    // Tüm başlıkları CSV formatına uygun şekilde birleştir
    const csvContent = topics.map(topic => topic.title).join('\n');
    
    // Dosya oluştur
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // Dosyayı indirme bağlantısı oluştur
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'konusma_konulari.csv');
    document.body.appendChild(link);
    
    // Dosyayı indir
    link.click();
    
    // Temizlik
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Dışa Aktarma Başarılı",
      description: `${topics.length} adet konu başlığı dışa aktarıldı.`,
      variant: "default",
    });
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="list" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="list">Konu Listesi</TabsTrigger>
          <TabsTrigger value="add">Konu Ekle</TabsTrigger>
          <TabsTrigger value="bulk">Toplu Ekle</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="space-y-4">
          {topics.length > 0 ? (
            <ScrollArea className="h-[400px] rounded-md border">
              <div className="p-4 grid gap-2">
                {topics.map((topic) => (
                  <Card key={topic.id} className="p-3 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="font-medium">{topic.title}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeTopic(topic.id)}
                      className="text-gray-500 hover:text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-10 border rounded-md bg-muted/30">
              <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">
                Henüz hiç konuşma konusu eklenmemiş.
              </p>
            </div>
          )}
          
          <div className="flex justify-between flex-wrap gap-2 mt-4">
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                CSV İçe Aktar
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                accept=".csv,.txt"
                onChange={importFromCSV}
                className="hidden"
              />
              
              <Button variant="outline" onClick={exportToCSV} disabled={topics.length === 0}>
                <Download className="h-4 w-4 mr-2" />
                CSV Dışa Aktar
              </Button>
            </div>
            
            <Button onClick={saveTopics} disabled={isLoading || topics.length === 0} className="bg-primary">
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="add">
          <div className="space-y-4 bg-white p-4 rounded-md border">
            <div>
              <Label htmlFor="new-topic" className="block mb-2">Konu Başlığı</Label>
              <div className="flex gap-2">
                <Input
                  id="new-topic"
                  placeholder="Yeni konuşma konusu ekle..."
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addTopic()}
                />
                <Button onClick={addTopic} disabled={!newTopic.trim()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ekle
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="bulk">
          <div className="space-y-4 bg-white p-4 rounded-md border">
            <div>
              <Label htmlFor="bulk-topics" className="block mb-2">
                Konuşma Konuları (Her satıra bir konu yazın)
              </Label>
              <Textarea
                id="bulk-topics"
                placeholder="Her satıra bir konu başlığı yazın..."
                rows={10}
                value={bulkTopics}
                onChange={(e) => setBulkTopics(e.target.value)}
                className="mb-4 font-mono"
              />
              
              <Button 
                onClick={addBulkTopics} 
                disabled={!bulkTopics.trim()}
                className="w-full sm:w-auto"
              >
                <Plus className="h-4 w-4 mr-2" />
                Toplu Ekle
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      {topics.length > 0 && (
        <div className="flex items-center justify-between p-3 bg-muted/20 rounded-md border">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Toplam Konu Sayısı:</span>
            <Badge variant="default">{topics.length}</Badge>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={async () => {
              if (confirm("Tüm konuşma konularını silmek istediğinizden emin misiniz?")) {
                setTopics([]);
                
                // Otomatik kaydet
                try {
                  setIsLoading(true);
                  
                  // API'ye gönderilecek ayarları hazırla (boş liste)
                  const settings = [
                    { key: "conversationTopics", value: "[]" }
                  ];
                  
                  // API'ye gönder
                  const response = await fetch("/api/users/1/settings/conversationTopics", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ 
                      settings,
                      category: "conversationTopics" 
                    })
                  });
                  
                  if (response.ok) {
                    toast({
                      title: "Liste Temizlendi",
                      description: "Tüm konuşma konuları başarıyla silindi.",
                      variant: "default",
                    });
                  } else {
                    throw new Error("Değişiklikler kaydedilemedi");
                  }
                } catch (error) {
                  console.error("Konular silinirken hata:", error);
                  toast({
                    title: "Uyarı",
                    description: "Konular silindi fakat değişiklikler kaydedilemedi. Lütfen 'Değişiklikleri Kaydet' butonunu kullanın.",
                    variant: "destructive",
                  });
                } finally {
                  setIsLoading(false);
                }
              }
            }}
            className="text-red-500 hover:text-red-600 border-red-200 hover:border-red-300"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Tümünü Temizle
          </Button>
        </div>
      )}
    </div>
  );
};

export default ConversationTopicsSettings;